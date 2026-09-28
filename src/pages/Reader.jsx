import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getChapterPages,
  getChapterInfo,
  getChapters,
  getMangaById,
  getCoverUrl,
  getTitle,
} from '../api/mangadex'
import { saveHistory, updatePage, getProgress, markChapterRead } from '../utils/storage'
import Comments from '../components/Comments'

function Reader() {
  const { chapterId } = useParams()
  const navigate = useNavigate()
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [prevChapter, setPrevChapter] = useState(null)
  const [nextChapter, setNextChapter] = useState(null)
  const [chapterLabel, setChapterLabel] = useState('')
  const [mangaId, setMangaId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const imgRefs = useRef([])
  const loadedRef = useRef(new Set())
  const restoreTarget = useRef(null) // índice (0-based) al que hay que volver
  const restored = useRef(false)

  // Salta a la página guardada cuando ya cargaron las imágenes de arriba
  const tryRestore = () => {
    const target = restoreTarget.current
    if (target === null || restored.current) return
    for (let i = 0; i <= target; i++) {
      if (!loadedRef.current.has(i)) return
    }
    imgRefs.current[target]?.scrollIntoView()
    restored.current = true
  }

  const handleImgDone = (i) => {
    loadedRef.current.add(i)
    tryRestore()
  }

  // Carga del capítulo
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setCurrentPage(1)
      restored.current = false
      restoreTarget.current = null
      loadedRef.current = new Set()
      imgRefs.current = []

      const chapterInfo = await getChapterInfo(chapterId)
      const mangaRel = chapterInfo.relationships.find((r) => r.type === 'manga')
      const id = mangaRel.id

      const [pagesData, chapters, manga] = await Promise.all([
        getChapterPages(chapterId),
        getChapters(id, chapterInfo.attributes.translatedLanguage),
        getMangaById(id),
      ])

      if (cancelled) return

      const saved = getProgress(id)
      if (saved && saved.chapterId === chapterId && saved.page > 1) {
        restoreTarget.current = Math.min(saved.page - 1, pagesData.length - 1)
      } else {
        restored.current = true
      }

      saveHistory({
        mangaId: id,
        mangaTitle: getTitle(manga),
        cover: getCoverUrl(manga),
        chapterId,
        chapterNumber: chapterInfo.attributes.chapter,
        timestamp: Date.now(),
      })

      const index = chapters.findIndex((c) => c.id === chapterId)
      setPrevChapter(index > 0 ? chapters[index - 1].id : null)
      setNextChapter(index < chapters.length - 1 ? chapters[index + 1].id : null)
      setChapterLabel(chapterInfo.attributes.chapter || '?')
      setMangaId(id)
      setPages(pagesData)
      setLoading(false)
    }

    load()
    window.scrollTo(0, 0)
    return () => {
      cancelled = true
    }
  }, [chapterId])

  // Detecta qué página se está viendo
  useEffect(() => {
    if (pages.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentPage(Number(entry.target.dataset.page))
          }
        })
      },
      { rootMargin: '-40% 0px -59% 0px' }
    )
    imgRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [pages])

  // Guarda la página actual (con pequeña espera para no escribir en cada scroll)
  useEffect(() => {
    if (!mangaId || !restored.current || pages.length === 0) return
    const timer = setTimeout(() => {
      updatePage(mangaId, chapterId, currentPage)
      if (currentPage >= pages.length) markChapterRead(mangaId, chapterId)
    }, 400)
    return () => clearTimeout(timer)
  }, [currentPage, mangaId, chapterId, pages])

  if (loading)
    return <p className="text-center mt-10 text-neutral-400">Cargando páginas...</p>

  return (
    <div className="flex flex-col items-center bg-black py-4">
      <div className="w-full max-w-2xl flex justify-between items-center mb-4 px-4">
        <Link to={mangaId ? `/manga/${mangaId}` : '/'} className="text-purple-400 hover:underline">
          ← Volver al manga
        </Link>
        <span className="text-neutral-400 text-sm">Capítulo {chapterLabel}</span>
      </div>

      {pages.map((url, i) => (
        <img
          key={url}
          ref={(el) => (imgRefs.current[i] = el)}
          data-page={i + 1}
          src={url}
          alt={`Página ${i + 1}`}
          onLoad={() => handleImgDone(i)}
          onError={() => handleImgDone(i)}
          className="max-w-full sm:max-w-2xl mb-1"
        />
      ))}

      <div className="w-full max-w-2xl flex justify-between items-center mt-4 px-4 pb-8">
        <button
          disabled={!prevChapter}
          onClick={() => navigate(`/read/${prevChapter}`)}
          className="bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-700 px-4 py-2 rounded-lg"
        >
          ← Anterior
        </button>
        <button
          disabled={!nextChapter}
          onClick={() => navigate(`/read/${nextChapter}`)}
          className="bg-purple-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-700 px-4 py-2 rounded-lg"
        >
          Siguiente →
        </button>
      </div>

      <div className="w-full max-w-2xl px-4">
        <Comments targetId={`chapter-${chapterId}`} />
      </div>

      {/* Indicador de página */}
      <div className="fixed bottom-4 right-4 bg-neutral-900/90 border border-neutral-700 text-sm px-3 py-1 rounded-full">
        Pág. {currentPage} / {pages.length}
      </div>
    </div>
  )
}

export default Reader