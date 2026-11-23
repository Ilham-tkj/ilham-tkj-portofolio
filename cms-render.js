// @ts-nocheck
/* eslint-disable */
function persistAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  renderAllUI();
  if (typeof pushDataToFirebase === 'function') {
    pushDataToFirebase();
  }
}

function renderAllUI() {
  applyTheme();
  renderNavigation();
  renderDynamicSubSections();
  renderMediaCards();
  renderPhotoFrames();
  applyElementStyles();
  applyTextEdits();
  applyHiddenBlocks();
  switchPage(currentPageId, false);
  syncEditorModeAttributes();
  updateHistoryButtons();

  const accIn = document.getElementById('pick-accent');
  const bgIn = document.getElementById('pick-bg');
  const cardIn = document.getElementById('pick-card');
  const txtIn = document.getElementById('pick-text');
  const opIn = document.getElementById('bg-opacity-range');
  const blurIn = document.getElementById('bg-blur-range');
  const fontSel = document.getElementById('font-style-select');
  const radIn = document.getElementById('card-radius-range');
  const gridChk = document.getElementById('toggle-grid-bg');

  if (accIn) accIn.value = appData.theme.accent;
  if (bgIn) bgIn.value = appData.theme.bg;
  if (cardIn) cardIn.value = appData.theme.card;
  if (txtIn) txtIn.value = appData.theme.text;
  if (opIn) {
    opIn.value = String(appData.theme.bgOpacity ?? 90);
    const opLbl = document.getElementById('bg-op-lbl');
    if (opLbl) opLbl.textContent = (appData.theme.bgOpacity ?? 90) + '%';
  }
  if (blurIn) {
    blurIn.value = String(appData.theme.bgBlur ?? 0);
    const blurLbl = document.getElementById('bg-blur-lbl');
    if (blurLbl) blurLbl.textContent = (appData.theme.bgBlur ?? 0) + 'px';
  }
  if (fontSel) fontSel.value = appData.theme.fontStyle || 'sans';
  if (radIn) {
    radIn.value = String(appData.theme.cardRadius ?? 14);
    const radLbl = document.getElementById('radius-val-lbl');
    if (radLbl) radLbl.textContent = (appData.theme.cardRadius ?? 14) + 'px';
  }
  if (gridChk) gridChk.checked = appData.theme.showGrid !== false;
}

function renderNavigation() {
  const navList = document.getElementById('nav-links');
  if (!navList) return;
  navList.innerHTML = '';

  appData.pages.forEach(page => {
    const li = document.createElement('li');
    li.className = 'nav-group';

    const row = document.createElement('div');
    row.className = 'nav-item-row';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-page-btn' + (page.id === currentPageId ? ' active' : '');
    btn.textContent = page.title;
    btn.setAttribute('contenteditable', isEditorActive && !isSelectorMode ? 'true' : 'false');

    btn.addEventListener('input', () => {
      page.title = btn.textContent?.trim() || page.title;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
      if (typeof pushDataToFirebase === 'function') pushDataToFirebase();
    });

    btn.addEventListener('click', (e) => {
      if (isEditorActive && document.activeElement === btn && e.detail > 1) return;
      switchPage(page.id, true);
      document.getElementById('nav-links')?.classList.remove('active');
    });

    row.appendChild(btn);

    if (appData.pages.length > 1) {
      const delPageBtn = document.createElement('button');
      delPageBtn.type = 'button';
      delPageBtn.className = 'delete-page-nav-btn';
      delPageBtn.textContent = '×';
      delPageBtn.title = 'Hapus Halaman';
      delPageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!confirm(`Hapus halaman "${page.title}"?`)) return;
        recordSnapshot();
        appData.pages = appData.pages.filter(p => p.id !== page.id);
        appData.dynamicSubs = appData.dynamicSubs.filter(s => s.pageId !== page.id);
        document.getElementById('page-' + page.id)?.remove();
        if (currentPageId === page.id) currentPageId = appData.pages[0].id;
        persistAndRender();
      });
      row.appendChild(delPageBtn);
    }

    li.appendChild(row);
    navList.appendChild(li);
  });

  (appData.topbarLinks || []).forEach(link => {
    const li = document.createElement('li');
    li.className = 'nav-group';
    const row = document.createElement('div');
    row.className = 'nav-item-row';

    const a = document.createElement('a');
    a.className = 'nav-custom-link';
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = link.label;
    row.appendChild(a);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'delete-page-nav-btn';
    delBtn.textContent = '×';
    delBtn.title = 'Hapus Menu';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      recordSnapshot();
      appData.topbarLinks = appData.topbarLinks.filter(x => x.id !== link.id);
      persistAndRender();
    });
    row.appendChild(delBtn);

    li.appendChild(row);
    navList.appendChild(li);
  });

  if (!isAdminLoggedIn) {
    const loginLi = document.createElement('li');
    loginLi.className = 'nav-admin-login-item';
    const loginBtn = document.createElement('button');
    loginBtn.type = 'button';
    loginBtn.className = 'nav-login-icon-btn';
    loginBtn.title = 'Login Admin Studio';
    loginBtn.setAttribute('aria-label', 'Login Admin Studio');

    const avatarSrc = appData.adminCreds?.avatar;
    if (avatarSrc) {
      loginBtn.innerHTML = `<img src="${avatarSrc}" alt="Admin">`;
    } else {
      loginBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    }

    loginBtn.addEventListener('click', () => {
      document.getElementById('nav-links')?.classList.remove('active');
      document.getElementById('admin-login-error').textContent = '';
      document.getElementById('admin-login-modal')?.classList.remove('hidden');
    });
    loginLi.appendChild(loginBtn);
    navList.appendChild(loginLi);
  }

  renderSubNavPills();
}

