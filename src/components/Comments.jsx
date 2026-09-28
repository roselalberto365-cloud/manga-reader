import { useEffect, useState } from 'react'
import { getComments, addComment, deleteComment } from '../utils/comments'
import { getUserId } from '../utils/supabase'

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return 'justo ahora'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `hace ${days} d`
}

function Comments({ targetId }) {
  const [comments, setComments] = useState([])
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [author, setAuthor] = useState(localStorage.getItem('comment_author') || '')
  const [text, setText] = useState('')

  useEffect(() => {
    getUserId().then(setUserId).catch(() => setUserId(null))
  }, [])

  useEffect(() => {
    setLoading(true)
    getComments(targetId).then((data) => {
      setComments(data)
      setLoading(false)
    })
  }, [targetId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim() || sending) return

    // Límite simple anti-spam: 1 comentario cada 20 segundos
    const last = Number(localStorage.getItem('last_comment_time') || 0)
    if (Date.now() - last < 20000) {
      setError('Espera unos segundos antes de comentar de nuevo.')
      return
    }

    setSending(true)
    setError('')
    try {
      const newComment = await addComment(targetId, { author, text })
      setComments((prev) => [newComment, ...prev])
      setText('')
      localStorage.setItem('comment_author', author)
      localStorage.setItem('last_comment_time', Date.now().toString())
    } catch (err) {
      console.error(err)
      setError('No se pudo enviar el comentario. Intenta de nuevo.')
    }
    setSending(false)
  }

  const handleDelete = async (commentId) => {
    if (!window.confirm('¿Eliminar este comentario?')) return
    try {
      await deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch (err) {
      console.error(err)
      setError('No se pudo eliminar el comentario.')
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">
        Comentarios {comments.length > 0 && `(${comments.length})`}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-6">
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          maxLength={40}
          placeholder="Tu nombre (opcional)"
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          placeholder="Escribe un comentario..."
          rows={3}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 resize-none"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={sending}
          className="self-end bg-purple-600 disabled:opacity-50 hover:bg-purple-700 px-5 py-2 rounded-lg text-sm font-medium"
        >
          {sending ? 'Enviando...' : 'Comentar'}
        </button>
      </form>

      {loading && <p className="text-neutral-500 text-sm">Cargando comentarios...</p>}

      <div className="flex flex-col gap-3">
        {!loading && comments.length === 0 && (
          <p className="text-neutral-500 text-sm">Sé el primero en comentar.</p>
        )}
        {comments.map((c) => (
          <div
            key={c.id}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-purple-400 text-sm">{c.author}</span>
              <div className="flex items-center gap-3">
                <span className="text-neutral-500 text-xs">{timeAgo(c.created_at)}</span>
                {userId && c.user_id === userId && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-neutral-600 hover:text-red-400 text-xs"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
            <p className="text-neutral-200 text-sm whitespace-pre-line break-words">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Comments