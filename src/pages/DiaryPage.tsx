import React from 'react';

export default function DiaryPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8">
      <meta name="robots" content="noindex, nofollow" />
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 md:p-8">
          <h1 className="text-cyan-400 font-bold text-xl mb-6 text-center">ЛИЧНЫЙ ДНЕВНИК</h1>
          <p className="text-gray-500 text-xs text-center mb-8 font-mono">Viktor Orel / id 087 / Sector Lambda</p>

          <div className="space-y-8">
            <div className="border-l-2 border-gray-700 pl-4">
              <p className="text-gray-500 text-xs font-mono mb-2">12 марта 2024</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Снова не спал. Шумы в наушниках не дают покоя — кажется, я различаю в них что-то осмысленное. 
                Коллеги говорят, это просто интерференция. Но я работаю на станции восемь лет и знаю: 
                магнитосфера не шумит просто так.
              </p>
            </div>

            <div className="border-l-2 border-cyan-800 pl-4">
              <p className="text-gray-500 text-xs font-mono mb-2">4 апреля 2024</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Ровно восемь лет на станции. За это время я обошёл все приёмные точки, 
                знаю каждый камень на острове. Но сегодня произошло то, чего я боялся.
              </p>
              <p className="text-gray-300 text-sm leading-relaxed mt-2">
                Код от сейфа с полевым оборудованием: <span className="text-yellow-300 font-bold text-lg font-mono">4729</span>
              </p>
              <p className="text-gray-300 text-sm leading-relaxed mt-2">
                Если что-то пойдёт не так — ищите записи с точки AP-07. Там всё.
              </p>
            </div>

            <div className="border-l-2 border-gray-700 pl-4">
              <p className="text-gray-500 text-xs font-mono mb-2">19 июня 2024</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Смотрите записи с точки AP-07. Частота, на которой я работал последние недели. 
                Всё, что нужно — там. Если меня не станет, знайте: я не сбежал. 
                Я нашёл то, что они скрывали.
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-700 pt-4 text-center">
            <p className="text-gray-600 text-xs font-mono">— конец записей —</p>
          </div>
        </div>
      </div>
    </div>
  );
}
