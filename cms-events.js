// @ts-nocheck
/* eslint-disable */
function openMediaCardModal(existing = null) {
  const modal = document.getElementById('media-card-modal');
  const heading = document.getElementById('media-modal-heading');
  const kindSel = document.getElementById('mc-kind');
  const tplSel = document.getElementById('mc-template');
  const grpSel = document.getElementById('mc-target-group');
  const badgeIn = document.getElementById('mc-badge');
  const titleIn = document.getElementById('mc-title');
  const descIn = document.getElementById('mc-desc');
  const typeSel = document.getElementById('mc-media-type');
  const urlIn = document.getElementById('mc-media-url');
  const fileIn = document.getElementById('mc-media-file');
  const linkUrlIn = document.getElementById('mc-link-url');
  const linkLblIn = document.getElementById('mc-link-label');

  if (fileIn) fileIn.value = '';

  if (existing) {
    editingMediaCardId = existing.id;
    if (heading) heading.textContent = '✏️ Edit Kartu Teks / Media';
    if (kindSel) kindSel.value = existing.kind || 'media';
    if (tplSel) tplSel.value = existing.template || 'fullbleed';
    if (grpSel) grpSel.value = existing.group === 'proyek' || existing.group === 'tugas' ? existing.group : 'active-page';
    if (badgeIn) badgeIn.value = existing.badge;
    if (titleIn) titleIn.value = existing.title;
    if (descIn) descIn.value = existing.desc;
    if (typeSel) typeSel.value = existing.mediaType;
    if (urlIn) urlIn.value = existing.mediaUrl;
    if (linkUrlIn) linkUrlIn.value = existing.linkUrl;
    if (linkLblIn) linkLblIn.value = existing.linkLabel;
  } else {
    editingMediaCardId = '';
    if (heading) heading.textContent = '🖼️ Tambah Kartu Teks & Media';
    if (kindSel) kindSel.value = 'media';
    if (tplSel) tplSel.value = 'bento';
    if (grpSel) grpSel.value = currentPageId === 'proyek' ? 'proyek' : 'active-page';
    if (badgeIn) badgeIn.value = '';
    if (titleIn) titleIn.value = '';
    if (descIn) descIn.value = '';
    if (typeSel) typeSel.value = 'none';
    if (urlIn) urlIn.value = '';
    if (linkUrlIn) linkUrlIn.value = '';
    if (linkLblIn) linkLblIn.value = '';
  }

  document.getElementById('mc-media-inputs')?.classList.toggle('hidden', (typeSel?.value || 'none') === 'none');
  modal?.classList.remove('hidden');
}

document.getElementById('mc-kind')?.addEventListener('change', (e) => {
  const isText = e.target.value === 'text';
  const tplSel = document.getElementById('mc-template');
  const typeSel = document.getElementById('mc-media-type');
  if (isText) {
    if (tplSel) tplSel.value = 'editorial';
    if (typeSel) {
      typeSel.value = 'none';
      document.getElementById('mc-media-inputs')?.classList.add('hidden');
    }
  } else {
    if (tplSel) tplSel.value = 'bento';
  }
});

function hideElementInspector() {
  document.getElementById('element-inspector')?.classList.add('hidden');
  document.querySelectorAll('.inspected-selected').forEach(x => x.classList.remove('inspected-selected'));
}

function selectElementForInspector(el) {
  if (!el || !el.id) return;
  selectedTargetId = el.id;

  document.querySelectorAll('.inspected-selected').forEach(x => x.classList.remove('inspected-selected'));
  el.classList.add('inspected-selected');

  const st = appData.elementStyles[selectedTargetId] || { width: 100, opacity: 100 };
  const wRange = document.getElementById('insp-width-range');
  const oRange = document.getElementById('insp-opacity-range');
  const wLbl = document.getElementById('insp-width-lbl');
  const oLbl = document.getElementById('insp-opacity-lbl');

  if (wRange) wRange.value = st.width ?? 100;
  if (oRange) oRange.value = st.opacity ?? 100;
  if (wLbl) wLbl.textContent = (st.width ?? 100) + '%';
  if (oLbl) oLbl.textContent = (st.opacity ?? 100) + '%';

  document.getElementById('element-inspector')?.classList.remove('hidden');
}

