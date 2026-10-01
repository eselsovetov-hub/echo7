import React, { useState } from 'react';
import { markDone } from '../state';
import { CONFIG } from '../config';

type WireColor = 'red' | 'blue' | 'yellow' | 'green';
type Connection = { color: WireColor; socket: number } | null;

export default function HeartbeatPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedColor, setSelectedColor] = useState<WireColor | null>(null);
  const [message, setMessage] = useState('');
  const [questComplete, setQuestComplete] = useState(false);
  const [error, setError] = useState('');

  const colors: WireColor[] = ['red', 'blue', 'yellow', 'green'];
  const colorLabels: Record<WireColor, string> = {
    red: 'Красный',
    blue: 'Синий',
    yellow: 'Жёлтый',
    green: 'Зелёный',
  };
  const colorClasses: Record<WireColor, string> = {
    red: 'bg-red-600 border-red-400',
    blue: 'bg-blue-600 border-blue-400',
    yellow: 'bg-yellow-600 border-yellow-400',
    green: 'bg-green-600 border-green-400',
  };

  const handleColorClick = (color: WireColor) => {
    if (connections.find(c => c && c.color === color)) return; // already connected
    setSelectedColor(color);
    setError('');
  };

  const handleSocketClick = (socket: number) => {
    if (!selectedColor) return;
    if (connections.find(c => c && c.socket === socket)) return; // socket occupied

    const newConnections = [...connections, { color: selectedColor, socket }];
    setConnections(newConnections);
    setSelectedColor(null);

    // Check if all connected
    if (newConnections.length === 4) {
      // Verify wiring
      const correct = newConnections.every(c => {
        if (!c) return false;
        return CONFIG.wiring[c.color] === c.socket;
      });

      if (correct) {
        markDone('q5');
        setQuestComplete(true);
        setMessage('Схема верна. Канал монитора восстановлен.');
      } else {
        setError('Неверная схема. Соединения сброшены, попробуйте снова');
        setConnections([]);
      }
    }
  };

  const handleReset = () => {
    setConnections([]);
    setSelectedColor(null);
    setMessage('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-cyan-400 font-bold text-xl mb-2">МОНИТОР ПУЛЬСА</h1>
        <p className="text-gray-500 text-sm mb-6">Восстановите коммутацию канала. Кликните по контакту, затем по разъёму.</p>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {/* Contacts (left) */}
            <div className="space-y-4">
              {colors.map(color => {
                const isConnected = connections.find(c => c && c.color === color);
                return (
                  <button
                    key={color}
                    onClick={() => handleColorClick(color)}
                    disabled={!!isConnected}
                    className={`w-16 h-10 rounded border-2 flex items-center justify-center text-xs font-bold transition-all ${
                      isConnected
                        ? 'opacity-30 cursor-not-allowed'
                        : selectedColor === color
                        ? `${colorClasses[color]} scale-110 ring-2 ring-white`
                        : `${colorClasses[color]} hover:scale-105`
                    }`}
                  >
                    {colorLabels[color]}
                  </button>
                );
              })}
            </div>

            {/* Connection lines (middle) */}
            <div className="flex-1 mx-4 relative h-48">
              <svg className="w-full h-full" viewBox="0 0 100 200">
                {connections.map((conn, i) => {
                  if (!conn) return null;
                  const colorIdx = colors.indexOf(conn.color);
                  const y1 = 25 + colorIdx * 50;
                  const y2 = 25 + (conn.socket - 1) * 50;
                  const strokeColor = conn.color === 'red' ? '#dc2626' : conn.color === 'blue' ? '#2563eb' : conn.color === 'yellow' ? '#ca8a04' : '#16a34a';
                  return (
                    <line key={i} x1="10" y1={y1} x2="90" y2={y2} stroke={strokeColor} strokeWidth="3" />
                  );
                })}
              </svg>
            </div>

            {/* Sockets (right) */}
            <div className="space-y-4">
              {[1, 2, 3, 4].map(socket => {
                const isOccupied = connections.find(c => c && c.socket === socket);
                return (
                  <button
                    key={socket}
                    onClick={() => handleSocketClick(socket)}
                    disabled={!!isOccupied}
                    className={`w-12 h-10 rounded border-2 flex items-center justify-center text-sm font-bold transition-all ${
                      isOccupied
                        ? 'border-cyan-500 bg-cyan-900/30 text-cyan-300'
                        : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {socket}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <button onClick={handleReset} className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 text-sm">
              Сбросить попытку
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-900/20 border border-red-800 rounded p-3">
              <p className="text-red-400 font-mono text-sm">{error}</p>
            </div>
          )}

          {questComplete && (
            <div className="mt-4 bg-green-900/20 border border-green-700 rounded p-4">
              <p className="text-green-400 font-mono text-sm mb-2">{message}</p>
              <p className="text-green-300 font-bold">Статус монитора: CRITICAL — сигнал восстановлен, пульс есть</p>
              <button onClick={() => window.location.href = '/dashboard'} className="mt-3 px-4 py-2 bg-green-900 text-green-300 rounded hover:bg-green-800 text-sm">
                Вернуться в кабинет
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
