import React, { useState } from 'react'
import { X, Lock } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function AuthModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error } = isSignUp 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-55">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 text-zinc-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center space-x-2">
            <Lock className="w-5 h-5 text-amber-500" />
            <span>{isSignUp ? 'Регистрация персонала' : 'Вход для персонала'}</span>
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {error && <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">{error}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none" />
          <input type="password" required placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none" />
          <button disabled={loading} type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold p-3 rounded-xl transition">
            {loading ? 'Загрузка...' : (isSignUp ? 'Зарегистрироваться' : 'Войти')}
          </button>
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="w-full text-xs text-amber-500 hover:underline">
            {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
          </button>
        </form>
      </div>
    </div>
  )
}
