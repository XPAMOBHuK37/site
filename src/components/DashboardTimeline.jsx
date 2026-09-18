import React from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react'

const masterColors = [
  { bg: 'bg-amber-500/15', border: 'border-amber-500/50', text: 'text-amber-300', dot: 'bg-amber-500', badge: 'bg-amber-500 text-zinc-950' },
  { bg: 'bg-emerald-500/15', border: 'border-emerald-500/50', text: 'text-emerald-300', dot: 'bg-emerald-500', badge: 'bg-emerald-500 text-zinc-950' },
  { bg: 'bg-violet-500/15', border: 'border-violet-500/50', text: 'text-violet-300', dot: 'bg-violet-500', badge: 'bg-violet-500 text-zinc-950' },
  { bg: 'bg-sky-500/15', border: 'border-sky-500/50', text: 'text-sky-300', dot: 'bg-sky-500', badge: 'bg-sky-500 text-zinc-950' },
  { bg: 'bg-rose-500/15', border: 'border-rose-500/50', text: 'text-rose-300', dot: 'bg-rose-500', badge: 'bg-rose-500 text-zinc-950' },
]

const getMasterColor = (masterName) => {
  if (!masterName) return masterColors[0]
  let hash = 0
  for (let i = 0; i < masterName.length; i++) {
    hash = masterName.charCodeAt(i) + ((hash << 5) - hash)
  }
  const idx = Math.abs(hash) % masterColors.length
  return masterColors[idx]
}

