'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from './ThemeProvider';

export default function OperationsMap({ zones, gates, activeLayers }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layerGroupRef = useRef(null);
  const { theme } = useTheme();

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView([19.052, 73.030], 12);

    mapInstanceRef.current = map;

    const tileUrl = theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when Theme changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const tileUrl = theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(mapInstanceRef.current);
  }, [theme]);

  // Update Layer contents dynamically
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    // 1. Accommodation Zones Layer
    if (activeLayers.hotels && zones) {
      zones.forEach(z => {
        const isCritical = z.status === 'critical';
        const isRecommended = z.is_overflow_recommended === 1;
        // Terracotta-driven palette
        const color = isCritical ? '#e11d48' : isRecommended ? '#c25e3e' : '#78716c';

        // Zone Radius Circle
        L.circle([z.lat, z.lng], {
          radius: isCritical ? 1400 : 1100,
          color,
          fillColor: color,
          fillOpacity: 0.14,
          weight: 1.5,
          dashArray: isRecommended ? '4 4' : undefined,
        }).addTo(layerGroupRef.current);

        // Marker (Minimalist Terracotta Badge)
        const bg = theme === 'dark' ? '#0e0e12' : '#ffffff';
        const text = theme === 'dark' ? '#ededed' : '#1c1917';
        const icon = L.divIcon({
          className: '',
          html: `<div style="background: ${bg}; border: 1.5px solid ${color}; width: 26px; height: 26px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: ${text}; font-family: monospace; font-size: 10px; font-weight: 700; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">Z${z.id}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        L.marker([z.lat, z.lng], { icon })
          .addTo(layerGroupRef.current)
          .bindPopup(`
            <div style="color: #1c1917; font-family: sans-serif; font-size: 12px; padding: 2px;">
              <div style="font-size: 13px; font-weight: 700; margin-bottom: 4px;">${z.name}</div>
              <div>Occupancy: <b>${z.occupancy_pct}%</b> (${z.booked_rooms.toLocaleString('en-IN')} / ${z.total_rooms.toLocaleString('en-IN')})</div>
              <div>Rate: ₹${z.avg_rate.toLocaleString('en-IN')} (${z.surge_multiplier}x multiplier)</div>
              <div style="color: #57534e; font-size: 11px; margin-top: 4px;">${z.transit_link_desc}</div>
              ${isRecommended ? '<div style="margin-top: 6px; background: #c25e3e; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; display: inline-block;">Target Overflow Buffer</div>' : ''}
            </div>
          `);
      });
    }

    // 2. Stadium Gates & Turnstiles Layer
    if (activeLayers.gates && gates) {
      gates.forEach(g => {
        const isCritical = g.status === 'critical';
        const color = isCritical ? '#e11d48' : g.status === 'warning' ? '#d97706' : '#57534e';
        const bg = theme === 'dark' ? '#0e0e12' : '#ffffff';

        const icon = L.divIcon({
          className: '',
          html: `<div style="background: ${bg}; border: 1.5px solid ${color}; width: 24px; height: 24px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: ${color}; font-family: monospace; font-size: 9px; font-weight: 700; box-shadow: 0 4px 10px rgba(0,0,0,0.12);">${g.name.split(' ')[1] || 'G'}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker([g.lat, g.lng], { icon })
          .addTo(layerGroupRef.current)
          .bindPopup(`
            <div style="color: #1c1917; font-family: sans-serif; font-size: 12px; padding: 2px;">
              <div style="font-size: 13px; font-weight: 700;">${g.name}</div>
              <div>Corridor: <b>${g.side.toUpperCase()}</b></div>
              <div>Throughput Load: <b>${g.load_pct}%</b> (${g.assigned} / ${g.capacity})</div>
              <div>Projected Queue: <b>${g.projected_wait_mins} mins</b></div>
            </div>
          `);
      });
    }
  }, [zones, gates, activeLayers, theme]);

  return (
    <div
      ref={mapContainerRef}
      className="relative h-[480px] w-full rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-soft transition-colors"
    />
  );
}
