import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Navbar from './components/Navbar'
import Landing from './components/Landing'
import BookingModal from './components/BookingModal'
import AuthModal from './components/AuthModal'
import Dashboard from './components/Dashboard'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)
  const [bookingData, setBookingData] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  useEffect(() => {
    const masterSessionStr = localStorage.getItem('korni_master_session')
    if (masterSessionStr) {
      try {
        const mObj = JSON.parse(masterSessionStr)
        setSession({ user: { email: mObj.email || mObj.phone, master: mObj } })
        setLoading(false)
        return
      } catch (e) {}
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, sess) => {
      setSession(sess)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center">Загрузка Корни Barbershop...</div>
  }

  if (showDashboard && session) {
    return <Dashboard session={session} onClose={() => setShowDashboard(false)} />
  }

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen font-sans">
      <Navbar
        onOpenBooking={(data = null) => { setBookingData(data); setShowBooking(true); }}
        onOpenAuth={() => setShowAuth(true)}
        session={session}
        onOpenDashboard={() => setShowDashboard(true)}
      />

      <Landing onOpenBooking={(data = null) => { setBookingData(data); setShowBooking(true); }} />

      {showBooking && (
        <BookingModal
          initialData={bookingData}
          onClose={() => setShowBooking(false)}
          onSuccess={() => {}}
        />
      )}

      {showAuth && !session && (
        <AuthModal
          onClose={() => setShowAuth(false)}
        />
      )}
    </div>
  )
}

