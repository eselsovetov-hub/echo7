import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { markDone } from '../state';
import { CONFIG } from '../config';

export default function TerminalPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const target = searchParams.get('target') || '';
  const value = searchParams.get('value') || '';
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [questComplete, setQuestComplete] = useState(false);
  const [diaryLink, setDiaryLink] = useState('');
  const pyodideRef = useRef<any>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPyodide();
  }, []);

  const loadPyodide = async () => {
    setInitializing(true);
    try {
      // Load Pyodide from CDN
      if (!(window as any).loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.0/full/pyodide.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Pyodide'));
          document.head.appendChild(script);
        });
      }

      const pyodide = await (window as any).loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.0/full/'
      });
      
      pyodideRef.current = pyodide;
      setPyodideReady(true);
    } catch (err) {
      setOutput('Ошибка загрузки интерпретатора. Проверьте подключение к интернету.');
    }
    setInitializing(false);
  };

  const runCode = async () => {
    if (!pyodideRef.current) return;
    setRunning(true);
    setOutput('');

    try {
      // Reset and capture stdout
      pyodideRef.current.runPython(`
import sys
from io import StringIO
_stdout_capture = StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stdout_capture
      `);

      // Replace input with prompt
      pyodideRef.current.setStdin({ stdin: () => window.prompt('input()') || '' });

      const result = await pyodideRef.current.runPythonAsync(code);
      
      let stdout = pyodideRef.current.runPython('_stdout_capture.getvalue()');
      
      if (!stdout && result !== undefined && result !== null) {
        stdout = String(result);
      }
      
      if (!stdout) {
        stdout = '(пустой вывод)';
      }

      setOutput(stdout);
      afterDecode(stdout);
    } catch (err: any) {
      const errMsg = err.message || String(err);
      const lines = errMsg.split('\n');
      setOutput(lines.slice(-4).join('\n'));
    }

    setRunning(false);
  };

  const afterDecode = (stdout: string) => {
    if (target === 'logs' && stdout.includes('GAMMA-CAM-04')) {
      markDone('q6');
      setQuestComplete(true);
    }
    if (target === 'notes') {
      // Check for .html or .htm in output
      const match = stdout.match(/[\w-]+\.(?:html|htm)/);
      if (match) {
        markDone('q8');
        setQuestComplete(true);
        setDiaryLink(match[0]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-cyan-400 font-bold text-xl mb-2">PYTHON-ТЕРМИНАЛ</h1>
        {target && (
          <p className="text-gray-500 text-sm mb-1">Цель: {target === 'logs' ? 'декодирование записи лога' : 'декодирование заметки'}</p>
        )}

        {value && (
          <div className="bg-gray-900 border border-yellow-800 rounded-lg p-3 mb-4">
            <p className="text-yellow-400 text-xs mb-1">Буфер терминала:</p>
            <p className="text-yellow-200 font-mono text-sm break-all">{value}</p>
          </div>
        )}

        {initializing ? (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-cyan-400 font-mono">Инициализация интерпретатора...</p>
            <p className="text-gray-500 text-sm mt-2">Загрузка Pyodide 0.26.0</p>
          </div>
        ) : (
          <>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4">
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-200 font-mono text-sm h-40 resize-y focus:border-cyan-500 focus:outline-none"
                placeholder="Введите Python-код..."
                defaultValue={target === 'logs' ? 'import base64\nprint(base64.b64decode("...").decode("utf-8"))' : 
                              target === 'notes' ? 'import base64\ns = "..."\nprint(base64.b64decode(base64.b64decode(s)).decode())' : ''}
              />
              <button
                onClick={runCode}
                disabled={running || !pyodideReady}
                className="mt-2 px-4 py-2 bg-cyan-900 text-cyan-300 rounded hover:bg-cyan-800 text-sm disabled:opacity-50"
              >
                {running ? 'Выполнение...' : 'Запустить'}
              </button>
            </div>

            {output && (
              <div ref={outputRef} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-xs mb-2">Вывод:</p>
                <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap break-all">{output}</pre>
              </div>
            )}

            {questComplete && target === 'logs' && (
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mt-4">
                <p className="text-green-400 font-mono text-sm mb-2">✓ Камера определена.</p>
                <button onClick={() => navigate('/cameras')} className="px-4 py-2 bg-green-900 text-green-300 rounded hover:bg-green-800 text-sm">
                  Перейти к видеонаблюдению
                </button>
              </div>
            )}

            {questComplete && target === 'notes' && diaryLink && (
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mt-4">
                <p className="text-green-400 font-mono text-sm mb-2">✓ Путь декодирован.</p>
                <p className="text-green-300 font-mono text-sm mb-3">Операция завершена. Канал связи закрыт.</p>
                <a
                  href={`/${diaryLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-900 text-green-300 rounded hover:bg-green-800 text-sm inline-block"
                >
                  Открыть: {diaryLink}
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
