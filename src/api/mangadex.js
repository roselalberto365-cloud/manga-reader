const BASE_URL = "https://api.mangadex.org"

export async function getPopularManga(originalLanguage = null, translatedLanguage = null) {
  const params = new URLSearchParams()
  params.append("limit", "20")
  params.append("order[followedCount]", "desc")
  params.append("includes[]", "cover_art")
  params.append("contentRating[]", "safe")
  params.append("contentRating[]", "suggestive")
  if (originalLanguage) params.append("originalLanguage[]", originalLanguage)
  if (translatedLanguage) params.append("availableTranslatedLanguage[]", translatedLanguage)
  const res = await fetch(`${BASE_URL}/manga?${params.toString()}`)
  const data = await res.json()
  return data.data
}

export async function searchManga(title, tagIds = []) {
  const params = new URLSearchParams()
  if (title) params.append("title", title)
  params.append("limit", "20")
  params.append("includes[]", "cover_art")
  params.append("contentRating[]", "safe")
  params.append("contentRating[]", "suggestive")
  tagIds.forEach((id) => params.append("includedTags[]", id))
  const res = await fetch(`${BASE_URL}/manga?${params.toString()}`)
  const data = await res.json()
  return data.data
}

export async function getTags() {
  const res = await fetch(`${BASE_URL}/manga/tag`)
  const data = await res.json()
  return data.data
}

export async function getMangaById(id) {
  const res = await fetch(`${BASE_URL}/manga/${id}?includes[]=cover_art`)
  const data = await res.json()
  return data.data
}

export async function getChapters(mangaId, language = null) {
  const params = new URLSearchParams()
  if (language) {
    params.append("translatedLanguage[]", language)
  } else {
    params.append("translatedLanguage[]", "es")
    params.append("translatedLanguage[]", "en")
  }
  params.append("order[chapter]", "asc")
  params.append("limit", "100")
  const res = await fetch(`${BASE_URL}/manga/${mangaId}/feed?${params.toString()}`)
  const data = await res.json()
  return data.data
}

export async function getChapterInfo(chapterId) {
  const res = await fetch(`${BASE_URL}/chapter/${chapterId}`)
  const data = await res.json()
  return data.data
}

export async function getChapterPages(chapterId) {
  const res = await fetch(`${BASE_URL}/at-home/server/${chapterId}`)
  const data = await res.json()
  return data.chapter.data.map(
    (filename) => `${data.baseUrl}/data/${data.chapter.hash}/${filename}`
  )
}

export function getCoverUrl(manga) {
  const cover = manga.relationships?.find((r) => r.type === "cover_art")
  if (!cover) return null
  return `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}.256.jpg`
}

export function getTitle(manga) {
  return (
    manga.attributes.title.en ||
    Object.values(manga.attributes.title)[0] ||
    "Sin título"
  )
}

export async function browseManga({
  offset = 0,
  limit = 24,
  originalLanguage = null,
  status = null,
  order = "followedCount",
  tagIds = [],
} = {}) {
  const params = new URLSearchParams()
  params.append("limit", limit)
  params.append("offset", offset)
  params.append(`order[${order}]`, "desc")
  params.append("includes[]", "cover_art")
  params.append("contentRating[]", "safe")
  params.append("contentRating[]", "suggestive")
  if (originalLanguage) params.append("originalLanguage[]", originalLanguage)
  if (status) params.append("status[]", status)
  tagIds.forEach((id) => params.append("includedTags[]", id))

  const res = await fetch(`${BASE_URL}/manga?${params.toString()}`)
  const data = await res.json()
  return { results: data.data, total: data.total }
}

