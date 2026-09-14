import React, { useState, useEffect } from 'react'
import { Scissors, Award, UserCheck, Phone } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Landing({ onOpenBooking }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [service, setService] = useState('1')
  const [datetime, setDatetime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  
  const [services, setServices] = useState([
    { title: 'Мужская стрижка', description: 'Классические и современные стрижки, мытье волос и укладка.', price: '1 500 ₽' },
    { title: 'Оформление бороды', description: 'Моделирование формы бороды, бритье опасной бритвой.', price: '1 000 ₽' },
    { title: 'Комплекс', description: 'Стрижка + оформление бороды для безупречного полного образа.', price: '2 200 ₽' }
  ])
  const [masters, setMasters] = useState([
    { name: 'Алексей Смирнов', phone: '+7 (999) 111-22-33', bio: 'Старший барбер со стажем более 10 лет. Мастер классических стрижек.', photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
    { name: 'Дмитрий Иванов', phone: '+7 (999) 222-33-44', bio: 'Эксперт по опасной бритве и моделированию бород.', photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
    { name: 'Максим Петров', phone: '+7 (999) 333-44-55', bio: 'Мастер современных текстурных стрижек и стильных укладок.', photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' }
  ])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: sData } = await supabase.from('services').select('*')
      if (sData && sData.length > 0) setServices(sData)

      const { data: mData } = await supabase.from('masters').select('*')
      if (mData && mData.length > 0) setMasters(mData)
    } catch (e) {}
  }

  const handleOpen = () => {
    if (onOpenBooking) onOpenBooking()
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Заявка принята! Мы перезвоним вам для подтверждения.')
    setModalOpen(false)
  }

  return (
    <div className="bg-[#120e0c] text-[#f4e8d3] font-['Montserrat',sans-serif] min-h-screen relative">
      {/* Винтажная лента / верхний бар */}
      <div className="h-[6px]" style={{
        background: 'repeating-linear-gradient(45deg, #9e3627, #9e3627 15px, #f4e8d3 15px, #f4e8d3 30px, #1b4332 30px, #1b4332 45px)'
      }}></div>

      {/* Шапка */}
      <header className="bg-[rgba(18,14,12,0.95)] border-b-2 border-[#3a2e26] fixed top-[6px] w-full z-100 backdrop-blur-[5px]">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
          <a href="#" className="flex items-center">
            <img src="/logo.svg" alt="Корни" className="h-11 w-auto" />
          </a>

          <ul className="hidden md:flex gap-[30px] list-none items-center">
            <li><a href="#services" className="text-[11px] font-extrabold tracking-[2px] uppercase text-[#f4e8d3] hover:text-[#d49b35] transition">Услуги</a></li>
            <li><a href="#masters" className="text-[11px] font-extrabold tracking-[2px] uppercase text-[#f4e8d3] hover:text-[#d49b35] transition">Мастера</a></li>
            <li><a href="#gallery" className="text-[11px] font-extrabold tracking-[2px] uppercase text-[#f4e8d3] hover:text-[#d49b35] transition">Галерея</a></li>
            <li><a href="#contacts" className="text-[11px] font-extrabold tracking-[2px] uppercase text-[#f4e8d3] hover:text-[#d49b35] transition">Контакты</a></li>
          </ul>

          <button 
            onClick={handleOpen}
            className="bg-[#9e3627] text-[#f4e8d3] font-['Montserrat',sans-serif] text-[11px] font-extrabold tracking-[2px] uppercase px-6 py-3 border-2 border-[#d49b35] rounded-[2px] cursor-pointer shadow-[3px_3px_0px_#d49b35] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0px_#d49b35] hover:bg-[#b53d2c] transition-all"
          >
            Записаться
          </button>
        </div>
      </header>

      {/* Главный экран (Hero) в стиле 1970 Americana с четким и качественным фоном */}
      <section className="pt-[140px] sm:pt-[150px] pb-[60px] sm:pb-[80px] min-h-screen flex items-center relative overflow-hidden bg-[#120e0c]" style={{ 
        backgroundImage: 'linear-gradient(rgba(18, 14, 12, 0.76), rgba(18, 14, 12, 0.86)), url("https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        boxShadow: 'inset 0 0 150px rgba(0,0,0,0.8)'
      }}>
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center w-full relative z-10">
          
          <div>
            <div className="inline-block border border-[#d49b35] px-3 py-1 text-[10px] font-extrabold tracking-[3px] text-[#d49b35] uppercase mb-5 bg-[rgba(212,155,53,0.12)] shadow-[2px_2px_0px_#9e3627]">
              ★ СТРИЖКИ & БРИТЬЁ С ДУШОЙ ★
            </div>
            <h1 className="font-['Abril_Fatface',cursive] text-[48px] sm:text-[58px] leading-[1.05] text-[#f4e8d3] mb-5 tracking-[1px] uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
              Возрождая<br /> Традиции.
              <span className="text-[#d49b35] font-['Playfair_Display',serif] font-italic normal-case block text-[38px] sm:text-[48px]">Подчеркивая стиль.</span>
            </h1>
            <p className="text-[15px] text-[#b8a99a] mb-[35px] max-w-[460px] border-l-[3px] border-[#9e3627] pl-[15px] leading-relaxed bg-[rgba(18,14,12,0.75)] py-3 px-2 shadow-md backdrop-blur-[4px]">
              Классическая мужская парикмахерская в духе золотой эры. Настоящие мастера, опасные бритвы и атмосфера хорошей мужской компании.
            </p>
            <button 
              onClick={handleOpen}
              className="bg-[#9e3627] text-[#f4e8d3] font-['Montserrat',sans-serif] text-[11px] font-extrabold tracking-[2px] uppercase px-8 py-4 border-2 border-[#d49b35] rounded-[2px] cursor-pointer shadow-[4px_4px_0px_#d49b35] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#d49b35] hover:bg-[#b53d2c] transition-all"
            >
              Записаться на визит
            </button>
          </div>

          {/* Фоторамка с фирменным логотипом и винтажным оформлением */}
          <div className="relative p-4 bg-[rgba(28,22,19,0.95)] backdrop-blur-[8px] border-2 border-[#d49b35] shadow-[14px_14px_0px_#3a2e26]">
            <div className="w-full h-[480px] bg-[#14100e] flex flex-col items-center justify-center text-center p-8 border border-[#3a2e26] relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d49b35_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(158,54,39,0.15)] via-transparent to-transparent"></div>
              <div className="relative z-10 space-y-6 flex flex-col items-center">
                <img src="/logo.svg" alt="Корни" className="w-56 h-auto drop-shadow-[0_5px_15px_rgba(212,155,53,0.3)]" />
                <div className="w-12 h-1 bg-[#9e3627] my-2"></div>
                <p className="text-[12px] font-bold text-[#f4e8d3] tracking-[3px] uppercase mt-2">ИВАНОВО, ПЕР. СТЕПАНОВА, 12</p>
                <p className="text-[10px] text-[#b8a99a] tracking-[2px] uppercase">АТМОСФЕРА 1970 AMERICANA</p>
              </div>
            </div>
            <div className="text-center text-[10px] tracking-[3px] text-[#d49b35] uppercase mt-[12px] font-bold">
              КОРНИ • ИВАНОВО • НАСТОЯЩЕЕ МАСТЕРСТВО
            </div>
          </div>

        </div>
      </section>

      {/* Услуги */}
      <section className="py-24 bg-[#16120e] border-t-2 border-[#3a2e26]" id="services">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-['Abril_Fatface',cursive] text-4xl text-[#d49b35] uppercase tracking-wider mb-3">Наши услуги и цены</h2>
            <div className="w-16 h-1 bg-[#9e3627] mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <div key={s.id || i} className="bg-[#1c1613] p-8 border border-[#3a2e26] shadow-lg hover:border-[#d49b35] transition cursor-pointer flex flex-col justify-between" onClick={handleOpen}>
                <div>
                  <h3 className="font-['Playfair_Display',serif] text-2xl text-[#f4e8d3] mb-3">{s.title}</h3>
                  <p className="text-[#b8a99a] text-sm mb-6 leading-relaxed">{s.description}</p>
                </div>
                <div className="pt-4 border-t border-[#3a2e26] flex items-center justify-between">
                  <span className="font-['Abril_Fatface',cursive] text-lg text-[#d49b35]">{s.price}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9e3627]">Записаться →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Мастера */}
      <section className="py-24 bg-[#120e0c] border-t-2 border-[#3a2e26]" id="masters">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-['Abril_Fatface',cursive] text-4xl text-[#d49b35] uppercase tracking-wider mb-3">Наши мастера</h2>
            <div className="w-16 h-1 bg-[#9e3627] mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {masters.map((m, i) => (
              <div key={m.id || i} className="bg-[#1c1613] p-8 border border-[#3a2e26] shadow-lg hover:border-[#d49b35] transition flex flex-col items-center text-center">
                <img 
                  src={m.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} 
                  alt={m.name} 
                  className="w-32 h-32 rounded-full object-cover border-2 border-[#d49b35] shadow-md mb-6" 
                />
                <h3 className="font-['Playfair_Display',serif] text-2xl text-[#f4e8d3] mb-2">{m.name}</h3>
                {m.phone && (
                  <div className="flex items-center space-x-2 text-[#d49b35] text-sm mb-4 font-semibold">
                    <Phone className="w-4 h-4" />
                    <span>{m.phone}</span>
                  </div>
                )}
                <p className="text-[#b8a99a] text-sm leading-relaxed mb-6">{m.bio}</p>
                <button 
                  onClick={handleOpen}
                  className="mt-auto bg-[#9e3627] text-[#f4e8d3] font-['Montserrat',sans-serif] text-[11px] font-extrabold tracking-[2px] uppercase px-5 py-2.5 border border-[#d49b35] rounded-[2px] cursor-pointer hover:bg-[#b53d2c] transition-all"
                >
                  Записаться к мастеру
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Модальное окно записи */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[rgba(10,8,7,0.85)] backdrop-blur-[6px] z-1000 flex items-center justify-center p-4">
          <div className="bg-[#1c1613] border-[3px] border-double border-[#d49b35] w-full max-w-[450px] p-[35px] relative shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
            <button className="absolute top-[15px] right-[15px] bg-none border-none text-[#f4e8d3] text-[24px] cursor-pointer" onClick={handleClose}>&times;</button>
            <div className="text-center mb-[25px]">
              <h3 className="font-['Abril_Fatface',cursive] text-[26px] text-[#d49b35] tracking-[1px]">Запись на визит</h3>
              <p className="text-[11px] text-[#b8a99a] uppercase tracking-[1px] mt-1">Мужская парикмахерская «Корни»</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-[18px]">
                <label className="block text-[10px] font-extrabold tracking-[2px] text-[#b8a99a] uppercase mb-[6px]">Выбор услуги</label>
                <select value={service} onChange={(e) => setService(e.target.value)} required className="w-full p-3 bg-[#100d0b] border border-[#3a2e26] text-[#f4e8d3] font-['Montserrat',sans-serif] text-[13px]">
                  <option value="1">Мужская стрижка — 1 500 ₽</option>
                  <option value="2">Бритьё опасной бритвой — 1 200 ₽</option>
                  <option value="3">Комплекс (Стрижка + Борода) — 2 300 ₽</option>
                </select>
              </div>

              <div className="mb-[18px]">
                <label className="block text-[10px] font-extrabold tracking-[2px] text-[#b8a99a] uppercase mb-[6px]">Желаемая дата и время</label>
                <input type="text" placeholder="Например: Завтра в 15:00" value={datetime} onChange={(e) => setDatetime(e.target.value)} required className="w-full p-3 bg-[#100d0b] border border-[#3a2e26] text-[#f4e8d3] font-['Montserrat',sans-serif] text-[13px]" />
              </div>

              <div className="mb-[18px]">
                <label className="block text-[10px] font-extrabold tracking-[2px] text-[#b8a99a] uppercase mb-[6px]">Ваше Имя</label>
                <input type="text" placeholder="Как вас зовут?" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 bg-[#100d0b] border border-[#3a2e26] text-[#f4e8d3] font-['Montserrat',sans-serif] text-[13px]" />
              </div>

              <div className="mb-[18px]">
                <label className="block text-[10px] font-extrabold tracking-[2px] text-[#b8a99a] uppercase mb-[6px]">Номер телефона</label>
                <input type="tel" placeholder="+7 (___) ___-__-__" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full p-3 bg-[#100d0b] border border-[#3a2e26] text-[#f4e8d3] font-['Montserrat',sans-serif] text-[13px]" />
              </div>

              <button type="submit" className="w-full mt-[10px] bg-[#9e3627] text-[#f4e8d3] font-['Montserrat',sans-serif] text-[11px] font-extrabold tracking-[2px] uppercase px-6 py-3 border-2 border-[#d49b35] rounded-[2px] cursor-pointer shadow-[3px_3px_0px_#d49b35] hover:bg-[#b53d2c] transition-all">
                Подтвердить запись
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
