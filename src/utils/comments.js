import { supabase, getUserId } from './supabase'

export async function getComments(targetId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('target_id', targetId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error(error)
    return []
  }
  return data
}

export async function addComment(targetId, { author, text }) {
  await getUserId() // asegura la sesión antes de insertar

  const { data, error } = await supabase
    .from('comments')
    .insert({
      target_id: targetId,
      author: author?.trim().slice(0, 40) || 'Anónimo',
      text: text.trim().slice(0, 1000),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteComment(commentId) {
  await getUserId()

  const { data, error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .select()

  if (error) throw error
  if (!data || data.length === 0) throw new Error('No se pudo eliminar')
}