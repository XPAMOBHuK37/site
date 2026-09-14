import React from 'react'
import { XCircle } from 'lucide-react'

export function DashboardModal({ name, setName, phone, setPhone, master, setMaster, time, setTime, masters, slots, onClose, onCreate }) {
  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 text-zinc-100 space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h3 className="text-lg font-bold">Новая запись</h3>
          <button onClick={onClose}><XCircle className="w-5 h-5 text-zinc-400" /></button>
        </div>
        <form onSubmit={onCreate} className="space-y-3">
          <input type="text" required placeholder="Имя" value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white" />
          <input type="tel" required placeholder="Телефон" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white" />
          <div className="grid grid-cols-2 gap-2">
            <select value={master} onChange={e => setMaster(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white">
              {masters.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
            <select value={time} onChange={e => setTime(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white">
              {slots.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-amber-500 text-zinc-950 font-bold p-3 rounded-xl text-sm mt-3">Создать</button>
        </form>
      </div>
    </div>
  )
}
