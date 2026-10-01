import React, { useState, useRef, useCallback } from 'react';
import { markDone, setData } from '../state';
import { CONFIG } from '../config';

export default function RadioArchivePage() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [showSpectrogram, setShowSpectrogram] = useState(false);
  const [questComplete, setQuestComplete] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const createPlaceholderAudio = useCallback((freq: number, reverse: boolean): AudioBuffer => {
    const ctx = audioCtxRef.current || new AudioContext();
    audioCtxRef.current = ctx;
    const sampleRate = 16000;
    const duration = 2;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    const actualFreq = freq * 3;
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      data[i] = Math.sin(2 * Math.PI * actualFreq * t) * 0.3;
    }
    
    if (reverse) {
      data.reverse();
    }
    return buffer;
  }, []);

  const playAudio = (reverse: boolean) => {
    if (!selectedFile) return;
    
    const freq = parseFloat(selectedFile.replace('rec_', '').replace('.wav', ''));
    
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    
    const ctx = audioCtxRef.current || new AudioContext();
    audioCtxRef.current = ctx;
    
    const buffer = createPlaceholderAudio(freq, reverse);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
    sourceRef.current = source;
    setPlaying(true);
    
    source.onended = () => setPlaying(false);
  };

  const handleSelectFile = (file: string) => {
    setSelectedFile(file);
    setIsReversed(false);
    setShowSpectrogram(false);
    setQuestComplete(false);
  };

  const handleReverse = () => {
    if (!selectedFile) return;
    const newReversed = !isReversed;
    setIsReversed(newReversed);
    playAudio(newReversed);
    
    // Check quest completion
    if (selectedFile === CONFIG.correctAudio && newReversed && showSpectrogram) {
      completeQuest();
    }
  };

  const handleSpectrogram = () => {
    if (!selectedFile) return;
    const newShow = !showSpectrogram;
    setShowSpectrogram(newShow);
    
    // Check quest completion
    if (selectedFile === CONFIG.correctAudio && isReversed && newShow) {
      completeQuest();
    }
  };

  const completeQuest = () => {
    markDone('q4');
    setData('callsign', CONFIG.callsign);
    setQuestComplete(true);
  };

  const handleSlow = () => {
    if (!selectedFile) return;
    const freq = parseFloat(selectedFile.replace('rec_', '').replace('.wav', ''));
    const ctx = audioCtxRef.current || new AudioContext();
    audioCtxRef.current = ctx;
    const buffer = createPlaceholderAudio(freq, isReversed);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = 0.5;
    source.connect(ctx.destination);
    source.start();
    setPlaying(true);
    source.onended = () => setPlaying(false);
  };

  const handleFast = () => {
    if (!selectedFile) return;
    const freq = parseFloat(selectedFile.replace('rec_', '').replace('.wav', ''));
    const ctx = audioCtxRef.current || new AudioContext();
    audioCtxRef.current = ctx;
    const buffer = createPlaceholderAudio(freq, isReversed);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = 2;
    source.connect(ctx.destination);
    source.start();
    setPlaying(true);
    source.onended = () => setPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-cyan-400 font-bold text-xl mb-2">РАДИОАРХИВ AP-07</h1>
        <p className="text-gray-500 text-sm mb-6">Записи СНЧ-сигналов. Подписи о назначении частот утрачены.</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* File list */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm font-bold mb-3">ФАЙЛЫ ЗАПИСИ</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {CONFIG.audioFiles.map(freq => {
                const file = `rec_${freq}.wav`;
                return (
                  <button
                    key={file}
                    onClick={() => handleSelectFile(file)}
                    className={`w-full text-left px-3 py-2 rounded font-mono text-sm transition-colors ${
                      selectedFile === file
                        ? 'bg-cyan-900 text-cyan-300'
                        : 'hover:bg-gray-800 text-gray-400'
                    }`}
                  >
                    {file}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Processing panel */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm font-bold mb-3">ОБРАБОТКА</h3>
            
            {selectedFile ? (
              <>
                <p className="text-gray-300 font-mono text-sm mb-4">{selectedFile}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => playAudio(false)}
                    className="px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 text-sm"
                  >
                    Normal
                  </button>
                  <button
                    onClick={handleReverse}
                    className={`px-3 py-2 rounded text-sm ${isReversed ? 'bg-cyan-900 text-cyan-300' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                  >
                    Reverse
                  </button>
                  <button
                    onClick={handleSlow}
                    className="px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 text-sm"
                  >
                    Slow ×0.5
                  </button>
                  <button
                    onClick={handleFast}
                    className="px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 text-sm"
                  >
                    Fast ×2
                  </button>
                  <button
                    onClick={handleSpectrogram}
                    className={`px-3 py-2 rounded text-sm ${showSpectrogram ? 'bg-cyan-900 text-cyan-300' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                  >
                    Spectrogram
                  </button>
                </div>

                {playing && (
                  <p className="text-green-400 text-xs mb-2">▶ Воспроизведение...</p>
                )}

                {showSpectrogram && (
                  <div className="mt-4">
                    <div className="bg-gray-800 rounded p-2">
                      {/* Spectrogram placeholder */}
                      <div className="w-full h-48 bg-gradient-to-r from-blue-900 via-purple-900 to-red-900 rounded flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-30">
                          {Array.from({length: 20}).map((_, i) => (
                            <div key={i} className="absolute h-full" style={{
                              left: `${i * 5}%`,
                              width: '3px',
                              background: `linear-gradient(to bottom, transparent, ${selectedFile === CONFIG.correctAudio ? '#63d7ff' : '#4a5568'}, transparent)`,
                              opacity: 0.3 + Math.random() * 0.7
                            }} />
                          ))}
                        </div>
                        {selectedFile === CONFIG.correctAudio && isReversed && (
                          <span className="text-cyan-300 font-mono text-lg font-bold z-10 bg-black/50 px-2 py-1 rounded">
                            {CONFIG.spectrogramMark}
                          </span>
                        )}
                        <span className="absolute bottom-2 right-2 text-gray-500 text-xs font-mono">
                          spectrogram_{selectedFile.replace('.wav', '')}.png
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-sm">Выберите файл для обработки</p>
            )}
          </div>
        </div>

        {questComplete && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mt-6">
            <p className="text-green-400 font-mono text-sm mb-2">✓ Метка со спектрограммы зафиксирована в деле операции: {CONFIG.spectrogramMark}</p>
            <button onClick={() => window.location.href = '/dashboard'} className="px-4 py-2 bg-green-900 text-green-300 rounded hover:bg-green-800 text-sm">
              Вернуться в кабинет
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
