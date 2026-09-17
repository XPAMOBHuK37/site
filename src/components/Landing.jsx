import React, { useState, useEffect } from 'react'
import { Scissors, Award, UserCheck, Phone, MapPin, Clock } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Landing({ onOpenBooking }) {
  const [services, setServices] = useState([
    { title: 'Мужская стрижка', description: 'Классические и современные стрижки, мытье волос и укладка.', price: '1 500 ₽' },
    { title: 'Оформление бороды', description: 'Моделирование формы бороды, бритье опасной бритвой.', price: '1 000 ₽' },
    { title: 'Комплекс', description: 'Стрижка + оформление бороды для безупречного полного образа.', price: '2 200 ₽' }
  ])
  const [masters, setMasters] = useState([
    { name: 'Алексей Смирнов', phone: '+7 (999) 111-22-33', bio: 'Старший барбер со стажем более 10 лет. Мастер классических стрижек.', photo_url: '/logo.svg' },
    { name: 'Дмитрий Иванов', phone: '+7 (999) 222-33-44', bio: 'Эксперт по опасной бритве и моделированию бород.', photo_url: '/logo.svg' },
    { name: 'Максим Петров', phone: '+7 (999) 333-44-55', bio: 'Мастер современных текстурных стрижек и стильных укладок.', photo_url: '/logo.svg' }
  ])

  useEffect(() => {
    fetchData()
    const handleUpdate = () => fetchData()
    window.addEventListener('korni_data_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    const channel = supabase
      .channel('public:landing_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'masters' }, () => fetchData())
      .subscribe()

    return () => {
      window.removeEventListener('korni_data_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchData = async () => {
    const localS = localStorage.getItem('korni_public_global_services')
    if (localS) {
      try {
        const parsed = JSON.parse(localS)
        if (parsed && parsed.length > 0) {
          setServices(parsed)
        }
      } catch (e) {}
    }

    const localM = localStorage.getItem('korni_local_masters')
    if (localM) {
      try {
        const parsed = JSON.parse(localM)
        if (parsed && parsed.length > 0) {
          setMasters(parsed)
        }
      } catch (e) {}
    }

    try {
      const { data: sData, error: sErr } = await supabase.from('services').select('*').order('created_at', { ascending: false })
      if (!sErr && sData) {
        const globalOnly = sData.filter(s => !s.master_id || s.master_id === '' || s.master_id === 'null')
        setServices(globalOnly)
        localStorage.setItem('korni_public_global_services', JSON.stringify(globalOnly))
      }
    } catch (e) {}

    try {
      const { data: mData, error: mErr } = await supabase.from('masters').select('*').order('created_at', { ascending: true })
      if (!mErr && mData) {
        setMasters(mData)
        localStorage.setItem('korni_local_masters', JSON.stringify(mData))
      }
    } catch (e) {}
  }

  const handleOpen = () => {
    if (onOpenBooking) onOpenBooking()
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
        backgroundImage: 'linear-gradient(rgba(18, 14, 12, 0.76), rgba(18, 14, 12, 0.86)), url("/hero.jpg")',
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

          {/* Видео-луп с надписью поверх в рамке */}
          <div className="relative p-4 bg-[rgba(28,22,19,0.95)] backdrop-blur-[8px] border-2 border-[#d49b35] shadow-[14px_14px_0px_#3a2e26]">
            <div className="w-full h-[480px] bg-[#14100e] relative overflow-hidden border border-[#3a2e26] flex flex-col items-center justify-center text-center p-8">
              <video 
                src="/1.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              <div className="absolute inset-0 bg-[rgba(18,14,12,0.55)] z-0"></div>
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d49b35_1.5px,transparent_1.5px)] [background-size:24px_24px] z-0"></div>
              
              <div className="relative z-10 space-y-6 flex flex-col items-center">
                <img src="/logo.svg" alt="Корни" className="w-56 h-auto drop-shadow-[0_5px_15px_rgba(212,155,53,0.5)]" />
                <div className="w-12 h-1 bg-[#9e3627] my-2 shadow-md"></div>
                <p className="text-[12px] font-bold text-[#f4e8d3] tracking-[3px] uppercase mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">ИВАНОВО, ПЕР. СТЕПАНОВА, 12</p>
              </div>
            </div>
            <div className="text-center text-[10px] tracking-[3px] text-[#d49b35] uppercase mt-[12px] font-bold">
              КОРНИ • ИВАНОВО • НАСТОЯЩЕЕ МАСТЕРСТВО
            </div>
          </div>

        </div>
      </section>

      {/* Услуги */}
      <section className="py-24 border-t-2 border-[#3a2e26] relative overflow-hidden bg-cover bg-center" style={{ 
        backgroundColor: '#15110e',
        backgroundImage: 'linear-gradient(to bottom, rgba(21, 17, 14, 0.95), rgba(13, 10, 8, 0.98)), repeating-linear-gradient(0deg, rgba(212, 155, 53, 0.025), rgba(212, 155, 53, 0.025) 3px, transparent 3px, transparent 6px)'
      }} id="services">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-['Abril_Fatface',cursive] text-4xl text-[#d49b35] uppercase tracking-wider mb-3">Наши услуги и цены</h2>
            <div className="w-16 h-1 bg-[#9e3627] mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <div key={s.id || i} className="bg-[#1c1613] p-8 border border-[#3a2e26] shadow-lg hover:border-[#d49b35] transition cursor-pointer flex flex-col justify-between" onClick={() => onOpenBooking && onOpenBooking({ service: s })}>
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
      <section className="py-24 border-t-2 border-[#3a2e26] relative overflow-hidden bg-cover bg-center" style={{ 
        backgroundColor: '#15110e',
        backgroundImage: 'linear-gradient(to bottom, rgba(21, 17, 14, 0.95), rgba(13, 10, 8, 0.98)), repeating-linear-gradient(0deg, rgba(212, 155, 53, 0.025), rgba(212, 155, 53, 0.025) 3px, transparent 3px, transparent 6px)'
      }} id="masters">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-['Abril_Fatface',cursive] text-4xl text-[#d49b35] uppercase tracking-wider mb-3">Наши мастера</h2>
            <div className="w-16 h-1 bg-[#9e3627] mx-auto"></div>
          </div>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
            {masters.map((m, i) => (
              <div key={m.id || i} className="bg-[#1c1613] p-8 border border-[#3a2e26] shadow-lg hover:border-[#d49b35] transition flex flex-col items-center text-center w-full max-w-sm">
                <img 
                  src={m.photo_url || '/logo.svg'} 
                  onError={(e) => { e.target.src = '/logo.svg'; }}
                  alt={m.name} 
                  className="w-32 h-32 rounded-full object-cover border-2 border-[#d49b35] shadow-md mb-6" 
                />
                <h3 className="font-['Playfair_Display',serif] text-2xl text-[#f4e8d3] mb-2">{m.name}</h3>
                {m.phone && (
                  <a href={`tel:${m.phone}`} className="flex items-center space-x-2 text-[#d49b35] hover:text-white text-sm mb-4 font-semibold transition">
                    <Phone className="w-4 h-4" />
                    <span>{m.phone}</span>
                  </a>
                )}
                <p className="text-[#b8a99a] text-sm leading-relaxed mb-6">{m.bio}</p>
                <button 
                  onClick={() => onOpenBooking && onOpenBooking({ master: m })}
                  className="mt-auto bg-[#9e3627] text-[#f4e8d3] font-['Montserrat',sans-serif] text-[11px] font-extrabold tracking-[2px] uppercase px-5 py-2.5 border border-[#d49b35] rounded-[2px] cursor-pointer hover:bg-[#b53d2c] transition-all"
                >
                  Записаться к мастеру
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Контакты */}
      <section className="py-24 border-t-2 border-[#3a2e26] relative overflow-hidden bg-cover bg-center" style={{ 
        backgroundColor: '#15110e',
        backgroundImage: 'linear-gradient(to bottom, rgba(21, 17, 14, 0.95), rgba(13, 10, 8, 0.98)), repeating-linear-gradient(0deg, rgba(212, 155, 53, 0.025), rgba(212, 155, 53, 0.025) 3px, transparent 3px, transparent 6px)'
      }} id="contacts">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-['Abril_Fatface',cursive] text-4xl text-[#d49b35] uppercase tracking-wider mb-3">Контакты</h2>
            <div className="w-16 h-1 bg-[#9e3627] mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-[#1c1613] p-8 border border-[#3a2e26] shadow-lg space-y-6">
              <h3 className="font-['Playfair_Display',serif] text-2xl text-[#f4e8d3]">Парикмахерская «Корни»</h3>
              <div className="space-y-4 text-sm text-[#b8a99a]">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-[#d49b35] shrink-0 mt-0.5" />
                  <span><strong>Адрес:</strong> Иваново, пер. Степанова, 12</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-[#d49b35] shrink-0" />
                  <span><strong>Телефон:</strong> <a href="tel:+79012833730" className="hover:text-white transition">+7 (901) 283-37-30</a></span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-[#d49b35] shrink-0" />
                  <span><strong>Режим работы:</strong> Ежедневно с 10:00 до 22:00</span>
                </div>
                <div className="pt-4 border-t border-[#3a2e26] flex items-center space-x-4">
                  <span className="font-semibold text-[#f4e8d3]">Мы в соцсетях:</span>
                  <a href="https://vk.ru/kornibarbershop" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 bg-[#9e3627] text-[#f4e8d3] px-4 py-2 rounded text-xs font-extrabold uppercase tracking-wider hover:bg-[#b53d2c] transition">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M15.684 0H8.316C1.442 0 0 1.442 0 8.316v7.368C0 22.558 1.442 24 8.316 24h7.368c6.874 0 8.316-1.442 8.316-8.316V8.316C24 1.442 22.558 0 15.684 0zm3.266 16.592h-1.633c-.571 0-.746-.465-1.768-1.488-0.902-.876-1.282-.988-1.503-.988-.308 0-.396.088-.396.516v1.408c0 .363-.118.579-1.086.579-1.603 0-3.385-.97-5.83-4.148-2.946-3.864-4.225-6.79-4.225-7.391 0-.325.124-.627.674-.627h1.633c.451 0 .622.208.796.672.868 2.527 2.327 4.743 2.932 4.743.22 0 .319-.101.319-.652V7.472c-.071-1.157-.691-1.255-.691-1.651 0-.198.165-.363.424-.363h2.563c.341 0 .451.176.451.571v3.155c0 .352.155.473.253.473.198 0 .363-.11 0-.726-2.078-2.31-2.222-2.585-2.222-2.915 0-.253.198-.463.538-.463h1.633c.495 0 .682.253.538.835-.308 1.309-1.474 2.893-1.583 3.047-.11.154-.11.231 0 .396.11.165 1.341 1.903 2.925 3.868 2.012 2.476 2.825 2.817 3.243 2.817.385 0 .594-.253.594-.781v-1.782c0-.527.187-.627.538-.627.308 0 .858.11 1.903 1.133 1.156 1.156 1.321 1.661 1.321 1.837 0 .22-.11.418-.538.418z"/>
                    </svg>
                    <span>ВКонтакте</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-[400px] rounded-xl overflow-hidden border-2 border-[#d49b35] shadow-[8px_8px_0px_#3a2e26] relative">
                <iframe 
                  src="https://yandex.ru/map-widget/v1/?text=%D0%98%D0%B2%D0%B0%D0%BD%D0%BE%D0%B2%D0%BE%2C%20%D0%BF%D0%B5%D1%80.%20%D0%A1%D1%82%D0%B5%D0%BF%D0%B0%D0%BD%D0%BE%D0%B2%D0%B0%2C%2012&z=17&l=map" 
                  width="100%" 
                  height="100%" 
                  frameBorder="0"
                  title="Карта"
                  loading="lazy"
                ></iframe>
              </div>
              <div className="text-center">
                <a 
                  href="https://yandex.ru/maps/?text=%D0%98%D0%B2%D0%B0%D0%BD%D0%BE%D0%B2%D0%BE%2C%20%D0%BF%D0%B5%D1%80.%20%D0%A1%D1%82%D0%B5%D0%BF%D0%B0%D0%BD%D0%BE%D0%B2%D0%B0%2C%2012" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block text-xs font-bold uppercase tracking-widest text-[#d49b35] hover:text-white underline transition mt-1"
                >
                  📍 Открыть в большом приложении Яндекс.Карты &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
