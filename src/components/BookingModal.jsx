import React, { useState } from 'react'
import { X, CheckCircle, Scissors } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { StepService, StepMaster, StepTime, StepContacts, StepConfirm } from './BookingSteps'

export default function BookingModal({ onClose, onSuccess }) {
  const [s, setS] = useState(1)
  const [n, setN] = useState('')
  const [p, setP] = useState('')
  const [srv, setSrv] = useState(null)
  const [mst, setMst] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState('12:00')
  const [load, setLoad] = useState(false)
  const [ok, setOk] = useState(false)

  const svcs = [{ t: 'Стрижка', pr: '1500₽' }, { t: 'Борода', pr: '1000₽' }, { t: 'Комплекс', pr: '2500₽' }]
  const masters = ['Любой мастер', 'Алексей', 'Дмитрий', 'Максим']
  const slots = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00']

  const sub = async (e) => {
    e.preventDefault(); setLoad(true)
    try { await supabase.from('appointments').insert([{ client_name: n, client_phone: p, date, start_time: time, status: 'Подтверждена' }]) } catch (e) {}
    setLoad(false); setOk(true); if (onSuccess) onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md text-zinc-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold flex items-center space-x-2"><Scissors className="w-4 h-4 text-amber-500" /><span>Запись ({s}/5)</span></h3>
          <button onClick={onClose}><X className="w-5 h-5 text-zinc-400" /></button>
        </div>
        {ok ? (
          <div className="text-center py-4 space-y-3">
            <CheckCircle className="w-12 h-12 text-amber-400 mx-auto" />
            <h4 className="font-bold text-lg">Записано!</h4>
            <button onClick={onClose} className="bg-amber-500 text-zinc-950 font-bold px-4 py-2 rounded-xl w-full">Готово</button>
          </div>
        ) : (
          <div>
            {s === 1 && <StepService svcs={svcs} srv={srv} setSrv={setSrv} onNext={() => setS(2)} />}
            {s === 2 && <StepMaster masters={masters} mst={mst} setMst={setMst} onBack={() => setS(1)} onNext={() => setS(3)} />}
            {s === 3 && <StepTime date={date} setDate={setDate} time={time} setTime={setTime} slots={slots} onBack={() => setS(2)} onNext={() => setS(4)} />}
            {s === 4 && <StepContacts name={n} setName={setN} phone={p} setPhone={setP} onBack={() => setS(3)} onNext={() => setS(5)} />}
            {s === 5 && <StepConfirm srv={srv} mst={mst} date={date} time={time} name={n} phone={p} load={load} onBack={() => setS(4)} onSubmit={sub} />}
          </div>
        )}
      </div>
    </div>
  )
}
