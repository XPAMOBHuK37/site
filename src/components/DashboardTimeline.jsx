import React from 'react'

export function DashboardTimeline({ date, slots, masters, filtered, onSelectSlot, onUpdateStatus }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-zinc-800 flex justify-between items-center"><h3 className="text-lg font-bold">Таймлайн на {date}</h3><span className="text-xs text-zinc-400">Записей: {filtered.length}</span></div>
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-7 bg-zinc-950 border-b border-zinc-800 text-xs font-semibold text-zinc-400 text-center py-3">
            <div className="px-4 text-left">Мастер</div>
            {slots.map(t => <div key={t} className="border-l border-zinc-800">{t}</div>)}
          </div>
          {masters.map(m => (
            <div key={m} className="grid grid-cols-7 border-b border-zinc-800 items-center min-h-[80px]">
              <div className="p-4 font-bold text-white border-r border-zinc-800 bg-zinc-900/50 text-sm">{m}</div>
              {slots.map(t => {
                const appt = filtered.find(a => a.start_time?.startsWith(t.slice(0, 2)))
                return (
                  <div key={t} onClick={() => { if (!appt) onSelectSlot(m, t) }} className="border-l border-zinc-800 h-full p-2 flex items-center justify-center cursor-pointer min-h-[80px]">
                    {appt ? (
                      <div className={"w-full p-2 rounded-xl border text-xs " + (appt.status === 'Завершена' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-amber-500/10 border-amber-500/40 text-amber-300')}>
                        <div className="font-bold truncate">{appt.client_name}</div>
                        <div className="text-[10px] opacity-80">{appt.client_phone}</div>
                        <div className="mt-1 flex justify-between items-center">
                          <span className="text-[10px]">{appt.start_time}</span>
                          <select value={appt.status} onChange={e => onUpdateStatus(appt.id, e.target.value)} className="bg-zinc-950 text-[10px] border border-zinc-700 rounded text-white" onClick={e => e.stopPropagation()}>
                            <option value="Подтверждена">Ок</option>
                            <option value="Завершена">Готово</option>
                            <option value="Отменена">Отмена</option>
                          </select>
                        </div>
                      </div>
                    ) : <span className="text-[10px] text-zinc-600">+</span>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
