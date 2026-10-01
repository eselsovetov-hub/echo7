import React, { useState, useRef } from 'react';
import { markDone } from '../state';
import { CONFIG } from '../config';

export default function CamerasPage() {
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [questComplete, setQuestComplete] = useState(false);
  const [noSignal, setNoSignal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSpeaker = (camera: string) => {
    setSelectedCamera(camera);
    
    if (camera === CONFIG.cameraId) {
      markDone('q7');
      setQuestComplete(true);
      setMessage(CONFIG.speakerLine);
      
      // Try to play audio (placeholder)
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 200;
        gain.gain.value = 0.1;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        setTimeout(() => {
          osc.stop();
          ctx.close();
        }, 3000);
      } catch (e) {
        // Audio blocked
      }
    } else {
      setNoSignal(true);
      setMessage('Нет ответа с этой локации');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-cyan-400 font-bold text-xl mb-6">ВИДЕОНАБЛЮДЕНИЕ</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {CONFIG.cameras.map((cam, i) => (
            <div key={cam} className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
                <div className="text-center">
                  <svg className="w-8 h-8 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 text-xs mt-1 font-mono">camera_{String(i + 1).padStart(2, '0')}_empty.jpg</p>
                </div>
                {/* Recording indicator */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 text-xs">REC</span>
                </div>
              </div>
              <div className="p-2">
                <p className="text-gray-400 text-xs font-mono mb-2">{cam}</p>
                <button
                  onClick={() => handleSpeaker(cam)}
                  className="w-full px-2 py-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 hover:text-cyan-400 text-xs transition-colors"
                >
                  Громкоговоритель
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedCamera && (
          <div className={`mt-6 rounded-lg p-4 border ${questComplete ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-800'}`}>
            <p className="text-gray-400 text-sm mb-1">{selectedCamera}:</p>
            {questComplete ? (
              <>
                <p className="text-green-300 font-mono text-sm mb-2">«{message}»</p>
                <p className="text-gray-500 text-xs mt-3">Связь прервана. Сигнал потерян.</p>
                <button onClick={() => window.location.href = '/dashboard'} className="mt-3 px-4 py-2 bg-green-900 text-green-300 rounded hover:bg-green-800 text-sm">
                  Вернуться в кабинет
                </button>
              </>
            ) : (
              <p className="text-red-400 font-mono text-sm">{message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
