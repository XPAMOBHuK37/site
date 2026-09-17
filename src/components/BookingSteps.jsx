import React from 'react'

export function StepMaster({ masters, mst, setMst, onNext }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs uppercase text-zinc-400 font-bold tracking-wider">1. Выберите мастера</h4>
      <div className="grid grid-cols-2 gap-2">
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
      
      {generalSvcs.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] uppercase text-amber-500 font-extrabold tracking-widest">Общие услуги</div>
          <div className="grid grid-cols-1 gap-2">
            {generalSvcs.map((item, i) => {
              const title = item.title || item.t || 'Услуга'
              const price = item.price || item.pr || '1 500 ₽'
              const isSelected = srv?.id === item.id || srv?.title === title
              return (
                <div key={item.id || i} onClick={() => { setSrv(item); onNext(); }} className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition ${isSelected ? 'border-amber-500 bg-amber-500/20 text-white font-bold' : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700'}`}>
                  <span className="font-semibold text-xs">{title}</span>
                  <span className="text-amber-400 font-bold text-xs">{price}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {masterSvcs.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-[10px] uppercase text-amber-500 font-extrabold tracking-widest">Индивидуальные услуги мастера</div>
          <div className="grid grid-cols-1 gap-2">
            {masterSvcs.map((item, i) => {
              const title = item.title || item.t || 'Услуга'
              const price = item.price || item.pr || '1 500 ₽'
              const isSelected = srv?.id === item.id || srv?.title === title
              return (
                <div key={item.id || i} onClick={() => { setSrv(item); onNext(); }} className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition ${isSelected ? 'border-amber-500 bg-amber-500/20 text-white font-bold' : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700'}`}>
                  <span className="font-semibold text-xs">{title}</span>
                  <span className="text-amber-400 font-bold text-xs">{price}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {generalSvcs.length === 0 && masterSvcs.length === 0 && (
        <div className="text-xs text-zinc-500 text-center py-6">Нет доступных услуг</div>
      )}
    </div>
  )
}

export function StepTime({ date, setDate, time, setTime, slots, onNext }) {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  const days = []
  for (let i = 0; i < 14; i++) {
    const d = new Date()
    d.setDate(today.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dayName = d.toLocaleDateString('ru-RU', { weekday: 'short' })
    const dayNum = d.getDate()
    const monthName = d.toLocaleDateString('ru-RU', { month: 'short' })
    days.push({ dateStr, dayName, dayNum, monthName })
  }

  const currentHours = today.getHours()
  const currentMinutes = today.getMinutes()

  const filteredSlots = slots.filter(t => {
    if (date !== todayStr) return true
    const [h, m] = t.split(':').map(Number)
    if (h > currentHours) return true
    if (h === currentHours && m > currentMinutes) return true
    return false
  })

  return (
    <div className='space-y-3'>
      <h4 className='text-xs uppercase text-zinc-400 font-bold tracking-wider'>3. Выберите дату и время</h4>
      
      <div className='flex gap-1.5 overflow-x-auto pb-1.5'>
        {days.map(d => {
          const isSelected = date === d.dateStr
          return (
            <button
              key={d.dateStr}
              type='button'
              onClick={() => setDate(d.dateStr)}
              className={lex flex-col items-center justify-center min-w-[65px] p-2 rounded-xl border transition cursor-pointer shrink-0 }
            >
              <span className='text-[9px] uppercase'>{d.dayName}</span>
              <span className='text-base font-extrabold my-0.5'>{d.dayNum}</span>
              <span className='text-[9px] uppercase'>{d.monthName}</span>
            </button>
          )
        })}
      </div>

      <div>
        <div className='text-[10px] uppercase text-zinc-400 mb-1.5 font-bold tracking-wider'>Доступное время</div>
        <div className='grid grid-cols-4 gap-1.5 max-h-[160px] overflow-y-auto pr-1'>
          {filteredSlots.map(t => (
            <button
              key={t}
              type='button'
              onClick={() => { setTime(t); onNext(); }}
              className={py-2 px-1 rounded-xl text-xs font-bold border transition cursor-pointer text-center }
            >
              {t}
            </button>
          ))}
          {filteredSlots.length === 0 && (
            <div className='col-span-4 text-xs text-zinc-500 text-center py-6'>На этот день нет свободных слотов</div>
          )}
        </div>
      </div>
    </div>
  )
}

export function StepContacts({ name, setName, phone, setPhone, onNext }) {
  return (
    <div className='space-y-3'>
      <h4 className='text-xs uppercase text-zinc-400 font-bold tracking-wider'>4. Контактные данные</h4>
      <div>
        <label className='block text-[10px] uppercase text-zinc-400 mb-1 font-semibold'>Ваше имя</label>
        <input 
          type='text' 
          placeholder='Иван' 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required 
          className='w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500' 
        />
      </div>
      <div>
        <label className='block text-[10px] uppercase text-zinc-400 mb-1 font-semibold'>Номер телефона</label>
        <input 
          type='tel' 
          placeholder='+7 (999) 000-00-00' 
          value={phone} 
          onChange={e => setPhone(e.target.value)} 
          required 
          className='w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500' 
        />
      </div>
      <button 
        disabled={!name.trim() || phone.replace(/[^\d]/g, '').length !== 11} 
        onClick={onNext} 
        className='w-full mt-2 bg-amber-500 disabled:opacity-50 text-zinc-950 font-bold p-3 rounded-xl cursor-pointer hover:bg-amber-400 transition'
      >
        Далее
      </button>
    </div>
  )
}

export function StepConfirm({ srv, mst, date, time, name, phone, load, onSubmit }) {
  const masterName = typeof mst === 'string' ? mst : (mst?.name || 'Мастер')
  const title = srv?.title || srv?.t || 'Услуга'
  const price = srv?.price || srv?.pr || '1 500 ₽'

  return (
    <div className='space-y-3'>
      <h4 className='text-xs uppercase text-zinc-400 font-bold tracking-wider'>5. Подтверждение записи</h4>
      <div className='bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs space-y-2'>
        <div className='flex justify-between border-b border-zinc-900 pb-1.5'><span className='text-zinc-400'>Мастер:</span><span className='font-bold text-amber-400'>{masterName}</span></div>
        <div className='flex justify-between border-b border-zinc-900 pb-1.5'><span className='text-zinc-400'>Услуга:</span><span className='font-bold text-white'>{title}</span></div>
        <div className='flex justify-between border-b border-zinc-900 pb-1.5'><span className='text-zinc-400'>Стоимость:</span><span className='font-bold text-amber-400'>{price}</span></div>
        <div className='flex justify-between border-b border-zinc-900 pb-1.5'><span className='text-zinc-400'>Дата и время:</span><span className='font-bold text-white'>{date} в {time}</span></div>
        <div className='flex justify-between'><span className='text-zinc-400'>Клиент:</span><span className='font-bold text-white'>{name} ({phone})</span></div>
      </div>
      <button disabled={load} onClick={onSubmit} className='w-full mt-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold p-3 rounded-xl cursor-pointer transition'>
        {load ? 'Обработка...' : 'Подтвердить запись'}
      </button>
    </div>
  )
}