// LOGIN, AVATAR & LOGOUT ADMIN
function performAdminLogout() {
  isAdminLoggedIn = false;
  isEditorActive = false;
  clearAdminSession();
  renderNavigation();
  syncEditorModeAttributes();
}

document.getElementById('close-admin-login')?.addEventListener('click', () => {
  document.getElementById('admin-login-modal')?.classList.add('hidden');
});

document.getElementById('cancel-admin-login-btn')?.addEventListener('click', () => {
  document.getElementById('admin-login-modal')?.classList.add('hidden');
});

document.getElementById('submit-admin-login-btn')?.addEventListener('click', () => {
  const u = document.getElementById('admin-user-input')?.value.trim() || '';
  const p = document.getElementById('admin-pass-input')?.value || '';
  const validU = appData.adminCreds?.username || 'admin';
  const validP = appData.adminCreds?.password || '123';

  if (u === validU && p === validP) {
    isAdminLoggedIn = true;
    isEditorActive = true;
    saveAdminSession();
    document.getElementById('admin-login-modal')?.classList.add('hidden');
    document.getElementById('editor-panel')?.classList.remove('hidden');
    renderNavigation();
    syncEditorModeAttributes();
  } else {
    document.getElementById('admin-login-error').textContent = 'Username atau password salah!';
  }
});

document.getElementById('save-admin-avatar-btn')?.addEventListener('click', () => {
  const urlIn = document.getElementById('admin-avatar-url');
  const fileIn = document.getElementById('admin-avatar-file');

  const commitAvatar = (finalUrl) => {
    if (!finalUrl) return alert('Masukkan URL foto atau pilih gambar dari galeri.');
    recordSnapshot();
    appData.adminCreds.avatar = finalUrl;
    if (urlIn) urlIn.value = '';
    if (fileIn) fileIn.value = '';
    persistAndRender();
    alert('Foto avatar tombol Login berhasil diperbarui!');
  };

  if (fileIn?.files?.[0]) {
    const reader = new FileReader();
    reader.onload = (evt) => commitAvatar(String(evt.target?.result || ''));
    reader.readAsDataURL(fileIn.files[0]);
  } else {
    commitAvatar(urlIn?.value.trim() || '');
  }
});

document.getElementById('reset-admin-avatar-btn')?.addEventListener('click', () => {
  recordSnapshot();
  appData.adminCreds.avatar = '';
  persistAndRender();
  alert('Avatar tombol Login dikembalikan ke ikon bawaan.');
});

document.getElementById('save-admin-pass-btn')?.addEventListener('click', () => {
  const newPass = document.getElementById('new-admin-pass')?.value.trim() || '';
  if (newPass.length < 3) return alert('Password minimal 3 karakter.');
  appData.adminCreds.password = newPass;
  document.getElementById('new-admin-pass').value = '';
  persistAndRender();
  alert('Password admin berhasil diperbarui!');
});

document.getElementById('logout-admin-btn')?.addEventListener('click', performAdminLogout);
document.getElementById('preview-logout-btn')?.addEventListener('click', performAdminLogout);

// Scroll Progress Bar & ScrollSpy Pill Bar
window.addEventListener('scroll', () => {
  const bar = document.getElementById('scroll-progress-bar');
  if (bar) {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0;
    bar.style.width = pct + '%';
  }

  const pills = document.querySelectorAll('.subnav-pill-btn');
  if (pills.length > 0) {
    let activeSubId = pills[0].dataset.targetSub;
    pills.forEach(pill => {
      const target = document.getElementById(pill.dataset.targetSub);
      if (target && target.getBoundingClientRect().top <= 165) {
        activeSubId = pill.dataset.targetSub;
      }
    });
    pills.forEach(pill => {
      const isMatch = pill.dataset.targetSub === activeSubId;
      if (isMatch && !pill.classList.contains('active')) {
        pill.classList.add('active');
        pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } else if (!isMatch) {
        pill.classList.remove('active');
      }
    });
  }
});

