'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

export default function CrowdFlowMapVisual({ 
  segments = [], 
  mixingPoints = [], 
  gates = [], 
  selectedPoint, 
  onSelectPoint 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || typeof window === 'undefined') return;

    let L;
    import('leaflet').then((leafletModule) => {
      L = leafletModule.default || leafletModule;

      if (!mapInstanceRef.current) {
        // DY Patil Stadium coordinates
        const center = [19.0583, 73.0075];
        const map = L.map(mapContainerRef.current, {
          center,
          zoom: 15,
          zoomControl: false,
          attributionControl: false,
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // CartoDB Dark Matter tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        layerGroupRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
      }

      const layerGroup = layerGroupRef.current;
      layerGroup.clearLayers();

      // 1. Draw Flow Segments (Cyan for Local, Amber for Outstation)
      segments.forEach((seg) => {
        const isLocal = seg.side === 'local';
        const color = isLocal ? '#06b6d4' : '#f59e0b';
        const weight = Math.max(3, Math.min(8, (seg.density || 100) / 60));

        const poly = L.polyline([seg.from, seg.to], {
          color,
          weight,
          opacity: 0.8,
          dashArray: isLocal ? undefined : '6 6',
          lineCap: 'round',
        }).addTo(layerGroup);

        poly.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; color: #111; padding: 3px;">
            <strong>${seg.name}</strong><br/>
            <span>Side: ${isLocal ? 'Local Corridor' : 'Outstation Shuttle'}</span><br/>
            <span>Throughput: ${seg.routed || 0} fans / hr</span>
          </div>
        `);
      });

      // 2. Draw Mixing Points (Red Pulsing Collision Nodes)
      mixingPoints.forEach((mp) => {
        const isSelected = selectedPoint?.id === mp.id;

        const iconHtml = `
          <div style="
            position: relative;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              inset: 0;
              border-radius: 50%;
              background: rgba(239, 68, 68, 0.4);
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: #ef4444;
              border: 3px solid #ffffff;
              box-shadow: 0 0 16px #ef4444;
            "></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'mixing-point-marker',
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([mp.lat, mp.lng], { icon: customIcon }).addTo(layerGroup);
        marker.on('click', () => {
          if (onSelectPoint) onSelectPoint(mp);
        });

        marker.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; color: #111; padding: 4px; max-width: 220px;">
            <strong style="color: #dc2626;">⚠ MIXING POINT DETECTED</strong><br/>
            <span>Separation: ${mp.distanceM}m</span><br/>
            <span>${mp.note}</span>
          </div>
        `);
      });

      // 3. Central Stadium Marker
      const stadiumIcon = L.divIcon({
        html: `
          <div style="
            background: #09090b;
            color: #22d3ee;
            border: 2px solid #06b6d4;
            border-radius: 6px;
            padding: 2px 6px;
            font-family: monospace;
            font-weight: 900;
            font-size: 10px;
            box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
            white-space: nowrap;
          ">
            DY PATIL ARENA (55K)
          </div>
        `,
        className: 'stadium-center-label',
        iconSize: [120, 24],
        iconAnchor: [60, 12],
      });

      L.marker([19.0583, 73.0075], { icon: stadiumIcon }).addTo(layerGroup);
    });
  }, [segments, mixingPoints, selectedPoint, onSelectPoint]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full min-h-[540px] rounded-2xl border border-zinc-800/80 overflow-hidden shadow-2xl relative" 
    />
  );
}
