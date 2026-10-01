import React, { useState, useRef } from 'react';
import { markDone } from '../state';
import { CONFIG } from '../config';

export default function ExifToolPage() {
  const [tags, setTags] = useState<[string, string][]>([]);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    setTags([]);

    try {
      const exifr = (await import('exifr')).default;
      const data = await exifr.parse(file, { translateValues: false });
      
      if (!data || Object.keys(data).length === 0) {
        setError('Метаданные не найдены в этом файле');
        return;
      }

      // Format tags
      const formatted: [string, string][] = [];
      const sortedKeys = Object.keys(data).sort();
      
      for (const key of sortedKeys) {
        let value = data[key];
        if (Array.isArray(value) && value.length === 3 && (key.includes('GPS') || key.includes('Lat') || key.includes('Lon'))) {
          // Format as DMS
          const d = Math.floor(value[0]);
          const m = Math.floor(value[1]);
          const s = ((value[2] || 0)).toFixed(2);
          formatted.push([key, `${d}° ${m}' ${s}"`]);
        } else if (typeof value === 'object' && value !== null) {
          formatted.push([key, JSON.stringify(value)]);
        } else {
          formatted.push([key, String(value)]);
        }
      }

      setTags(formatted);

      // Check Q2: file name must be field_photo_087.jpg
      if (file.name === CONFIG.photoFile) {
        markDone('q2a');
        markDone('q2');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка чтения файла');
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
            accept="image/*"
            onChange={handleFile}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-cyan-900 file:text-cyan-300 hover:file:bg-cyan-800 cursor-pointer"
          />
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
                    <tr key={i} className="border-b border-gray-800">
                      <td className="px-2 py-1 text-gray-400">{key}</td>
                      <td className="px-2 py-1 text-gray-200">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {fileName === CONFIG.photoFile && tags.length > 0 && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mt-4">
            <p className="text-green-400 font-mono text-sm">✓ Файл идентифицирован. Координаты зафиксированы.</p>
          </div>
        )}
      </div>
    </div>
  );
}
