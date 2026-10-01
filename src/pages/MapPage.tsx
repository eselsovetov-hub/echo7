import React, { useState, useEffect, useRef } from 'react';
import { markDone } from '../state';
import { CONFIG } from '../config';
import L from 'leaflet';

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [coordInput, setCoordInput] = useState('');
  const [coordError, setCoordError] = useState('');
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [pointMessage, setPointMessage] = useState('');
  const [questComplete, setQuestComplete] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      crs: L.CRS.Simple,
      minZoom: -3,
      maxZoom: 4,
      center: [500, 750],
      zoom: -1,
    });

    // Create a canvas-based image (placeholder for island.jpg)
    const canvas = document.createElement('canvas');
    canvas.width = 1500;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d')!;
    
    // Draw island-like shape
    ctx.fillStyle = '#1a2332';
    ctx.fillRect(0, 0, 1500, 1000);
    
    // Water
    ctx.fillStyle = '#0d1b2a';
    ctx.fillRect(0, 0, 1500, 1000);
    
    // Island shape
    ctx.beginPath();
    ctx.moveTo(100, 400);
    ctx.bezierCurveTo(200, 100, 600, 50, 800, 150);
    ctx.bezierCurveTo(1000, 200, 1300, 300, 1400, 450);
    ctx.bezierCurveTo(1450, 600, 1300, 800, 1100, 900);
    ctx.bezierCurveTo(900, 950, 600, 900, 400, 850);
    ctx.bezierCurveTo(200, 750, 50, 600, 100, 400);
    ctx.fillStyle = '#2d4a3e';
    ctx.fill();
    ctx.strokeStyle = '#3d6a5e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add some terrain features
    ctx.fillStyle = '#1d3a2e';
    ctx.beginPath();
    ctx.arc(500, 500, 80, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#3d5a4e';
    ctx.beginPath();
    ctx.arc(800, 400, 50, 0, Math.PI * 2);
    ctx.fill();

    const bounds: L.LatLngBoundsExpression = [[0, 0], [1000, 1500]];
    const imageUrl = canvas.toDataURL();
    L.imageOverlay(imageUrl, bounds).addTo(map);

    // Add markers for AP points
    CONFIG.mapPoints.forEach(point => {
      const marker = L.marker([point.y, point.x], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="width:24px;height:24px;background:#06b6d4;border:2px solid #67e8f9;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;color:#030712;font-family:monospace;">${point.code.replace('AP-', '')}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })
      });
      
      marker.bindTooltip(point.code, { permanent: false, direction: 'top' });
      
      let popupContent = `<div class="text-sm"><strong>${point.code}</strong><br/>${point.place}`;
      if (point.code !== 'AP-07' && CONFIG.mapPhotos && point.photos.length > 0) {
        popupContent += `<br/><span class="text-gray-500">Фото: ${point.photos.map(p => `field_photo_${p}.jpg`).join(', ')}</span>`;
      }
      popupContent += '</div>';
      
      marker.bindPopup(popupContent);
      
      marker.on('click', () => {
        if (point.code === CONFIG.correctPoint) {
          markDone('q3');
          setSelectedPoint(point.code);
          setPointMessage(`Точка ${point.code}: архив доступен`);
          setQuestComplete(true);
        } else {
          setSelectedPoint(point.code);
          setPointMessage(`Точка ${point.code}: архив недоступен`);
          setQuestComplete(false);
        }
      });

      marker.addTo(map);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  const parseCoordinates = (input: string): { lat: number; lng: number } | null => {
    // Try decimal degrees: 45.8923, 13.0642
    const decimalMatch = input.match(/(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)/);
    if (decimalMatch) {
      const a = parseFloat(decimalMatch[1]);
      const b = parseFloat(decimalMatch[2]);
      if (a > 90) return { lat: b, lng: a }; // swapped
      return { lat: a, lng: b };
    }

    // Try DMS: 45°53'32.28"N 13°03'51.12"E
    const dmsMatch = input.match(/(\d+)[°]\s*(\d+)['′]\s*(\d+\.?\d*)["″]?\s*([NSEWСЮВЗ])\s*[,\s]?\s*(\d+)[°]\s*(\d+)['′]\s*(\d+\.?\d*)["″]?\s*([NSEWСЮВЗ])/i);
    if (dmsMatch) {
      let lat = parseInt(dmsMatch[1]) + parseInt(dmsMatch[2]) / 60 + parseFloat(dmsMatch[3]) / 3600;
      if ('SЮ'.includes(dmsMatch[4].toUpperCase())) lat = -lat;
      let lng = parseInt(dmsMatch[5]) + parseInt(dmsMatch[6]) / 60 + parseFloat(dmsMatch[7]) / 3600;
      if ('WЗ'.includes(dmsMatch[8].toUpperCase())) lng = -lng;
      return { lat, lng };
    }

    return null;
  };

  const handleGoToCoords = () => {
    setCoordError('');
    const coords = parseCoordinates(coordInput);
    if (!coords) {
      setCoordError('Координаты не распознаны');
      return;
    }

    // Convert game coords to map pixel coords
    const y = 629 + (coords.lat - 45.8923) * 10000;
    const x = 127 + (coords.lng - 13.0642) * 10000;

    if (mapInstance.current) {
      mapInstance.current.flyTo([y, x], 2);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-cyan-400 font-bold text-xl mb-4">КАРТА ОСТРОВА</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={coordInput}
              onChange={e => setCoordInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGoToCoords()}
              className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-200 font-mono text-sm focus:border-cyan-500 focus:outline-none"
              placeholder="45.8923, 13.0642 или DMS"
            />
            <button
              onClick={handleGoToCoords}
              className="px-4 py-2 bg-cyan-900 text-cyan-300 rounded hover:bg-cyan-800 text-sm whitespace-nowrap"
            >
              Перейти
            </button>
          </div>
        </div>
        
        {coordError && (
          <p className="text-red-400 text-sm mb-2">{coordError}</p>
        )}

        <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden" style={{ height: '500px' }}>
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {pointMessage && (
          <div className={`mt-4 rounded-lg p-4 border ${questComplete ? 'bg-green-900/20 border-green-700' : 'bg-gray-900 border-gray-700'}`}>
            <p className={`font-mono text-sm ${questComplete ? 'text-green-400' : 'text-gray-400'}`}>{pointMessage}</p>
            {questComplete && (
              <button
                onClick={() => window.location.href = '/radio-archive'}
                className="mt-2 px-4 py-2 bg-green-900 text-green-300 rounded hover:bg-green-800 text-sm"
              >
                Открыть архив точки AP-07
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
