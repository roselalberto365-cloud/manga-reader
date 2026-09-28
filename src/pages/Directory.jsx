import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { browseManga, getTags, getCoverUrl, getTitle } from '../api/mangadex'

const PAGE_SIZE = 24

function Directory() {
  const [mangas, setMangas] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tags, setTags] = useState([])
  const [showTags, setShowTags] = useState(false)

  const [originalLanguage, setOriginalLanguage] = useState('')
  const [status, setStatus] = useState('')
  const [order, setOrder] = useState('followedCount')
  const [selectedTags, setSelectedTags] = useState([])
  const [translatedLanguage, setTranslatedLanguage] = useState('')

  useEffect(() => {
    getTags().then((data) => {
      const genres = data
        .filter((t) => t.attributes.group === 'genre')
        .sort((a, b) => a.attributes.name.en.localeCompare(b.attributes.name.en))
      setTags(genres)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    browseManga({
      translatedLanguage: translatedLanguage || null,
      offset: page * PAGE_SIZE,
      limit: PAGE_SIZE,
      originalLanguage: originalLanguage || null,
      status: status || null,
      order,
      tagIds: selectedTags,
    }).then(({ results, total }) => {
      setMangas(results)
      setTotal(total)
      setLoading(false)
    })
    window.scrollTo(0, 0)
  }, [page, originalLanguage, status, order, selectedTags, translatedLanguage])

  useEffect(() => {
    setPage(0)
  }, [originalLanguage, status, order, selectedTags, translatedLanguage])

  const toggleTag = (id) => {
    setSelectedTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Directorio</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={originalLanguage}
          onChange={(e) => setOriginalLanguage(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos los tipos</option>
          <option value="ja">Manga</option>
          <option value="ko">Manhwa</option>
          <option value="zh">Manhua</option>
        </select>
        <select
          value={translatedLanguage}
          onChange={(e) => setTranslatedLanguage(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos los idiomas</option>
          <option value="es">Español</option>
          <option value="es-la">Español (Latino)</option>
          <option value="en">Inglés</option>
          <option value="pt-br">Portugués (Brasil)</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Cualquier estado</option>
          <option value="ongoing">En emisión</option>
          <option value="completed">Completado</option>
          <option value="hiatus">En pausa</option>
          <option value="cancelled">Cancelado</option>
        </select>

        <select
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="followedCount">Más populares</option>
          <option value="latestUploadedChapter">Recién actualizados</option>
          <option value="createdAt">Más recientes</option>
          <option value="rating">Mejor calificados</option>
          
        </select>


        <button
          onClick={() => setShowTags(!showTags)}
          className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-lg text-sm"
        >
          Géneros {selectedTags.length > 0 && `(${selectedTags.length})`}
        </button>
      </div>

      {showTags && (
        <div className="flex flex-wrap gap-2 mb-6 bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`text-sm px-3 py-1 rounded-full border ${
                selectedTags.includes(tag.id)
                  ? 'bg-purple-600 border-purple-600'
                  : 'bg-neutral-800 border-neutral-700 hover:border-purple-500'
              }`}
            >
              {tag.attributes.name.en}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-center mt-10 text-neutral-400">Cargando...</p>
      ) : (
        <>
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

          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-700 px-4 py-2 rounded-lg"
            >
              ← Anterior
            </button>
            <span className="text-neutral-400 text-sm">
              Página {page + 1} de {totalPages || 1}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="bg-purple-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-700 px-4 py-2 rounded-lg"
            >
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Directory