import asyncio
import logging
import httpx
import time

logger = logging.getLogger(__name__)

class GeoAdapter:
    def __init__(self, user_agent: str, nominatim_base: str, overpass_base: str, osrm_base: str):
        self.user_agent = user_agent
        self.nominatim_base = nominatim_base.rstrip('/')
        self.overpass_base = overpass_base.rstrip('/')
        self.osrm_base = osrm_base.rstrip('/')
        self._last_nominatim_call = 0
        self._nominatim_lock = asyncio.Lock()
        self._geocode_cache = {}

    async def _throttle(self):
        async with self._nominatim_lock:
            elapsed = time.time() - self._last_nominatim_call
            if elapsed < 1.1:
                await asyncio.sleep(1.1 - elapsed)
            self._last_nominatim_call = time.time()

    async def geocode(self, query: str) -> dict:
        if query in self._geocode_cache:
            return self._geocode_cache[query]
            
        await self._throttle()
        headers = {'User-Agent': self.user_agent}
        params = {
            'q': query,
            'format': 'json',
            'limit': 1,
            'countrycodes': 'in'
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.nominatim_base}/search", params=params, headers=headers, timeout=10.0)
                response.raise_for_status()
                data = response.json()
                if data:
                    result = {
                        'lat': float(data[0]['lat']),
                        'lon': float(data[0]['lon']),
                        'display_name': data[0]['display_name']
                    }
                    self._geocode_cache[query] = result
                    return result
                return {}
            except Exception as e:
                logger.error(f"Geocode failed: {e}")
                return {}

    async def find_partners(self, lat: float, lon: float, radius_m: int = 5000) -> list:
        query = (
            f'[out:json];'
            f'(node["amenity"="bank"](around:{radius_m},{lat},{lon});'
            f'node["office"="financial"](around:{radius_m},{lat},{lon}););'
            f'out body;'
        )
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.overpass_base, data={'data': query}, timeout=30.0)
                response.raise_for_status()
                data = response.json()
                partners = []
                for element in data.get('elements', []):
                    partners.append({
                        'name': element.get('tags', {}).get('name', 'Unknown Partner'),
                        'lat': element.get('lat'),
                        'lon': element.get('lon'),
                        'address': element.get('tags', {}).get('address', ''),
                        'type': element.get('tags', {}).get('amenity', element.get('tags', {}).get('office', 'partner'))
                    })
                return partners
            except Exception as e:
                logger.error(f"Overpass failed: {e}")
                return []

    async def route(self, from_lat: float, from_lon: float, to_lat: float, to_lon: float) -> dict:
        url = f"{self.osrm_base}/route/v1/driving/{from_lon},{from_lat};{to_lon},{to_lat}?overview=false"
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, timeout=10.0)
                response.raise_for_status()
                data = response.json()
                if data.get('routes'):
                    route_info = data['routes'][0]
                    return {
                        'distance_km': route_info.get('distance', 0) / 1000.0,
                        'duration_min': route_info.get('duration', 0) / 60.0
                    }
                return {}
            except Exception as e:
                logger.error(f"OSRM failed: {e}")
                return {}
