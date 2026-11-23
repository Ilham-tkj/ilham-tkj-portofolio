// @ts-nocheck
/* eslint-disable */
function persistAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  renderAllUI();
}

function renderAllUI() {
  applyTheme();
  renderNavigation();
  renderSubnavPillBar();
  renderCustomPages();
  renderDynamicSubBlocks();
  renderAllMediaCards();
  renderPhotoFrames();
  applyElementStyles();
  applyTextEdits();
  applyHiddenBlocks();
  switchPage(currentPageId, false);
  syncEditorModeAttributes();
  updateHistoryButtons();
}

function renderNavigation() {
  const navLinksEl = document.getElementById('nav-links');
  if (!navLinksEl) return;
  navLinksEl.innerHTML = '';

  appData.pages.forEach(page => {
    const li = document.createElement('li');
    li.className = 'nav-group';

    const row = document.createElement('div');
    row.className = 'nav-main-row' + (page.id === currentPageId ? ' active' : '');

    const pageBtn = document.createElement('button');
    pageBtn.type = 'button';
    pageBtn.className = 'nav-page-btn';
    pageBtn.textContent = page.title;
    pageBtn.addEventListener('click', () => {
      if (isEditorActive) return;
      switchPage(page.id, true);
      navLinksEl.classList.remove('active');
    });

    pageBtn.addEventListener('blur', () => {
      const txt = pageBtn.textContent.trim();
      if (txt && txt !== page.title) {
        recordSnapshot();
        page.title = txt;
        persistAndRender();
      }
    });

    row.appendChild(pageBtn);

    const visibleSubs = page.subs.filter(s => !appData.hiddenBlocks.includes(s.id));
    if (visibleSubs.length > 0) {
      const subToggle = document.createElement('button');
      subToggle.type = 'button';
      subToggle.className = 'nav-sub-toggle';
      subToggle.textContent = '▾';
      subToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = li.classList.contains('open');
        document.querySelectorAll('.nav-group.open').forEach(g => g.classList.remove('open'));
        if (!wasOpen) li.classList.add('open');
      });
      row.appendChild(subToggle);
    }

    if (appData.pages.length > 1) {
      const delPageBtn = document.createElement('button');
      delPageBtn.type = 'button';
      delPageBtn.className = 'delete-page-nav-btn';
      delPageBtn.textContent = '×';
      delPageBtn.title = 'Hapus Halaman ' + page.title;
      delPageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        recordSnapshot();
        appData.pages = appData.pages.filter(p => p.id !== page.id);
        document.getElementById('page-' + page.id)?.remove();
        if (currentPageId === page.id) currentPageId = appData.pages[0].id;
        persistAndRender();
      });
      row.appendChild(delPageBtn);
    }

    li.appendChild(row);

    if (visibleSubs.length > 0) {
      const subUl = document.createElement('ul');
      subUl.className = 'nav-sub-menu';
      visibleSubs.forEach(sub => {
        const subLi = document.createElement('li');
        const subBtn = document.createElement('button');
        subBtn.type = 'button';
        subBtn.className = 'nav-sub-link';
        subBtn.textContent = '↳ ' + sub.title;
        subBtn.addEventListener('click', () => {
          switchPage(page.id, false);
          li.classList.remove('open');
          navLinksEl.classList.remove('active');
          setTimeout(() => {
            document.getElementById(sub.id)?.scrollIntoView({ behavior: 'smooth' });
          }, 60);
        });
        subLi.appendChild(subBtn);
        subUl.appendChild(subLi);
      });
      li.appendChild(subUl);
    }

    navLinksEl.appendChild(li);
  });

  (appData.topbarLinks || []).forEach(lnk => {
    const li = document.createElement('li');
    li.className = 'topbar-custom-link';

    const a = document.createElement('a');
    a.href = lnk.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'nav-page-btn';
    a.textContent = lnk.label;
    a.addEventListener('click', (e) => { if (isEditorActive) e.preventDefault(); });
    a.addEventListener('blur', () => {
      const txt = a.textContent.trim();
      if (txt && txt !== lnk.label) {
        recordSnapshot();
        lnk.label = txt;
        persistAndRender();
      }
    });

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'delete-page-nav-btn';
    del.textContent = '×';
    del.addEventListener('click', () => {
      recordSnapshot();
      appData.topbarLinks = appData.topbarLinks.filter(x => x.id !== lnk.id);
      persistAndRender();
    });

    li.append(a, del);
    navLinksEl.appendChild(li);
  });

  // Tombol Login Avatar di Top Bar
  const loginLi = document.createElement('li');
  loginLi.className = 'nav-admin-login-item';
  const loginBtn = document.createElement('button');
  loginBtn.type = 'button';
  loginBtn.id = 'topbar-admin-login-btn';
  loginBtn.className = 'topbar-avatar-btn' + (isAdminLoggedIn ? ' is-logged-in' : '');
  loginBtn.title = isAdminLoggedIn ? 'Admin Aktif (Klik untuk buka Panel)' : 'Login Admin Studio';

  const avatarSrc = appData.adminCreds?.avatar;
  if (avatarSrc) {
    const img = document.createElement('img');
    img.src = avatarSrc;
    img.alt = 'Admin';
    loginBtn.appendChild(img);
  } else {
    loginBtn.textContent = isAdminLoggedIn ? '🛠️' : '🔐';
  }

  loginBtn.addEventListener('click', () => {
    navLinksEl.classList.remove('active');
    if (isAdminLoggedIn) {
      isEditorActive = true;
      syncEditorModeAttributes();
      document.getElementById('editor-panel')?.classList.toggle('hidden');
    } else {
      document.getElementById('admin-login-error').textContent = '';
      document.getElementById('admin-user-input').value = '';
      document.getElementById('admin-pass-input').value = '';
      document.getElementById('admin-login-modal')?.classList.remove('hidden');
    }
  });

  loginLi.appendChild(loginBtn);
  navLinksEl.appendChild(loginLi);
}

