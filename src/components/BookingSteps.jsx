import React from 'react'
import { ArrowLeft } from 'lucide-react'

export function StepMaster({ masters, mst, setMst, onNext }) {
  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto">
      <h4 className="text-sm font-bold mb-2">1. Выберите мастера</h4>
      {masters.map((m, i) => {
        const name = typeof m === 'string' ? m : m.name
        return (
          <div key={m.id || i} onClick={() => setMst(m)} className={`p-3 rounded-xl border cursor-pointer transition ${mst?.id === m.id || mst === name ? 'border-amber-500 bg-amber-500/20 text-white font-bold' : 'border-zinc-800 bg-zinc-950 text-zinc-300'}`}>👤 {name}</div>
        )
      })}
      <div className="flex space-x-2 mt-3 pt-2 border-t border-zinc-800">
        <button disabled={!mst} onClick={onNext} className="w-full bg-amber-500 disabled:opacity-50 text-zinc-950 font-bold p-3 rounded-xl cursor-pointer">Далее</button>
      </div>
    </div>
  )
}

export function StepService({ svcs, mst, srv, setSrv, onBack, onNext }) {
  const generalSvcs = svcs.filter(item => !item.master_id)
  const masterSvcs = svcs.filter(item => item.master_id && (item.master_id === mst?.id || item.master_name === mst?.name))

  return (
    <div className="space-y-3 max-h-[320px] overflow-y-auto">
      <h4 className="text-sm font-bold mb-1">2. Выберите услугу</h4>
      {generalSvcs.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] uppercase text-amber-500 font-bold tracking-wider">Общие услуги</div>
          {generalSvcs.map((item, i) => {
            const title = item.title || item.t || 'Услуга'
            const price = item.price || item.pr || '1 500 ₽'
            return (
              <div key={item.id || i} onClick={() => setSrv(item)} className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition ${srv?.id === item.id || srv?.title === title ? 'border-amber-500 bg-amber-500/20 text-white' : 'border-zinc-800 bg-zinc-950 text-zinc-300'}`}>
                <span className="font-semibold text-sm">{title}</span><span className="text-amber-400 font-bold">{price}</span>
              </div>
            )
          })}
        </div>
      )}

      {masterSvcs.length > 0 && (
        <div className="space-y-1.5 pt-2">
          <div className="text-[11px] uppercase text-amber-500 font-bold tracking-wider">Услуги мастера ({typeof mst === 'string' ? mst : mst?.name})</div>
          {masterSvcs.map((item, i) => {
            const title = item.title || item.t || 'Услуга'
            const price = item.price || item.pr || '1 500 ₽'
            return (
              <div key={item.id || i} onClick={() => setSrv(item)} className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition ${srv?.id === item.id || srv?.title === title ? 'border-amber-500 bg-amber-500/20 text-white' : 'border-zinc-800 bg-zinc-950 text-zinc-300'}`}>
                <span className="font-semibold text-sm">{title}</span><span className="text-amber-400 font-bold">{price}</span>
              </div>
            )
          })}
        </div>
      )}

      {generalSvcs.length === 0 && masterSvcs.length === 0 && (
        <div className="text-xs text-zinc-500 text-center py-4">Нет доступных услуг</div>
      )}

      <div className="flex space-x-2 mt-3 pt-2 border-t border-zinc-800">
        <button onClick={onBack} className="bg-zinc-800 p-3 rounded-xl px-4 cursor-pointer hover:bg-zinc-700"><ArrowLeft className="w-4 h-4" /></button>
        <button disabled={!srv} onClick={onNext} className="flex-1 bg-amber-500 disabled:opacity-50 text-zinc-950 font-bold p-3 rounded-xl cursor-pointer">Далее</button>
      </div>
    </div>
  )
}

export function StepTime({ date, setDate, time, setTime, slots, onBack, onNext }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold mb-2">3. Время</h4>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm" />
      <div className="grid grid-cols-3 gap-2">
        {slots.map(t => (
          <button key={t} type="button" onClick={() => setTime(t)} className={`p-2 rounded-xl text-xs font-bold border ${time === t ? 'border-amber-500 bg-amber-500 text-zinc-950' : 'border-zinc-800 bg-zinc-950 text-zinc-300'}`}>{t}</button>
        ))}
      </div>
      <div className="flex space-x-2 mt-3">
        <button onClick={onBack} className="bg-zinc-800 p-3 rounded-xl px-4"><ArrowLeft className="w-4 h-4" /></button>
        <button onClick={onNext} className="flex-1 bg-amber-500 text-zinc-950 font-bold p-3 rounded-xl">Далее</button>
      </div>
    </div>
  )
}

export function StepContacts({ name, setName, phone, setPhone, onBack, onNext }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold mb-2">4. Контакты</h4>
      <input type="text" placeholder="Имя" value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm" />
      <input type="tel" placeholder="Телефон" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm" />
      <div className="flex space-x-2 mt-3">
        <button onClick={onBack} className="bg-zinc-800 p-3 rounded-xl px-4"><ArrowLeft className="w-4 h-4" /></button>
        <button disabled={!name || !phone} onClick={onNext} className="flex-1 bg-amber-500 disabled:opacity-50 text-zinc-950 font-bold p-3 rounded-xl">Далее</button>
      </div>
    </div>
  )
}

export function StepConfirm({ srv, mst, date, time, name, phone, load, onBack, onSubmit }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold mb-2">5. Подтверждение</h4>
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs space-y-1">
        <div><b>Услуга:</b> {srv?.t} ({srv?.pr})</div>
        <div><b>Мастер:</b> {mst}</div>
        <div><b>Дата:</b> {date} ({time})</div>
        <div><b>Имя:</b> {name} | <b>Тел:</b> {phone}</div>
      </div>
      <div className="flex space-x-2 mt-3">
        <button onClick={onBack} className="bg-zinc-800 p-3 rounded-xl px-4"><ArrowLeft className="w-4 h-4" /></button>
        <button disabled={load} onClick={onSubmit} className="flex-1 bg-amber-500 text-zinc-950 font-bold p-3 rounded-xl">{load ? '...' : 'Подтвердить'}</button>
      </div>
    </div>
  )
}
