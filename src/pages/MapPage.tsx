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

    // Create island image on canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1500;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d')!;
    
    // Sea background
    const seaGrad = ctx.createRadialGradient(750, 500, 100, 750, 500, 800);
    seaGrad.addColorStop(0, '#1a3a5c');
    seaGrad.addColorStop(1, '#0d1b2a');
    ctx.fillStyle = seaGrad;
    ctx.fillRect(0, 0, 1500, 1000);

    // Island shape
    ctx.beginPath();
    ctx.moveTo(100, 400);
    ctx.bezierCurveTo(150, 200, 350, 80, 600, 100);
    ctx.bezierCurveTo(800, 110, 1000, 150, 1200, 250);
    ctx.bezierCurveTo(1350, 320, 1420, 450, 1400, 550);
    ctx.bezierCurveTo(1380, 650, 1300, 780, 1150, 870);
    ctx.bezierCurveTo(1000, 940, 800, 960, 600, 920);
    ctx.bezierCurveTo(400, 880, 250, 800, 150, 700);
    ctx.bezierCurveTo(80, 620, 60, 500, 100, 400);
    ctx.closePath();
    
    // Island fill with terrain gradient
    const islandGrad = ctx.createLinearGradient(0, 0, 1500, 1000);
    islandGrad.addColorStop(0, '#2d5a3e');
    islandGrad.addColorStop(0.3, '#3d6a4e');
    islandGrad.addColorStop(0.5, '#4a7a5a');
    islandGrad.addColorStop(0.7, '#3d6a4e');
    islandGrad.addColorStop(1, '#2d4a3e');
    ctx.fillStyle = islandGrad;
    ctx.fill();
    
    // Coastline
    ctx.strokeStyle = '#5a8a6a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Western cliffs (darker, rougher)
    ctx.beginPath();
    ctx.moveTo(100, 400);
    ctx.bezierCurveTo(80, 500, 60, 600, 150, 700);
    ctx.bezierCurveTo(120, 650, 90, 550, 100, 400);
    ctx.fillStyle = '#1a3a2a';
    ctx.fill();

    // Fields (south)
    ctx.fillStyle = '#5a8a4a';
    ctx.fillRect(450, 350, 200, 100);
    ctx.fillRect(500, 300, 150, 80);
    
    // Forest (center)
    ctx.fillStyle = '#1d4a2e';
    ctx.beginPath();
    ctx.arc(500, 550, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(550, 500, 60, 0, Math.PI * 2);
    ctx.fill();

    // Lake
    ctx.fillStyle = '#1a3a5c';
    ctx.beginPath();
    ctx.ellipse(791, 570, 30, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // River
    ctx.strokeStyle = '#2a4a6c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(1055, 434);
    ctx.bezierCurveTo(1000, 450, 950, 400, 900, 380);
    ctx.stroke();

    // Beach (north)
    ctx.fillStyle = '#8a7a5a';
    ctx.beginPath();
    ctx.ellipse(470, 130, 60, 20, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Buildings/structures (small rectangles)
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(600, 450, 15, 10);
    ctx.fillRect(620, 460, 12, 8);
    ctx.fillRect(580, 470, 10, 12);

    // Radio mast at AP-07 (western cliffs)
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(127, 629);
    ctx.lineTo(127, 600);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(120, 605);
    ctx.lineTo(134, 605);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(122, 610);
    ctx.lineTo(132, 610);
    ctx.stroke();

    // Scale indicator
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(50, 950, 100, 3);
    ctx.font = '10px monospace';
    ctx.fillText('~500m', 70, 970);

    const bounds: L.LatLngBoundsExpression = [[0, 0], [1000, 1500]];
    const imageUrl = canvas.toDataURL();
    L.imageOverlay(imageUrl, bounds).addTo(map);

    // Add markers for AP points
    CONFIG.mapPoints.forEach(point => {
      const isAP07 = point.code === 'AP-07';
      const marker = L.marker([point.y, point.x], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="width:${isAP07 ? 28 : 24}px;height:${isAP07 ? 28 : 24}px;background:${isAP07 ? '#06b6d4' : '#374151'};border:2px solid ${isAP07 ? '#67e8f9' : '#6b7280'};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${isAP07 ? 10 : 9}px;font-weight:bold;color:${isAP07 ? '#030712' : '#d1d5db'};font-family:monospace;${isAP07 ? 'box-shadow:0 0 8px rgba(6,182,212,0.5);' : ''}">${point.code.replace('AP-', '')}</div>`,
          iconSize: [isAP07 ? 28 : 24, isAP07 ? 28 : 24],
          iconAnchor: [isAP07 ? 14 : 12, isAP07 ? 14 : 12],
        })
      });
      
      marker.bindTooltip(point.code, { permanent: false, direction: 'top', offset: [0, -15] });
      
      let popupContent = `<div style="font-family:monospace;font-size:12px;"><strong>${point.code}</strong><br/><span style="color:#9ca3af">${point.place}</span>`;
      if (point.code !== 'AP-07' && CONFIG.mapPhotos && point.photos.length > 0) {
        popupContent += `<br/><span style="color:#6b7280;font-size:10px;">Фото: ${point.photos.map(p => `field_photo_${p}.jpg`).join(', ')}</span>`;
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
    // Try decimal degrees: 45.8923, 13.0642 or 45.8923 13.0642
    const decimalMatch = input.match(/(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)/);
    if (decimalMatch) {
      const a = parseFloat(decimalMatch[1]);
      const b = parseFloat(decimalMatch[2]);
      // Determine which is lat and which is lng
      if (a >= 40 && a <= 50 && b >= 10 && b <= 20) {
        return { lat: a, lng: b };
      } else if (b >= 40 && b <= 50 && a >= 10 && a <= 20) {
        return { lat: b, lng: a };
      }
      // Default: first is lat if > 30
      if (a > b) return { lat: a, lng: b };
      return { lat: b, lng: a };
    }

    // Try DMS: 45°53'32.28"N 13°03'51.12"E (with various separators)
    const dmsRegex = /(\d+)[°]\s*(\d+)[''′]\s*(\d+\.?\d*)[""″]?\s*([NSEWСЮВЗ])\s*[,\s]?\s*(\d+)[°]\s*(\d+)[''′]\s*(\d+\.?\d*)[""″]?\s*([NSEWСЮВЗ])/i;
    const dmsMatch = input.match(dmsRegex);
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

    // Convert game coords to map pixel coords (anchor: AP-07)
    const y = 629 + (coords.lat - 45.8923) * 10000;
    const x = 127 + (coords.lng - 13.0642) * 10000;

    if (mapInstance.current) {
      mapInstance.current.flyTo([y, x], 2, { duration: 1 });
      
      // Add temporary marker
      const tempMarker = L.marker([y, x], {
        icon: L.divIcon({
          className: 'temp-marker',
          html: '<div style="width:12px;height:12px;background:#ff7b6b;border:2px solid #fff;border-radius:50%;"></div>',
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        })
      });
      tempMarker.addTo(mapInstance.current);
      
      setTimeout(() => {
        if (mapInstance.current) {
          mapInstance.current.removeLayer(tempMarker);
        }
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-cyan-400 font-bold text-xl mb-4">КАРТА ОСТРОВА</h1>
        <p className="text-gray-500 text-sm mb-4">Точки приёма AP-01…AP-15. Введите координаты для поиска.</p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={coordInput}
              onChange={e => setCoordInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGoToCoords()}
              className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-200 font-mono text-sm focus:border-cyan-500 focus:outline-none"
              placeholder="45.8923, 13.0642 или 45°53'32.28&quot;N 13°03'51.12&quot;E"
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