// Klik Global: Navigasi, Hapus Blok & Pilih Komponen
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-group')) {
    document.querySelectorAll('.nav-group.open').forEach(g => g.classList.remove('open'));
  }

  const pageTrigger = e.target.closest('[data-page-link]');
  if (pageTrigger && pageTrigger.dataset.pageLink && !isEditorActive) {
    e.preventDefault();
    switchPage(pageTrigger.dataset.pageLink, true);
  }

  const rmBtn = e.target.closest('[data-remove-target]');
  if (rmBtn && rmBtn.dataset.removeTarget && isEditorActive) {
    const id = rmBtn.dataset.removeTarget;
    recordSnapshot();
    const isDynSub = appData.dynamicSubs.some(s => s.id === id);
    if (isDynSub) {
      appData.dynamicSubs = appData.dynamicSubs.filter(s => s.id !== id);
      appData.pages.forEach(p => { p.subs = p.subs.filter(s => s.id !== id); });
    } else if (!appData.hiddenBlocks.includes(id)) {
      appData.hiddenBlocks.push(id);
    }
    persistAndRender();
    return;
  }

  if (isEditorActive && e.target.closest('.editable, .nav-page-btn')) {
    hideElementInspector();
    return;
  }

  if (isEditorActive && !e.target.closest('#editor-panel, #editor-dock, #element-inspector, #media-card-modal, #photo-frame-modal, #admin-login-modal, button, a, input, select, textarea')) {
    const targetBox = e.target.closest('.glass-card, .text-plain-box, .hero, .sub-block, #main-topbar');
    if (targetBox && targetBox.id) {
      selectElementForInspector(targetBox);
    }
  }
});

document.addEventListener('focusin', (e) => {
  if (isEditorActive && e.target.closest('.editable, .nav-page-btn')) {
    hideElementInspector();
    recordSnapshot();
  }
});

document.addEventListener('input', (e) => {
  if (!isEditorActive) return;
  const el = e.target.closest('.editable');
  if (el) {
    hideElementInspector();
    if (el.dataset.key) {
      appData.texts[el.dataset.key] = el.innerHTML;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    }
  }
});

// Tambah Link Menu Baru di Top Bar
document.getElementById('topbar-add-link-btn')?.addEventListener('click', () => {
  const label = prompt('Nama tombol menu baru di Top Bar (misal: YouTube / GitHub):');
  if (!label || !label.trim()) return;
  const url = prompt('Masukkan URL tujuan (misal: https://github.com/hamztechlab):', 'https://');
  if (!url || !url.trim()) return;

  recordSnapshot();
  appData.topbarLinks = appData.topbarLinks || [];
  appData.topbarLinks.push({ id: 'tb-' + Date.now(), label: label.trim(), url: url.trim() });
  persistAndRender();
});

// Kontrol Inspektor: Lebar, Transparansi, Toggle Overlay Kartu & Reset
document.getElementById('close-inspector-btn')?.addEventListener('click', hideElementInspector);

document.getElementById('insp-width-range')?.addEventListener('input', (e) => {
  if (!selectedTargetId) return;
  const val = Number(e.target.value);
  document.getElementById('insp-width-lbl').textContent = val + '%';
  appData.elementStyles[selectedTargetId] = { ...(appData.elementStyles[selectedTargetId] || {}), width: val };
  applyElementStyles();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
});

document.getElementById('insp-opacity-range')?.addEventListener('input', (e) => {
  if (!selectedTargetId) return;
  const val = Number(e.target.value);
  document.getElementById('insp-opacity-lbl').textContent = val + '%';
  appData.elementStyles[selectedTargetId] = { ...(appData.elementStyles[selectedTargetId] || {}), opacity: val };
  applyElementStyles();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
});

