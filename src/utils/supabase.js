import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Devuelve el ID del usuario anónimo (crea la sesión si no existe)
let userPromise = null

export function getUserId() {
  if (!userPromise) {
    userPromise = (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) return session.user.id
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      return data.user.id
    })().catch((err) => {
      userPromise = null
      throw err
    })
  }
  return userPromise
}