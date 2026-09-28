import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPopularManga, getCoverUrl, getTitle } from '../api/mangadex'

function Home() {
  const [mangas, setMangas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [language, setLanguage] = useState('')

  const filters = {
    all: null,
    manga: 'ja',
    manhwa: 'ko',
    manhua: 'zh',
  }

  useEffect(() => {
    let active = true

    setLoading(true)
    setError('')
    getPopularManga(filters[filter], language || null)
      .then((data) => {
        if (active) setMangas(data)
      })
      .catch(() => {
        if (active) setError('No se pudieron cargar los mangas.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [filter, language])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Populares</h1>
        <div className="flex flex-wrap gap-2">
          {Object.keys(filters).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-sm px-3 py-1 rounded-full border ${
                filter === key
                  ? 'bg-purple-600 border-purple-600'
                  : 'bg-neutral-800 border-neutral-700 hover:border-purple-500'
              }`}
            >
              {key === 'all' ? 'Todos' : key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1 text-sm"
          >
            <option value="">Todos los idiomas</option>
            <option value="es">Español</option>
            <option value="es-la">Español (Latino)</option>
            <option value="en">Inglés</option>
            <option value="pt-br">Portugués (Brasil)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-center mt-10 text-neutral-400">Cargando...</p>
      ) : error ? (
        <p className="text-center mt-10 text-red-400">{error}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {mangas.map((manga) => (
            <Link to={`/manga/${manga.id}`} key={manga.id} className="group">
              <img
                src={getCoverUrl(manga)}
                alt={getTitle(manga)}
                className="rounded-lg w-full aspect-[2/3] object-cover group-hover:opacity-80 transition"
              />
              <p className="text-sm mt-2 line-clamp-2 text-neutral-200">{getTitle(manga)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home