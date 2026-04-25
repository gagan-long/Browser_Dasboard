/* ── script.js ─────────────────────────────────────────────────────────────
   Browser Dashboard – main logic
   Features: animated background, live clock/date, greeting, search engine
   switcher, local-storage quick links, local-storage to-do list, weather.
────────────────────────────────────────────────────────────────────────── */

/* ══════════════════════════════════════════════════════════
   1. PARTICLE BACKGROUND
══════════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.floor((W * H) / 14000);
    particles = Array.from({ length: count }, () => ({
      x:   Math.random() * W,
      y:   Math.random() * H,
      r:   Math.random() * 1.6 + 0.4,
      dx:  (Math.random() - 0.5) * 0.35,
      dy:  (Math.random() - 0.5) * 0.35,
      a:   Math.random() * 0.5 + 0.15,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); createParticles(); });
  resize();
  createParticles();
  draw();
})();

/* ══════════════════════════════════════════════════════════
   2. CLOCK & DATE
══════════════════════════════════════════════════════════ */
(function initClock() {
  const clockEl   = document.getElementById('clock');
  const dateEl    = document.getElementById('date-display');
  const greetEl   = document.getElementById('greeting');

  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

  function pad(n) { return String(n).padStart(2, '0'); }

  function greeting(h) {
    if (h < 5)  return '🌙 Good night';
    if (h < 12) return '☀️ Good morning';
    if (h < 17) return '🌤 Good afternoon';
    if (h < 21) return '🌆 Good evening';
    return '🌙 Good night';
  }

  function tick() {
    const now  = new Date();
    const h    = now.getHours();
    const m    = now.getMinutes();
    const s    = now.getSeconds();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12  = h % 12 || 12;

    clockEl.textContent  = `${pad(h12)}:${pad(m)}:${pad(s)} ${ampm}`;
    dateEl.textContent   = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    greetEl.textContent  = greeting(h);
  }

  tick();
  setInterval(tick, 1000);
})();

/* ══════════════════════════════════════════════════════════
   3. SEARCH ENGINE SWITCHER
══════════════════════════════════════════════════════════ */
(function initSearch() {
  const form        = document.getElementById('search-form');
  const input       = document.getElementById('search-input');
  const toggle      = document.getElementById('engine-toggle');
  const menu        = document.getElementById('engine-menu');
  const engineIcon  = document.getElementById('engine-icon');

  const ENGINES = [
    { name: 'google',     url: 'https://www.google.com/search?q=',                icon: 'https://www.google.com/favicon.ico' },
    { name: 'bing',       url: 'https://www.bing.com/search?q=',                  icon: 'https://www.bing.com/favicon.ico' },
    { name: 'duckduckgo', url: 'https://duckduckgo.com/?q=',                      icon: 'https://duckduckgo.com/favicon.ico' },
    { name: 'youtube',    url: 'https://www.youtube.com/results?search_query=',   icon: 'https://www.youtube.com/favicon.ico' },
  ];

  let current = ENGINES.find(e => e.name === (localStorage.getItem('searchEngine') || 'google')) || ENGINES[0];

  function applyEngine(e) {
    current           = e;
    engineIcon.src    = e.icon;
    engineIcon.alt    = e.name;
    localStorage.setItem('searchEngine', e.name);
  }

  applyEngine(current);

  toggle.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.toggle('hidden');
  });

  document.addEventListener('click', () => menu.classList.add('hidden'));

  menu.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const eng = ENGINES.find(e => e.name === btn.dataset.engine);
      if (eng) applyEngine(eng);
      menu.classList.add('hidden');
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;

    // If user typed a URL, navigate directly (only http/https allowed)
    if (/^https?:\/\//i.test(q) || /^[\w-]+\.[\w]{2,}(\/|$)/i.test(q)) {
      try {
        const parsed = new URL(/^https?:\/\//i.test(q) ? q : 'https://' + q);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          window.location.assign(parsed.href);
          return;
        }
      } catch { /* fall through to search */ }
    }
    window.location.assign(current.url + encodeURIComponent(q));
  });
})();