document.getElementById('toggle-el-overlay-btn')?.addEventListener('click', () => {
  if (!selectedTargetId) return;
  const el = document.getElementById(selectedTargetId);
  if (!el) return;
  recordSnapshot();
  const currentlyHasOverlay = el.classList.contains('glass-card');
  appData.elementStyles[selectedTargetId] = {
    ...(appData.elementStyles[selectedTargetId] || {}),
    noOverlay: currentlyHasOverlay
  };
  persistAndRender();
});

document.getElementById('reset-el-style-btn')?.addEventListener('click', () => {
  if (!selectedTargetId) return;
  recordSnapshot();
  delete appData.elementStyles[selectedTargetId];
  document.getElementById('insp-width-range').value = 100;
  document.getElementById('insp-opacity-range').value = 100;
  document.getElementById('insp-width-lbl').textContent = '100%';
  document.getElementById('insp-opacity-lbl').textContent = '100%';
  persistAndRender();
});

// Modal Bingkai Foto
document.getElementById('open-frame-modal-btn')?.addEventListener('click', () => {
  if (!selectedTargetId) return alert('Klik salah satu kartu atau bagian halaman terlebih dahulu.');
  const existing = appData.photoFrames?.[selectedTargetId];
  document.getElementById('pf-shape').value = existing?.shape || 'circle';
  document.getElementById('pf-img-url').value = existing?.url || '';
  document.getElementById('pf-img-file').value = '';
  document.getElementById('pf-size-range').value = existing?.size || 170;
  document.getElementById('pf-size-lbl').textContent = (existing?.size || 170) + 'px';
  document.getElementById('pf-caption').value = existing?.caption || '';
  document.getElementById('photo-frame-modal')?.classList.remove('hidden');
});

document.getElementById('pf-size-range')?.addEventListener('input', (e) => {
  document.getElementById('pf-size-lbl').textContent = e.target.value + 'px';
});

document.getElementById('close-frame-modal')?.addEventListener('click', () => {
  document.getElementById('photo-frame-modal')?.classList.add('hidden');
});

document.getElementById('save-frame-btn')?.addEventListener('click', () => {
  if (!selectedTargetId) return;
  const shape = document.getElementById('pf-shape')?.value || 'circle';
  const size = Number(document.getElementById('pf-size-range')?.value || 170);
  const caption = document.getElementById('pf-caption')?.value.trim() || '';
  const urlIn = document.getElementById('pf-img-url')?.value.trim() || '';
  const fileIn = document.getElementById('pf-img-file');

  const commitFrame = (finalUrl) => {
    if (!finalUrl) return alert('Masukkan URL gambar atau pilih foto dari perangkat.');
    recordSnapshot();
    appData.photoFrames = appData.photoFrames || {};
    appData.photoFrames[selectedTargetId] = { shape, size, caption, url: finalUrl };
    document.getElementById('photo-frame-modal')?.classList.add('hidden');
    persistAndRender();
  };

  if (fileIn?.files?.[0]) {
    const reader = new FileReader();
    reader.onload = (evt) => commitFrame(String(evt.target?.result || ''));
    reader.readAsDataURL(fileIn.files[0]);
  } else {
    commitFrame(urlIn);
  }
});

document.getElementById('remove-frame-btn')?.addEventListener('click', () => {
  if (!selectedTargetId) return;
  recordSnapshot();
  if (appData.photoFrames) delete appData.photoFrames[selectedTargetId];
  document.getElementById('photo-frame-modal')?.classList.add('hidden');
  persistAndRender();
});

// Toggle Menu Mobile, Panel Editor, Undo, Redo & Mode Pratinjau Pengunjung
document.getElementById('menu-toggle')?.addEventListener('click', () => {
  document.getElementById('nav-links')?.classList.toggle('active');
});

document.getElementById('toggle-editor-btn')?.addEventListener('click', () => {
  document.getElementById('editor-panel')?.classList.toggle('hidden');
});

document.getElementById('close-editor-btn')?.addEventListener('click', () => {
  document.getElementById('editor-panel')?.classList.add('hidden');
});

document.getElementById('preview-mode-btn')?.addEventListener('click', () => {
  isEditorActive = false;
  syncEditorModeAttributes();
});

