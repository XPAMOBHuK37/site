import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function App() {
  const [s, setS] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)
  const [isUp, setIsUp] = useState(false)
  const [clients, setClients] = useState([])
  const [modal, setModal] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('Новая')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setS(data.session); setLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => { setS(session); setLoading(false) })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { if (s) fetchClients() }, [s])

  const fetchClients = async () => {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
  }

  const handleAuth = async (e) => {
    e.preventDefault(); setErr(null)
    const { error } = isUp ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password })
    if (error) setErr(error.message)
  }

  const addClient = async (e) => {
    e.preventDefault()
    await supabase.from('clients').insert([{ name, phone, status }])
    setName(''); setPhone(''); setStatus('Новая'); setModal(false); fetchClients()
  }

  const updateStatus = async (id, ns) => {
    await supabase.from('clients').update({ status: ns }).eq('id', id)
    fetchClients()
  }

  if (loading) return <div className="p-8 text-center">Загрузка...</div>

  if (!s) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form onSubmit={handleAuth} className="w-full max-w-md p-8 bg-white rounded shadow">
          <h2 className="text-xl font-bold mb-4">{isUp ? 'Регистрация' : 'Вход'}</h2>
          {err && <div className="mb-4 text-red-600 text-sm">{err}</div>}
          <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mb-3 p-2 border rounded" />
          <input type="password" required placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} className="w-full mb-4 p-2 border rounded" />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">{isUp ? 'Регистрация' : 'Войти'}</button>
          <button type="button" onClick={() => setIsUp(!isUp)} className="w-full mt-3 text-sm text-blue-600">{isUp ? 'Войти' : 'Регистрация'}</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-lg font-bold">Мини-CRM</h1>
        <button onClick={() => supabase.auth.signOut()} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Выйти</button>
      </header>
      <main className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Заявки</h2>
          <button onClick={() => setModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded">+ Добавить</button>
        </div>
        <div className="bg-white shadow rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 text-left">Имя</th>
                <th className="p-3 text-left">Телефон</th>
                <th className="p-3 text-left">Статус</th>
                <th className="p-3 text-left">Действие</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id} className="border-b">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.phone}</td>
                  <td className="p-3">{c.status}</td>
                  <td className="p-3">
                    <select value={c.status} onChange={e => updateStatus(c.id, e.target.value)} className="border rounded p-1">
                      <option value="Новая">Новая</option>
                      <option value="В работе">В работе</option>
                      <option value="Завершена">Завершена</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Новая заявка</h3>
            <form onSubmit={addClient} className="space-y-3">
              <input type="text" required placeholder="Имя" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" />
              <input type="text" required placeholder="Телефон" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded" />
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2 border rounded">
                <option value="Новая">Новая</option>
                <option value="В работе">В работе</option>
                <option value="Завершена">Завершена</option>
              </select>
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded mt-2">Сохранить</button>
              <button type="button" onClick={() => setModal(false)} className="w-full bg-gray-200 p-2 rounded mt-1">Отмена</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
