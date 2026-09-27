'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

export default function TicketRouteMap({ route, height = '340px' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || typeof window === 'undefined') return;

    let L;
    import('leaflet').then((leafletModule) => {
      L = leafletModule.default || leafletModule;

      // Avoid double initialization
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Default center around DY Patil Stadium
      const defaultCenter = [19.04194, 73.02667];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 14,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      }).addTo(map);

      mapInstanceRef.current = map;

      if (!route) return;

      const bounds = [];

      // Render Entry Polyline (Cyan glow)
      if (route.entry && route.entry.length > 0) {
        const entryLine = L.polyline(route.entry, {
          color: '#06b6d4',
          weight: 4,
          opacity: 0.9,
          dashArray: '8 6',
          lineCap: 'round',
        }).addTo(map);
        route.entry.forEach((pt) => bounds.push(pt));
      }

      // Render Exit Polyline (Amber glow)
      if (route.exit && route.exit.length > 0) {
        const exitLine = L.polyline(route.exit, {
          color: '#f59e0b',
          weight: 3,
          opacity: 0.7,
          dashArray: '4 6',
        }).addTo(map);
        route.exit.forEach((pt) => bounds.push(pt));
      }

      // Render Markers
      if (route.markers && route.markers.length > 0) {
        route.markers.forEach((m) => {
          bounds.push([m.lat, m.lng]);

          const markerColor = m.color === 'violet' ? '#8b5cf6' :
                              m.color === 'emerald' ? '#10b981' :
                              m.color === 'sky' ? '#0ea5e9' :
                              m.color === 'rose' ? '#ef4444' : '#f59e0b';

          const iconHtml = `
            <div style="
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: ${markerColor};
              border: 2.5px solid #09090b;
              box-shadow: 0 0 10px ${markerColor};
            "></div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-route-marker',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });

          const marker = L.marker([m.lat, m.lng], { icon: customIcon }).addTo(map);
          marker.bindPopup(`
            <div style="font-family: monospace; font-size: 11px; color: #111; padding: 2px;">
              <strong>${m.label}</strong>
            </div>
          `);
        });
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [route]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ height }} 
      className="map-dark-tiles w-full rounded-2xl border border-zinc-800/80 overflow-hidden shadow-xl"
    />
  );
}