export function DashboardTimeline({ date, onDateChange, filtered, onSelectSlot, onDeleteAppt, services, daysOff, onToggleDayOff, dailySchedules, onUpdateDailyHours, closedHours, onToggleClosedHour }) {
  const getDaysWindow = (baseDateStr) => {
    const [y, m, d] = (baseDateStr || new Date().toISOString().split('T')[0]).split('-').map(Number)
    const baseDate = new Date(y, m - 1, d)
    const days = []
    for (let i = 0; i < 3; i++) {
      const nextDay = new Date(baseDate)
      nextDay.setDate(baseDate.getDate() + i)
      days.push(`${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`)
    }
    return days
  }

  const viewDays = getDaysWindow(date)
  const todayStr = new Date().toISOString().split('T')[0]

  const shiftDays = (offset) => {
    const [y, m, d] = date.split('-').map(Number)
    const base = new Date(y, m - 1, d + (offset * 3))
    onDateChange(base.toISOString().split('T')[0])
  }

  const hours = []
  for (let h = 8; h <= 23; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`)
  }

  const fmt = (s) => new Date(s).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'numeric' })

  const getServicePrice = (title) => {
    const s = services?.find(srv => srv.title === title)
    return s ? s.price : '1 500 ₽'
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-white">Период: {fmt(viewDays[0])} — {fmt(viewDays[2])}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => shiftDays(-1)} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer">
            <ChevronLeft className="w-4 h-4" /><span>← Назад</span>
          </button>
          <button onClick={() => onDateChange(todayStr)} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg text-xs font-bold cursor-pointer">Сегодня</button>
          <button onClick={() => shiftDays(1)} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer">
            <span>Вперед →</span><ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-zinc-800 rounded-xl">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-4 bg-zinc-950 border-b border-zinc-800 text-xs font-semibold text-zinc-400 text-center py-3">
            <div className="px-3 text-left font-bold text-amber-400">Час</div>
            {viewDays.map(d => {
              const isToday = d === todayStr
              const isOff = daysOff?.includes(d)
              const daySched = dailySchedules?.[d]
              return (
                <div key={d} className={`border-l border-zinc-800 px-3 py-1.5 flex flex-col items-center justify-center gap-1 ${isToday ? 'bg-amber-500/20 text-amber-300 font-extrabold border-amber-500/80 shadow-md' : ''}`}>
                  <div className="flex items-center justify-between w-full px-2 gap-1">
                    <span className="text-sm">{fmt(d)}</span>
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onUpdateDailyHours && onUpdateDailyHours(d); }} 
                        className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-zinc-800 hover:bg-zinc-700 text-amber-300 transition cursor-pointer"
                        title="Настроить часы работы на этот день"
                      >
                        {daySched ? `${daySched.start?.slice(0,5)}-${daySched.end?.slice(0,5)}` : '⏱ Часы'}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onToggleDayOff && onToggleDayOff(d); }} 
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase transition cursor-pointer ${isOff ? 'bg-red-500 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}`}
                        title="Поставить выходной на весь день"
                      >
                        {isOff ? '🌙 Вых.' : 'Вых.'}
                      </button>
                    </div>
                  </div>
                  {isToday && <span className="text-[10px] uppercase tracking-wider text-amber-400">Сегодня</span>}
                  {isOff && <span className="text-[10px] uppercase text-red-400 font-bold">Выходной день</span>}
                </div>
              )
            })}
          </div>

          {hours.map(h => {
            const hourPrefix = h.slice(0, 2)
            const hourNum = parseInt(hourPrefix)
            return (
              <div key={h} className="grid grid-cols-4 border-b border-zinc-800/80 items-stretch min-h-[90px] hover:bg-zinc-950/40 transition">
                <div className="px-3 py-2 text-xs font-mono font-semibold text-zinc-400 border-r border-zinc-800 bg-zinc-900/60 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-500/70" />{h}
                </div>
                {viewDays.map(d => {
                  const isToday = d === todayStr
                  const isOff = daysOff?.includes(d)
                  const daySched = dailySchedules?.[d]
                  let isNonWorking = false
                  if (daySched && daySched.start && daySched.end) {
                    const startH = parseInt(daySched.start.split(':')[0])
                    const endH = parseInt(daySched.end.split(':')[0])
                    if (hourNum < startH || hourNum > endH) {
                      isNonWorking = true
                    }
                  }

                  const isHourClosed = closedHours?.[d]?.[h]
                  const hourAppts = filtered.filter(a => a.date === d && a.start_time?.slice(0, 2) === hourPrefix)

                  return (
                    <div 
                      key={d + h} 
                      onClick={() => { if (!isOff && !isNonWorking && !isHourClosed && onSelectSlot) onSelectSlot(d, h) }} 
                      className={`border-l border-zinc-800/80 p-1.5 flex flex-col justify-center gap-1.5 cursor-pointer transition hover:bg-zinc-800/40 ${isOff || isNonWorking || isHourClosed ? 'bg-zinc-950/80 opacity-60 cursor-not-allowed' : isToday ? 'bg-amber-500/[0.03]' : ''}`}
                    >
                      {isOff ? (
                        <div className="text-center text-xs text-zinc-600 font-semibold uppercase tracking-widest py-4">Выходной</div>
                      ) : isNonWorking ? (
                        <div className="text-center text-xs text-zinc-600 font-semibold uppercase tracking-widest py-4">Закрыто</div>
                      ) : isHourClosed ? (
                        <div className="text-center py-3 space-y-1">
                          <span className="text-[11px] text-red-400 font-bold block">🔒 Закрыто ({h})</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onToggleClosedHour && onToggleClosedHour(d, h); }}
                            className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2 py-0.5 rounded font-semibold transition cursor-pointer"
                          >
                            Открыть
                          </button>
                        </div>
                      ) : hourAppts.length > 0 ? (
                        hourAppts.map(appt => {
                          const apptTheme = getMasterColor(appt.master_name)
                          return (
                            <div key={appt.id} className={`w-full p-2.5 rounded-xl border text-xs shadow-lg space-y-1 ${apptTheme.bg} ${apptTheme.border} ${apptTheme.text}`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-bold text-xs text-white flex items-center space-x-1.5">
                                    <span className={`w-2 h-2 rounded-full ${apptTheme.dot}`} />
                                    <span>{appt.client_name}</span>
                                  </div>
                                  <div className="text-[10px] text-zinc-300">📞 {appt.client_phone}</div>
                                </div>
                                {onDeleteAppt && (
                                  <button onClick={(e) => { e.stopPropagation(); onDeleteAppt(appt.id) }} className="text-red-400 hover:text-red-300 p-1 bg-red-500/10 rounded cursor-pointer" title="Удалить запись">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              {appt.service_title && (
                                <div className="flex justify-between items-center pt-1 border-t border-zinc-800/60 text-[10px]">
                                  <span className="font-semibold truncate max-w-[100px]">{appt.service_title}</span>
                                  <span className="font-bold">{getServicePrice(appt.service_title)}</span>
                                </div>
                              )}
                              <div className="pt-0.5 flex justify-between items-center text-[10px]">
                                <span className="font-mono text-zinc-400">{appt.start_time?.slice(0, 5)}</span>
                                <span className={`${apptTheme.badge} font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center space-x-1`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${apptTheme.dot}`} />
                                  <span>{appt.master_name || 'Мастер'}</span>
                                </span>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-2 space-y-1">
                          <span className="text-[11px] text-zinc-600 hover:text-amber-500 font-bold block">+ Свободно ({h})</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onToggleClosedHour && onToggleClosedHour(d, h); }}
                            className="text-[10px] text-zinc-500 hover:text-red-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 transition cursor-pointer"
                            title="Закрыть этот час"
                          >
                            🔒 Закрыть час
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
