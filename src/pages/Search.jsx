import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchManga, getTags, getCoverUrl, getTitle } from '../api/mangadex'

function Search() {
  const [query, setQuery] = useState('')
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showTags, setShowTags] = useState(false)

  useEffect(() => {
    getTags().then((data) => {
      const genres = data
        .filter((t) => t.attributes.group === 'genre')
        .sort((a, b) => a.attributes.name.en.localeCompare(b.attributes.name.en))
      setTags(genres)
    })
  }, [])

  const toggleTag = (id) => {
    setSelectedTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  const handleSearch = async (e) => {
    e?.preventDefault()
    setLoading(true)
    const data = await searchManga(query, selectedTags)
    setResults(data)
    setLoading(false)
  }

  return (
    <div className="p-6">
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar manga..."
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
        />
        <button
          type="button"
          onClick={() => setShowTags(!showTags)}
          className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-lg text-sm"
        >
          Géneros {selectedTags.length > 0 && `(${selectedTags.length})`}
        </button>
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-medium">
          Buscar
        </button>
      </form>

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

      {loading && <p className="text-neutral-400">Buscando...</p>}

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {results.map((manga) => (
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
    </div>
  )
}

export default Search