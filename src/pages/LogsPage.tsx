import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../config';

export default function LogsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-cyan-400 font-bold text-xl mb-2">ЛОГИ АКТИВНОСТИ</h1>
        <p className="text-gray-500 text-sm mb-6">
          Сверьте даты записей с журналом технического обслуживания.
        </p>

        <div className="space-y-3">
          {CONFIG.logs.map((log, i) => (
            <div key={i} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm font-mono">{log.date}</span>
                <span className="text-cyan-400 text-sm font-mono">{log.num}</span>
              </div>
              <div className="bg-gray-800 rounded p-2 font-mono text-xs text-gray-500 break-all">
                {log.base64}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate('/terminal?target=logs')}
            className="px-4 py-2 bg-cyan-900 text-cyan-300 rounded hover:bg-cyan-800 text-sm"
          >
            Открыть Python-терминал
          </button>
        </div>
      </div>
    </div>
  );
}
