import React, { useState } from 'react'
import { X, CheckCircle, Scissors, ChevronLeft } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { StepService, StepMaster, StepTime, StepContacts, StepConfirm } from './BookingSteps'

export default function BookingModal({ onClose, onSuccess, initialData }) {
  const [mst, setMst] = useState(initialData?.master || null)
  const [srv, setSrv] = useState(initialData?.service || null)
  const [s, setS] = useState(initialData?.master ? 2 : 1)
  const [n, setN] = useState('')
  const [p, setP] = useState('+7')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState('10:00')
  const [load, setLoad] = useState(false)
  const [ok, setOk] = useState(false)

  const [svcs, setSvcs] = useState([])
  const [masters, setMasters] = useState([])

  React.useEffect(() => {
    fetchData()
  }, [])

  React.useEffect(() => {
    if (initialData?.master && masters.length > 0) {
      const target = initialData.master
      const found = masters.find(m => m.id === target || m.name === target || m.name === target?.name)
      if (found) setMst(found)
    }
  }, [initialData, masters])

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
    e.preventDefault()
    setLoad(true)

    const serviceTitle = srv?.title || srv?.t || 'Мужская стрижка'
    const masterName = typeof mst === 'string' ? mst : (mst?.name || 'Мастер')

    const newAppt = {
      client_name: n,
      client_phone: p,
      date,
      start_time: time,
      service_title: serviceTitle,
      master_name: masterName,
      status: 'Подтверждена'
    }

    try {
      // Primary direct sync to Supabase
      const { error } = await supabase.from('appointments').insert([newAppt])
      if (error) throw error
    } catch (err) {
      console.warn('Supabase insert notice, saving to local fallback:', err)
      try {
        const existing = JSON.parse(localStorage.getItem('korni_local_appointments') || '[]')
        existing.unshift({ ...newAppt, id: Date.now().toString() })
        localStorage.setItem('korni_local_appointments', JSON.stringify(existing))
      } catch (e) {}
    }

    try {
      window.dispatchEvent(new Event('korni_data_updated'))
      const channel = new BroadcastChannel('korni_sync_channel')
      channel.postMessage({ type: 'DATA_UPDATED' })
      channel.close()
    } catch (e) {}

    setLoad(false)
    setOk(true)
    if (onSuccess) onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md text-zinc-100 p-5 shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-3">
          <h3 className="font-bold flex items-center space-x-2 text-sm text-zinc-200">
            <Scissors className="w-4 h-4 text-amber-500" />
            <span>Запись ({s}/5)</span>
          </h3>
          <div className="flex items-center space-x-2">
            {s > 1 && (
              <button 
                type="button"
                onClick={() => setS(s - 1)} 
                className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition flex items-center"
                title="Назад"
              >
                <ChevronLeft className="w-5 h-5 text-amber-500" />
              </button>
            )}
            <button 
              type="button"
              onClick={onClose} 
              className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {ok ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle className="w-12 h-12 text-amber-400 mx-auto" />
            <h4 className="font-bold text-lg">Запись подтверждена!</h4>
            <p className="text-xs text-zinc-400">Мы ждем вас {date} в {time}</p>
            <button onClick={onClose} className="bg-amber-500 text-zinc-950 font-bold px-4 py-2.5 rounded-xl w-full mt-2">Готово</button>
          </div>
        ) : (
          <div>
            {s === 1 && <StepMaster masters={masters} mst={mst} setMst={setMst} onNext={() => setS(2)} />}
            {s === 2 && <StepService svcs={svcs} mst={mst} srv={srv} setSrv={setSrv} onNext={() => setS(3)} />}
            {s === 3 && <StepTime date={date} setDate={setDate} time={time} setTime={setTime} slots={slots} onNext={() => setS(4)} srv={srv} mst={mst} />}
            {s === 4 && <StepContacts name={n} setName={setN} phone={p} setPhone={setP} onNext={() => setS(5)} />}
            {s === 5 && <StepConfirm srv={srv} mst={mst} date={date} time={time} name={n} phone={p} load={load} onSubmit={sub} />}
          </div>
        )}
      </div>
    </div>
  )
}
