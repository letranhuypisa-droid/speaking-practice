import { useState, useEffect } from 'react'
import { supabase } from './services/supabase'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return session ? <Dashboard session={session} /> : <Auth />
}

export default App
