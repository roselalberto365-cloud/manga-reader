import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getMangaById, getChapters, getCoverUrl, getTitle } from '../api/mangadex'
import { isFavorite, toggleFavorite, getProgress, getReadChapters } from '../utils/storage'
import Comments from '../components/Comments'

function MangaDetail() {
  const { id } = useParams()
  const [manga, setManga] = useState(null)
  const [chapters, setChapters] = useState([])
  const [language, setLanguage] = useState('all')
  const [fav, setFav] = useState(false)
  const [progress, setProgress] = useState(null)
  const [readChapters, setReadChapters] = useState([])

  useEffect(() => {
    getMangaById(id).then((m) => {
      setManga(m)
      setFav(isFavorite(id))
    })
    setProgress(getProgress(id))
    setReadChapters(getReadChapters(id))
  }, [id])

  useEffect(() => {
    if (!id) return
    getChapters(id, language === 'all' ? null : language).then(setChapters)
  }, [id, language])

  if (!manga) return <p className="text-center mt-10 text-neutral-400">Cargando...</p>

  const description =
    manga.attributes.description.es ||
    manga.attributes.description.en ||
    'Sin descripción disponible.'

  const handleFavorite = () => {
    const nowFav = toggleFavorite({
      id: manga.id,
      title: getTitle(manga),
      cover: getCoverUrl(manga),
    })
    setFav(nowFav)
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex gap-6 flex-col sm:flex-row">
        <img src={getCoverUrl(manga)} alt={getTitle(manga)} className="w-40 sm:w-48 rounded-lg self-center sm:self-start"/>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-2">
            <h1 className="text-xl sm:text-2xl font-bold">
            <button
              onClick={handleFavorite}
              className={\self-start px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${`
                fav ? 'bg-purple-600 hover:bg-purple-700' : 'bg-neutral-800 hover:bg-neutral-700'
              }`}
            >
              {fav ? '★ En favoritos' : '☆ Agregar a favoritos'}
            </button>
          </div>
          <p className="text-neutral-400 text-sm whitespace-pre-line">{description}</p>

          {progress && (
            <Link
              to={`/read/${progress.chapterId}`}
              className="inline-block mt-4 bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg text-sm font-medium"
            >
              ▶ Continuar: Capítulo {progress.chapterNumber || '?'} · Página {progress.page || 1}
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-xl font-bold">Capítulos</h2>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1 text-sm"
        >
          <option value="all">Todos los idiomas</option>
          <option value="es">Español</option>
          <option value="en">Inglés</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        {chapters.length === 0 && <p className="text-neutral-500">No hay capítulos disponibles.</p>}
        {chapters.map((ch) => {
          const isRead = readChapters.includes(ch.id)
          const isCurrent = progress?.chapterId === ch.id
          return (
            <Link
              to={`/read/${ch.id}`}
              key={ch.id}
              className={`bg-neutral-900 hover:bg-neutral-800 border rounded-lg px-4 py-3 flex justify-between gap-3 ${
                isCurrent ? 'border-purple-500' : 'border-neutral-800'
              } ${isRead ? 'opacity-50' : ''}`}
            >
              <span>
                {isRead && '✓ '}
                Capítulo {ch.attributes.chapter || '?'} — {ch.attributes.title || 'Sin título'}
                {isCurrent && (
                  <span className="ml-2 text-xs text-purple-400">(pág. {progress.page || 1})</span>
                )}
              </span>
            
              <span className="text-neutral-500 text-sm uppercase shrink-0">{ch.attributes.translatedLanguage}</span>
            </Link>
          )
        })}
      </div>

      <Comments targetId={`manga-${id}`} />
    </div>
  )
}

export default MangaDetail
