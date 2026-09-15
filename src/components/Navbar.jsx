import React, { useState, useEffect } from 'react'
import { Calendar, User, LogIn, Menu, X, Bell } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Navbar({ onOpenBooking, onOpenAuth, session, onOpenDashboard }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (session) {
      supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'Подтверждена').then(({ count }) => {
        if (count !== null) setPendingCount(count)
      })
    }
  }, [session])

  const handleNavClick = (href, e) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const element = document.querySelector(href)
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#121212]/95 backdrop-blur-md border-b border-[#2a2a2a]">
      <div className="max-w-[1200px] mx-auto flex justify-between items-center px-5 py-3">
        <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center cursor-pointer">
          <img src="/logo.svg" alt="Корни" className="h-12 sm:h-14 w-auto object-contain" />
        </a>
        
        <nav className="hidden md:flex items-center space-x-[30px]">
          <a href="#services" onClick={(e) => handleNavClick('#services', e)} className="text-[13px] font-semibold tracking-[1.5px] uppercase text-[#d1d1d1] hover:text-[#794d38] transition">Услуги</a>
          <a href="#masters" onClick={(e) => handleNavClick('#masters', e)} className="text-[13px] font-semibold tracking-[1.5px] uppercase text-[#d1d1d1] hover:text-[#794d38] transition">Мастера</a>
          <a href="#contacts" onClick={(e) => handleNavClick('#contacts', e)} className="text-[13px] font-semibold tracking-[1.5px] uppercase text-[#d1d1d1] hover:text-[#794d38] transition">Контакты</a>
          <a href="#booking" onClick={(e) => { e.preventDefault(); onOpenBooking(); }} className="text-[13px] font-semibold tracking-[1.5px] uppercase text-[#d1d1d1] hover:text-[#794d38] transition">Запись</a>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {session ? (
            <div className="flex items-center space-x-3">
              <button onClick={onOpenDashboard} className="relative bg-[#1e1e1e] hover:bg-[#2a2a2a] text-amber-400 p-2.5 rounded-lg text-sm font-medium flex items-center justify-center border border-[#794d38]/50 transition" title="Новые записи">
                <Bell className="w-4 h-4" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#121212]">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button onClick={onOpenDashboard} className="bg-[#1e1e1e] hover:bg-[#2a2a2a] text-amber-400 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 border border-[#794d38]/50 transition">
                <User className="w-4 h-4" /><span>Кабинет</span>
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="text-[#a0a0a0] hover:text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1 transition">
              <LogIn className="w-4 h-4" /><span>Вход</span>
            </button>
          )}

          <button onClick={onOpenBooking} className="bg-[#794d38] hover:bg-[#613c2b] text-white px-6 py-2.5 rounded text-[14px] font-semibold tracking-[1px] uppercase transition shadow-lg shadow-[#794d38]/30">
            Записаться
          </button>
        </div>

        <div className="flex md:hidden items-center space-x-3">
          <button onClick={onOpenBooking} className="bg-[#794d38] text-white px-3 py-1.5 rounded text-xs font-semibold uppercase">Запись</button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="flex flex-col gap-1 p-2 cursor-pointer bg-[#1e1e1e] rounded border border-[#2a2a2a]">
            {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1e1e1e] border-b border-[#2a2a2a] px-5 py-4 space-y-3">
          <a href="#services" onClick={(e) => handleNavClick('#services', e)} className="block py-2 text-sm uppercase text-[#d1d1d1]">Услуги</a>
          <a href="#masters" onClick={(e) => handleNavClick('#masters', e)} className="block py-2 text-sm uppercase text-[#d1d1d1]">Мастера</a>
          <a href="#contacts" onClick={(e) => handleNavClick('#contacts', e)} className="block py-2 text-sm uppercase text-[#d1d1d1]">Контакты</a>
          <div className="pt-3 border-t border-[#2a2a2a]">
            {session ? (
              <button onClick={() => { setMobileMenuOpen(false); onOpenDashboard(); }} className="w-full bg-[#121212] text-amber-400 px-4 py-2.5 rounded text-sm font-medium flex items-center justify-center space-x-2 border border-[#794d38]/30">
                <Bell className="w-4 h-4" /><span>Кабинет ({pendingCount} новых)</span>
              </button>
            ) : (
              <button onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }} className="w-full bg-[#121212] text-[#a0a0a0] px-4 py-2.5 rounded text-sm font-medium flex items-center justify-center space-x-2">
                <LogIn className="w-4 h-4" /><span>Вход</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}