function renderSubnavPillBar() {
  const bar = document.getElementById('page-subnav-bar');
  if (!bar) return;
  const page = appData.pages.find(p => p.id === currentPageId);
  const visibleSubs = (page?.subs || []).filter(s => !appData.hiddenBlocks.includes(s.id));

  if (visibleSubs.length < 2) {
    bar.classList.add('hidden');
    bar.innerHTML = '';
    return;
  }

  bar.innerHTML = '';
  visibleSubs.forEach((sub, idx) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'subnav-pill-btn' + (idx === 0 ? ' active' : '');
    pill.dataset.targetSub = sub.id;
    pill.textContent = sub.title;
    pill.addEventListener('click', () => {
      document.querySelectorAll('.subnav-pill-btn').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      document.getElementById(sub.id)?.scrollIntoView({ behavior: 'smooth' });
    });
    bar.appendChild(pill);
  });
  bar.classList.remove('hidden');
}

function switchPage(pageId, scrollTop) {
  const exists = appData.pages.some(p => p.id === pageId);
  currentPageId = exists ? pageId : (appData.pages[0]?.id || 'beranda');

  document.querySelectorAll('.page-view').forEach(sec => {
    sec.classList.toggle('active', sec.dataset.pageId === currentPageId);
  });

  renderNavigation();
  renderSubnavPillBar();
  syncEditorModeAttributes();
  if (scrollTop) window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCustomPages() {
  const pagesHostEl = document.getElementById('pages-host');
  if (!pagesHostEl) return;
  document.querySelectorAll('.page-view.custom-created').forEach(el => el.remove());

  appData.pages.filter(p => p.custom).forEach(page => {
    const sec = document.createElement('section');
    sec.className = 'page-view custom-created';
    sec.id = 'page-' + page.id;
    sec.dataset.pageId = page.id;

    const introBlock = document.createElement('div');
    introBlock.className = 'sub-block';
    introBlock.id = 'intro-' + page.id;

    const h2 = document.createElement('h2');
    h2.className = 'section-title editable';
    h2.dataset.key = 'ptitle-' + page.id;
    h2.textContent = page.title;

    const card = document.createElement('div');
    card.className = 'glass-card float-hover';
    card.id = 'card-intro-' + page.id;
    const p = document.createElement('p');
    p.className = 'editable';
    p.dataset.key = 'pintro-' + page.id;
    p.textContent = page.intro || 'Halaman baru siap diisi teks atau kartu media.';
    card.appendChild(p);
    introBlock.append(h2, card);

    const dynArea = document.createElement('div');
    dynArea.className = 'page-dynamic-area';
    dynArea.dataset.pageArea = page.id;

    sec.append(introBlock, dynArea);
    pagesHostEl.appendChild(sec);
  });
}

function renderDynamicSubBlocks() {
  document.querySelectorAll('.page-dynamic-area').forEach(area => { area.innerHTML = ''; });

  appData.dynamicSubs.forEach(sub => {
    if (appData.hiddenBlocks.includes(sub.id)) return;
    const area = document.querySelector('.page-dynamic-area[data-page-area="' + sub.pageId + '"]');
    if (!area) return;

    const block = document.createElement('div');
    block.className = 'sub-block';
    block.id = sub.id;

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'delete-section-btn';
    delBtn.dataset.removeTarget = sub.id;
    delBtn.textContent = '🗑️ Hapus Teks';
    block.appendChild(delBtn);

    if (sub.title) {
      const h2 = document.createElement('h2');
      h2.className = 'section-title editable';
      h2.dataset.key = sub.id + '-t';
      h2.textContent = sub.title;
      block.appendChild(h2);
    }

    const useOverlay = sub.overlay !== false;
    const card = document.createElement('div');
    card.className = useOverlay ? 'glass-card float-hover' : 'text-plain-box';
    card.id = 'card-' + sub.id;
    card.dataset.dynSubId = sub.id;

    const p = document.createElement('p');
    p.className = 'editable';
    p.dataset.key = sub.id + '-b';
    p.textContent = sub.body;
    card.appendChild(p);

    block.appendChild(card);
    area.appendChild(block);
  });
}

function buildMediaPreviewNode(item) {
  if (!item.mediaUrl || item.mediaType === 'none') return null;
  const box = document.createElement('div');
  box.className = 'media-preview-box';

  if (item.mediaType === 'image') {
    const img = document.createElement('img');
    img.src = item.mediaUrl;
    img.alt = item.title;
    img.addEventListener('click', (e) => {
      if (isEditorActive) return;
      e.stopPropagation();
      openLightbox('image', item.mediaUrl, item.title);
    });
    box.appendChild(img);
    return box;
  }

  if (item.mediaType === 'video') {
    const yt = getYouTubeEmbed(item.mediaUrl);
    if (yt) {
      const frame = document.createElement('iframe');
      frame.src = yt;
      frame.height = '205';
      frame.style.border = 'none';
      frame.allowFullscreen = true;
      box.appendChild(frame);
    } else {
      const vid = document.createElement('video');
      vid.src = item.mediaUrl;
      vid.controls = true;
      box.appendChild(vid);
    }
    return box;
  }

  if (item.mediaType === 'file') {
    const isPdf = item.mediaUrl.startsWith('data:application/pdf') || /\.pdf(\?|$)/i.test(item.mediaUrl) || /\.pdf$/i.test(item.fileName);
    if (isPdf) {
      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'btn secondary sm';
      prevBtn.textContent = '👁️ Pratinjau PDF (' + (item.fileName || 'Dokumen') + ')';
      prevBtn.addEventListener('click', (e) => {
        if (isEditorActive) return;
        e.stopPropagation();
        openLightbox('pdf', item.mediaUrl, item.fileName || item.title);
      });
      box.appendChild(prevBtn);
    }
    return box;
  }
  return null;
}

function renderAllMediaCards() {
  const proyekSlot = document.getElementById('media-cards-proyek');
  const tugasSlot = document.getElementById('media-cards-tugas');
  if (proyekSlot) proyekSlot.innerHTML = '';
  if (tugasSlot) tugasSlot.innerHTML = '';

  appData.mediaCards.forEach(item => {
    let targetContainer = document.getElementById('media-cards-' + item.group);
    if (!targetContainer) {
      const dynArea = document.querySelector('.page-dynamic-area[data-page-area="' + item.group + '"]');
      if (dynArea) {
        let grid = dynArea.querySelector('.fallback-media-grid');
        if (!grid) {
          grid = document.createElement('div');
          grid.className = 'grid-cards fallback-media-grid';
          grid.style.marginTop = '1.5rem';
          dynArea.appendChild(grid);
        }
        targetContainer = grid;
      }
    }
    if (!targetContainer) return;

    const tpl = item.template || 'fullbleed';
    const card = document.createElement('article');
    card.className = 'glass-card float-hover media-card tpl-' + tpl;
    card.id = item.id;

    const toolBar = document.createElement('div');
    toolBar.className = 'card-editor-tools';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'mini-tool-btn clone';
    editBtn.textContent = '✏️';
    editBtn.title = 'Edit Isi Kartu';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openMediaCardModal(item);
    });

    const cloneBtn = document.createElement('button');
    cloneBtn.type = 'button';
    cloneBtn.className = 'mini-tool-btn clone';
    cloneBtn.textContent = '📋';
    cloneBtn.title = 'Duplikasi Kartu';
    cloneBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      recordSnapshot();
      const copy = { ...item, id: 'mc-' + Date.now(), title: item.title + ' (Salinan)' };
      appData.mediaCards.push(copy);
      persistAndRender();
    });

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'mini-tool-btn del';
    delBtn.textContent = '🗑️';
    delBtn.title = 'Hapus Kartu';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      recordSnapshot();
      appData.mediaCards = appData.mediaCards.filter(mc => mc.id !== item.id);
      persistAndRender();
    });

    toolBar.append(editBtn, cloneBtn, delBtn);
    card.appendChild(toolBar);

    const preview = buildMediaPreviewNode(item);
    const actions = document.createElement('div');
    actions.className = 'media-card-actions';

    if (item.mediaType === 'file' && item.mediaUrl) {
      const dl = document.createElement('a');
      dl.href = item.mediaUrl;
      dl.download = item.fileName || 'tugas';
      dl.className = 'btn secondary sm';
      dl.textContent = '📄 Unduh ' + (item.fileName || 'File');
      dl.addEventListener('click', (e) => { if (isEditorActive) e.preventDefault(); });
      actions.appendChild(dl);
    }
    if (item.linkUrl) {
      const lnk = document.createElement('a');
      lnk.href = item.linkUrl;
      lnk.target = '_blank';
      lnk.rel = 'noopener';
      lnk.className = 'btn primary sm';
      lnk.textContent = '🔗 ' + (item.linkLabel || 'Buka Link');
      lnk.addEventListener('click', (e) => { if (isEditorActive) e.preventDefault(); });
      actions.appendChild(lnk);
    }

    if (tpl === 'bento' || tpl === 'horizontal') {
      const leftMedia = document.createElement('div');
      if (preview) leftMedia.appendChild(preview);
      else {
        const ph = document.createElement('div');
        ph.className = 'bento-placeholder';
        ph.textContent = item.badge || item.title;
        leftMedia.appendChild(ph);
      }

      const rightBody = document.createElement('div');
      rightBody.style.display = 'flex';
      rightBody.style.flexDirection = 'column';
      rightBody.style.gap = '0.6rem';

      if (item.badge) {
        const b = document.createElement('span');
        b.className = 'badge';
        b.textContent = item.badge;
        rightBody.appendChild(b);
      }
      const h3 = document.createElement('h3');
      h3.textContent = item.title;
      rightBody.appendChild(h3);

      if (item.desc) {
        const p = document.createElement('p');
        p.textContent = item.desc;
        rightBody.appendChild(p);
      }
      if (actions.children.length > 0) rightBody.appendChild(actions);
      card.append(leftMedia, rightBody);
    } else if (tpl === 'fullbleed') {
      const coverWrap = document.createElement('div');
      coverWrap.className = 'fb-cover-wrap';

      if (item.badge) {
        const b = document.createElement('span');
        b.className = 'badge';
        b.textContent = item.badge;
        coverWrap.appendChild(b);
      }
      if (preview) coverWrap.appendChild(preview);
      else {
        const iconSpan = document.createElement('span');
        iconSpan.style.fontSize = '2.4rem';
        iconSpan.textContent = '🖥️';
        coverWrap.appendChild(iconSpan);
      }

      const pad = document.createElement('div');
      pad.className = 'fb-content-pad';
      const h3 = document.createElement('h3');
      h3.textContent = item.title;
      pad.appendChild(h3);

      if (item.desc) {
        const p = document.createElement('p');
        p.textContent = item.desc;
        pad.appendChild(p);
      }
      if (actions.children.length > 0) pad.appendChild(actions);
      card.append(coverWrap, pad);
    } else if (tpl === 'editorial' || tpl === 'quote' || tpl === 'announcement') {
      if (item.badge) {
        const b = document.createElement('span');
        b.className = 'badge';
        b.textContent = item.badge;
        card.appendChild(b);
      }
      const h3 = document.createElement('h3');
      h3.textContent = item.title;
      card.appendChild(h3);

      if (preview) card.appendChild(preview);

      if (item.desc) {
        const p = document.createElement('p');
        p.textContent = item.desc;
        card.appendChild(p);
      }
      if (actions.children.length > 0) card.appendChild(actions);
    } else {
      const topbar = document.createElement('div');
      topbar.className = 'term-topbar';
      const dots = document.createElement('div');
      dots.className = 'term-dots';
      ['#ef4444', '#f59e0b', '#10b981'].forEach(col => {
        const d = document.createElement('span');
        d.style.background = col;
        dots.appendChild(d);
      });
      const fname = document.createElement('span');
      fname.className = 'term-filename';
      fname.textContent = item.fileName || (item.title.toLowerCase().replace(/\s+/g, '_') + '.log');
      topbar.append(dots, fname);

      const pad = document.createElement('div');
      pad.className = 'term-content-pad';
      if (preview) pad.appendChild(preview);

      const h3 = document.createElement('h3');
      h3.textContent = item.title;
      pad.appendChild(h3);

      if (item.desc) {
        const p = document.createElement('p');
        p.textContent = item.desc;
        pad.appendChild(p);
      }
      if (item.badge) {
        const tags = document.createElement('div');
        tags.className = 'term-tags';
        item.badge.split(/[,/]+/).forEach(t => {
          const clean = t.trim();
          if (!clean) return;
          const tag = document.createElement('span');
          tag.className = 'term-tag';
          tag.textContent = '#' + clean.replace(/\s+/g, '');
          tags.appendChild(tag);
        });
        pad.appendChild(tags);
      }
      if (actions.children.length > 0) pad.appendChild(actions);
      card.append(topbar, pad);
    }

    targetContainer.appendChild(card);
  });
}

