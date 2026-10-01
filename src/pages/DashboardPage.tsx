import React from 'react';
import { Link } from 'react-router-dom';
import { isDone } from '../state';
import { CONFIG } from '../config';

export default function DashboardPage() {
  const tiles = [
    { path: '/staff-db', label: 'Терминал SQL', desc: 'Кадровая база данных', quest: 'q0' },
    { path: '/photos', label: 'Фотоархив', desc: 'Полевые снимки', quest: 'q1' },
    { path: '/exif-tool', label: 'Анализ метаданных', desc: 'EXIF-данные изображений', quest: 'q1' },
    { path: '/map', label: 'Карта острова', desc: 'Точки приёма AP-01…AP-15', quest: 'q2' },
    { path: '/radio-archive', label: 'Радиоархив', desc: 'Записи СНЧ-сигналов', quest: 'q3' },
    { path: '/nicknames', label: 'Позывные', desc: 'База позывных операторов', quest: 'q4' },
    { path: '/heartbeat', label: 'Монитор пульса', desc: 'Восстановление канала', quest: 'q4' },
    { path: '/logs', label: 'Логи активности', desc: 'Записи Base64', quest: 'q5' },
    { path: '/terminal', label: 'Python-терминал', desc: 'Декодирование служебных строк', quest: 'q5' },
    { path: '/cameras', label: 'Видеонаблюдение', desc: '10 камер станции', quest: 'q6' },
    { path: '/index', label: 'Вход в систему', desc: 'Авторизация', quest: null },
    { path: '/reset', label: 'Сброс прогресса', desc: 'Служебная страница', quest: null },
  ];

  const visibleTiles = CONFIG.openAccess ? tiles : tiles.filter(t => !t.quest || isDone(t.quest));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-cyan-400 font-bold text-2xl mb-6">ЛИЧНЫЙ КАБИНЕТ</h1>
        
        {/* Station Info */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-cyan-300 font-bold mb-4 text-lg">СТАНОЦИЯ ECHO-7</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Объект: <span className="text-gray-200">Автономная станция мониторинга</span></p>
              <p className="text-gray-400">Расположение: <span className="text-gray-200">о. Мали-Бриун, Адриатика</span></p>
              <p className="text-gray-400">Запуск: <span className="text-gray-200">2011 г.</span></p>
              <p className="text-gray-400">Штат: <span className="text-gray-200">150 чел. (38 на вахте)</span></p>
            </div>
            <div>
              <p className="text-gray-400">Программа: <span className="text-gray-200">ECHO — магнитосферные аномалии, СНЧ 30–300 Гц</span></p>
              <p className="text-gray-400">Приёмные точки: <span className="text-gray-200">AP-01…AP-15</span></p>
              <p className="text-gray-400">Секторы: <span className="text-gray-200">ALPHA, BETA, GAMMA, LAMBDA, DELTA</span></p>
            </div>
          </div>
          
          <div className="mt-6 border-t border-gray-700 pt-4">
            <h3 className="text-red-400 font-bold mb-2">⚠ ОПЕРАТИВНАЯ СВОДКА</h3>
            <p className="text-sm text-gray-300">
              <span className="text-red-300">03.09.2024 22:17</span> — несанкционированный доступ к терминалу в секторе GAMMA. 
              Сотрудник сектора LAMBDA <span className="text-yellow-300">Viktor Orel (id 087)</span> числится пропавшим.
            </p>
          </div>
        </div>

        {/* Tiles */}
        <h2 className="text-gray-400 font-bold mb-4">РАЗДЕЛЫ СТАНЦИИ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleTiles.map(tile => (
            <Link
              key={tile.path}
              to={tile.path}
              className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-cyan-700 transition-colors group"
            >
              <p className="text-cyan-400 font-semibold group-hover:text-cyan-300">{tile.label}</p>
              <p className="text-gray-500 text-xs mt-1">{tile.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
