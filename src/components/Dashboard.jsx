import React, { useState, useEffect } from 'react'
import { Calendar, Search, Plus, LogOut, Scissors, Users, DollarSign, Trash2, Edit } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { DashboardTimeline } from './DashboardTimeline'
import { DashboardModal } from './DashboardModal'

export default function Dashboard({ session, onClose }) {
  const [dbMasters, setDbMasters] = useState([])
  
  const currentDbMaster = dbMasters.find(m => m.phone === session?.user?.email || m.email === session?.user?.email || m.name?.toLowerCase() === session?.user?.email?.split('@')[0])
  const isAdmin = session?.user?.email === 'admin@korni37.ru' || currentDbMaster?.is_admin === true

  const [tab, setTab] = useState('appts') // 'appts' | 'services' | 'masters' | 'earnings'
  
  // Appointments state
  const [appts, setAppts] = useState([])
  const [search, setSearch] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [modal, setModal] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [master, setMaster] = useState('Алексей Смирнов')
  const [time, setTime] = useState('12:00')
  const [selectedService, setSelectedService] = useState('')

  const currentMasterObj = session?.user?.master || dbMasters.find(m => m.phone === session?.user?.email || m.email === session?.user?.email || m.name?.toLowerCase() === session?.user?.email?.split('@')[0])
  const currentMasterName = currentMasterObj?.name || session?.user?.master?.name || session?.user?.email?.split('@')[0] || 'Мастер'

  const [workStart, setWorkStart] = useState('10:00')
  const [workEnd, setWorkEnd] = useState('23:00')
  const [daysOff, setDaysOff] = useState([])
  const [dailySchedules, setDailySchedules] = useState({})
  const [closedHours, setClosedHours] = useState({})
  const [newDayOff, setNewDayOff] = useState('')

  useEffect(() => {
    if (currentMasterObj) {
      setWorkStart(currentMasterObj.work_start || '10:00')
      setWorkEnd(currentMasterObj.work_end || '23:00')
      setDaysOff(currentMasterObj.days_off || [])
      setDailySchedules(currentMasterObj.daily_schedules || {})
      setClosedHours(currentMasterObj.closed_hours || {})
    }
  }, [currentMasterObj])

  const toggleClosedHour = async (dateStr, hourStr) => {
    if (!currentMasterObj) return
    const dayClosed = closedHours[dateStr] || {}
    const isClosed = dayClosed[hourStr]
    const updatedDayClosed = { ...dayClosed, [hourStr]: !isClosed }
    const updatedClosedHours = { ...closedHours, [dateStr]: updatedDayClosed }
    setClosedHours(updatedClosedHours)

    const updatedData = { ...currentMasterObj, closed_hours: updatedClosedHours }
    try {
      await supabase.from('masters').update({ closed_hours: updatedClosedHours }).eq('id', currentMasterObj.id)
    } catch (e) {}

    const updatedMasters = dbMasters.map(m => m.id === currentMasterObj.id ? updatedData : m)
    setDbMasters(updatedMasters)
    localStorage.setItem('korni_local_masters', JSON.stringify(updatedMasters))
  }

  const updateDailyHours = async (dateStr) => {
    if (!currentMasterObj) return
    const currentDaySched = dailySchedules[dateStr] || { start: workStart, end: workEnd }
    const newStart = prompt('Час начала работы для ' + dateStr + ' (например, 14:00):', currentDaySched.start || '10:00')
    if (newStart === null) return
    const newEnd = prompt('Час окончания работы для ' + dateStr + ' (например, 23:00):', currentDaySched.end || '23:00')
    if (newEnd === null) return

    const updatedSchedules = { ...dailySchedules, [dateStr]: { start: newStart, end: newEnd } }
    setDailySchedules(updatedSchedules)

    const updatedData = { ...currentMasterObj, daily_schedules: updatedSchedules }
    try {
      await supabase.from('masters').update({ daily_schedules: updatedSchedules }).eq('id', currentMasterObj.id)
    } catch (e) {}

    const updatedMasters = dbMasters.map(m => m.id === currentMasterObj.id ? updatedData : m)
    setDbMasters(updatedMasters)
    localStorage.setItem('korni_local_masters', JSON.stringify(updatedMasters))
  }

  const mastersList = isAdmin ? dbMasters.map(m => m.name) : [currentMasterName]
  const workStartHour = currentMasterObj?.work_start ? parseInt(currentMasterObj.work_start.split(':')[0]) : 10
  const workEndHour = currentMasterObj?.work_end ? parseInt(currentMasterObj.work_end.split(':')[0]) : 23

  const slots = []
  for (let h = workStartHour; h <= workEndHour; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    if (h < workEndHour) {
      slots.push(`${String(h).padStart(2, '0')}:30`)
    }
  }

  // Services state
  const [services, setServices] = useState([])
  const [serviceModal, setServiceModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [sTitle, setSTitle] = useState('')
  const [sDesc, setSDesc] = useState('')
  const [sPrice, setSPrice] = useState('')
  const [sDuration, setSDuration] = useState('60')

  // Masters DB state
  const [masterModal, setMasterModal] = useState(false)
  const [editingMaster, setEditingMaster] = useState(null)
  const [mName, setMName] = useState('')
  const [mPhone, setMPhone] = useState('')
  const [mBio, setMBio] = useState('')
  const [mPhoto, setMPhoto] = useState('')
  const [mEmail, setMEmail] = useState('')
  const [mPassword, setMPassword] = useState('')
  const [mIsAdmin, setMIsAdmin] = useState(false)
  const [period, setPeriod] = useState('month')

  useEffect(() => { 
    fetchDbMasters()
    fetchAppts()
    fetchServices()
  }, [date])

  const fetchAppts = async () => {
    try {
      const { data, error } = await supabase.from('appointments').select('*').order('date', { ascending: false })
      if (error) throw error
      if (data) {
        localStorage.setItem('korni_local_appointments', JSON.stringify(data))
        filterAndSetAppts(data)
        return
      }
    } catch (e) {}

    // Fallback to localStorage
    const local = localStorage.getItem('korni_local_appointments')
    if (local) {
      try {
        const parsed = JSON.parse(local)
        filterAndSetAppts(parsed)
        return
      } catch (err) {}
    }

    setAppts([])
  }

  const filterAndSetAppts = (allAppts) => {
    if (!isAdmin) {
      if (currentMasterName) {
        setAppts(allAppts.filter(a => a.master_name?.toLowerCase() === currentMasterName.toLowerCase() || a.master_name?.toLowerCase().includes(currentMasterName.toLowerCase().split(' ')[0])))
      } else {
        setAppts([])
      }
    } else {
      setAppts(allAppts)
    }
  }

  const fetchServices = async () => {
    const defaultServices = [
      { id: '1', title: 'Мужская стрижка', description: 'Классические и современные стрижки, мытье волос и укладка.', price: '1 500 ₽' },
      { id: '2', title: 'Оформление бороды', description: 'Моделирование формы бороды, бритье опасной бритвой.', price: '1 000 ₽' },
      { id: '3', title: 'Комплекс', description: 'Стрижка + оформление бороды для безупречного полного образа.', price: '2 200 ₽' }
    ]

    const local = localStorage.getItem('korni_local_services')
    if (local) {
      try {
        const parsed = JSON.parse(local)
        if (parsed && parsed.length > 0) {
          setServices(parsed)
        } else {
          setServices(defaultServices)
          localStorage.setItem('korni_local_services', JSON.stringify(defaultServices))
        }
      } catch (err) {
        setServices(defaultServices)
      }
    } else {
      setServices(defaultServices)
      localStorage.setItem('korni_local_services', JSON.stringify(defaultServices))
    }

    try {
      const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false })
      if (!error && data && data.length > 0) {
        setServices(data)
        localStorage.setItem('korni_local_services', JSON.stringify(data))
      }
    } catch (e) {}
  }

  const fetchDbMasters = async () => {
    const defaultMasters = [
      { id: '1', name: 'Алексей Смирнов', phone: '+7 (999) 111-22-33', bio: 'Старший барбер со стажем более 10 лет. Мастер классических стрижек.', photo_url: '/logo.svg', email: 'alex@korni37.ru', is_admin: true },
      { id: '2', name: 'Дмитрий Иванов', phone: '+7 (999) 222-33-44', bio: 'Эксперт по опасной бритве и моделированию бород.', photo_url: '/logo.svg', email: 'dmitry@korni37.ru', is_admin: false },
      { id: '3', name: 'Максим Петров', phone: '+7 (999) 333-44-55', bio: 'Мастер современных текстурных стрижек и стильных укладок.', photo_url: '/logo.svg', email: 'maxim@korni37.ru', is_admin: false }
    ]

    const local = localStorage.getItem('korni_local_masters')
    if (local) {
      try {
        const parsed = JSON.parse(local)
        if (parsed && parsed.length > 0) {
          setDbMasters(parsed)
        } else {
          setDbMasters(defaultMasters)
          localStorage.setItem('korni_local_masters', JSON.stringify(defaultMasters))
        }
      } catch (err) {
        setDbMasters(defaultMasters)
      }
    } else {
      setDbMasters(defaultMasters)
      localStorage.setItem('korni_local_masters', JSON.stringify(defaultMasters))
    }

    try {
      const { data, error } = await supabase.from('masters').select('*').order('created_at', { ascending: true })
      if (!error && data && data.length > 0) {
        setDbMasters(data)
        localStorage.setItem('korni_local_masters', JSON.stringify(data))
      }
    } catch (e) {}
  }

  const createAppt = async (e) => {
    e.preventDefault()
    try {
      const apptData = { 
        id: Date.now().toString(),
        client_name: name, 
        client_phone: phone, 
        date, 
        start_time: time, 
        master_name: isAdmin ? master : currentMasterName,
        service_title: selectedService || services[0]?.title || 'Стрижка',
        status: 'Подтверждена' 
      }
      try {
        await supabase.from('appointments').insert([apptData])
      } catch (err) {}

      const local = localStorage.getItem('korni_local_appointments')
      let existing = local ? JSON.parse(local) : []
      existing.unshift(apptData)
      localStorage.setItem('korni_local_appointments', JSON.stringify(existing))

      setName(''); setPhone(''); setModal(false); fetchAppts()
    } catch (err) {
      alert('Ошибка создания записи: ' + err.message)
    }
  }

  const updateApptStatus = async (id, status) => {
    try {
      await supabase.from('appointments').update({ status }).eq('id', id)
    } catch (e) {}

    const local = localStorage.getItem('korni_local_appointments')
    if (local) {
      try {
        const parsed = JSON.parse(local).map(a => a.id === id ? { ...a, status } : a)
        localStorage.setItem('korni_local_appointments', JSON.stringify(parsed))
      } catch (e) {}
    }
    fetchAppts()
  }

  const deleteAppt = async (id) => {
    if (confirm('Удалить эту запись?')) {
      try {
        await supabase.from('appointments').delete().eq('id', id)
      } catch (e) {}

      const local = localStorage.getItem('korni_local_appointments')
      if (local) {
        try {
          const parsed = JSON.parse(local).filter(a => a.id !== id)
          localStorage.setItem('korni_local_appointments', JSON.stringify(parsed))
        } catch (e) {}
      }
      fetchAppts()
    }
  }

  const saveService = async (e) => {
    e.preventDefault()
    const sData = { title: sTitle, description: sDesc, price: sPrice, duration: parseInt(sDuration) || 60 }
    
    let updated = [...services]
    if (editingService) {
      updated = updated.map(s => s.id === editingService.id ? { ...s, ...sData } : s)
    } else {
      updated.unshift({ id: 'srv_' + Date.now(), ...sData })
    }
    setServices(updated)
    localStorage.setItem('korni_local_services', JSON.stringify(updated))
    setServiceModal(false); setEditingService(null); setSTitle(''); setSDesc(''); setSPrice(''); setSDuration('60')
    window.dispatchEvent(new Event('korni_data_updated'))

    try {
      if (editingService) {
        await supabase.from('services').update(sData).eq('id', editingService.id)
      } else {
        await supabase.from('services').insert([sData])
      }
    } catch (err) {
      console.warn('Supabase sync skipped (tables not created yet):', err.message)
    }
  }

  const deleteService = async (id) => {
    if (confirm('Удалить эту услугу?')) {
      const updated = services.filter(s => s.id !== id)
      setServices(updated)
      localStorage.setItem('korni_local_services', JSON.stringify(updated))
      window.dispatchEvent(new Event('korni_data_updated'))

      try {
        await supabase.from('services').delete().eq('id', id)
      } catch (e) {
        console.warn('Supabase sync skipped:', e.message)
      }
    }
  }

  const saveMaster = async (e) => {
    e.preventDefault()
    const mData = {
      name: mName,
      phone: mPhone || mEmail,
      bio: mBio,
      photo_url: mPhoto || '/logo.svg',
      email: mEmail,
      is_admin: mIsAdmin
    }
    if (mPassword) mData.password = mPassword

    let updated = [...dbMasters]
    if (editingMaster) {
      updated = updated.map(m => m.id === editingMaster.id ? { ...m, ...mData } : m)
    } else {
      updated.unshift({ id: 'mst_' + Date.now(), ...mData })
    }
    setDbMasters(updated)
    localStorage.setItem('korni_local_masters', JSON.stringify(updated))
    setMasterModal(false); setEditingMaster(null); setMName(''); setMPhone(''); setMBio(''); setMPhoto(''); setMEmail(''); setMPassword(''); setMIsAdmin(false)
    window.dispatchEvent(new Event('korni_data_updated'))

    try {
      if (editingMaster) {
        await supabase.from('masters').update(mData).eq('id', editingMaster.id)
      } else {
        await supabase.from('masters').insert([mData])
      }
    } catch (err) {
      console.warn('Supabase sync skipped:', err.message)
    }
  }

  const deleteMaster = async (id) => {
    if (confirm('Удалить этого мастера?')) {
      const updated = dbMasters.filter(m => m.id !== id)
      setDbMasters(updated)
      localStorage.setItem('korni_local_masters', JSON.stringify(updated))
      window.dispatchEvent(new Event('korni_data_updated'))

      try {
        await supabase.from('masters').delete().eq('id', id)
      } catch (e) {
        console.warn('Supabase sync skipped:', e.message)
      }
    }
  }

  const saveMasterSchedule = async (e) => {
    e.preventDefault()
    if (!currentMasterObj) {
      alert('Мастер не найден')
      return
    }
    const updatedData = {
      ...currentMasterObj,
      work_start: workStart,
      work_end: workEnd,
      days_off: daysOff
    }
    try {
      await supabase.from('masters').update({
        work_start: workStart,
        work_end: workEnd,
        days_off: daysOff
      }).eq('id', currentMasterObj.id)
    } catch (err) {}

    const updatedMasters = dbMasters.map(m => m.id === currentMasterObj.id ? updatedData : m)
    setDbMasters(updatedMasters)
    localStorage.setItem('korni_local_masters', JSON.stringify(updatedMasters))
    alert('График успешно сохранен!')
  }

  const toggleDayOff = async (dateStr) => {
    if (!currentMasterObj) return
    const updatedDaysOff = daysOff.includes(dateStr)
      ? daysOff.filter(d => d !== dateStr)
      : [...daysOff, dateStr]
    
    setDaysOff(updatedDaysOff)
    const updatedData = { ...currentMasterObj, days_off: updatedDaysOff }
    try {
      await supabase.from('masters').update({ days_off: updatedDaysOff }).eq('id', currentMasterObj.id)
    } catch (e) {}

    const updatedMasters = dbMasters.map(m => m.id === currentMasterObj.id ? updatedData : m)
    setDbMasters(updatedMasters)
    localStorage.setItem('korni_local_masters', JSON.stringify(updatedMasters))
  }

  const filtered = appts.filter(a => a.client_name.toLowerCase().includes(search.toLowerCase()) || a.client_phone.includes(search))

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center bg-zinc-900 border border-zinc-800 p-6 rounded-2xl gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2"><Scissors className="w-6 h-6 text-amber-500" /><span>Админ-панель «Корни»</span></h1>
            <p className="text-xs text-zinc-400 mt-1">{session?.user?.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setTab('appts')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === 'appts' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>📅 Записи</button>
            {isAdmin && <button onClick={() => setTab('services')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === 'services' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>✂️ Услуги и цены</button>}
            {isAdmin && <button onClick={() => setTab('masters')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === 'masters' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>💈 Мастера</button>}
            <button onClick={() => setTab('earnings')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === 'earnings' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>💰 Заработок</button>
            <button onClick={onClose} className="bg-zinc-800 text-white px-4 py-2 rounded-xl text-sm font-semibold">На сайт</button>
            <button onClick={() => {
              if (localStorage.getItem('korni_master_session')) {
                localStorage.removeItem('korni_master_session')
                window.location.reload()
              } else {
                supabase.auth.signOut()
              }
            }} className="bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-1.5"><LogOut className="w-4 h-4" /><span>Выйти</span></button>
          </div>
        </div>

        {tab === 'appts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
              <div>
                <h2 className="text-lg font-bold">Расписание записей</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Недельная сетка расписания</p>
              </div>
              <button onClick={() => { setMaster(currentMasterName); setSelectedService(services[0]?.title || ''); setModal(true) }} className="bg-amber-500 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center space-x-2 cursor-pointer"><Plus className="w-4 h-4" /><span>Создать запись</span></button>
            </div>

            <DashboardTimeline date={date} onDateChange={setDate} filtered={filtered} onSelectSlot={(d, t) => { setDate(d); setTime(t); setMaster(currentMasterName); setSelectedService(services[0]?.title || ''); setModal(true) }} onDeleteAppt={deleteAppt} services={services} daysOff={daysOff} onToggleDayOff={toggleDayOff} dailySchedules={dailySchedules} onUpdateDailyHours={updateDailyHours} closedHours={closedHours} onToggleClosedHour={toggleClosedHour} />

            {modal && <DashboardModal name={name} setName={setName} phone={phone} setPhone={setPhone} master={master} setMaster={setMaster} time={time} setTime={setTime} masters={mastersList} slots={slots} services={services} selectedService={selectedService} setSelectedService={setSelectedService} onClose={() => setModal(false)} onCreate={createAppt} />}
          </div>
        )}
        {tab === 'schedule' && (
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6 max-w-2xl mx-auto">
            <div>
              <h2 className="text-xl font-bold">Распорядок дня и выходные</h2>
              <p className="text-xs text-zinc-400 mt-1">Настройте часы работы (например, с 14:00 до 23:00) и добавьте выходные дни</p>
            </div>
            <form onSubmit={saveMasterSchedule} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-2 font-semibold">Начало работы</label>
                  <select value={workStart} onChange={e => setWorkStart(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none cursor-pointer">
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-2 font-semibold">Конец работы</label>
                  <select value={workEnd} onChange={e => setWorkEnd(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none cursor-pointer">
                    {['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <label className="block text-xs uppercase text-zinc-400 font-semibold">Выходные дни (даты)</label>
                <div className="flex gap-2">
                  <input type="date" value={newDayOff} onChange={e => setNewDayOff(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
                  <button type="button" onClick={() => {
                    if (newDayOff && !daysOff.includes(newDayOff)) {
                      setDaysOff([...daysOff, newDayOff])
                      setNewDayOff('')
                    }
                  }} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm cursor-pointer">Добавить выходной</button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {daysOff.map(d => (
                    <span key={d} className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-1.5 rounded-xl flex items-center space-x-2">
                      <span>{d}</span>
                      <button type="button" onClick={() => setDaysOff(daysOff.filter(x => x !== d))} className="text-red-300 hover:text-white font-bold cursor-pointer">&times;</button>
                    </span>
                  ))}
                  {daysOff.length === 0 && <span className="text-xs text-zinc-500">Нет добавленных выходных дней</span>}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end">
                <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-3 rounded-xl text-sm cursor-pointer">Сохранить график</button>
              </div>
            </form>
          </div>
        )}
        {tab === 'services' && (
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Управление услугами и ценами</h2>
                <p className="text-xs text-zinc-400">Добавляйте, редактируйте или удаляйте услуги, отображаемые на главной странице.</p>
              </div>
              <button 
                onClick={() => { setEditingService(null); setSTitle(''); setSDesc(''); setSPrice(''); setSDuration('60'); setServiceModal(true) }}
                className="bg-amber-500 text-zinc-950 font-bold px-4 py-2 rounded-xl text-sm flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" /><span>Добавить услугу</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(s => (
                <div key={s.id} className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-amber-400">{s.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{s.description}</p>
                    <p className="text-xs text-zinc-500 mt-2">⏱ Длительность: {s.duration || 60} мин</p>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-zinc-900">
                    <span className="font-bold text-white text-base">{s.price}</span>
                    <div className="flex space-x-2">
                      <button onClick={() => { setEditingService(s); setSTitle(s.title); setSDesc(s.description); setSPrice(s.price); setSDuration(s.duration?.toString() || '60'); setServiceModal(true) }} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteService(s.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {serviceModal && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4">
                  <h3 className="text-lg font-bold">{editingService ? 'Редактировать услугу' : 'Новая услуга'}</h3>
                  <form onSubmit={saveService} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase text-zinc-400 mb-1">Название услуги</label>
                      <input type="text" value={sTitle} onChange={e => setSTitle(e.target.value)} required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-zinc-400 mb-1">Описание</label>
                      <textarea value={sDesc} onChange={e => setSDesc(e.target.value)} rows="3" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-zinc-400 mb-1">Цена (например: 1 500 ₽)</label>
                      <input type="text" value={sPrice} onChange={e => setSPrice(e.target.value)} required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-zinc-400 mb-1">Длительность (минут, например 30, 60)</label>
                      <input type="number" step="15" min="15" value={sDuration} onChange={e => setSDuration(e.target.value)} required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                      <button type="button" onClick={() => setServiceModal(false)} className="bg-zinc-800 px-4 py-2 rounded-xl text-sm font-semibold">Отмена</button>
                      <button type="submit" className="bg-amber-500 text-zinc-950 font-bold px-5 py-2 rounded-xl text-sm">Сохранить</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
        {tab === 'masters' && isAdmin && (
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Мастера</h2>
                <p className="text-xs text-zinc-400 mt-1">Управление списком мастеров и доступом к кабинетам</p>
              </div>
              <button 
                onClick={() => { setEditingMaster(null); setMName(''); setMPhone(''); setMBio(''); setMPhoto(''); setMEmail(''); setMPassword(''); setMIsAdmin(false); setMasterModal(true) }}
                className="bg-amber-500 text-zinc-950 font-bold px-4 py-2 rounded-xl text-sm flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" /><span>Добавить мастера</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dbMasters.map(m => (
                <div key={m.id} className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl flex flex-col items-center text-center space-y-4">
                  <img src={m.photo_url || '/logo.svg'} onError={(e) => { e.target.src = '/logo.svg'; }} alt={m.name} className="w-24 h-24 rounded-full object-cover border border-amber-500/50" />
                  <div>
                    <h3 className="font-bold text-lg text-amber-400">{m.name} {m.is_admin && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded ml-1">Админ</span>}</h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      {m.phone ? <a href={`tel:${m.phone}`} className="hover:text-amber-400 underline transition">{m.phone}</a> : ''}
                    </p>
                    {m.email && <p className="text-xs text-zinc-500 mt-0.5">{m.email}</p>}
                    <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{m.bio}</p>
                  </div>
                  <div className="flex space-x-2 pt-2 w-full justify-center border-t border-zinc-900">
                    <button onClick={() => { setEditingMaster(m); setMName(m.name); setMPhone(m.phone || ''); setMBio(m.bio || ''); setMPhoto(m.photo_url || ''); setMEmail(m.email || ''); setMIsAdmin(!!m.is_admin); setMasterModal(true) }} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs text-zinc-200 font-semibold flex items-center space-x-1"><Edit className="w-3.5 h-3.5" /><span>Редактировать</span></button>
                    <button onClick={() => deleteMaster(m.id)} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-xs text-red-400 font-semibold flex items-center space-x-1"><Trash2 className="w-3.5 h-3.5" /><span>Удалить</span></button>
                  </div>
                </div>
              ))}
            </div>

            {masterModal && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[9999]">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4">
                  <h3 className="text-lg font-bold">{editingMaster ? 'Редактировать мастера' : 'Новый мастер и учетная запись'}</h3>
                  <form onSubmit={saveMaster} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase text-zinc-400 mb-1">Имя мастера</label>
                      <input type="text" value={mName} onChange={e => setMName(e.target.value)} required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-zinc-400 mb-1">Телефон / Контакт</label>
                      <input type="text" value={mPhone} onChange={e => setMPhone(e.target.value)} placeholder="+7 (999) 000-00-00" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-zinc-400 mb-1">Email для входа в кабинет</label>
                      <input type="email" value={mEmail} onChange={e => setMEmail(e.target.value)} placeholder="master@korni37.ru" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-zinc-400 mb-1">Пароль для входа {editingMaster ? '(оставьте пустым, если не менять)' : ''}</label>
                      <input type="password" value={mPassword} onChange={e => setMPassword(e.target.value)} placeholder="••••••••" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
                    </div>
                    <div className="flex items-center space-x-3 pt-1">
                      <input 
                        type="checkbox" 
                        id="mIsAdminModal" 
                        checked={mIsAdmin} 
                        onChange={e => setMIsAdmin(e.target.checked)} 
                        className="w-4 h-4 accent-amber-500 rounded bg-zinc-950 border-zinc-800 cursor-pointer" 
                      />
                      <label htmlFor="mIsAdminModal" className="text-xs uppercase text-zinc-300 font-semibold cursor-pointer">
                        Права администратора (доступ к управлению услугами и мастерами)
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-zinc-400 mb-1">Загрузить фото с компьютера</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => {
                          const file = e.target.files[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (uploadEvent) => setMPhoto(uploadEvent.target.result)
                            reader.readAsDataURL(file)
                          }
                        }} 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-zinc-950 hover:file:bg-amber-400 cursor-pointer" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-zinc-400 mb-1">Или ссылка на фото (URL)</label>
                      <input type="text" value={mPhoto} onChange={e => setMPhoto(e.target.value)} placeholder="https://..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-zinc-400 mb-1">О мастере (био)</label>
                      <textarea value={mBio} onChange={e => setMBio(e.target.value)} rows="3" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none"></textarea>
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                      <button type="button" onClick={() => setMasterModal(false)} className="bg-zinc-800 px-4 py-2 rounded-xl text-sm font-semibold">Отмена</button>
                      <button type="submit" className="bg-amber-500 text-zinc-950 font-bold px-5 py-2 rounded-xl text-sm">Сохранить</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'earnings' && (
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold">Финансовый отчёт и аналитика {isAdmin ? '' : `(${currentMasterName})`}</h2>
              <p className="text-xs text-zinc-400 mt-1">Срезы по услугам, клиентам и заработку</p>
            </div>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-1">
                <div className="text-xs uppercase text-zinc-400">Заработано денег</div>
                <div className="text-2xl font-bold text-amber-400">
                  {appts.reduce((acc, a) => {
                    const s = services.find(srv => srv.title === a.service_title)
                    const priceNum = s ? parseInt(s.price.replace(/\D/g, '')) || 1500 : 1500
                    return acc + priceNum
                  }, 0).toLocaleString('ru-RU')} ₽
                </div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-1">
                <div className="text-xs uppercase text-zinc-400">Оказано услуг</div>
                <div className="text-2xl font-bold text-white">{appts.length}</div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-1">
                <div className="text-xs uppercase text-zinc-400">Уникальных клиентов</div>
                <div className="text-2xl font-bold text-emerald-400">{new Set(appts.map(a => a.client_phone)).size}</div>
              </div>
            </div>

            {/* Breakdown by Services */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-zinc-200">Срез по услугам</h3>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden p-4 space-y-3">
                {services.map(s => {
                  const sAppts = appts.filter(a => a.service_title === s.title)
                  const count = sAppts.length
                  const priceNum = parseInt(s.price.replace(/\D/g, '')) || 1500
                  const totalEarned = count * priceNum
                  return (
                    <div key={s.id || s.title} className="flex justify-between items-center text-xs border-b border-zinc-900 pb-2">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-white text-sm">{s.title}</span>
                        <div className="text-[10px] text-zinc-400">Оказано раз: {count}</div>
                      </div>
                      <span className="text-amber-400 font-bold text-sm">{totalEarned.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Breakdown by Dates */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-zinc-200">Срез по датам</h3>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden p-4 space-y-2">
                {Array.from(new Set(appts.map(a => a.date))).sort().reverse().map(d => {
                  const dAppts = appts.filter(a => a.date === d)
                  const dRev = dAppts.reduce((acc, a) => {
                    const s = services.find(srv => srv.title === a.service_title)
                    return acc + (s ? parseInt(s.price.replace(/\D/g, '')) || 1500 : 1500)
                  }, 0)
                  return (
                    <div key={d} className="flex justify-between items-center text-xs border-b border-zinc-900 pb-2">
                      <span className="font-semibold text-white">{d}</span>
                      <div className="space-x-3 text-zinc-400">
                        <span>Услуг: <strong className="text-white">{dAppts.length}</strong></span>
                        <span>Заработано: <strong className="text-amber-400">{dRev.toLocaleString('ru-RU')} ₽</strong></span>
                      </div>
                    </div>
                  )
                })}
                {appts.length === 0 && <div className="text-xs text-zinc-500 text-center py-2">Нет записей</div>}
              </div>
            </div>

            {/* Breakdown by Masters (Admin only) */}
            {isAdmin && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-200">Срез по мастерам</h3>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden p-4 space-y-2">
                  {dbMasters.map(m => {
                    const mAppts = appts.filter(a => a.master_name === m.name)
                    const mRev = mAppts.reduce((acc, a) => {
                      const s = services.find(srv => srv.title === a.service_title)
                      return acc + (s ? parseInt(s.price.replace(/\D/g, '')) || 1500 : 1500)
                    }, 0)
                    return (
                      <div key={m.id || m.name} className="flex justify-between items-center text-xs border-b border-zinc-900 pb-2">
                        <span className="font-semibold text-white">{m.name}</span>
                        <div className="space-x-3 text-zinc-400">
                          <span>Услуг: <strong className="text-white">{mAppts.length}</strong></span>
                          <span>Заработано: <strong className="text-amber-400">{mRev.toLocaleString('ru-RU')} ₽</strong></span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