document.getElementById('resume-edit-btn')?.addEventListener('click', () => {
  if (!isAdminLoggedIn) return;
  isEditorActive = true;
  syncEditorModeAttributes();
});

document.getElementById('undo-btn')?.addEventListener('click', () => {
  if (undoStack.length === 0) return;
  redoStack.push(JSON.stringify(appData));
  const prev = undoStack.pop();
  if (prev) { appData = JSON.parse(prev); persistAndRender(); }
});

document.getElementById('redo-btn')?.addEventListener('click', () => {
  if (redoStack.length === 0) return;
  undoStack.push(JSON.stringify(appData));
  const next = redoStack.pop();
  if (next) { appData = JSON.parse(next); persistAndRender(); }
});

// Ubah Warna Teks Pilihan
document.getElementById('apply-selection-color-btn')?.addEventListener('click', () => {
  const color = document.getElementById('selection-text-color')?.value || '#00e5ff';
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
    return alert('Blok / pilih sebagian teks terlebih dahulu di halaman, lalu klik Terapkan.');
  }
  const range = sel.getRangeAt(0);
  const ancestor = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
  const editableParent = ancestor?.closest('.editable');
  if (!editableParent) return alert('Pilih teks di dalam area yang dapat diedit.');

  recordSnapshot();
  const span = document.createElement('span');
  span.style.color = color;
  try {
    range.surroundContents(span);
  } catch {
    const frag = range.extractContents();
    span.appendChild(frag);
    range.insertNode(span);
  }
  sel.removeAllRanges();
  if (editableParent.dataset.key) {
    appData.texts[editableParent.dataset.key] = editableParent.innerHTML;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  }
});

// Tab Panel Editor
document.querySelectorAll('.ed-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ed-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.ed-tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    if (tab.dataset.tab) document.getElementById(tab.dataset.tab)?.classList.add('active');
  });
});

// Tambahkan Blok Teks Baru & Halaman Baru
document.getElementById('add-text-block-btn')?.addEventListener('click', () => {
  const hIn = document.getElementById('new-text-heading');
  const bIn = document.getElementById('new-text-body');
  const ovIn = document.getElementById('new-text-overlay');
  const title = hIn?.value.trim() || '';
  const body = bIn?.value.trim() || '';
  if (!title && !body) return alert('Isi judul atau paragraf teks terlebih dahulu.');

  recordSnapshot();
  const subId = 'sub-' + Date.now();
  const overlay = ovIn ? ovIn.checked : true;
  appData.dynamicSubs.push({ id: subId, pageId: currentPageId, title, body: body || 'Teks baru siap diedit.', overlay });
  if (title) {
    appData.pages.find(p => p.id === currentPageId)?.subs.push({ id: subId, title });
  }
  if (hIn) hIn.value = '';
  if (bIn) bIn.value = '';
  persistAndRender();
});

document.getElementById('create-page-btn')?.addEventListener('click', () => {
  const titleIn = document.getElementById('new-page-title');
  const introIn = document.getElementById('new-page-intro');
  const title = titleIn?.value.trim() || '';
  if (!title) return alert('Masukkan judul halaman baru.');

  recordSnapshot();
  const id = 'pg-' + Date.now();
  appData.pages.push({ id, title, custom: true, intro: introIn?.value.trim() || '', subs: [{ id: 'intro-' + id, title: 'Pengantar' }] });
  currentPageId = id;
  if (titleIn) titleIn.value = '';
  if (introIn) introIn.value = '';
  persistAndRender();
});

// Pop-up Kartu Teks & Media
document.getElementById('mc-media-type')?.addEventListener('change', (e) => {
  document.getElementById('mc-media-inputs')?.classList.toggle('hidden', e.target.value === 'none');
});

document.getElementById('open-media-studio-btn')?.addEventListener('click', () => openMediaCardModal(null));
document.getElementById('quick-add-media-card-btn')?.addEventListener('click', () => openMediaCardModal(null));
document.getElementById('close-media-modal')?.addEventListener('click', () => document.getElementById('media-card-modal')?.classList.add('hidden'));
document.getElementById('cancel-media-card-btn')?.addEventListener('click', () => document.getElementById('media-card-modal')?.classList.add('hidden'));

