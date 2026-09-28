import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Search from './pages/Search'
import Directory from './pages/Directory'
import MangaDetail from './pages/MangaDetail'
import Reader from './pages/Reader'
import Favorites from './pages/Favorites'
import History from './pages/History'

function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white overflow-x-hidden">
      <nav className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 sm:px-6 py-3 sm:py-4 bg-neutral-900 border-b border-neutral-800">
        <Link to="/" className="text-xl font-bold text-purple-500">
          MangaReader
        </Link>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Link to="/directory" className="text-neutral-300 hover:text-purple-400">Directorio</Link>
          <Link to="/history" className="text-neutral-300 hover:text-purple-400">Historial</Link>
          <Link to="/favorites" className="text-neutral-300 hover:text-purple-400">Favoritos</Link>
          <Link to="/search" className="text-neutral-300 hover:text-purple-400">Buscar</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/manga/:id" element={<MangaDetail />} />
        <Route path="/read/:chapterId" element={<Reader />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </div>
  )
}

export default App
