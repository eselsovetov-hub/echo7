import React, { useState, useRef } from 'react';
import { markDone } from '../state';
import { CONFIG } from '../config';

export default function ExifToolPage() {
  const [tags, setTags] = useState<[string, string][]>([]);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [questSolved, setQuestSolved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    setTags([]);
    setQuestSolved(false);

    try {
      const exifr = (await import('exifr')).default;
      const data = await exifr.parse(file, { translateValues: false } as any);
      
      if (!data || Object.keys(data).length === 0) {
        setError('Метаданные не найдены в этом файле');
        return;
      }

      // Format tags
      const formatted: [string, string][] = [];
      const sortedKeys = Object.keys(data).sort();
      
      for (const key of sortedKeys) {
        let value = data[key];
        
        // Format GPS coordinate arrays as DMS
        if (key === 'GPSLatitude' && Array.isArray(value)) {
          const d = Math.floor(value[0]);
          const m = Math.floor(value[1]);
          const s = (value[2] || 0).toFixed(2);
          const ref = data['GPSLatitudeRef'] || 'N';
          formatted.push([key, `${d}° ${m}' ${s}" ${ref}`]);
          // Also add decimal
          const decimal = d + m / 60 + parseFloat(s) / 3600;
          formatted.push(['GPSLatitude (decimal)', decimal.toFixed(4)]);
        } else if (key === 'GPSLongitude' && Array.isArray(value)) {
          const d = Math.floor(value[0]);
          const m = Math.floor(value[1]);
          const s = (value[2] || 0).toFixed(2);
          const ref = data['GPSLongitudeRef'] || 'E';
          formatted.push([key, `${d}° ${m}' ${s}" ${ref}`]);
          const decimal = d + m / 60 + parseFloat(s) / 3600;
          formatted.push(['GPSLongitude (decimal)', decimal.toFixed(4)]);
        } else if (key === 'GPSDestLatitude' && Array.isArray(value)) {
          const d = Math.floor(value[0]);
          const m = Math.floor(value[1]);
          const s = (value[2] || 0).toFixed(2);
          const ref = data['GPSDestLatitudeRef'] || 'N';
          formatted.push([key, `${d}° ${m}' ${s}" ${ref}`]);
          const decimal = d + m / 60 + parseFloat(s) / 3600;
          formatted.push(['GPSDestLatitude (decimal)', decimal.toFixed(4)]);
        } else if (key === 'GPSDestLongitude' && Array.isArray(value)) {
          const d = Math.floor(value[0]);
          const m = Math.floor(value[1]);
          const s = (value[2] || 0).toFixed(2);
          const ref = data['GPSDestLongitudeRef'] || 'E';
          formatted.push([key, `${d}° ${m}' ${s}" ${ref}`]);
          const decimal = d + m / 60 + parseFloat(s) / 3600;
          formatted.push(['GPSDestLongitude (decimal)', decimal.toFixed(4)]);
        } else if (key.includes('GPS') && key.includes('Ref')) {
          // Skip - already shown with coordinates
          continue;
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          formatted.push([key, JSON.stringify(value)]);
        } else if (Array.isArray(value)) {
          formatted.push([key, value.join(', ')]);
        } else {
          formatted.push([key, String(value)]);
        }
      }

      setTags(formatted);

      // Check Q2: file name must be field_photo_087.jpg
      if (file.name === CONFIG.photoFile) {
        markDone('q2a');
        markDone('q2');
        setQuestSolved(true);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка чтения файла. Убедитесь, что это JPEG-изображение.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-cyan-400 font-bold text-xl mb-4">АНАЛИЗ МЕТАДАННЫХ</h1>
        <p className="text-gray-500 text-sm mb-6">
          Загрузите файл для чтения EXIF-метаданных. Имя файла содержит табельный номер сотрудника.
        </p>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg"
            onChange={handleFile}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-cyan-900 file:text-cyan-300 hover:file:bg-cyan-800 cursor-pointer"
          />
          <p className="text-gray-600 text-xs mt-2">Поддерживается формат JPEG с EXIF-данными</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded p-3 mb-4">
            <p className="text-red-400 font-mono text-sm">{error}</p>
          </div>
        )}

        {fileName && tags.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-3">Файл: <span className="text-gray-200 font-mono">{fileName}</span></p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-cyan-400 px-2 py-1">Тег</th>
                    <th className="text-left text-cyan-400 px-2 py-1">Значение</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.map(([key, value], i) => (
                    <tr key={i} className={`border-b border-gray-800 ${key.includes('GPS') ? 'bg-cyan-900/10' : ''}`}>
                      <td className="px-2 py-1 text-gray-400">{key}</td>
                      <td className="px-2 py-1 text-gray-200">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {questSolved && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mt-4">
            <p className="text-green-400 font-mono text-sm">✓ Файл идентифицирован. Координаты зафиксированы в деле операции.</p>
            <button onClick={() => window.location.href = '/dashboard'} className="mt-3 px-4 py-2 bg-green-900 text-green-300 rounded hover:bg-green-800 text-sm">
              Вернуться в кабинет
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
