import React from 'react'
import { XCircle } from 'lucide-react'

export function DashboardModal({ name, setName, phone, setPhone, master, setMaster, time, setTime, masters, slots, services, selectedService, setSelectedService, onClose, onCreate }) {
  const handleNameChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ\s]/g, '')
    setName(val)
  }

  const handlePhoneChange = (e) => {
    let digits = e.target.value.replace(/\D/g, '')
    if (digits.startsWith('7') || digits.startsWith('8')) digits = digits.slice(1)
    digits = digits.slice(0, 10)
    
    let formatted = '+7'
    if (digits.length > 0) formatted += ' (' + digits.slice(0, 3)
    if (digits.length >= 3) formatted += ') ' + digits.slice(3, 6)
    if (digits.length >= 6) formatted += '-' + digits.slice(6, 8)
    if (digits.length >= 8) formatted += '-' + digits.slice(8, 10)
    
    setPhone(formatted)
  }

  const cleanPhoneDigits = phone.replace(/\D/g, '')
  const isValidName = name.trim().length >= 3
  const isValidPhone = cleanPhoneDigits.length === 11

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 text-zinc-100 space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h3 className="text-lg font-bold">Новая запись</h3>
          <button onClick={onClose}><XCircle className="w-5 h-5 text-zinc-400" /></button>
        </div>
        <form onSubmit={onCreate} className="space-y-3">
          <div>
            <label className="block text-xs uppercase text-zinc-400 mb-1">Имя клиента (мин. 3 буквы)</label>
            <input type="text" required placeholder="Иван" value={name} onChange={handleNameChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none" />
          </div>
          <div>
            <label className="block text-xs uppercase text-zinc-400 mb-1">Телефон</label>
            <input type="tel" required placeholder="+7 (999) 000-00-00" value={phone} onChange={handlePhoneChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none" />
          </div>
          <div>
            <label className="block text-xs uppercase text-zinc-400 mb-1">Услуга</label>
            <select value={selectedService} onChange={e => setSelectedService(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none">
              {services.map(s => <option key={s.id || s.title} value={s.title}>{s.title} — {s.price} ({s.duration || 60} мин)</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs uppercase text-zinc-400 mb-1">Мастер</label>
              <select value={master} onChange={e => setMaster(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none">
                {masters.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase text-zinc-400 mb-1">Время</label>
              <select value={time} onChange={e => setTime(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none">
                {slots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={!isValidName || !isValidPhone} className="w-full bg-amber-500 disabled:opacity-40 text-zinc-950 font-bold p-3 rounded-xl text-sm mt-3 cursor-pointer">Создать</button>
        </form>
      </div>
    </div>
  )
}