function renderSubNavPills() {
  const bar = document.getElementById('page-subnav-bar');
  if (!bar) return;
  const page = appData.pages.find(p => p.id === currentPageId);
  const validSubs = (page?.subs || []).filter(s => !appData.hiddenBlocks.includes(s.id));

  if (validSubs.length === 0) {
    bar.innerHTML = '';
    bar.classList.add('hidden');
    return;
  }

  bar.classList.remove('hidden');
  bar.innerHTML = '';
  validSubs.forEach((sub, idx) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'subnav-pill-btn' + (idx === 0 ? ' active' : '');
    pill.dataset.targetSub = sub.id;
    pill.textContent = sub.title;
    pill.addEventListener('click', () => {
      document.querySelectorAll('.subnav-pill-btn').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      document.getElementById(sub.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    bar.appendChild(pill);
  });
}

function switchPage(pageId, scrollToTop = true) {
  const exists = appData.pages.some(p => p.id === pageId);
  currentPageId = exists ? pageId : (appData.pages[0]?.id || 'beranda');

  document.querySelectorAll('.page-view').forEach(sec => {
    sec.classList.toggle('active', sec.dataset.pageId === currentPageId);
  });

  document.querySelectorAll('.nav-page-btn').forEach((btn, idx) => {
    const pg = appData.pages[idx];
    if (pg) btn.classList.toggle('active', pg.id === currentPageId);
  });

  renderSubNavPills();
  applyPageHeights();
  if (scrollToTop) window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderDynamicSubSections() {
  const host = document.getElementById('pages-host');
  if (!host) return;

  appData.pages.forEach(page => {
    if (page.custom && !document.getElementById('page-' + page.id)) {
      const sec = document.createElement('section');
      sec.className = 'page-view';
      sec.id = 'page-' + page.id;
      sec.dataset.pageId = page.id;
      sec.innerHTML = `
        <div class="sub-block" id="intro-${page.id}">
          <h2 class="section-title editable" data-key="pg-title-${page.id}">${page.title}</h2>
          <div class="glass-card" id="card-intro-${page.id}">
            <p class="editable" data-key="pg-intro-${page.id}">${page.intro || 'Klik teks ini di mode editor untuk mulai mengisi konten halaman.'}</p>
          </div>
        </div>
        <div class="page-dynamic-area" data-page-area="${page.id}"></div>
      `;
      host.appendChild(sec);
    }
  });

  document.querySelectorAll('.page-dynamic-area').forEach(area => { area.innerHTML = ''; });

  appData.dynamicSubs.forEach(sub => {
    const area = document.querySelector(`.page-dynamic-area[data-page-area="${sub.pageId}"]`);
    if (!area) return;

    const useOverlay = sub.overlay !== false;
    const block = document.createElement('div');
    block.className = 'sub-block';
    block.id = sub.id;

    const titleHtml = sub.title
      ? `<h2 class="section-title editable" data-key="sub-t-${sub.id}">${sub.title}</h2>`
      : '';

    block.innerHTML = `
      <button type="button" class="delete-section-btn" data-remove-target="${sub.id}">🗑️ Hapus</button>
      ${titleHtml}
      <div class="${useOverlay ? 'glass-card float-hover' : 'text-plain-box'}" id="card-${sub.id}">
        <p class="editable" data-key="sub-b-${sub.id}">${sub.body}</p>
      </div>
    `;
    area.appendChild(block);
  });
}

function renderMediaCards() {
  const proyekGrid = document.getElementById('media-cards-proyek');
  const tugasGrid = document.getElementById('media-cards-tugas');
  if (proyekGrid) proyekGrid.innerHTML = '';
  if (tugasGrid) tugasGrid.innerHTML = '';

  appData.mediaCards.forEach(card => {
    let targetContainer = proyekGrid;
    if (card.group === 'tugas') {
      targetContainer = tugasGrid;
    } else if (card.group !== 'proyek') {
      const pageArea = document.querySelector(`.page-dynamic-area[data-page-area="${card.group}"]`);
      if (pageArea) {
        let customGrid = pageArea.querySelector('.custom-page-media-grid');
        if (!customGrid) {
          customGrid = document.createElement('div');
          customGrid.className = 'grid-cards custom-page-media-grid';
          customGrid.style.marginTop = '1.2rem';
          pageArea.appendChild(customGrid);
        }
        targetContainer = customGrid;
      }
    }
    if (!targetContainer) return;

    const tpl = card.template || 'fullbleed';
    const el = document.createElement('article');
    el.className = `glass-card media-card tpl-${tpl}`;
    el.id = card.id;

    let mediaHtml = '';
    if (card.mediaType === 'image' && card.mediaUrl) {
      mediaHtml = `<div class="media-preview-box" data-lightbox="image" data-src="${card.mediaUrl}" data-cap="${card.title}"><img src="${card.mediaUrl}" alt="${card.title}"></div>`;
    } else if (card.mediaType === 'video' && card.mediaUrl) {
      const yt = getYouTubeEmbed(card.mediaUrl);
      mediaHtml = yt
        ? `<div class="media-preview-box"><iframe src="${yt}" allowfullscreen></iframe></div>`
        : `<div class="media-preview-box"><video src="${card.mediaUrl}" controls></video></div>`;
    } else if (card.mediaType === 'file' && card.mediaUrl) {
      const isPdf = card.mediaUrl.startsWith('data:application/pdf') || card.mediaUrl.toLowerCase().endsWith('.pdf');
      const viewBtn = isPdf
        ? `<button type="button" class="btn primary sm" data-lightbox="pdf" data-src="${card.mediaUrl}" data-cap="${card.fileName || card.title}">👁️ Lihat PDF</button>`
        : '';
      mediaHtml = `<div class="file-chip"><span>📄 ${card.fileName || 'Dokumen Tugas'}</span><div>${viewBtn} <a href="${card.mediaUrl}" download="${card.fileName || 'tugas'}" class="btn secondary sm">⬇️ Unduh</a></div></div>`;
    }

    const tagsArray = (card.badge || '').split(',').map(t => t.trim()).filter(Boolean);
    const pillsHtml = tagsArray.length > 0
      ? `<div class="card-pills-row">${tagsArray.map(t => `<span class="tech-pill">${t}</span>`).join('')}</div>`
      : '';

    const linkHtml = card.linkUrl
      ? `<div class="card-footer-action"><a href="${card.linkUrl}" target="_blank" rel="noopener noreferrer" class="btn secondary sm">${card.linkLabel || 'Buka Link'} ↗</a></div>`
      : '';

    const toolsHtml = `
      <div class="card-editor-tools">
        <button type="button" class="btn secondary sm" data-edit-mc="${card.id}">✏️ Edit</button>
        <button type="button" class="btn danger sm" data-del-mc="${card.id}">🗑️</button>
      </div>
    `;

    if (tpl === 'terminal') {
      el.innerHTML = `
        <div class="terminal-header">
          <div class="term-dots"><span></span><span></span><span></span></div>
          <span class="term-filename">${card.fileName || 'task_log.sh'}</span>
        </div>
        ${mediaHtml}
        <div class="media-card-body">
          <h3><span class="term-prompt">&gt;_</span> ${card.title}</h3>
          <p>${card.desc}</p>
          ${pillsHtml}
          ${linkHtml}
          ${toolsHtml}
        </div>
      `;
    } else if (tpl === 'quote') {
      el.innerHTML = `
        <div class="media-card-body">
          <div class="quote-mark">“</div>
          <p class="quote-text">${card.desc}</p>
          <h3 class="quote-author">— ${card.title}</h3>
          ${pillsHtml}
          ${linkHtml}
          ${toolsHtml}
        </div>
      `;
    } else if (tpl === 'announcement') {
      el.innerHTML = `
        <div class="media-card-body">
          <div class="announce-top">
            <span class="announce-badge">📢 INFO / PENGUMUMAN</span>
            ${pillsHtml}
          </div>
          <h3>${card.title}</h3>
          <p>${card.desc}</p>
          ${mediaHtml}
          ${linkHtml}
          ${toolsHtml}
        </div>
      `;
    } else if (tpl === 'editorial') {
      el.innerHTML = `
        <div class="media-card-body">
          ${pillsHtml}
          <h3 class="editorial-title">${card.title}</h3>
          <p class="editorial-desc">${card.desc}</p>
          ${mediaHtml}
          ${linkHtml}
          ${toolsHtml}
        </div>
      `;
    } else {
      el.innerHTML = `
        ${mediaHtml}
        <div class="media-card-body">
          ${pillsHtml}
          <h3>${card.title}</h3>
          <p>${card.desc}</p>
          ${linkHtml}
          ${toolsHtml}
        </div>
      `;
    }

    el.querySelector('[data-lightbox]')?.addEventListener('click', (e) => {
      if (isEditorActive) return;
      const box = e.currentTarget;
      openLightbox(box.dataset.lightbox, box.dataset.src, box.dataset.cap);
    });

    el.querySelector('[data-edit-mc]')?.addEventListener('click', () => openMediaCardModal(card));
    el.querySelector('[data-del-mc]')?.addEventListener('click', () => {
      recordSnapshot();
      appData.mediaCards = appData.mediaCards.filter(c => c.id !== card.id);
      persistAndRender();
    });

    targetContainer.appendChild(el);
  });
}

function renderPhotoFrames() {
  document.querySelectorAll('.photo-frame-widget').forEach(w => w.remove());
  const frames = appData.photoFrames || {};

  Object.keys(frames).forEach(targetId => {
    const f = frames[targetId];
    const host = document.getElementById(targetId);
    if (!host || !f || !f.url) return;

    const wrap = document.createElement('div');
    wrap.className = `photo-frame-widget frame-${f.shape || 'circle'}`;
    wrap.id = 'pf-widget-' + targetId;

    const maxSafeSize = Math.min(f.size || 170, Math.round(window.innerWidth * 0.65));
    const sizePx = maxSafeSize + 'px';

    wrap.innerHTML = `
      <div class="pf-inner" style="width:${sizePx};height:${sizePx};">
        <img src="${f.url}" alt="${f.caption || 'Foto'}">
      </div>
      ${f.caption ? `<span class="pf-cap">${f.caption}</span>` : ''}
    `;

    const heroContent = host.querySelector('.hero-content');
    if (heroContent) {
      heroContent.prepend(wrap);
    } else {
      host.prepend(wrap);
    }
  });
}

function getCanvasScaleFactor(el) {
  const host = el.closest('.page-view') || document.querySelector('main');
  const currentCanvasW = host ? host.clientWidth : window.innerWidth;
  return Math.max(0.32, Math.min(1.4, currentCanvasW / 1040));
}

function applyElementStyles() {
  const styles = appData.elementStyles || {};
  Object.keys(styles).forEach(targetId => {
    const st = styles[targetId];
    const el = document.getElementById(targetId);
    if (!el || !st) return;

    const scale = getCanvasScaleFactor(el);

    if (st.widthPct) {
      el.style.width = st.widthPct + '%';
      el.style.maxWidth = '100%';
      el.style.marginInline = 'auto';
    } else if (st.width && st.width < 100) {
      el.style.width = st.width + '%';
      el.style.maxWidth = st.width + '%';
      el.style.marginInline = 'auto';
    } else {
      el.style.width = '';
      el.style.maxWidth = '';
      el.style.marginInline = '';
    }

    if (st.heightNormPx) {
      el.style.minHeight = Math.round(st.heightNormPx * scale) + 'px';
    } else if (st.customHeightPx) {
      el.style.minHeight = st.customHeightPx + 'px';
    } else {
      el.style.minHeight = '';
    }

    const rawTx = st.txNorm !== undefined ? Math.round(st.txNorm * scale) : (st.tx || 0);
    const rawTy = st.tyNorm !== undefined ? Math.round(st.tyNorm * scale) : (st.ty || 0);

    if (rawTx || rawTy) {
      el.style.position = 'relative';
      el.style.left = rawTx + 'px';
      el.style.top = rawTy + 'px';
    } else {
      el.style.left = '';
      el.style.top = '';
    }

    if (st.opacity && st.opacity < 100) {
      el.style.opacity = String(st.opacity / 100);
    } else {
      el.style.opacity = '';
    }

    if (st.noOverlay) {
      el.classList.remove('glass-card', 'float-hover');
      el.classList.add('text-plain-box');
    } else if (st.noOverlay === false) {
      el.classList.remove('text-plain-box');
      el.classList.add('glass-card', 'float-hover');
    }
  });
}

function applyTextEdits() {
  document.querySelectorAll('.editable').forEach(el => {
    const key = el.dataset.key;
    if (key && appData.texts[key] !== undefined) el.innerHTML = appData.texts[key];
  });
}

function applyHiddenBlocks() {
  document.querySelectorAll('[data-block-id]').forEach(el => {
    el.classList.toggle('hidden', appData.hiddenBlocks.includes(el.dataset.blockId || ''));
  });
}

function applyPageHeights() {
  const heights = appData.pageHeights || {};
  document.querySelectorAll('.page-view').forEach(sec => {
    const pid = sec.dataset.pageId;
    const hVal = heights[pid] || 0;
    sec.style.minHeight = hVal > 0 ? hVal + 'px' : '';

    let bar = sec.querySelector('.page-length-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'page-length-bar';
      bar.innerHTML = `
        <button type="button" class="btn secondary sm" data-page-len-act="extend">➕ Tambah Panjang Halaman (+250px)</button>
        <button type="button" class="btn secondary sm" data-page-len-act="shrink">➖ Kurangi</button>
      `;
      sec.appendChild(bar);
    }
  });

  const lbl = document.getElementById('page-height-lbl');
  if (lbl) {
    const curH = heights[currentPageId] || 0;
    lbl.textContent = curH > 0 ? curH + 'px' : 'Otomatis';
  }
}

function syncEditorModeAttributes() {
  if (!isEditorActive) isSelectorMode = false;

  document.body.classList.toggle('editor-active', isEditorActive);
  document.body.classList.toggle('selector-mode-active', isEditorActive && isSelectorMode);

  document.getElementById('editor-dock')?.classList.toggle('hidden', !isEditorActive);
  document.getElementById('admin-preview-dock')?.classList.toggle('hidden', !(isAdminLoggedIn && !isEditorActive));
  document.getElementById('selector-mode-banner')?.classList.toggle('hidden', !(isEditorActive && isSelectorMode));

  const selBtn = document.getElementById('toggle-selector-btn');
  if (selBtn) {
    selBtn.classList.toggle('selector-on', isSelectorMode);
    selBtn.textContent = isSelectorMode ? '✅ Selector ON' : '🎯 Selector';
  }

  if (!isEditorActive || !isSelectorMode) {
    document.querySelectorAll('.inspected-selected').forEach(el => el.classList.remove('inspected-selected'));
    document.querySelectorAll('.canva-resize-overlay').forEach(el => el.remove());
  }

  const panel = document.getElementById('editor-panel');
  if (panel) panel.classList.toggle('hidden', !isEditorActive);

  applyPageHeights();

  document.querySelectorAll('.editable, .nav-page-btn').forEach(el => {
    el.setAttribute('contenteditable', isEditorActive && !isSelectorMode ? 'true' : 'false');
  });
}

