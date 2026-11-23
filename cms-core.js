// @ts-nocheck
/* eslint-disable */
const STORAGE_KEY = 'hamz_modular_cms_v7';
const ADMIN_AUTH_KEY = 'hamz_admin_session_persist';

let appData = {
  adminCreds: {
    username: 'admin',
    password: '123',
    avatar: ''
  },
  texts: {},
  theme: {
    accent: '#00e5ff',
    bg: '#080c14',
    card: '#131a28',
    text: '#f1f5f9',
    bgImage: '',
    bgOpacity: 90,
    bgBlur: 0,
    fontStyle: 'sans',
    cardRadius: 14,
    showGrid: true
  },
  pages: [
    { id: 'beranda', title: 'Beranda', subs: [{ id: 'sec-hero', title: 'Utama' }, { id: 'sec-stats', title: 'Sorotan Bidang' }] },
    { id: 'tentang', title: 'Tentang', subs: [{ id: 'sub-profil', title: 'Profil Singkat' }, { id: 'sub-keahlian', title: 'Bidang Keahlian' }] },
    { id: 'proyek', title: 'Proyek & Tugas', subs: [{ id: 'sub-proyek-utama', title: 'Proyek Pilihan' }, { id: 'sub-tugas-praktikum', title: 'Arsip Tugas' }] },
    { id: 'kontak', title: 'Kontak', subs: [{ id: 'sub-kontak-form', title: 'Form Pesan' }] }
  ],
  topbarLinks: [],
  elementStyles: {},
  photoFrames: {},
  hiddenBlocks: [],
  mediaCards: [
    {
      id: 'mc-default-1',
      kind: 'media',
      template: 'bento',
      group: 'proyek',
      badge: 'IoT / ESP32',
      title: 'Kontrol Suhu Otomatis',
      desc: 'Simulasi sistem pengendali suhu ruangan penetas berbasis ESP32 dengan monitoring jarak jauh.',
      mediaType: 'none',
      mediaUrl: '',
      fileName: '',
      linkUrl: '',
      linkLabel: 'Buka Proyek'
    },
    {
      id: 'mc-default-2',
      kind: 'media',
      template: 'fullbleed',
      group: 'proyek',
      badge: 'Hardware PC',
      title: 'Simulasi Rakit PC Custom',
      desc: 'Perancangan konfigurasi PC Office, Gaming, dan Desain beserta estimasi daya komponen.',
      mediaType: 'none',
      mediaUrl: '',
      fileName: '',
      linkUrl: '',
      linkLabel: 'Detail Spesifikasi'
    },
    {
      id: 'mc-default-3',
      kind: 'media',
      template: 'terminal',
      group: 'tugas',
      badge: 'TJKT, Networking, Praktikum',
      title: 'Laporan Praktikum Jaringan & Mikrokontroler',
      desc: 'Dokumentasi tugas konfigurasi topologi jaringan lokal dan pemrograman dasar mikrokontroler.',
      mediaType: 'none',
      mediaUrl: '',
      fileName: 'laporan_tjkt.pdf',
      linkUrl: '',
      linkLabel: 'Lihat Tugas'
    }
  ],
  dynamicSubs: []
};

const THEME_PRESETS = {
  cyber: { accent: '#00e5ff', bg: '#080c14', card: '#131a28', text: '#f1f5f9' },
  matrix: { accent: '#10b981', bg: '#050e0a', card: '#0d1f17', text: '#ecfdf5' },
  sunset: { accent: '#f59e0b', bg: '#120b07', card: '#21150e', text: '#fffbeb' },
  light: { accent: '#2563eb', bg: '#f1f5f9', card: '#ffffff', text: '#0f172a' }
};

const FONT_STACKS = {
  sans: "'Segoe UI', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  editorial: "Georgia, 'Times New Roman', serif"
};

let undoStack = [];
let redoStack = [];
let isAdminLoggedIn = localStorage.getItem(ADMIN_AUTH_KEY) === '1';
let isEditorActive = isAdminLoggedIn;
let isSelectorMode = false;
let currentPageId = 'beranda';
let editingMediaCardId = '';
let selectedTargetId = '';

function saveAdminSession() {
  localStorage.setItem(ADMIN_AUTH_KEY, '1');
}

function clearAdminSession() {
  localStorage.removeItem(ADMIN_AUTH_KEY);
}

function updateHistoryButtons() {
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');
  if (undoBtn) undoBtn.disabled = undoStack.length === 0;
  if (redoBtn) redoBtn.disabled = redoStack.length === 0;
}

function recordSnapshot() {
  undoStack.push(JSON.stringify(appData));
  if (undoStack.length > 25) undoStack.shift();
  redoStack = [];
  updateHistoryButtons();
}

function applyTheme() {
  const root = document.documentElement;
  root.style.setProperty('--accent', appData.theme.accent);
  root.style.setProperty('--bg-main', appData.theme.bg);
  root.style.setProperty('--bg-card', appData.theme.card);
  root.style.setProperty('--text-main', appData.theme.text);
  root.style.setProperty('--font-stack', FONT_STACKS[appData.theme.fontStyle] || FONT_STACKS.sans);
  root.style.setProperty('--card-radius', (appData.theme.cardRadius ?? 14) + 'px');

  const op = (appData.theme.bgOpacity ?? 90) / 100;
  const blur = (appData.theme.bgBlur ?? 0) + 'px';
  root.style.setProperty('--bg-img-opacity', String(op));
  root.style.setProperty('--bg-img-blur', blur);

  const bgLow = appData.theme.bg.toLowerCase();
  const isLight = bgLow === '#f1f5f9' || bgLow === '#ffffff';
  root.style.setProperty('--text-muted', isLight ? '#475569' : '#94a3b8');
  root.style.setProperty('--border', isLight ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.11)');

  const bgLayer = document.getElementById('custom-bg-layer');
  const hasBg = Boolean(appData.theme.bgImage);
  document.body.classList.toggle('has-custom-bg', hasBg);
  if (bgLayer) {
    bgLayer.style.backgroundImage = hasBg ? 'url("' + appData.theme.bgImage + '")' : 'none';
  }

  const gridLayer = document.querySelector('.cyber-grid-bg');
  if (gridLayer) gridLayer.classList.toggle('hidden', hasBg || appData.theme.showGrid === false);
}

function getYouTubeEmbed(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  return match ? 'https://www.youtube.com/embed/' + match[1] : null;
}

function openLightbox(kind, src, caption) {
  const modal = document.getElementById('lightbox-modal');
  const stage = document.getElementById('lightbox-stage');
  const capEl = document.getElementById('lightbox-caption');
  const dlEl = document.getElementById('lightbox-download');
  if (!modal || !stage) return;

  stage.innerHTML = '';
  if (kind === 'image') {
    const img = document.createElement('img');
    img.src = src;
    img.alt = caption;
    stage.appendChild(img);
  } else {
    const frame = document.createElement('iframe');
    frame.src = src;
    stage.appendChild(frame);
  }
  if (capEl) capEl.textContent = caption;
  if (dlEl) {
    dlEl.href = src;
    dlEl.download = caption || 'file';
  }
  modal.classList.remove('hidden');
}

window.HAMZ_CORE = { STORAGE_KEY, ADMIN_AUTH_KEY, THEME_PRESETS, recordSnapshot, applyTheme, getYouTubeEmbed, openLightbox };
