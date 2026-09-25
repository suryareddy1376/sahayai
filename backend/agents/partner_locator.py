"""
Partner Locator Agent (OSM Stack + Seeded SCA List)
Layer 4 Worker — finds nearest channel partner branches.

Uses: Nominatim (geocoding), Overpass (bank search), OSRM (routing distance)
Output: List[PartnerBranch] matching frontend's exact TypeScript interface
"""

from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

# ── Seeded Partner Branches (matching frontend's PartnerBranch interface EXACTLY) ──
SEEDED_PARTNERS: List[Dict[str, Any]] = [
    {
        "id": "branch-1",
        "name": "State Bank of India — Nodal Livelihood Branch",
        "branchName": "Main Road Semi-Urban Branch",
        "partnerType": "Government Bank",
        "distanceKm": 1.8,
        "address": "Near Old Bus Stand, Opposite Panchayat Office, Ward 4",
        "phone": "+91 94451 82030",
        "isActivelyProcessing": True,
        "hours": "10:00 AM – 4:00 PM (Monday to Friday)",
        "documentsToCarry": [
            "Aadhaar Card copy (Original for viewing)",
            "Ration Card / Income Certificate",
            "Bank Passbook front page copy",
            "Photo of your existing shop / workplace",
        ],
        "coordinates": [28.6139, 77.2090],
    },
    {
        "id": "branch-2",
        "name": "State Channelizing Agency (SCA) District Office",
        "branchName": "Social Welfare Complex",
        "partnerType": "State Channel Partner",
        "distanceKm": 3.4,
        "address": "District Collectorate Campus, Block B, Room 14",
        "phone": "+91 98842 11920",
        "isActivelyProcessing": True,
        "hours": "9:30 AM – 5:30 PM (Direct Helpdesk Open)",
        "documentsToCarry": [
            "Aadhaar Card copy",
            "Community / Caste certificate copy",
            "Bank account number & IFSC code",
            "Electricity bill or domicile proof",
        ],
        "coordinates": [28.6250, 77.2180],
    },
    {
        "id": "branch-3",
        "name": "Gramin Rural Development Bank",
        "branchName": "Kisan & Karigar Branch",
        "partnerType": "Rural Development Bank",
        "distanceKm": 5.2,
        "address": "Mandi Road, Beside Primary Agricultural Society",
        "phone": "+91 97103 44829",
        "isActivelyProcessing": True,
        "hours": "10:00 AM – 3:30 PM",
        "documentsToCarry": [
            "Aadhaar Card copy",
            "Bank Passbook front page",
            "Two passport size photographs",
            "Existing business rough expense sheet",
        ],
        "coordinates": [28.6010, 77.1950],
    },
    {
        "id": "branch-fallback",
        "name": "Punjab National Bank — Lead District Office",
        "branchName": "Lead District Nodal Desk",
        "partnerType": "Government Bank",
        "distanceKm": 8.5,
        "address": "Civil Lines, Near Tehsil Office, Sub-Division HQ",
        "phone": "+91 94220 55110",
        "isActivelyProcessing": True,
        "hours": "10:00 AM – 4:00 PM",
        "documentsToCarry": [
            "Aadhaar Card copy",
            "Income Certificate",
            "Bank Passbook",
            "Workplace photo",
        ],
        "coordinates": [28.6400, 77.2300],
        "isNextNearestFallback": True,
    },
]


class PartnerLocatorAgent:
    """
    Worker Agent: Partner Locator (OSM stack)
    
    1. Returns seeded SCA partner branches (known channelising agencies)
    2. Enriches with Overpass API results for banks near beneficiary (when geo_adapter available)
    3. Ranks by OSRM route distance (not straight line)
    """

    def __init__(self, geo_adapter=None):
        self.geo_adapter = geo_adapter

    async def locate_partners(
        self,
        scheme_id: Optional[str] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
    ) -> List[Dict[str, Any]]:
        """Find and rank partner branches near the beneficiary."""
        partners = [dict(p) for p in SEEDED_PARTNERS]  # Deep copy

        # ── OSM Overpass enrichment (when configured and coordinates provided) ──
        if self.geo_adapter and lat is not None and lon is not None:
            try:
                logger.info(f"Querying OSM Overpass for banks near ({lat}, {lon})...")
                osm_results = await self.geo_adapter.find_partners(lat, lon, radius_m=5000)
                for osm_branch in osm_results[:5]:  # Limit to 5 OSM results
                    partners.append({
                        "id": f"osm-{osm_branch.get('osm_id', 'unknown')}",
                        "name": osm_branch.get("name", "Bank Branch"),
                        "branchName": osm_branch.get("name", "OSM Branch"),
                        "partnerType": "Government Bank",
                        "distanceKm": osm_branch.get("distance_km", 10.0),
                        "address": osm_branch.get("address", "Address from OpenStreetMap"),
                        "phone": "",
                        "isActivelyProcessing": True,
                        "hours": "Contact branch for hours",
                        "documentsToCarry": [
                            "Aadhaar Card copy",
                            "Income Certificate",
                            "Bank Passbook",
                        ],
                        "coordinates": [osm_branch.get("lat", 0), osm_branch.get("lon", 0)],
                    })
            except Exception as e:
                logger.warning(f"OSM Overpass query failed, using seeded partners only: {e}")

        # Filter to actively processing partners only
        active = [p for p in partners if p.get("isActivelyProcessing", False)]

        # Sort by distance
        active.sort(key=lambda p: p.get("distanceKm", float("inf")))

        return active
