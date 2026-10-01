import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isDone, markNotifShown, getFirstUnshownNotif, getAllPendingNotifs } from './state';
import { CONFIG } from './config';

export function Menu() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showInbox, setShowInbox] = useState(false);
  const [currentNotif, setCurrentNotif] = useState(getFirstUnshownNotif());
  const [hasNew, setHasNew] = useState(!!getFirstUnshownNotif());

  useEffect(() => {
    setCurrentNotif(getFirstUnshownNotif());
    setHasNew(!!getFirstUnshownNotif());
  }, [location.pathname]);

  if (location.pathname === '/' || location.pathname === '/reset') return null;
  if (!isDone('q0') && !CONFIG.openAccess) return null;

  const handleLogout = () => {
    if (confirm('Выход приведёт к сбросу прогресса. Продолжить?')) {
      localStorage.clear();
      navigate('/');
    }
  };

  const menuItems = [
    { path: '/staff-db', label: 'Терминал SQL', quest: 'q0' },
    { path: '/photos', label: 'Фотоархив', quest: 'q1' },
    { path: '/exif-tool', label: 'Анализ метаданных', quest: 'q1' },
    { path: '/map', label: 'Карта', quest: 'q2' },
    { path: '/radio-archive', label: 'Радиозаписи', quest: 'q3' },
    { path: '/nicknames', label: 'Позывные', quest: 'q4' },
    { path: '/logs', label: 'Логи активности', quest: 'q5' },
    { path: '/cameras', label: 'Видеонаблюдение', quest: 'q6' },
  ];

  const visibleItems = CONFIG.openAccess
    ? menuItems
    : menuItems.filter(item => isDone(item.quest));

  return (
    <>
      <header className="bg-gray-900 border-b border-cyan-900 px-4 py-2 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-cyan-400 font-bold text-lg tracking-wider">
            ECHO-7
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            {visibleItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm hover:text-cyan-400 transition-colors ${
                  location.pathname === item.path ? 'text-cyan-400' : 'text-gray-400'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowInbox(true)}
            className={`relative p-2 hover:text-cyan-400 transition-colors ${hasNew ? 'text-cyan-400' : 'text-gray-400'}`}
            title="Входящие"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {hasNew && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-400 transition-colors">
            Выход
          </button>
        </div>
      </header>

      {/* Notification Modal */}
      {showInbox && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]" onClick={() => setShowInbox(false)}>
          <div className="bg-gray-900 border border-cyan-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-cyan-400 font-bold mb-4 text-lg">ВХОДЯЩИЕ СООБЩЕНИЯ</h3>
            {getAllPendingNotifs().length === 0 && CONFIG.notifications.filter(n => isDone(n.after)).length === 0 ? (
              <p className="text-gray-400">Нет сообщений</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {CONFIG.notifications.filter(n => isDone(n.after)).map(n => (
                  <div key={n.id} className="border border-gray-700 rounded p-3">
                    <p className="text-cyan-300 font-semibold text-sm">{n.title}</p>
                    <p className="text-gray-300 text-sm mt-1">{n.text}</p>
                    {n.link && (
                      <Link to={n.link} onClick={() => setShowInbox(false)} className="text-cyan-400 text-sm hover:underline mt-2 inline-block">
                        {n.linkText}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => {
              getAllPendingNotifs().forEach(n => markNotifShown(n.id));
              setHasNew(false);
              setShowInbox(false);
            }} className="mt-4 px-4 py-2 bg-cyan-900 text-cyan-300 rounded hover:bg-cyan-800 text-sm w-full">
              Понятно
            </button>
          </div>
        </div>
      )}

      {/* Single notification popup */}
      {currentNotif && !showInbox && location.pathname === '/dashboard' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]" onClick={() => {
          markNotifShown(currentNotif.id);
          setCurrentNotif(getFirstUnshownNotif());
          setHasNew(!!getFirstUnshownNotif());
        }}>
          <div className="bg-gray-900 border border-cyan-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <p className="text-gray-500 text-xs mb-2">ВХОДЯЩЕЕ СООБЩЕНИЕ</p>
            <h3 className="text-cyan-400 font-bold mb-3">{currentNotif.title}</h3>
            <p className="text-gray-300 text-sm mb-4">{currentNotif.text}</p>
            {currentNotif.link && (
              <Link to={currentNotif.link} className="block mb-3 px-4 py-2 bg-cyan-900 text-cyan-300 rounded hover:bg-cyan-800 text-sm text-center">
                {currentNotif.linkText}
              </Link>
            )}
            <button onClick={() => {
              markNotifShown(currentNotif.id);
              setCurrentNotif(getFirstUnshownNotif());
              setHasNew(!!getFirstUnshownNotif());
            }} className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 text-sm w-full">
              Понятно
            </button>
          </div>
        </div>
      )}
    </>
  );
}
