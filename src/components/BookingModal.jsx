import React, { useState } from 'react'
import { X, CheckCircle, Scissors } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { StepService, StepMaster, StepTime, StepContacts, StepConfirm } from './BookingSteps'

export default function BookingModal({ onClose, onSuccess, initialData }) {
  const [srv, setSrv] = useState(initialData?.service || null)
  const [mst, setMst] = useState(initialData?.master || null)
  const [s, setS] = useState(initialData?.service ? 2 : 1)
  const [n, setN] = useState('')
  const [p, setP] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState('10:00')
  const [load, setLoad] = useState(false)
  const [ok, setOk] = useState(false)

  const [svcs, setSvcs] = useState([
    { title: 'Мужская стрижка', price: '1 500 ₽' },
    { title: 'Оформление бороды', price: '1 000 ₽' },
    { title: 'Комплекс', price: '2 200 ₽' }
  ])
  const [masters, setMasters] = useState([
    { name: 'Алексей Смирнов' },
    { name: 'Дмитрий Иванов' },
    { name: 'Максим Петров' }
  ])

  React.useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const localS = localStorage.getItem('korni_local_services')
      if (localS) {
        const parsed = JSON.parse(localS)
        if (parsed && parsed.length > 0) setSvcs(parsed)
      }
    } catch (e) {}

    try {
      const localM = localStorage.getItem('korni_local_masters')
      if (localM) {
        const parsed = JSON.parse(localM)
        if (parsed && parsed.length > 0) setMasters(parsed)
      }
    } catch (e) {}

    try {
      const { data: sData } = await supabase.from('services').select('*').order('created_at', { ascending: false })
      if (sData) {
        setSvcs(sData)
        localStorage.setItem('korni_local_services', JSON.stringify(sData))
      }
    } catch (e) {}

    try {
      const { data: mData } = await supabase.from('masters').select('*').order('created_at', { ascending: true })
      if (mData) {
        setMasters(mData)
        localStorage.setItem('korni_local_masters', JSON.stringify(mData))
      }
    } catch (e) {}
  }

  const slots = []
  for (let h = 8; h <= 23; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    slots.push(`${String(h).padStart(2, '0')}:30`)
  }

  const sub = async (e) => {
    e.preventDefault(); setLoad(true)
    const serviceTitle = srv?.title || srv?.t || 'Мужская стрижка'
    const masterName = mst || 'Любой мастер'

    try {
      await supabase.from('appointments').insert([{
        client_name: n,
        client_phone: p,
        date,
        start_time: time,
        service_title: serviceTitle,
        master_name: masterName,
        status: 'Подтверждена'
      }])
    } catch (e) {}

    try {
      const existing = JSON.parse(localStorage.getItem('korni_local_appointments') || '[]')
      existing.unshift({
        id: Date.now().toString(),
        client_name: n,
        client_phone: p,
        date,
        start_time: time,
        service_title: serviceTitle,
        master_name: masterName,
        status: 'Подтверждена'
      })
      localStorage.setItem('korni_local_appointments', JSON.stringify(existing))
    } catch (err) {}

    setLoad(false); setOk(true); if (onSuccess) onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[9999]">
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
