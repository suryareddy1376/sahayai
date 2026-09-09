import React, { useEffect, useRef } from 'react';
import { PartnerBranch } from '../types';
import L from 'leaflet';

interface PartnerMapProps {
  partners: PartnerBranch[];
  selectedPartnerId: string;
  onSelectPartner: (partner: PartnerBranch) => void;
}

export const PartnerMap: React.FC<PartnerMapProps> = ({
  partners,
  selectedPartnerId,
  onSelectPartner,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default to Delhi center or first partner coords
      const centerCoord: [number, number] = partners.length > 0 ? partners[0].coordinates : [28.6139, 77.2090];
      
      const map = L.map(mapContainerRef.current, {
        center: centerCoord,
        zoom: 13,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add partner markers
    partners.forEach((partner) => {
      const isSelected = partner.id === selectedPartnerId;
      
      // Custom HTML Marker icon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="
            background: ${isSelected ? '#059669' : '#1d4ed8'};
            color: white;
            padding: 6px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 800;
            white-space: nowrap;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid white;
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span>🏛️</span>
            <span>${partner.distanceKm} km</span>
          </div>
        `,
        iconSize: [80, 32],
        iconAnchor: [40, 32],
      });

      const marker = L.marker(partner.coordinates, { icon: customIcon }).addTo(map);
      marker.on('click', () => {
        onSelectPartner(partner);
      });

      markersRef.current.push(marker);
    });

    // Auto-center map on selected partner if available
    const selected = partners.find((p) => p.id === selectedPartnerId);
    if (selected) {
      map.setView(selected.coordinates, 13, { animate: true });
    }

    return () => {
      // Clean up map when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [partners, selectedPartnerId, onSelectPartner]);

  return (
    <div className="w-full h-80 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm relative z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
