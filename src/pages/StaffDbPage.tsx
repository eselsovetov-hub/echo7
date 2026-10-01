import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { initDatabase, executeQuery } from '../db';
import { markDone, isDone } from '../state';
import { CONFIG } from '../config';

export default function StaffDbPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ columns: string[]; values: any[][] } | { error: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [questComplete, setQuestComplete] = useState(false);
  const [noteHint, setNoteHint] = useState(false);
  const [noteValue, setNoteValue] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    initDatabase()
      .then(() => setLoading(false))
      .catch((err) => {
        setLoading(false);
        setResult({ error: 'Не удалось загрузить базу данных. Проверьте подключение к интернету.' });
      });
  }, []);

  const handleExecute = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    // Check forbidden patterns
    const forbidden = /pragma|sqlite_master|sqlite_sequence|\.schema|schema|attach|drop|delete|update|insert|alter|create/i;
    if (forbidden.test(trimmed)) {
      setResult({ error: 'Доступ ограничен' });
      return;
    }

    // Must start with SELECT
    if (!trimmed.toUpperCase().startsWith('SELECT')) {
      setResult({ error: 'Разрешены только запросы SELECT' });
      return;
    }

    // Must reference employees or notes
    if (!/employees|notes/i.test(trimmed)) {
      setResult({ error: 'Таблица недоступна с этого терминала' });
      return;
    }

    const res = executeQuery(trimmed);
    setResult(res);

    if ('columns' in res && res.columns.length > 0) {
      // Q1 check: has id column, no note column, exactly 1 row, id === 87
      const hasId = res.columns.includes('id');
      const hasNote = res.columns.includes('note');
      if (hasId && !hasNote && res.values.length === 1) {
        const idIdx = res.columns.indexOf('id');
        if (res.values[0][idIdx] === 87) {
          markDone('q1');
          setQuestComplete(true);
        }
      }

      // Q8 check: has id and note columns, row with id === 87
      if (hasId && hasNote) {
        const idIdx = res.columns.indexOf('id');
        const noteIdx = res.columns.indexOf('note');
        const row87 = res.values.find(r => r[idIdx] === 87);
        if (row87) {
          setNoteHint(true);
          setNoteValue(row87[noteIdx]);
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') handleExecute();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-cyan-400 font-mono">Загрузка базы данных...</p>
          <p className="text-gray-500 text-sm mt-2">Требуется подключение к интернету</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-cyan-400 font-bold text-xl mb-4">SQL-ТЕРМИНАЛ</h1>
        <p className="text-gray-500 text-sm mb-4">Доступные таблицы: employees, notes</p>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4">
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-200 font-mono text-sm h-32 resize-y focus:border-cyan-500 focus:outline-none"
            placeholder="Введите SQL-запрос (SELECT ...)"
          />
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={handleExecute}
              className="px-4 py-2 bg-cyan-900 text-cyan-300 rounded hover:bg-cyan-800 text-sm font-mono"
            >
              Выполнить (Ctrl+Enter)
            </button>
          </div>
        </div>

        {result && 'error' in result && (
          <div className="bg-red-900/20 border border-red-800 rounded p-3 mb-4">
            <p className="text-red-400 font-mono text-sm">Ошибка: {result.error}</p>
          </div>
        )}

        {result && 'columns' in result && result.columns.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4 overflow-x-auto">
            <p className="text-gray-400 text-sm mb-2">Строк: {result.values.length}</p>
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-gray-700">
                  {result.columns.map(col => (
                    <th key={col} className="text-left text-cyan-400 px-2 py-1">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.values.map((row, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    {row.map((val, j) => (
                      <td key={j} className="px-2 py-1 text-gray-300">{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {result && 'columns' in result && result.columns.length === 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 font-mono text-sm">Пустой результат</p>
          </div>
        )}

        {questComplete && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mt-4">
            <p className="text-green-400 font-mono text-sm mb-2">✓ Запись найдена. Данные сотрудника зафиксированы в деле операции.</p>
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-green-900 text-green-300 rounded hover:bg-green-800 text-sm">
              Вернуться в кабинет
            </button>
          </div>
        )}

        {noteHint && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mt-4">
            <p className="text-yellow-300 font-mono text-sm mb-2">Заметка сотрудника 087 хранится в закодированном виде.</p>
            <button
              onClick={() => navigate(`/terminal?target=notes&value=${encodeURIComponent(noteValue)}`)}
              className="px-4 py-2 bg-yellow-900 text-yellow-300 rounded hover:bg-yellow-800 text-sm"
            >
              Открыть Python-терминал
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
