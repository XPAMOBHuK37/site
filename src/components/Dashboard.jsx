import React, { useState, useEffect } from 'react'
import { Calendar, Search, Plus, LogOut, Scissors, Users, DollarSign, Trash2, Edit } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { DashboardTimeline } from './DashboardTimeline'
import { DashboardModal } from './DashboardModal'

export default function Dashboard({ session, onClose }) {
  const [tab, setTab] = useState('appts') // 'appts' | 'services' | 'masters'
  
  // Appointments state
  const [appts, setAppts] = useState([])
  const [search, setSearch] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [modal, setModal] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [master, setMaster] = useState('Алексей Смирнов')
  const [time, setTime] = useState('12:00')

  const mastersList = ['Алексей Смирнов', 'Дмитрий Иванов', 'Максим Петров']
  const slots = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00']

  // Services state
  const [services, setServices] = useState([])
  const [serviceModal, setServiceModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [sTitle, setSTitle] = useState('')
  const [sDesc, setSDesc] = useState('')
  const [sPrice, setSPrice] = useState('')

  // Masters DB state
  const [dbMasters, setDbMasters] = useState([])
  const [masterModal, setMasterModal] = useState(false)
  const [editingMaster, setEditingMaster] = useState(null)
  const [mName, setMName] = useState('')
  const [mPhone, setMPhone] = useState('')
  const [mBio, setMBio] = useState('')
  const [mPhoto, setMPhoto] = useState('')

  useEffect(() => { 
    fetchAppts()
    fetchServices()
    fetchDbMasters()
  }, [date])

  const fetchAppts = async () => {
    try {
      const { data } = await supabase.from('appointments').select('*').eq('date', date).order('start_time')
      if (data) setAppts(data)
    } catch (e) {}
  }

  const fetchServices = async () => {
    try {
      const { data } = await supabase.from('services').select('*').order('created_at', { ascending: false })
      if (data) setServices(data)
    } catch (e) {}
  }

  const fetchDbMasters = async () => {
    try {
      const { data } = await supabase.from('masters').select('*').order('created_at', { ascending: false })
      if (data) setDbMasters(data)
    } catch (e) {}
  }

  const createAppt = async (e) => {
    e.preventDefault()
    try {
      await supabase.from('appointments').insert([{ client_name: name, client_phone: phone, date, start_time: time, status: 'Подтверждена' }])
      setName(''); setPhone(''); setModal(false); fetchAppts()
    } catch (e) {}
  }

  const updateApptStatus = async (id, status) => {
    await supabase.from('appointments').update({ status }).eq('id', id)
    fetchAppts()
  }

  const saveService = async (e) => {
    e.preventDefault()
    if (editingService) {
      await supabase.from('services').update({ title: sTitle, description: sDesc, price: sPrice }).eq('id', editingService.id)
    } else {
      await supabase.from('services').insert([{ title: sTitle, description: sDesc, price: sPrice }])
    }
    setServiceModal(false); setEditingService(null); setSTitle(''); setSDesc(''); setSPrice(''); fetchServices()
  }

  const deleteService = async (id) => {
    if (confirm('Удалить эту услугу?')) {
      await supabase.from('services').delete().eq('id', id)
      fetchServices()
    }
  }

  const saveMaster = async (e) => {
    e.preventDefault()
    if (editingMaster) {
      await supabase.from('masters').update({ name: mName, phone: mPhone, bio: mBio, photo_url: mPhoto }).eq('id', editingMaster.id)
    } else {
      await supabase.from('masters').insert([{ name: mName, phone: mPhone, bio: mBio, photo_url: mPhoto }])
    }
    setMasterModal(false); setEditingMaster(null); setMName(''); setMPhone(''); setMBio(''); setMPhoto(''); fetchDbMasters()
  }

  const deleteMaster = async (id) => {
    if (confirm('Удалить этого мастера?')) {
      await supabase.from('masters').delete().eq('id', id)
      fetchDbMasters()
    }
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
            <button onClick={() => setTab('services')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === 'services' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>✂️ Услуги и цены</button>
            <button onClick={() => setTab('masters')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === 'masters' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>💈 Мастера</button>
            <button onClick={onClose} className="bg-zinc-800 text-white px-4 py-2 rounded-xl text-sm font-semibold">На сайт</button>
            <button onClick={() => supabase.auth.signOut()} className="bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-1.5"><LogOut className="w-4 h-4" /><span>Выйти</span></button>
          </div>
        </div>

        {tab === 'appts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <input type="text" placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none" />
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white outline-none" />
                </div>
              </div>
              <button onClick={() => setModal(true)} className="bg-amber-500 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center space-x-2"><Plus className="w-4 h-4" /><span>Создать запись</span></button>
            </div>

            <DashboardTimeline date={date} slots={slots} masters={mastersList} filtered={filtered} onSelectSlot={(m, t) => { setTime(t); setMaster(m); setModal(true) }} onUpdateStatus={updateApptStatus} />

            {modal && <DashboardModal name={name} setName={setName} phone={phone} setPhone={setPhone} master={master} setMaster={setMaster} time={time} setTime={setTime} masters={mastersList} slots={slots} onClose={() => setModal(false)} onCreate={createAppt} />}
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
                onClick={() => { setEditingService(null); setSTitle(''); setSDesc(''); setSPrice(''); setServiceModal(true) }}
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
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-zinc-900">
                    <span className="font-bold text-white text-base">{s.price}</span>
                    <div className="flex space-x-2">
                      <button onClick={() => { setEditingService(s); setSTitle(s.title); setSDesc(s.description); setSPrice(s.price); setServiceModal(true) }} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300"><Edit className="w-4 h-4" /></button>
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
        {tab === 'masters' && (
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Управление мастерами</h2>
                <p className="text-xs text-zinc-400">Добавляйте, редактируйте или удаляйте мастеров и их контактные данные.</p>
              </div>
              <button 
                onClick={() => { setEditingMaster(null); setMName(''); setMPhone(''); setMBio(''); setMPhoto(''); setMasterModal(true) }}
                className="bg-amber-500 text-zinc-950 font-bold px-4 py-2 rounded-xl text-sm flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" /><span>Добавить мастера</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dbMasters.map(m => (
                <div key={m.id} className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl flex flex-col items-center text-center space-y-4">
                  <img src={m.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} alt={m.name} className="w-24 h-24 rounded-full object-cover border border-amber-500/50" />
                  <div>
                    <h3 className="font-bold text-lg text-white">{m.name}</h3>
                    <p className="text-xs text-amber-400 font-semibold mt-1">{m.phone}</p>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{m.bio}</p>
                  </div>
                  <div className="flex space-x-2 pt-2 w-full justify-center border-t border-zinc-900">
                    <button onClick={() => { setEditingMaster(m); setMName(m.name); setMPhone(m.phone || ''); setMBio(m.bio || ''); setMPhoto(m.photo_url || ''); setMasterModal(true) }} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs text-zinc-200 font-semibold flex items-center space-x-1"><Edit className="w-3.5 h-3.5" /><span>Редактировать</span></button>
                    <button onClick={() => deleteMaster(m.id)} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-xs text-red-400 font-semibold flex items-center space-x-1"><Trash2 className="w-3.5 h-3.5" /><span>Удалить</span></button>
                  </div>
                </div>
              ))}
            </div>

            {masterModal && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4">
                  <h3 className="text-lg font-bold">{editingMaster ? 'Редактировать мастера' : 'Новый мастер'}</h3>
                  <form onSubmit={saveMaster} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase text-zinc-400 mb-1">Имя мастера</label>
                      <input type="text" value={mName} onChange={e => setMName(e.target.value)} required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-zinc-400 mb-1">Телефон</label>
                      <input type="text" value={mPhone} onChange={e => setMPhone(e.target.value)} placeholder="+7 (999) 000-00-00" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-zinc-400 mb-1">Ссылка на фото (URL)</label>
                      <input type="text" value={mPhoto} onChange={e => setMPhoto(e.target.value)} placeholder="https://..." className="w-full bg-zinc-950 border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
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
      </div>
    </div>
  )
}