function renderPhotoFrames() {
  document.querySelectorAll('.photo-frame-box').forEach(el => el.remove());
  const frames = appData.photoFrames || {};

  Object.keys(frames).forEach(targetId => {
    const f = frames[targetId];
    const host = document.getElementById(targetId);
    if (!host || !f || !f.url) return;

    const wrap = document.createElement('figure');
    wrap.className = 'photo-frame-box frame-' + (f.shape || 'circle');
    wrap.style.setProperty('--frame-size', (f.size || 170) + 'px');

    const img = document.createElement('img');
    img.src = f.url;
    img.alt = f.caption || 'Foto';
    img.addEventListener('click', (e) => {
      if (isEditorActive) return;
      e.stopPropagation();
      openLightbox('image', f.url, f.caption || 'Bingkai Foto');
    });
    wrap.appendChild(img);

    if (f.caption) {
      const cap = document.createElement('figcaption');
      cap.className = 'frame-cap';
      cap.textContent = f.caption;
      wrap.appendChild(cap);
    }

    const innerContent = host.querySelector('.hero-content') || host;
    innerContent.prepend(wrap);
  });
}

function applyElementStyles() {
  const styles = appData.elementStyles || {};
  Object.keys(styles).forEach(targetId => {
    const st = styles[targetId];
    const el = document.getElementById(targetId);
    if (!el || !st) return;

    if (st.width && st.width < 100) {
      el.style.width = st.width + '%';
      el.style.maxWidth = st.width + '%';
      el.style.marginInline = 'auto';
    } else {
      el.style.width = '';
      el.style.maxWidth = '';
      el.style.marginInline = '';
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

function syncEditorModeAttributes() {
  document.body.classList.toggle('editor-active', isEditorActive);

  document.getElementById('editor-dock')?.classList.toggle('hidden', !isEditorActive);
  document.getElementById('admin-preview-dock')?.classList.toggle('hidden', !(isAdminLoggedIn && !isEditorActive));

  if (!isEditorActive) {
    document.getElementById('editor-panel')?.classList.add('hidden');
    document.getElementById('element-inspector')?.classList.add('hidden');
    document.querySelectorAll('.inspected-selected').forEach(el => el.classList.remove('inspected-selected'));
  }

  document.querySelectorAll('.editable, .nav-page-btn').forEach(el => {
    el.setAttribute('contenteditable', isEditorActive ? 'true' : 'false');
  });
}

