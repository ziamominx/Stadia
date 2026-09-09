import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const COLORS = {
  emerald: '#34d399',
  rose: '#fb7185',
  sky: '#38bdf8',
  amber: '#fbbf24',
  violet: '#a78bfa',
};

export default function RouteMap({ route, height = 'h-80' }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true });
    mapRef.current = map;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const entry = route?.entry ?? [];
    const exit = route?.exit ?? [];
    const pts = [...entry, ...exit];

    if (entry.length) {
      L.polyline(entry, { color: '#34d399', weight: 4, opacity: 0.9 }).addTo(map);
    }
    if (exit.length) {
      L.polyline(exit, { color: '#fb7185', weight: 4, opacity: 0.85, dashArray: '6 6' }).addTo(map);
    }

    if (pts.length) {
      map.fitBounds(L.latLngBounds(pts.map(([lat, lng]) => [lat, lng])).pad(0.25));
    } else {
      map.setView([19.0583, 73.0075], 15);
    }

    (route?.markers ?? []).forEach((m) => {
      const color = COLORS[m.color] ?? '#ffffff';
      const icon = L.divIcon({
        className: '',
        html: `<div style="transform:translate(-50%,-100%);text-align:center">
          <div style="width:16px;height:16px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 0 0 2px rgba(0,0,0,.45);margin:0 auto"></div>
          <div style="background:rgba(7,13,24,.88);color:#e8eef7;font-size:10px;font-weight:600;padding:2px 6px;border-radius:6px;margin-top:3px;white-space:nowrap">${m.label}</div>
        </div>`,
        iconSize: [0, 0],
      });
      L.marker([m.lat, m.lng], { icon })
        .addTo(map)
        .bindTooltip(m.label, { direction: 'top' });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className={`${height} w-full overflow-hidden rounded-xl border border-slate-700/50`} />;
}