document.getElementById('save-media-card-btn')?.addEventListener('click', () => {
  const kindSel = document.getElementById('mc-kind');
  const tplSel = document.getElementById('mc-template');
  const grpSel = document.getElementById('mc-target-group');
  const badgeIn = document.getElementById('mc-badge');
  const titleIn = document.getElementById('mc-title');
  const descIn = document.getElementById('mc-desc');
  const typeSel = document.getElementById('mc-media-type');
  const urlIn = document.getElementById('mc-media-url');
  const fileIn = document.getElementById('mc-media-file');
  const linkUrlIn = document.getElementById('mc-link-url');
  const linkLblIn = document.getElementById('mc-link-label');

  const title = titleIn?.value.trim() || '';
  if (!title) return alert('Judul kartu tidak boleh kosong.');

  const rawGroup = grpSel?.value || 'proyek';
  const resolvedGroup = rawGroup === 'active-page' ? currentPageId : rawGroup;
  const mediaType = typeSel?.value || 'none';

  const commitCard = (finalUrl, fName) => {
    recordSnapshot();
    const cardData = {
      id: editingMediaCardId || 'mc-' + Date.now(),
      kind: kindSel?.value || 'media',
      template: tplSel?.value || 'bento',
      group: resolvedGroup,
      badge: badgeIn?.value.trim() || '',
      title,
      desc: descIn?.value.trim() || '',
      mediaType,
      mediaUrl: finalUrl,
      fileName: fName,
      linkUrl: linkUrlIn?.value.trim() || '',
      linkLabel: linkLblIn?.value.trim() || 'Buka Link'
    };
    if (editingMediaCardId) {
      const idx = appData.mediaCards.findIndex(c => c.id === editingMediaCardId);
      if (idx !== -1) appData.mediaCards[idx] = cardData;
    } else {
      appData.mediaCards.push(cardData);
    }
    document.getElementById('media-card-modal')?.classList.add('hidden');
    persistAndRender();
  };

  if (mediaType !== 'none' && fileIn?.files?.[0]) {
    const file = fileIn.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => commitCard(String(evt.target?.result || ''), file.name);
    reader.readAsDataURL(file);
  } else {
    commitCard(urlIn?.value.trim() || '', title);
  }
});

// Estetika: Tema, Background Jernih Tanpa Grid, Tipografi & Sudut
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.preset || 'cyber';
    if (!THEME_PRESETS[key]) return;
    recordSnapshot();
    appData.theme = { ...appData.theme, ...THEME_PRESETS[key] };
    persistAndRender();
  });
});

['pick-accent', 'pick-bg', 'pick-card', 'pick-text'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', (e) => {
    const val = e.target.value;
    if (id === 'pick-accent') appData.theme.accent = val;
    if (id === 'pick-bg') appData.theme.bg = val;
    if (id === 'pick-card') appData.theme.card = val;
    if (id === 'pick-text') appData.theme.text = val;
    applyTheme();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  });
});

document.getElementById('bg-opacity-range')?.addEventListener('input', (e) => {
  const val = Number(e.target.value);
  appData.theme.bgOpacity = val;
  document.getElementById('bg-op-lbl').textContent = val + '%';
  applyTheme();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
});

document.getElementById('bg-blur-range')?.addEventListener('input', (e) => {
  const val = Number(e.target.value);
  appData.theme.bgBlur = val;
  document.getElementById('bg-blur-lbl').textContent = val + 'px';
  applyTheme();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
});

document.getElementById('font-style-select')?.addEventListener('change', (e) => {
  recordSnapshot();
  appData.theme.fontStyle = e.target.value;
  persistAndRender();
});

document.getElementById('card-radius-range')?.addEventListener('input', (e) => {
  const val = Number(e.target.value);
  appData.theme.cardRadius = val;
  const lbl = document.getElementById('radius-val-lbl');
  if (lbl) lbl.textContent = val + 'px';
  applyTheme();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
});

