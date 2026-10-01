import React from 'react';
import { useNavigate } from 'react-router-dom';
import { resetProgress, jumpToQuest } from '../state';

export default function ResetPage() {
  const navigate = useNavigate();

  const handleReset = () => {
    if (confirm('Сбросить весь прогресс?')) {
      resetProgress();
      alert('Прогресс сброшен.');
    }
  };

  const handleJump = (quest: string) => {
    jumpToQuest(quest);
    const routes: Record<string, string> = {
      q0: '/dashboard',
      q1: '/photos',
      q2: '/map',
      q3: '/radio-archive',
      q4: '/nicknames',
      q5: '/logs',
      q6: '/cameras',
      q7: '/staff-db',
    };
    navigate(routes[quest] || '/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-cyan-400 font-bold text-xl mb-6">СБРОС ПРОГРЕССА</h1>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
          <p className="text-gray-400 text-sm mb-4">Полный сброс всех флагов квестов и уведомлений.</p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-900 text-red-300 rounded hover:bg-red-800 text-sm"
          >
            Сбросить прогресс
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm font-bold mb-4">ОТЛАДКА: ПРЫЖОК НА КВЕСТ</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { quest: 'q0', label: 'После Q0 → Кабинет' },
              { quest: 'q1', label: 'После Q1 → Фото' },
              { quest: 'q2', label: 'После Q2 → Карта' },
              { quest: 'q3', label: 'После Q3 → Радио' },
              { quest: 'q4', label: 'После Q4 → Позывные' },
              { quest: 'q5', label: 'После Q5 → Логи' },
              { quest: 'q6', label: 'После Q6 → Камеры' },
              { quest: 'q7', label: 'После Q7 → SQL' },
            ].map(item => (
              <button
                key={item.quest}
                onClick={() => handleJump(item.quest)}
                className="px-3 py-2 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 hover:text-cyan-400 text-xs transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
