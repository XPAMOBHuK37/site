import React from 'react'
import { ArrowLeft } from 'lucide-react'

export function StepService({ svcs, srv, setSrv, onNext }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-bold mb-2">1. Услуга</h4>
      {svcs.map((item, i) => (
        <div key={i} onClick={() => setSrv(item)} className={`p-3 rounded-xl border cursor-pointer flex justify-between ${srv?.t === item.t ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800 bg-zinc-950'}`}>
          <span>{item.t}</span><span className="text-amber-400">{item.pr}</span>
        </div>
      ))}
      <button disabled={!srv} onClick={onNext} className="w-full mt-3 bg-amber-500 disabled:opacity-50 text-zinc-950 font-bold p-3 rounded-xl">Далее</button>
    </div>
  )
}

export function StepMaster({ masters, mst, setMst, onBack, onNext }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-bold mb-2">2. Мастер</h4>
      {masters.map((m, i) => (
        <div key={i} onClick={() => setMst(m)} className={`p-3 rounded-xl border cursor-pointer ${mst === m ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800 bg-zinc-950'}`}>{m}</div>
      ))}
      <div className="flex space-x-2 mt-3">
        <button onClick={onBack} className="bg-zinc-800 p-3 rounded-xl px-4"><ArrowLeft className="w-4 h-4" /></button>
        <button disabled={!mst} onClick={onNext} className="flex-1 bg-amber-500 disabled:opacity-50 text-zinc-950 font-bold p-3 rounded-xl">Далее</button>
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
