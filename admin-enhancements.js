(() => {
  const SUPABASE_URL = 'https://zsnrjapfmsvkyjeiwxmk.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_apAFjK94Dolcr-8ZXM6ydw_pLeep978';
  const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' };
  const api = async (path, opts = {}) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: { ...headers, ...(opts.headers || {}) }, ...opts });
    if (!res.ok) throw new Error(await res.text());
    if (res.status === 204) return null;
    return res.json();
  };
  const isAdmin = () => {
    try { const s = JSON.parse(localStorage.getItem('korni_master_session') || '{}'); return s.is_admin === true || s.email === 'admin@korni37.ru'; } catch { return false; }
  };
  const masterSession = () => {
    try { return JSON.parse(localStorage.getItem('korni_master_session') || 'null'); } catch { return null; }
  };
  const today = () => new Date().toISOString().slice(0, 10);

  async function showPublicEventPopup() {
    if (location.pathname.includes('admin')) return;
    let events = [];
    try { events = await api(`events?select=*&date_from=lte.${today()}&date_to=gte.${today()}&order=created_at.desc&limit=1`); } catch { return; }
    const ev = events && events[0];
    if (!ev || !ev.image_url) return;
    if (sessionStorage.getItem(`korni_event_closed_${ev.id}`)) return;
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;padding:14px;';
    wrap.innerHTML = `<div style="position:relative;max-width:520px;width:100%;"><button aria-label="Закрыть" style="position:absolute;right:-6px;top:-46px;width:42px;height:42px;border-radius:999px;border:2px solid #fff;background:#111;color:#fff;font-size:28px;line-height:1;z-index:2;cursor:pointer">×</button><img alt="${ev.title || 'Событие'}" src="${ev.image_url}" style="display:block;width:100%;max-height:82vh;object-fit:contain;border-radius:18px;box-shadow:0 20px 70px rgba(0,0,0,.65);cursor:pointer;background:#222" /></div>`;
    const close = () => { sessionStorage.setItem(`korni_event_closed_${ev.id}`, '1'); wrap.remove(); };
    wrap.querySelector('button').onclick = close;
    wrap.querySelector('img').onclick = close;
    document.body.appendChild(wrap);
  }

  function modal(title, body) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;padding:16px;color:#f4e8d3;font-family:Montserrat,Arial,sans-serif;';
    wrap.innerHTML = `<div style="width:min(760px,100%);max-height:90vh;overflow:auto;background:#18181b;border:1px solid #3f3f46;border-radius:20px;padding:18px;box-shadow:0 20px 70px rgba(0,0,0,.7)"><div style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:14px"><h2 style="font-size:20px;font-weight:800;margin:0">${title}</h2><button style="width:40px;height:40px;border-radius:12px;background:#27272a;color:#fff;border:0;font-size:24px;cursor:pointer">×</button></div><div class="korni-modal-body">${body}</div></div>`;
    wrap.querySelector('button').onclick = () => wrap.remove();
    document.body.appendChild(wrap);
    return wrap;
  }

  async function openColors() {
    const masters = await api('masters?select=id,name,color&order=created_at.asc');
    const rows = masters.map(m => `<div style="display:flex;align-items:center;gap:12px;padding:10px;border-bottom:1px solid #27272a"><div style="flex:1;font-weight:700">${m.name}</div><input type="color" data-id="${m.id}" value="${m.color || '#f59e0b'}" style="width:54px;height:38px" /></div>`).join('');
    const w = modal('Цвета мастеров', `${rows}<button id="korni-save-colors" style="margin-top:14px;width:100%;padding:12px;border:0;border-radius:12px;background:#f59e0b;color:#111;font-weight:900;cursor:pointer">Сохранить цвета</button>`);
    w.querySelector('#korni-save-colors').onclick = async () => {
      for (const input of w.querySelectorAll('input[type=color]')) await api(`masters?id=eq.${input.dataset.id}`, { method: 'PATCH', body: JSON.stringify({ color: input.value }) });
      localStorage.removeItem('korni_local_masters');
      window.dispatchEvent(new Event('korni_data_updated'));
      alert('Цвета сохранены');
      w.remove();
    };
  }

  async function openEvents() {
    let events = [];
    try { events = await api('events?select=*&order=date_from.desc'); } catch (e) { alert('Сначала выполните SQL для таблицы events'); return; }
    const oldRows = events.filter(e => e.date_to < today()).map(e => `<div style="padding:8px;border-bottom:1px solid #27272a;color:#a1a1aa">${e.date_from} — ${e.date_to}: ${e.title || 'Без названия'}</div>`).join('') || '<div style="color:#71717a">Прошедших событий нет</div>';
    const w = modal('События', `<div style="display:grid;gap:10px"><input id="ev-title" placeholder="Название" style="padding:10px;border-radius:10px;background:#09090b;color:#fff;border:1px solid #3f3f46"><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><input id="ev-from" type="date" style="padding:10px;border-radius:10px;background:#09090b;color:#fff;border:1px solid #3f3f46"><input id="ev-to" type="date" style="padding:10px;border-radius:10px;background:#09090b;color:#fff;border:1px solid #3f3f46"></div><input id="ev-file" type="file" accept="image/*" style="padding:10px;border-radius:10px;background:#09090b;color:#fff;border:1px solid #3f3f46"><button id="ev-save" style="padding:12px;border:0;border-radius:12px;background:#f59e0b;color:#111;font-weight:900;cursor:pointer">Создать событие</button><h3 style="margin:18px 0 6px;font-weight:800">Прошедшие события</h3>${oldRows}</div>`);
    w.querySelector('#ev-save').onclick = async () => {
      const file = w.querySelector('#ev-file').files[0];
      const date_from = w.querySelector('#ev-from').value;
      const date_to = w.querySelector('#ev-to').value;
      const title = w.querySelector('#ev-title').value || 'Событие';
      if (!file || !date_from || !date_to) return alert('Заполните даты и выберите картинку');
      const reader = new FileReader();
      reader.onload = async () => {
        await api('events', { method: 'POST', body: JSON.stringify([{ title, date_from, date_to, image_url: reader.result }]) });
        alert('Событие создано');
        w.remove();
      };
      reader.readAsDataURL(file);
    };
  }

  function mountAdminButtons() {
    if (!isAdmin()) return;
    if (!document.body.innerText.includes('Админ-панель')) return;

    if (!document.getElementById('korni-admin-tabs-extra')) {
      const header = Array.from(document.querySelectorAll('div')).find(el =>
        el.innerText && el.innerText.includes('Админ-панель') && el.querySelector('button')
      );
      if (header) {
        const tabs = document.createElement('div');
        tabs.id = 'korni-admin-tabs-extra';
        tabs.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-top:12px';
        tabs.innerHTML = `<button style="padding:9px 13px;border-radius:12px;border:1px solid #444;background:#18181b;color:#fff;font-weight:800;cursor:pointer">🎨 Цвета мастеров</button><button style="padding:9px 13px;border-radius:12px;border:1px solid #d97706;background:#f59e0b;color:#111;font-weight:900;cursor:pointer">📣 События</button>`;
        tabs.children[0].onclick = openColors;
        tabs.children[1].onclick = openEvents;
        header.appendChild(tabs);
      }
    }

    if (document.getElementById('korni-admin-extra')) return;
    const box = document.createElement('div');
    box.id = 'korni-admin-extra';
    box.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:99999;display:flex;flex-direction:column;gap:8px';
    box.innerHTML = `<button style="padding:10px 12px;border-radius:12px;border:1px solid #444;background:#18181b;color:#fff;font-weight:800;cursor:pointer">🎨 Цвета мастеров</button><button style="padding:10px 12px;border-radius:12px;border:1px solid #444;background:#f59e0b;color:#111;font-weight:900;cursor:pointer">📣 События</button>`;
    box.children[0].onclick = openColors;
    box.children[1].onclick = openEvents;
    document.body.appendChild(box);
  }

  function hideAdminBell() {
    for (const btn of document.querySelectorAll('button[title="Новые записи"]')) {
      if (isAdmin()) {
        btn.style.display = 'none';
      } else {
        btn.style.display = '';
        attachBellDropdown(btn);
      }
    }
  }

  function attachBellDropdown(btn) {
    if (btn.dataset.korniBellDropdown) return;
    btn.dataset.korniBellDropdown = '1';
    btn.addEventListener('click', async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      await openBellDropdown(btn);
    }, true);
  }

  async function openBellDropdown(btn) {
    document.getElementById('korni-bell-dropdown')?.remove();
    const s = masterSession();
    const masterName = s && s.name && s.name !== 'Администратор' ? s.name : '';
    let rows = [];
    try {
      const filter = masterName ? `&master_name=eq.${encodeURIComponent(masterName)}` : '';
      rows = await api(`appointments?select=id,date,start_time,client_phone,master_name,status&date=gte.${today()}${filter}&order=date.asc&order=start_time.asc&limit=20`);
    } catch {
      try {
        rows = JSON.parse(localStorage.getItem('korni_local_appointments') || '[]')
          .filter(a => (!masterName || a.master_name === masterName) && a.date >= today())
          .sort((a, b) => `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`))
          .slice(0, 20);
      } catch { rows = []; }
    }
    rows = rows.filter(a => (a.status || 'Подтверждена') !== 'Отменена');
    const rect = btn.getBoundingClientRect();
    const dd = document.createElement('div');
    dd.id = 'korni-bell-dropdown';
    dd.style.cssText = `position:fixed;z-index:999999;top:${Math.max(68, rect.bottom + 8)}px;right:${Math.max(10, window.innerWidth - rect.right)}px;width:min(340px,calc(100vw - 20px));max-height:70vh;overflow:auto;background:#18181b;border:1px solid #3f3f46;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.65);color:#f4e8d3;font-family:Montserrat,Arial,sans-serif;padding:10px`;
    dd.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px"><b>Новые записи</b><button style="background:#27272a;color:#fff;border:0;border-radius:10px;width:32px;height:32px;font-size:20px;cursor:pointer">×</button></div>${
      rows.length ? rows.map(a => `<div style="display:grid;grid-template-columns:94px 56px 1fr;gap:8px;align-items:center;padding:9px 6px;border-top:1px solid #27272a;font-size:13px"><span style="color:#f59e0b;font-weight:800">${a.date || ''}</span><span>${(a.start_time || '').slice(0,5)}</span><span style="text-align:right;color:#fff">${a.client_phone || '—'}</span></div>`).join('') : '<div style="padding:18px 8px;color:#a1a1aa;text-align:center">Активных записей нет</div>'
    }`;
    dd.querySelector('button').onclick = () => dd.remove();
    document.body.appendChild(dd);
    setTimeout(() => {
      const close = e => { if (!dd.contains(e.target) && e.target !== btn) { dd.remove(); document.removeEventListener('click', close, true); } };
      document.addEventListener('click', close, true);
    }, 0);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(showPublicEventPopup, 1200);
    setInterval(() => { mountAdminButtons(); hideAdminBell(); }, 1500);
  });
})();
