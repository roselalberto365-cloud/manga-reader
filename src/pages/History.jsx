import { Link } from 'react-router-dom'
import { getHistory } from '../utils/storage'
import { useEffect, useState } from 'react'

function History() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    setHistory(getHistory())
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Continuar leyendo</h1>
      {history.length === 0 && <p className="text-neutral-500">Aún no has leído ningún capítulo.</p>}
      <div className="flex flex-col gap-2">
        {history.map((h) => (
          <Link
            to={`/read/${h.chapterId}`}
            key={h.mangaId}
            className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg px-4 py-3 flex items-center gap-4"
          >
            <img src={h.cover} alt={h.mangaTitle} className="w-12 h-16 object-cover rounded" />
            <div>
              <p className="font-medium">{h.mangaTitle}</p>
              <p className="text-sm text-neutral-500">
                Capítulo {h.chapterNumber || '?'} · Página {h.page || 1}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default History