const FAVORITES_KEY = "manga_favorites"
const HISTORY_KEY = "manga_history"
const READ_KEY = "manga_read_chapters"

// ---------- Favoritos ----------
export function getFavorites() {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]")
}

export function isFavorite(id) {
  return getFavorites().some((m) => m.id === id)
}

export function toggleFavorite(manga) {
  const favorites = getFavorites()
  const exists = favorites.some((m) => m.id === manga.id)
  const updated = exists
    ? favorites.filter((m) => m.id !== manga.id)
    : [...favorites, manga]
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
  return !exists
}

// ---------- Historial y progreso ----------
export function getHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]")
}

export function saveHistory(entry) {
  const history = getHistory()
  const prev = history.find((h) => h.mangaId === entry.mangaId)
  const rest = history.filter((h) => h.mangaId !== entry.mangaId)
  // Si es el mismo capítulo, conserva la página guardada
  const page = prev && prev.chapterId === entry.chapterId ? prev.page || 1 : 1
  const updated = [{ ...entry, page }, ...rest].slice(0, 50)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
}

export function updatePage(mangaId, chapterId, page) {
  const updated = getHistory().map((h) =>
    h.mangaId === mangaId && h.chapterId === chapterId
      ? { ...h, page, timestamp: Date.now() }
      : h
  )
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
}

export function getProgress(mangaId) {
  return getHistory().find((h) => h.mangaId === mangaId) || null
}

// ---------- Capítulos leídos ----------
export function markChapterRead(mangaId, chapterId) {
  const all = JSON.parse(localStorage.getItem(READ_KEY) || "{}")
  const list = all[mangaId] || []
  if (!list.includes(chapterId)) {
    all[mangaId] = [...list, chapterId]
    localStorage.setItem(READ_KEY, JSON.stringify(all))
  }
}

export function getReadChapters(mangaId) {
  const all = JSON.parse(localStorage.getItem(READ_KEY) || "{}")
  return all[mangaId] || []
}