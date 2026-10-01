import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../config';
import { markDone } from '../state';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      login.toLowerCase().trim() === CONFIG.login.name.toLowerCase() &&
      password === CONFIG.login.password
    ) {
      markDone('q0');
      navigate('/dashboard');
    } else {
      setError('Доступ не подтверждён');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      {/* SYSTEM LOG — auth service
        2024-09-01 03:12:47
        target: employee_id 087
        reason: credential rotation after security audit
        new_hash_ref: bKlb85kA
      */}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-cyan-400 font-bold text-3xl tracking-widest mb-2">ECHO-7</h1>
          <p className="text-gray-500 text-sm">Аварийный канал связи</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Логин</label>
            <input
              type="text"
              value={login}
              onChange={e => setLogin(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-200 font-mono text-sm focus:border-cyan-500 focus:outline-none"
              placeholder="Имя сотрудника"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-200 font-mono text-sm focus:border-cyan-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-cyan-900 text-cyan-300 py-2 rounded hover:bg-cyan-800 transition-colors font-mono text-sm"
          >
            Открыть защищённый канал
          </button>
        </form>
        <p className="text-gray-600 text-xs text-center mt-4">Station ECHO-7 • Mali Brijun • Restricted Access</p>
      </div>
    </div>
  );
}
