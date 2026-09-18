import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../supabaseClient'

export function StepMaster({ masters, mst, setMst, onNext }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs uppercase text-zinc-400 font-bold tracking-wider">1. Выберите мастера</h4>
      <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
        {masters.map((m, i) => {
          const name = typeof m === 'string' ? m : m.name
          const isSelected = mst?.id === m.id || mst?.name === name || mst === name
          return (
            <div 
              key={m.id || i} 
              onClick={() => { setMst(m); onNext(); }} 
              className={`p-3 rounded-xl border cursor-pointer transition text-center flex flex-col items-center justify-center space-y-2 ${isSelected ? 'border-amber-500 bg-amber-500/20 text-white font-bold shadow-lg' : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700'}`}
            >
              <img src={m.photo_url || '/logo.svg'} onError={(e) => { e.target.src = '/logo.svg'; }} alt={name} className="w-12 h-12 rounded-full object-cover border border-amber-500/40" />
              <span className="text-xs font-semibold leading-tight">{name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function StepService({ svcs, mst, srv, setSrv, onNext }) {
  const masterId = typeof mst === 'object' ? mst?.id : null
  const masterName = typeof mst === 'string' ? mst : mst?.name

  const generalSvcs = svcs.filter(item => !item.master_id || item.master_id === '' || item.master_id === 'null')
  const masterSvcs = svcs.filter(item => {
    if (!item.master_id || item.master_id === '' || item.master_id === 'null') return false
    return item.master_id === masterId || item.master_id === masterName || item.master_name === masterName
  })

  return (
    <div className="space-y-3">
      <h4 className="text-xs uppercase text-zinc-400 font-bold tracking-wider">2. Выберите услугу</h4>
      <div className="max-h-[320px] overflow-y-auto space-y-3 pr-1">
        {generalSvcs.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase text-amber-500 font-extrabold tracking-widest">Общие услуги</div>
            <div className="grid grid-cols-2 gap-2">
              {generalSvcs.map((item, i) => {
                const title = item.title || item.t || 'Услуга'
                const price = item.price || item.pr || '1 500 ₽'
                const isSelected = srv?.id === item.id || srv?.title === title
                return (
                  <div key={item.id || i} onClick={() => { setSrv(item); onNext(); }} className={`p-2.5 rounded-xl border cursor-pointer flex flex-col justify-between transition ${isSelected ? 'border-amber-500 bg-amber-500/20 text-white font-bold' : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700'}`}>
                    <span className="font-semibold text-xs truncate mb-1">{title}</span>
                    <span className="text-amber-400 font-bold text-xs">{price}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {masterSvcs.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase text-amber-500 font-extrabold tracking-widest">Услуги мастера</div>
            <div className="grid grid-cols-2 gap-2">
              {masterSvcs.map((item, i) => {
                const title = item.title || item.t || 'Услуга'
                const price = item.price || item.pr || '1 500 ₽'
                const isSelected = srv?.id === item.id || srv?.title === title
                return (
                  <div key={item.id || i} onClick={() => { setSrv(item); onNext(); }} className={`p-2.5 rounded-xl border cursor-pointer flex flex-col justify-between transition ${isSelected ? 'border-amber-500 bg-amber-500/20 text-white font-bold' : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700'}`}>
                    <span className="font-semibold text-xs truncate mb-1">{title}</span>
                    <span className="text-amber-400 font-bold text-xs">{price}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function StepTime({ date, setDate, time, setTime, slots, onNext, srv, mst }) {
  const [fetchedAppts, setFetchedAppts] = useState([])
  const [fetchedMasterObj, setFetchedMasterObj] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('appointments').select('*')
        if (data) {
          setFetchedAppts(data)
          localStorage.setItem('korni_local_appointments', JSON.stringify(data))
        }
      } catch (e) {}

      try {
        const { data } = await supabase.from('masters').select('*')
        if (data) {
          localStorage.setItem('korni_local_masters', JSON.stringify(data))
          const masterName = typeof mst === 'string' ? mst : (mst?.name || '')
          const found = data.find(m => m.name === masterName)
          if (found) setFetchedMasterObj(found)
        }
      } catch (e) {}
    })()
  }, [mst])

  const days = []
  const today = new Date()
  
  for (let i = 0; i < 14; i++) {
    const d = new Date()
    d.setDate(today.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dayName = d.toLocaleDateString('ru-RU', { weekday: 'short' })
    const dayNum = d.getDate()
    const monthName = d.toLocaleDateString('ru-RU', { month: 'short' })
    days.push({ dateStr, dayName, dayNum, monthName })
  }

  const selectedDateObj = new Date(date)
  const isToday = selectedDateObj.toDateString() === today.toDateString()
  const currentMinutes = today.getHours() * 60 + today.getMinutes()

  const masterName = typeof mst === 'string' ? mst : (mst?.name || '')
  let masterObj = fetchedMasterObj || (typeof mst === 'object' ? mst : null)
  if (!masterObj) {
    try {
      const allMasters = JSON.parse(localStorage.getItem('korni_local_masters') || '[]')
      masterObj = allMasters.find(m => m.name === masterName)
    } catch (e) {}
  }
  const daysOff = masterObj?.days_off || []
  const isDayOff = daysOff.includes(date)

  const closedHoursMap = masterObj?.closed_hours?.[date] || {}
  const isHourClosed = (t) => {
    const hourPrefix = t.slice(0, 2) + ':00'
    const shortHour = t.slice(0, 2)
    return closedHoursMap[t] || closedHoursMap[hourPrefix] || closedHoursMap[shortHour] || closedHoursMap[Number(shortHour)]
  }

  let existingAppts = []
  try {
    const allAppts = fetchedAppts.length > 0 ? fetchedAppts : JSON.parse(localStorage.getItem('korni_local_appointments') || '[]')
    existingAppts = allAppts.filter(a => {
      if (a.date !== date) return false
      if (a.status && a.status === 'Отменена') return false
      if (masterName && a.master_name) {
        const m1 = masterName.toLowerCase().trim()
        const m2 = a.master_name.toLowerCase().trim()
        if (m1 !== m2 && !m1.includes(m2) && !m2.includes(m1)) return false
      }
      return true
    })
  } catch (e) {}

  const serviceDuration = Number(srv?.duration || srv?.dur || 60) // in minutes

  const isSlotBusy = (t) => {
    if (isDayOff) return true
    if (isHourClosed(t)) return true

    const [h, m] = t.split(':').map(Number)
    const slotStart = h * 60 + m
    const slotEnd = slotStart + serviceDuration

    if (isToday && slotStart <= currentMinutes) return true

    for (const appt of existingAppts) {
      if (!appt.start_time) continue
      const [ah, am] = appt.start_time.split(':').map(Number)
      const apptStart = ah * 60 + am
      const apptDuration = 60 // default appt duration if unknown
      const apptEnd = apptStart + apptDuration

      // Учитывать только вперед: если сегодня и запись уже закончилась, она не блокирует
      if (isToday && apptEnd <= currentMinutes) continue

      if (slotStart < apptEnd && slotEnd > apptStart) {
        return true
      }
    }
    return false
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs uppercase text-zinc-400 font-bold tracking-wider">3. Выберите дату и время</h4>
      
      <div>
        <label className="block text-[10px] uppercase text-zinc-400 mb-1 font-semibold">Дата</label>
        <div className="grid grid-cols-7 gap-1">
          {days.map(d => {
            const isSelected = date === d.dateStr
            const isOff = daysOff.includes(d.dateStr)
            return (
              <button
                key={d.dateStr}
                type="button"
                onClick={() => setDate(d.dateStr)}
                className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition cursor-pointer ${
                  isSelected 
                    ? 'border-amber-500 bg-amber-500 text-zinc-950 font-bold shadow-lg' 
                    : isOff 
                      ? 'border-red-500/40 bg-red-500/15 text-red-400 hover:border-red-500/60' 
                      : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <span className="text-[8px] uppercase tracking-wider">{d.dayName}</span>
                <span className="text-xs font-extrabold">{d.dayNum}</span>
              </button>
            )
          })}
        </div>
      </div>

      {isDayOff && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-semibold">
          ⚠️ Выбранный мастер не работает в этот день (выходной). Выберите другую дату.
        </div>
      )}

      <div>
        <label className="block text-[10px] uppercase text-zinc-400 mb-1 font-semibold">Время</label>
        <div className="grid grid-cols-4 gap-1.5">
          {slots.map(t => {
            const busy = isSlotBusy(t)
            const isSelected = time === t
            return (
              <button
                key={t}
                type="button"
                disabled={busy}
                onClick={() => { if (!busy) { setTime(t); onNext(); } }}
                className={`p-2 text-xs rounded-lg border font-semibold transition text-center ${
                  busy
                    ? 'border-zinc-900 bg-zinc-900/60 text-zinc-600 cursor-not-allowed line-through'
                    : isSelected
                      ? 'border-amber-500 bg-amber-500/20 text-white font-bold shadow-lg cursor-pointer'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700 cursor-pointer'
                }`}
              >
                {t}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function StepContacts({ name, setName, phone, setPhone, onNext }) {
  const [agreed, setAgreed] = React.useState(false)
  const [showPrivacy, setShowPrivacy] = React.useState(false)

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
    <div className="space-y-3">
      <h4 className="text-xs uppercase text-zinc-400 font-bold tracking-wider">4. Контактные данные</h4>
      <div>
        <label className="block text-[10px] uppercase text-zinc-400 mb-1 font-semibold">Ваше имя (мин. 3 буквы)</label>
        <input 
          type="text" 
          placeholder="Иван" 
          value={name} 
          onChange={handleNameChange} 
          required 
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500" 
        />
      </div>
      <div>
        <label className="block text-[10px] uppercase text-zinc-400 mb-1 font-semibold">Номер телефона</label>
        <input 
          type="tel" 
          placeholder="+7 (999) 000-00-00" 
          value={phone} 
          onChange={handlePhoneChange} 
          required 
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500" 
        />
      </div>

      <div className="flex items-start space-x-2 pt-1">
        <input 
          type="checkbox" 
          id="privacyCheckbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-4 h-4 accent-amber-500 rounded bg-zinc-950 border-zinc-800 cursor-pointer mt-0.5 shrink-0"
        />
        <label htmlFor="privacyCheckbox" className="text-[11px] text-zinc-400 leading-tight select-none cursor-pointer">
          Нажимая кнопку «Записаться», я даю согласие на обработку персональных данных в соответствии с{' '}
          <span 
            onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}
            className="text-amber-400 underline hover:text-amber-300"
          >
            Политикой конфиденциальности
          </span>.
        </label>
      </div>

      <button 
        disabled={!isValidName || !isValidPhone || !agreed} 
        onClick={onNext} 
        className="w-full mt-2 bg-amber-500 disabled:opacity-40 text-zinc-950 font-bold p-3 rounded-xl cursor-pointer hover:bg-amber-400 transition"
      >
        Далее
      </button>

      {showPrivacy && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[10000]">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg text-zinc-100 p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-amber-400">Политика конфиденциальности и соглашение</h3>
              <button onClick={() => setShowPrivacy(false)} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto pr-2 text-xs space-y-3 text-zinc-300 leading-relaxed">
              <p className="font-bold text-white uppercase tracking-wider">СОГЛАСИЕ НА ОБРАБОТКУ ПЕРСОНАЛЬНЫХ ДАННЫХ</p>
              <p>Настоящим я, действуя свободно, своей волей и в своем интересе, оставляя заявку на сайте korni37.ru, даю свое согласие Администрации сайта korni37.ru (Барбершоп «Корни», г. Иваново, пер. Степанова, д. 12) (далее — «Оператор»), на обработку моих персональных данных на следующих условиях:</p>
              
              <p className="font-semibold text-white">1. Перечень обрабатываемых персональных данных</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Имя.</li>
                <li>Контактный номер телефона.</li>
              </ul>

              <p className="font-semibold text-white">2. Цели обработки персональных данных</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Обработка входящих заявок и осуществление онлайн-записи на услуги барбершопа.</li>
                <li>Направление сервисных и информационных уведомлений, связанных с подтверждением и статусом записи (включая СМС-оповещения, сообщения в Telegram, ВКонтакте и иные каналы связи).</li>
                <li>Обратная связь для уточнения деталей записи и оценки качества обслуживания.</li>
              </ul>

              <p className="font-semibold text-white">3. Способы обработки персональных данных</p>
              <p>Оператор осуществляет сбор, запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу (в том числе доступ системам бронирования и рассылки уведомлений), блокирование, удаление и уничтожение персональных данных с использованием средств автоматизации и без их использования.</p>

              <p className="font-semibold text-white">4. Срок действия согласия и порядок его отзыва</p>
              <p>Согласие вступает в силу с момента его принятия (проставления галочки в чек-боксе и нажатия кнопки отправки формы на сайте korni37.ru) и действует до момента достижения целей обработки.</p>
              <p>Согласие может быть отозвано в любой момент путем направления письменного заявления Оператору по адресу: г. Иваново, пер. Степанова, д. 12, либо на контактную электронную почту барбершопа, указанную на сайте. В случае отзыва согласия Оператор обязуется прекратить обработку данных.</p>
            </div>
            <button onClick={() => setShowPrivacy(false)} className="w-full mt-4 bg-amber-500 text-zinc-950 font-bold p-2.5 rounded-xl cursor-pointer hover:bg-amber-400 transition">
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function StepConfirm({ srv, mst, date, time, name, phone, load, onSubmit }) {
  const masterName = typeof mst === 'string' ? mst : (mst?.name || 'Мастер')
  const title = srv?.title || srv?.t || 'Услуга'
  const price = srv?.price || srv?.pr || '1 500 ₽'

  return (
    <div className="space-y-3">
      <h4 className="text-xs uppercase text-zinc-400 font-bold tracking-wider">5. Подтверждение записи</h4>
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs space-y-2">
        <div className="flex justify-between border-b border-zinc-900 pb-1.5"><span className="text-zinc-400">Мастер:</span><span className="font-bold text-amber-400">{masterName}</span></div>
        <div className="flex justify-between border-b border-zinc-900 pb-1.5"><span className="text-zinc-400">Услуга:</span><span className="font-bold text-white">{title}</span></div>
        <div className="flex justify-between border-b border-zinc-900 pb-1.5"><span className="text-zinc-400">Стоимость:</span><span className="font-bold text-amber-400">{price}</span></div>
        <div className="flex justify-between border-b border-zinc-900 pb-1.5"><span className="text-zinc-400">Дата и время:</span><span className="font-bold text-white">{date} в {time}</span></div>
        <div className="flex justify-between"><span className="text-zinc-400">Клиент:</span><span className="font-bold text-white">{name} ({phone})</span></div>
      </div>
      <button disabled={load} onClick={onSubmit} className="w-full mt-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold p-3 rounded-xl cursor-pointer transition">
        {load ? 'Обработка...' : 'Подтвердить запись'}
      </button>
    </div>
  )
}
