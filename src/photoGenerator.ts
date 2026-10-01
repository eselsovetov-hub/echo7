// GPS coordinates for each photo (decimal degrees)
const photoCoords: Record<string, { lat: number; lng: number }> = {
  '012': { lat: 45.8935, lng: 13.0655 },
  '031': { lat: 45.8940, lng: 13.0670 },
  '044': { lat: 45.8910, lng: 13.0700 },
  '087': { lat: 45.8923, lng: 13.0642 }, // TARGET
  '019': { lat: 45.8928, lng: 13.0660 },
  '103': { lat: 45.8915, lng: 13.0685 },
  '066': { lat: 45.8932, lng: 13.0675 },
  '128': { lat: 45.8905, lng: 13.0680 },
  '075': { lat: 45.8938, lng: 13.0650 },
  '008': { lat: 45.8912, lng: 13.0690 },
  '140': { lat: 45.8930, lng: 13.0665 },
  '052': { lat: 45.8942, lng: 13.0658 },
  '097': { lat: 45.8925, lng: 13.0668 },
  '023': { lat: 45.89234, lng: 13.06538 }, // Near AP-07 (confirmation)
  '111': { lat: 45.8908, lng: 13.0695 },
  '038': { lat: 45.8945, lng: 13.0672 },
  '084': { lat: 45.8918, lng: 13.0648 },
  '149': { lat: 45.8950, lng: 13.0640 },
  '061': { lat: 45.8933, lng: 13.0658 },
  '005': { lat: 45.8920, lng: 13.0678 },
};

// Convert decimal degrees to DMS for EXIF (as rational numbers [num, den])
function decimalToDMSRational(decimal: number): [[number, number], [number, number], [number, number]] {
  const abs = Math.abs(decimal);
  const d = Math.floor(abs);
  const mFloat = (abs - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60 * 100); // hundredths of seconds
  return [[d, 1], [m, 1], [s, 100]];
}

// Generate a field photo as canvas
export function generateFieldPhoto(photoId: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 933;
  const ctx = canvas.getContext('2d')!;

  // Background - landscape-like gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 933);
  
  if (['087', '023', '149'].includes(photoId)) {
    // Coastal/cliff photos
    gradient.addColorStop(0, '#4a5568');
    gradient.addColorStop(0.3, '#718096');
    gradient.addColorStop(0.5, '#2d3748');
    gradient.addColorStop(0.7, '#1a365d');
    gradient.addColorStop(1, '#2c5282');
  } else if (['012', '075', '019', '038'].includes(photoId)) {
    // Forest/bunker photos
    gradient.addColorStop(0, '#4a5568');
    gradient.addColorStop(0.4, '#2d3748');
    gradient.addColorStop(0.6, '#1a4731');
    gradient.addColorStop(1, '#22543d');
  } else {
    // General field photos
    gradient.addColorStop(0, '#4a5568');
    gradient.addColorStop(0.35, '#718096');
    gradient.addColorStop(0.5, '#48bb78');
    gradient.addColorStop(0.7, '#276749');
    gradient.addColorStop(1, '#1a365d');
  }
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1400, 933);

  // Add some noise/texture
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 1400;
    const y = Math.random() * 933;
    const alpha = Math.random() * 0.1;
    ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0}, ${Math.random() > 0.5 ? 255 : 0}, ${Math.random() > 0.5 ? 255 : 0}, ${alpha})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Add horizon line
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 400 + Math.random() * 100);
  for (let x = 0; x < 1400; x += 50) {
    ctx.lineTo(x, 400 + Math.sin(x * 0.01) * 20 + Math.random() * 10);
  }
  ctx.stroke();

  // Photo ID watermark
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.font = '120px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`ECHO-7`, 700, 500);
  
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.font = '14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`field_photo_${photoId}.jpg`, 20, 910);
  ctx.fillText('ECHO-7 Field Unit / FC-2 Recorder', 20, 890);

  return canvas;
}

// Create JPEG blob with GPS EXIF data
export function createPhotoWithGPS(photoId: string): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = generateFieldPhoto(photoId);
    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    const coords = photoCoords[photoId];
    
    if (coords) {
      // Build EXIF data with GPS (rational format for piexifjs)
      const latDMS = decimalToDMSRational(coords.lat);
      const lngDMS = decimalToDMSRational(coords.lng);
      
      const exifObj: any = {
        "0th": {
          0x010F: "ECHO-7 Field Unit",  // Make
          0x0110: "FC-2 Recorder",       // Model
          0x0132: "2024:09:01 14:30:00", // DateTime
        },
        "Exif": {
          0x9003: "2024:09:01 14:30:00", // DateTimeOriginal
        },
        "GPS": {
          0x0000: [2, 3, 0, 0],          // GPSVersionID
          0x0001: coords.lat >= 0 ? 'N' : 'S', // GPSLatitudeRef
          0x0002: latDMS,                 // GPSLatitude
          0x0003: coords.lng >= 0 ? 'E' : 'W', // GPSLongitudeRef
          0x0004: lngDMS,                 // GPSLongitude
        }
      };

      // For photo 087, also add GPSDest (false trail)
      if (photoId === '087') {
        const destLatDMS = decimalToDMSRational(45.9023);
        const destLngDMS = decimalToDMSRational(13.0200);
        exifObj["GPS"][0x0005] = 'N'; // GPSDestLatitudeRef
        exifObj["GPS"][0x0006] = destLatDMS; // GPSDestLatitude
        exifObj["GPS"][0x0007] = 'E'; // GPSDestLongitudeRef
        exifObj["GPS"][0x0008] = destLngDMS; // GPSDestLongitude
      }

      try {
        // @ts-ignore
        const piexif = (window as any).piexif;
        if (piexif) {
          const exifBytes = piexif.dump(exifObj);
          const newDataUrl = piexif.insert(exifBytes, jpegDataUrl);
          const binaryString = atob(newDataUrl.split(',')[1]);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          resolve(new Blob([bytes], { type: 'image/jpeg' }));
          return;
        }
      } catch (e) {
        console.warn('piexif not available, falling back to plain JPEG');
      }
    }

    // Fallback: plain JPEG without EXIF
    canvas.toBlob(blob => {
      resolve(blob || new Blob());
    }, 'image/jpeg', 0.9);
  });
}

export function getPhotoCoords(photoId: string) {
  return photoCoords[photoId] || null;
}