document.getElementById('toggle-grid-bg')?.addEventListener('change', (e) => {
  recordSnapshot();
  appData.theme.showGrid = e.target.checked;
  persistAndRender();
});

document.getElementById('apply-bg-btn')?.addEventListener('click', () => {
  const urlIn = document.getElementById('bg-image-url');
  const fileIn = document.getElementById('bg-image-file');
  if (fileIn?.files?.[0]) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      recordSnapshot();
      appData.theme.bgImage = String(evt.target?.result || '');
      appData.theme.bgOpacity = 90;
      persistAndRender();
    };
    reader.readAsDataURL(fileIn.files[0]);
  } else if (urlIn?.value.trim()) {
    recordSnapshot();
    appData.theme.bgImage = urlIn.value.trim();
    appData.theme.bgOpacity = 90;
    persistAndRender();
  }
});

document.getElementById('clear-bg-btn')?.addEventListener('click', () => {
  recordSnapshot();
  appData.theme.bgImage = '';
  persistAndRender();
});

// Generator Kode HTML Statis Siap Deploy
document.getElementById('export-html-btn')?.addEventListener('click', async () => {
  let cssText = '';
  try {
    const res = await fetch('style.css');
    if (res.ok) cssText = await res.text();
  } catch {}

  const cloneDoc = document.documentElement.cloneNode(true);
  cloneDoc.querySelector('body')?.classList.remove('editor-active');
  cloneDoc.querySelectorAll('#editor-dock, #admin-preview-dock, #editor-panel, #element-inspector, #media-card-modal, #photo-frame-modal, #admin-login-modal, .nav-admin-login-item, .delete-section-btn, .delete-page-nav-btn, .card-editor-tools, .editor-only-inline').forEach(el => el.remove());
  cloneDoc.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));

  if (cssText) {
    cloneDoc.querySelector('link[href="style.css"]')?.remove();
    const styleTag = document.createElement('style');
    styleTag.textContent = cssText;
    cloneDoc.querySelector('head')?.appendChild(styleTag);
  }

  const finalHtml = '<!DOCTYPE html>\n' + cloneDoc.outerHTML;
  const blob = new Blob([finalHtml], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'index.html';
  a.click();
});

// Export / Import JSON & Reset
document.getElementById('export-data-btn')?.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'portofolio-data.json';
  a.click();
});

document.getElementById('import-data-btn')?.addEventListener('click', () => document.getElementById('import-file-input')?.click());
document.getElementById('import-file-input')?.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try { recordSnapshot(); appData = JSON.parse(String(evt.target?.result || '{}')); persistAndRender(); }
    catch { alert('Format JSON tidak valid.'); }
  };
  reader.readAsText(file);
});

document.getElementById('reset-data-btn')?.addEventListener('click', () => {
  if (confirm('Kembalikan seluruh website ke tampilan awal?')) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
});

// Lightbox & Form Kontak
document.getElementById('lightbox-close')?.addEventListener('click', () => {
  document.getElementById('lightbox-modal')?.classList.add('hidden');
  const stage = document.getElementById('lightbox-stage');
  if (stage) stage.innerHTML = '';
});

const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const namaIn = document.getElementById('nama');
  if (formStatus) formStatus.textContent = 'Terima kasih, ' + (namaIn?.value.trim() || 'Pengunjung') + '! Pesan Anda telah diterima.';
  contactForm.reset();
  setTimeout(() => { if (formStatus) formStatus.textContent = ''; }, 4000);
});

// Inisialisasi Awal
const savedRaw = localStorage.getItem(STORAGE_KEY);
if (savedRaw) {
  try {
    const parsed = JSON.parse(savedRaw);
    appData = {
      ...appData,
      ...parsed,
      adminCreds: { ...appData.adminCreds, ...(parsed.adminCreds || {}) },
      theme: { ...appData.theme, ...(parsed.theme || {}) }
    };
  } catch {}
}
renderAllUI();

