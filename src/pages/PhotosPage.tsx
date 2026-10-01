import React, { useState } from 'react';
import { CONFIG } from '../config';

export default function PhotosPage() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-cyan-400 font-bold text-xl mb-2">ФОТОАРХИВ</h1>
        <p className="text-gray-500 text-sm mb-6">
          Полевые снимки станции ECHO-7. Имя файла содержит табельный номер сотрудника, который его загрузил.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {CONFIG.photoIds.map(id => (
            <div
              key={id}
              onClick={() => setLightbox(id)}
              className="aspect-[3/2] bg-gray-800 border border-gray-700 rounded-lg overflow-hidden cursor-pointer hover:border-cyan-700 transition-colors flex items-center justify-center group"
            >
              <div className="text-center p-2">
                <div className="w-full h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded mb-2 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-500 group-hover:text-cyan-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-400 font-mono">field_photo_{id}.jpg</p>
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
              <div className="aspect-[3/2] bg-gray-800 rounded mb-4 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-400 text-sm font-mono">field_photo_{lightbox}.jpg</p>
                  <p className="text-gray-500 text-xs mt-1">1400 × 933</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-sm font-mono">field_photo_{lightbox}.jpg</p>
                <button
                  onClick={() => {
                    // Create a placeholder image download
                    const canvas = document.createElement('canvas');
                    canvas.width = 1400;
                    canvas.height = 933;
                    const ctx = canvas.getContext('2d')!;
                    ctx.fillStyle = '#1a1a2e';
                    ctx.fillRect(0, 0, 1400, 933);
                    ctx.fillStyle = '#4a5568';
                    ctx.font = '24px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText(`field_photo_${lightbox}.jpg`, 700, 466);
                    ctx.fillText('ECHO-7 Field Unit', 700, 500);
                    canvas.toBlob(blob => {
                      if (blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `field_photo_${lightbox}.jpg`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }
                    });
                  }}
                  className="px-4 py-2 bg-cyan-900 text-cyan-300 rounded hover:bg-cyan-800 text-sm"
                >
                  Скачать снимок
                </button>
              </div>
              <button
                onClick={() => setLightbox(null)}
                className="mt-4 w-full px-4 py-2 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 text-sm"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