/* ══════════════════════════════════════════════════════════
   4. QUICK LINKS
══════════════════════════════════════════════════════════ */
(function initQuickLinks() {
  const container   = document.getElementById('quick-links');
  const addBtn      = document.getElementById('add-link-btn');
  const modal       = document.getElementById('link-modal');
  const nameInput   = document.getElementById('modal-name');
  const urlInput    = document.getElementById('modal-url');
  const saveBtn     = document.getElementById('modal-save');
  const cancelBtn   = document.getElementById('modal-cancel');

  const DEFAULTS = [
    { name: 'Google',    url: 'https://www.google.com',    icon: 'https://www.google.com/favicon.ico' },
    { name: 'YouTube',   url: 'https://www.youtube.com',   icon: 'https://www.youtube.com/favicon.ico' },
    { name: 'GitHub',    url: 'https://www.github.com',    icon: 'https://github.com/favicon.ico' },
    { name: 'Reddit',    url: 'https://www.reddit.com',    icon: 'https://www.reddit.com/favicon.ico' },
    { name: 'Twitter/X', url: 'https://www.x.com',         icon: 'https://abs.twimg.com/favicons/twitter.3.ico' },
    { name: 'Gmail',     url: 'https://mail.google.com',   icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico' },
  ];

  function load() {
    const saved = localStorage.getItem('quickLinks');
    return saved ? JSON.parse(saved) : DEFAULTS;
  }

  function save(links) {
    localStorage.setItem('quickLinks', JSON.stringify(links));
  }

  function faviconUrl(url) {
    try {
      const origin = new URL(url).origin;
      return `https://www.google.com/s2/favicons?sz=64&domain_url=${origin}`;
    } catch {
      return '';
    }
  }

  /** Return url only when protocol is http or https, else '#'. */
  function sanitizeUrl(url) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.href;
      }
    } catch { /* fall through */ }
    return '#';
  }

  function render() {
    const links = load();
    container.innerHTML = '';
    links.forEach((link, idx) => {
      const a = document.createElement('a');
      a.className   = 'quick-link-item';
      a.href        = sanitizeUrl(link.url);
      a.target      = '_blank';
      a.rel         = 'noopener noreferrer';

      const wrap = document.createElement('div');
      wrap.className = 'link-icon-wrap';

      const img = document.createElement('img');
      img.src   = sanitizeUrl(link.icon || faviconUrl(link.url));
      img.alt   = link.name;
      img.onerror = () => { img.style.display = 'none'; wrap.textContent = link.name[0].toUpperCase(); };

      wrap.appendChild(img);

      const label = document.createElement('span');
      label.className   = 'link-label';
      label.textContent = link.name;

      const del = document.createElement('button');
      del.className   = 'link-delete';
      del.textContent = '×';
      del.title       = 'Remove';
      del.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const updated = load().filter((_, i) => i !== idx);
        save(updated);
        render();
      });

      a.appendChild(wrap);
      a.appendChild(label);
      a.appendChild(del);
      container.appendChild(a);
    });
  }

  addBtn.addEventListener('click', () => {
    nameInput.value = '';
    urlInput.value  = '';
    modal.classList.remove('hidden');
    nameInput.focus();
  });

  saveBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    let   url  = urlInput.value.trim();
    if (!name || !url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    const safeUrl = sanitizeUrl(url);
    if (safeUrl === '#') return;
    const links = load();
    links.push({ name, url: safeUrl, icon: faviconUrl(safeUrl) });
    save(links);
    render();
    modal.classList.add('hidden');
  });

  cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

  render();
})();

/* ══════════════════════════════════════════════════════════
   5. TO-DO LIST
══════════════════════════════════════════════════════════ */
(function initTodo() {
  const form      = document.getElementById('todo-form');
  const input     = document.getElementById('todo-input');
  const list      = document.getElementById('todo-list');

  function load() {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  }

  function save(todos) {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  function render() {
    const todos = load();
    list.innerHTML = '';
    todos.forEach((todo, idx) => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (todo.done ? ' done' : '');

      const cb = document.createElement('input');
      cb.type      = 'checkbox';
      cb.className = 'todo-check';
      cb.checked   = todo.done;
      cb.addEventListener('change', () => {
        const t   = load();
        t[idx].done = cb.checked;
        save(t);
        render();
      });

      const span = document.createElement('span');
      span.className   = 'todo-text';
      span.textContent = todo.text;

      const del = document.createElement('button');
      del.className   = 'todo-remove';
      del.textContent = '✕';
      del.title       = 'Delete';
      del.addEventListener('click', () => {
        const t = load().filter((_, i) => i !== idx);
        save(t);
        render();
      });

      li.appendChild(cb);
      li.appendChild(span);
      li.appendChild(del);
      list.appendChild(li);
    });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const todos = load();
    todos.push({ text, done: false });
    save(todos);
    render();
    input.value = '';
  });

  render();
})();

/* ══════════════════════════════════════════════════════════
   6. WEATHER (OpenWeatherMap – requires free API key)
      Falls back gracefully when no key is configured.
══════════════════════════════════════════════════════════ */
(function initWeather() {
  const weatherText = document.getElementById('weather-text');

  // To enable live weather, get a free key at https://openweathermap.org/api
  // then replace the empty string below.  NEVER commit your API key to source control.
  const API_KEY = ''; // <-- paste your key here (not committed)

  if (!API_KEY) {
    weatherText.textContent = 'Add API key for weather';
    return;
  }

  function fetchWeather(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        const temp  = Math.round(data.main.temp);
        const desc  = data.weather[0].description;
        const city  = data.name;
        weatherText.textContent = `${city}: ${temp}°C, ${desc}`;
      })
      .catch(() => { weatherText.textContent = 'Weather unavailable'; });
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      ()  => { weatherText.textContent = 'Location denied'; }
    );
  } else {
    weatherText.textContent = 'Geolocation unsupported';
  }
})();
