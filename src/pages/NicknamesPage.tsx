import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../config';
import { setData } from '../state';

export default function NicknamesPage() {
  const [selectedCallsign, setSelectedCallsign] = useState<string | null>(null);
  const [showCase, setShowCase] = useState(false);
  const navigate = useNavigate();

  const handleClick = (callsign: string) => {
    setSelectedCallsign(callsign);
    if (callsign === CONFIG.callsign) {
      setShowCase(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-cyan-400 font-bold text-xl mb-6">БАЗА ПОЗЫВНЫХ</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
          {CONFIG.callsigns.map(cs => (
            <button
              key={cs}
              onClick={() => handleClick(cs)}
              className={`px-3 py-3 rounded border font-mono text-sm transition-colors ${
                selectedCallsign === cs
                  ? 'border-cyan-500 bg-cyan-900/30 text-cyan-300'
                  : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500'
              }`}
            >
              {cs}
            </button>
          ))}
        </div>

        {selectedCallsign && selectedCallsign !== CONFIG.callsign && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <p className="text-red-400 font-mono text-sm">Личное дело закрыто для этого терминала.</p>
          </div>
        )}

        {showCase && (
          <div className="bg-gray-900 border border-cyan-800 rounded-lg p-6 mt-4">
            <h3 className="text-cyan-400 font-bold mb-4">ЛИЧНОЕ ДЕЛО</h3>
            <div className="space-y-2 font-mono text-sm">
              <p><span className="text-gray-500">ID:</span> <span className="text-gray-200">087</span></p>
              <p><span className="text-gray-500">Имя:</span> <span className="text-gray-200">{CONFIG.target.name}</span></p>
              <p><span className="text-gray-500">Должность:</span> <span className="text-gray-200">{CONFIG.target.role}</span></p>
              <p><span className="text-gray-500">Сектор:</span> <span className="text-gray-200">{CONFIG.target.sector}</span></p>
              <p><span className="text-gray-500">Допуск:</span> <span className="text-gray-200">{CONFIG.target.clearance}</span></p>
              <p><span className="text-gray-500">Статус:</span> <span className="text-red-400">{CONFIG.target.status.toUpperCase()}</span></p>
            </div>
            
            <div className="mt-6 border-t border-gray-700 pt-4">
              <p className="text-gray-400 text-sm mb-2">Монитор пульса:</p>
              <p className="text-red-400 font-bold text-lg">NO SIGNAL</p>
            </div>

            <button
              onClick={() => navigate('/heartbeat')}
              className="mt-4 px-4 py-2 bg-cyan-900 text-cyan-300 rounded hover:bg-cyan-800 text-sm"
            >
              Восстановить соединение
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
