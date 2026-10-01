import React, { useState } from 'react';
import { CONFIG } from '../config';
import { createPhotoWithGPS, generateFieldPhoto } from '../photoGenerator';

export default function PhotosPage() {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (photoId: string) => {
    setDownloading(true);
    try {
      const blob = await createPhotoWithGPS(photoId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `field_photo_${photoId}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
    setDownloading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-cyan-400 font-bold text-xl mb-2">ФОТОАРХИВ</h1>
        <p className="text-gray-500 text-sm mb-6">
          Полевые снимки станции ECHO-7. <span className="text-yellow-400">Имя файла содержит табельный номер сотрудника, который его загрузил.</span>
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {CONFIG.photoIds.map(id => (
            <div
              key={id}
              onClick={() => setLightbox(id)}
              className="aspect-[3/2] bg-gray-800 border border-gray-700 rounded-lg overflow-hidden cursor-pointer hover:border-cyan-700 transition-colors group relative"
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600 group-hover:text-cyan-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                <p className="text-xs text-gray-400 font-mono truncate">field_photo_{id}.jpg</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {lightbox && (
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4"
            onClick={() => setLightbox(null)}
          >
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
              <div className="aspect-[3/2] bg-gray-800 rounded mb-4 flex items-center justify-center overflow-hidden">
                <PhotoPreview photoId={lightbox} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-sm font-mono">field_photo_{lightbox}.jpg</p>
                <button
                  onClick={() => handleDownload(lightbox)}
                  disabled={downloading}
                  className="px-4 py-2 bg-cyan-900 text-cyan-300 rounded hover:bg-cyan-800 text-sm disabled:opacity-50"
                >
                  {downloading ? 'Подготовка...' : 'Скачать снимок'}
                </button>
              </div>
              <button
                onClick={() => setLightbox(null)}
                className="mt-4 w-full px-4 py-2 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 text-sm"
              >
                Закрыть (Esc)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Photo preview component
function PhotoPreview({ photoId }: { photoId: string }) {
  const [dataUrl, setDataUrl] = useState<string>('');
  
  React.useEffect(() => {
    const canvas = generateFieldPhoto(photoId);
    setDataUrl(canvas.toDataURL('image/jpeg', 0.8));
  }, [photoId]);

  if (!dataUrl) return null;
  
  return <img src={dataUrl} alt={`field_photo_${photoId}`} className="w-full h-full object-cover" />;
}
