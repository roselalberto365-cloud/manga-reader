import { Link } from 'react-router-dom'
import { getFavorites } from '../utils/storage'
import { useEffect, useState } from 'react'

function Favorites() {
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    setFavorites(getFavorites())
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Mis Favoritos</h1>
      {favorites.length === 0 && <p className="text-neutral-500">Aún no tienes mangas en favoritos.</p>}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {favorites.map((manga) => (
          <Link to={`/manga/${manga.id}`} key={manga.id} className="group">
            <img src={manga.cover} alt={manga.title} className="rounded-lg w-full aspect-[2/3] object-cover group-hover:opacity-80 transition" />
            <p className="text-sm mt-2 line-clamp-2 text-neutral-200">{manga.title}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Favorites