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

// =========================================================
// RESPONSIVE CANVAS SCALING & SMART GUIDES SNAPPING
// =========================================================
window.addEventListener('resize', () => {
  applyElementStyles();
  if (isSelectorMode && selectedTargetId) {
    const el = document.getElementById(selectedTargetId);
    if (el) attachCanvaResizeHandles(el);
  }
});

function hideSmartGuides() {
  const gv = document.getElementById('smart-guide-v');
  const gh = document.getElementById('smart-guide-h');
  if (gv) gv.style.display = 'none';
  if (gh) gh.style.display = 'none';
}

function computeSnapAdjustment(el, proposedLeftPx, proposedTopPx) {
  const SNAP_DIST = 9;
  const gv = document.getElementById('smart-guide-v');
  const gh = document.getElementById('smart-guide-h');
  const rect = el.getBoundingClientRect();
  const curLeft = parseFloat(el.style.left || '0') || 0;
  const curTop = parseFloat(el.style.top || '0') || 0;

  const predLeft = rect.left + (proposedLeftPx - curLeft);
  const predRight = predLeft + rect.width;
  const predCenterX = predLeft + rect.width / 2;

  const predTop = rect.top + (proposedTopPx - curTop);
  const predBottom = predTop + rect.height;
  const predCenterY = predTop + rect.height / 2;

  const host = el.closest('.page-view') || document.querySelector('main');
  const hostRect = host ? host.getBoundingClientRect() : { left: 0, width: window.innerWidth };
  const canvasCenterX = hostRect.left + hostRect.width / 2;

  const vTargets = [canvasCenterX, hostRect.left + 16, hostRect.left + hostRect.width - 16];
  const hTargets = [];

  document.querySelectorAll('.page-view.active .photo-frame-widget, .page-view.active .glass-card, .page-view.active .text-plain-box, .page-view.active .float-card').forEach(other => {
    if (other === el || other.contains(el) || el.contains(other)) return;
    const r = other.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    vTargets.push(r.left, r.left + r.width / 2, r.right);
    hTargets.push(r.top, r.top + r.height / 2, r.bottom);
  });

  let snapDx = 0;
  let guideX = null;
  let bestDistX = SNAP_DIST + 1;

  vTargets.forEach(tx => {
    [predLeft, predCenterX, predRight].forEach(px => {
      const diff = tx - px;
      if (Math.abs(diff) < bestDistX) {
        bestDistX = Math.abs(diff);
        snapDx = diff;
        guideX = tx;
      }
    });
  });

  let snapDy = 0;
  let guideY = null;
  let bestDistY = SNAP_DIST + 1;

  hTargets.forEach(ty => {
    [predTop, predCenterY, predBottom].forEach(py => {
      const diff = ty - py;
      if (Math.abs(diff) < bestDistY) {
        bestDistY = Math.abs(diff);
        snapDy = diff;
        guideY = ty;
      }
    });
  });

  if (gv) {
    if (guideX !== null) {
      gv.style.left = Math.round(guideX) + 'px';
      gv.style.display = 'block';
    } else {
      gv.style.display = 'none';
    }
  }

  if (gh) {
    if (guideY !== null) {
      gh.style.top = Math.round(guideY) + 'px';
      gh.style.display = 'block';
    } else {
      gh.style.display = 'none';
    }
  }

  return {
    left: Math.round(proposedLeftPx + snapDx),
    top: Math.round(proposedTopPx + snapDy)
  };
}

// =========================================================
// MODE SELECTOR, MENU TITIK TIGA (⋮), RESIZE & DRAG-AND-DROP
// =========================================================
function getFrameHostId(elId) {
  return elId.startsWith('pf-widget-') ? elId.replace('pf-widget-', '') : elId;
}

function toggleSelectorMode(forceState) {
  if (!isEditorActive) return;
  isSelectorMode = typeof forceState === 'boolean' ? forceState : !isSelectorMode;
  if (!isSelectorMode) clearElementSelection();
  syncEditorModeAttributes();
  updateBottomSafePadding();
}

document.getElementById('toggle-selector-btn')?.addEventListener('click', () => toggleSelectorMode());
document.getElementById('exit-selector-banner-btn')?.addEventListener('click', () => toggleSelectorMode(false));

function removeCanvaOverlay() {
  document.querySelectorAll('.canva-resize-overlay').forEach(el => el.remove());
  hideSmartGuides();
}

function clearElementSelection() {
  selectedTargetId = '';
  document.querySelectorAll('.inspected-selected').forEach(x => x.classList.remove('inspected-selected'));
  removeCanvaOverlay();
}

function attachCanvaResizeHandles(el) {
  removeCanvaOverlay();
  if (!el || !isSelectorMode) return;

  if (getComputedStyle(el).position === 'static') {
    el.style.position = 'relative';
  }

  const overlay = document.createElement('div');
  overlay.className = 'canva-resize-overlay';

  const moreBtn = document.createElement('button');
  moreBtn.type = 'button';
  moreBtn.className = 'canva-more-btn';
  moreBtn.title = 'Opsi Elemen';
  moreBtn.textContent = '⋮';

  const popover = document.createElement('div');
  popover.className = 'canva-more-popover hidden';

  const st = appData.elementStyles[el.id] || {};
  const curOpacity = st.opacity ?? 100;
  const isPhotoWidget = el.classList.contains('photo-frame-widget');

  popover.innerHTML = `
    <label>👻 Transparansi (<span class="pop-op-lbl">${curOpacity}%</span>)
      <input type="range" class="pop-op-range" min="15" max="100" value="${curOpacity}">
    </label>
    ${!isPhotoWidget ? '<button type="button" class="canva-pop-btn" data-pop-act="overlay">🪟 Toggle Overlay Kartu</button>' : ''}
    <button type="button" class="canva-pop-btn" data-pop-act="frame">🖼️ ${isPhotoWidget ? 'Edit / Ganti Bingkai Foto' : 'Tambah / Edit Bingkai Foto'}</button>
    <button type="button" class="canva-pop-btn" data-pop-act="reset-pos">📍 Reset Posisi Geser</button>
    <button type="button" class="canva-pop-btn" data-pop-act="reset-all">🔄 Reset Ukuran &amp; Posisi</button>
  `;

  popover.addEventListener('pointerdown', (e) => e.stopPropagation());
  popover.addEventListener('click', (e) => e.stopPropagation());

  popover.querySelector('.pop-op-range')?.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    popover.querySelector('.pop-op-lbl').textContent = val + '%';
    appData.elementStyles[el.id] = { ...(appData.elementStyles[el.id] || {}), opacity: val };
    applyElementStyles();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    if (typeof pushDataToFirebase === 'function') pushDataToFirebase();
  });

  popover.addEventListener('click', (e) => {
    const actBtn = e.target.closest('[data-pop-act]');
    if (!actBtn) return;
    const act = actBtn.dataset.popAct;

    if (act === 'overlay') {
      recordSnapshot();
      const currentlyHasOverlay = el.classList.contains('glass-card');
      appData.elementStyles[el.id] = { ...(appData.elementStyles[el.id] || {}), noOverlay: currentlyHasOverlay };
      persistAndRender();
      selectElementForInspector(document.getElementById(el.id));
    } else if (act === 'frame') {
      const hostId = getFrameHostId(el.id);
      const existing = appData.photoFrames?.[hostId];
      document.getElementById('pf-shape').value = existing?.shape || 'circle';
      document.getElementById('pf-img-url').value = existing?.url || '';
      document.getElementById('pf-img-file').value = '';
      document.getElementById('pf-size-range').value = existing?.size || 170;
      document.getElementById('pf-size-lbl').textContent = (existing?.size || 170) + 'px';
      document.getElementById('pf-caption').value = existing?.caption || '';
      document.getElementById('photo-frame-modal')?.classList.remove('hidden');
    } else if (act === 'reset-pos') {
      recordSnapshot();
      if (appData.elementStyles[el.id]) {
        delete appData.elementStyles[el.id].tx;
        delete appData.elementStyles[el.id].ty;
        delete appData.elementStyles[el.id].txNorm;
        delete appData.elementStyles[el.id].tyNorm;
      }
      persistAndRender();
      selectElementForInspector(document.getElementById(el.id));
    } else if (act === 'reset-all') {
      recordSnapshot();
      delete appData.elementStyles[el.id];
      persistAndRender();
      selectElementForInspector(document.getElementById(el.id));
    }
  });

  moreBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
  moreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    popover.classList.toggle('hidden');
  });

  overlay.append(moreBtn, popover);

  const sizePill = document.createElement('div');
  sizePill.className = 'canva-size-pill';
  const initRect = el.getBoundingClientRect();
  sizePill.textContent = Math.round(initRect.width) + ' × ' + Math.round(initRect.height) + 'px';
  overlay.appendChild(sizePill);

  const dirs = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
  dirs.forEach(dir => {
    const h = document.createElement('span');
    h.className = 'canva-handle ' + dir;

    h.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      popover.classList.add('hidden');
      recordSnapshot();

      const startX = e.clientX;
      const startY = e.clientY;
      const rect = el.getBoundingClientRect();
      const startW = rect.width;
      const startH = rect.height;
      const pW = el.parentElement ? el.parentElement.clientWidth : window.innerWidth;
      const scale = getCanvasScaleFactor(el);
      const startLeft = parseFloat(el.style.left || '0') || 0;
      const startTop = parseFloat(el.style.top || '0') || 0;

      h.setPointerCapture(e.pointerId);

      const onMove = (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        let newW = startW;
        let newH = startH;
        let newLeft = startLeft;
        let newTop = startTop;

        if (dir.includes('e')) newW = Math.max(80, Math.min(pW, startW + dx));
        if (dir.includes('w')) {
          newW = Math.max(80, Math.min(pW, startW - dx));
          newLeft = startLeft + (startW - newW) / 2;
        }
        if (dir.includes('s')) newH = Math.max(48, startH + dy);
        if (dir.includes('n')) {
          newH = Math.max(48, startH - dy);
          newTop = startTop + (startH - newH);
        }

        if (isPhotoWidget) {
          const sq = Math.max(80, Math.min(360, Math.round(Math.max(newW, newH))));
          const pfInner = el.querySelector('.pf-inner');
          if (pfInner) {
            pfInner.style.width = sq + 'px';
            pfInner.style.height = sq + 'px';
          }
          const hostId = getFrameHostId(el.id);
          if (appData.photoFrames?.[hostId]) {
            appData.photoFrames[hostId].size = sq;
          }
          sizePill.textContent = sq + ' × ' + sq + 'px';
        } else {
          const widthPct = Math.max(25, Math.min(100, Math.round((newW / Math.max(1, pW)) * 100)));
          const heightNormPx = Math.round(newH / scale);

          el.style.width = widthPct + '%';
          el.style.maxWidth = '100%';
          el.style.marginInline = 'auto';
          el.style.minHeight = Math.round(newH) + 'px';

          sizePill.textContent = widthPct + '% × ' + Math.round(newH) + 'px';
          appData.elementStyles[el.id] = {
            ...(appData.elementStyles[el.id] || {}),
            widthPct,
            heightNormPx
          };
        }

        el.style.left = Math.round(newLeft) + 'px';
        el.style.top = Math.round(newTop) + 'px';
        appData.elementStyles[el.id] = {
          ...(appData.elementStyles[el.id] || {}),
          txNorm: Math.round(newLeft / scale),
          tyNorm: Math.round(newTop / scale)
        };
      };

      const onUp = () => {
        h.removeEventListener('pointermove', onMove);
        h.removeEventListener('pointerup', onUp);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
        if (typeof pushDataToFirebase === 'function') pushDataToFirebase();
      };

      h.addEventListener('pointermove', onMove);
      h.addEventListener('pointerup', onUp);
    });

    overlay.appendChild(h);
  });

  el.appendChild(overlay);
}

let activeDragEl = null;
let dragStartX = 0;
let dragStartY = 0;
let dragOrigLeft = 0;
let dragOrigTop = 0;
let dragMoved = false;
let swapTargetCard = null;

document.addEventListener('pointerdown', (e) => {
  if (!isEditorActive || !isSelectorMode) return;
  if (e.target.closest('.canva-handle, .canva-more-btn, .canva-more-popover, #editor-panel, #editor-dock, #selector-mode-banner, #media-card-modal, #photo-frame-modal, #admin-login-modal, button, a, input, select, textarea')) return;

  const targetBox = e.target.closest('.photo-frame-widget, .glass-card, .text-plain-box, .float-card, .hero, .sub-block');
  if (!targetBox || !targetBox.id) return;

  selectElementForInspector(targetBox);

  activeDragEl = targetBox;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragOrigLeft = parseFloat(targetBox.style.left || '0') || 0;
  dragOrigTop = parseFloat(targetBox.style.top || '0') || 0;
  dragMoved = false;
  swapTargetCard = null;
});

document.addEventListener('pointermove', (e) => {
  if (!activeDragEl || !isSelectorMode) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;

  if (!dragMoved && Math.hypot(dx, dy) < 6) return;
  if (!dragMoved) {
    dragMoved = true;
    recordSnapshot();
    activeDragEl.classList.add('is-dragging-el');
  }

  e.preventDefault();
  const rawLeft = dragOrigLeft + dx;
  const rawTop = dragOrigTop + dy;
  const snapped = computeSnapAdjustment(activeDragEl, rawLeft, rawTop);
  const scale = getCanvasScaleFactor(activeDragEl);

  activeDragEl.style.position = 'relative';
  activeDragEl.style.left = snapped.left + 'px';
  activeDragEl.style.top = snapped.top + 'px';

  appData.elementStyles[activeDragEl.id] = {
    ...(appData.elementStyles[activeDragEl.id] || {}),
    txNorm: Math.round(snapped.left / scale),
    tyNorm: Math.round(snapped.top / scale)
  };

  if (activeDragEl.classList.contains('media-card')) {
    document.querySelectorAll('.drag-swap-target').forEach(x => x.classList.remove('drag-swap-target'));
    swapTargetCard = null;
    document.querySelectorAll('.media-card').forEach(card => {
      if (card === activeDragEl) return;
      const r = card.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        swapTargetCard = card;
        card.classList.add('drag-swap-target');
      }
    });
  }
}, { passive: false });

document.addEventListener('pointerup', () => {
  if (!activeDragEl) return;
  activeDragEl.classList.remove('is-dragging-el');
  document.querySelectorAll('.drag-swap-target').forEach(x => x.classList.remove('drag-swap-target'));
  hideSmartGuides();

  if (dragMoved) {
    if (swapTargetCard && activeDragEl.classList.contains('media-card')) {
      const idxA = appData.mediaCards.findIndex(c => c.id === activeDragEl.id);
      const idxB = appData.mediaCards.findIndex(c => c.id === swapTargetCard.id);
      if (idxA !== -1 && idxB !== -1) {
        const temp = appData.mediaCards[idxA];
        appData.mediaCards[idxA] = appData.mediaCards[idxB];
        appData.mediaCards[idxB] = temp;
        if (appData.elementStyles[activeDragEl.id]) {
          delete appData.elementStyles[activeDragEl.id].txNorm;
          delete appData.elementStyles[activeDragEl.id].tyNorm;
        }
        persistAndRender();
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
      if (typeof pushDataToFirebase === 'function') pushDataToFirebase();
    }
  }

  activeDragEl = null;
  swapTargetCard = null;
  dragMoved = false;
});

function selectElementForInspector(el) {
  if (!el || !el.id || !isSelectorMode) return;
  if (selectedTargetId === el.id && el.querySelector('.canva-resize-overlay')) return;
  selectedTargetId = el.id;

  document.querySelectorAll('.inspected-selected').forEach(x => x.classList.remove('inspected-selected'));
  el.classList.add('inspected-selected');
  attachCanvaResizeHandles(el);
}

// =========================================================
// KONTROL SLIDE BAR BAWAH, PANJANG & HAPUS HALAMAN
// =========================================================
function updateBottomSafePadding() {
  const bar = document.getElementById('editor-panel');
  const drawer = document.getElementById('canva-slide-drawer');
  if (!isEditorActive || !bar || bar.classList.contains('hidden')) {
    document.body.style.paddingBottom = '';
    document.body.classList.remove('drawer-open');
    return;
  }
  const isDrawerOpen = drawer && !drawer.classList.contains('hidden');
  document.body.classList.toggle('drawer-open', isDrawerOpen);
  requestAnimationFrame(() => {
    const barH = bar.offsetHeight || 76;
    document.body.style.paddingBottom = (barH + 28) + 'px';
  });
}

document.querySelectorAll('.canva-tool-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const targetId = tab.dataset.tab;
    const label = tab.dataset.label || 'Editor';
    const drawer = document.getElementById('canva-slide-drawer');
    const titleEl = document.getElementById('drawer-active-title');
    const wasActive = tab.classList.contains('active') && drawer && !drawer.classList.contains('hidden');

    document.querySelectorAll('.canva-tool-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.ed-tab-content').forEach(c => c.classList.remove('active'));

    if (wasActive) {
      drawer?.classList.add('hidden');
    } else {
      tab.classList.add('active');
      if (targetId) document.getElementById(targetId)?.classList.add('active');
      if (titleEl) titleEl.textContent = label;
      drawer?.classList.remove('hidden');
    }
    updateBottomSafePadding();
  });
});

document.getElementById('close-editor-btn')?.addEventListener('click', () => {
  document.getElementById('canva-slide-drawer')?.classList.add('hidden');
  document.querySelectorAll('.canva-tool-tab').forEach(t => t.classList.remove('active'));
  updateBottomSafePadding();
});

document.getElementById('drawer-selector-btn')?.addEventListener('click', () => toggleSelectorMode());
document.getElementById('drawer-add-card-btn')?.addEventListener('click', () => openMediaCardModal(null));

function changeActivePageLength(delta) {
  const activeSec = document.getElementById('page-' + currentPageId);
  if (!activeSec) return;
  recordSnapshot();
  appData.pageHeights = appData.pageHeights || {};
  const currentMin = appData.pageHeights[currentPageId] || Math.round(activeSec.getBoundingClientRect().height);
  const nextH = Math.max(420, currentMin + delta);
  appData.pageHeights[currentPageId] = nextH;
  applyPageHeights();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  if (typeof pushDataToFirebase === 'function') pushDataToFirebase();
}

document.getElementById('extend-page-btn')?.addEventListener('click', () => changeActivePageLength(250));
document.getElementById('shrink-page-btn')?.addEventListener('click', () => changeActivePageLength(-250));
document.getElementById('reset-page-height-btn')?.addEventListener('click', () => {
  recordSnapshot();
  if (appData.pageHeights) delete appData.pageHeights[currentPageId];
  applyPageHeights();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  if (typeof pushDataToFirebase === 'function') pushDataToFirebase();
});

// FITUR HAPUS HALAMAN AKTIF
document.getElementById('delete-current-page-btn')?.addEventListener('click', () => {
  if (appData.pages.length <= 1) {
    return alert('Minimal harus tersisa 1 halaman di website.');
  }
  const activePage = appData.pages.find(p => p.id === currentPageId);
  if (!activePage) return;
  if (!confirm(`Hapus halaman "${activePage.title}" secara permanen?`)) return;

  recordSnapshot();
  appData.pages = appData.pages.filter(p => p.id !== currentPageId);
  appData.dynamicSubs = appData.dynamicSubs.filter(s => s.pageId !== currentPageId);
  document.getElementById('page-' + currentPageId)?.remove();
  currentPageId = appData.pages[0].id;
  persistAndRender();
});

window.addEventListener('resize', updateBottomSafePadding);

// LOGIN, AVATAR & LOGOUT ADMIN
function performAdminLogout() {
  isAdminLoggedIn = false;
  isEditorActive = false;
  isSelectorMode = false;
  clearAdminSession();
  renderNavigation();
  syncEditorModeAttributes();
  updateBottomSafePadding();
}

document.getElementById('close-admin-login')?.addEventListener('click', () => {
  document.getElementById('admin-login-modal')?.classList.add('hidden');
});

document.getElementById('cancel-admin-login-btn')?.addEventListener('click', () => {
  document.getElementById('admin-login-modal')?.classList.add('hidden');
});

document.getElementById('submit-admin-login-btn')?.addEventListener('click', async () => {
  const email = document.getElementById('admin-user-input')?.value.trim() || '';
  const password = document.getElementById('admin-pass-input')?.value || '';
  const errEl = document.getElementById('admin-login-error');
  const btn = document.getElementById('submit-admin-login-btn');

  if (!email || !password) {
    if (errEl) errEl.textContent = 'Isi email dan password admin!';
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Memverifikasi...'; }
  if (errEl) errEl.textContent = '';

  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Login gagal');

    localStorage.setItem(FIREBASE_TOKEN_KEY, data.idToken);
    localStorage.setItem(FIREBASE_REFRESH_KEY, data.refreshToken);

    isAdminLoggedIn = true;
    isEditorActive = true;
    isSelectorMode = false;
    saveAdminSession();
    document.getElementById('admin-login-modal')?.classList.add('hidden');
    renderNavigation();
    syncEditorModeAttributes();
    updateBottomSafePadding();
  } catch (err) {
    if (errEl) errEl.textContent = 'Login ditolak: Email atau password Firebase salah!';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Masuk Editor'; }
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

// Klik Global: Navigasi, Panjang Halaman, Hapus Blok & Tutup Seleksi
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-group')) {
    document.querySelectorAll('.nav-group.open').forEach(g => g.classList.remove('open'));
  }

  const lenBtn = e.target.closest('[data-page-len-act]');
  if (lenBtn && isEditorActive) {
    const act = lenBtn.dataset.pageLenAct;
    changeActivePageLength(act === 'extend' ? 250 : -250);
    return;
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

  if (isEditorActive && isSelectorMode && !e.target.closest('.photo-frame-widget, .glass-card, .text-plain-box, .float-card, .hero, .sub-block, .canva-more-btn, .canva-more-popover, #editor-panel, #editor-dock, #selector-mode-banner, #photo-frame-modal')) {
    clearElementSelection();
  }
});

document.addEventListener('focusin', (e) => {
  if (isEditorActive && !isSelectorMode && e.target.closest('.editable, .nav-page-btn')) {
    recordSnapshot();
  }
});

document.addEventListener('input', (e) => {
  if (!isEditorActive || isSelectorMode) return;
  const el = e.target.closest('.editable');
  if (el && el.dataset.key) {
    appData.texts[el.dataset.key] = el.innerHTML;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    if (typeof pushDataToFirebase === 'function') pushDataToFirebase();
  }
});

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

// Modal Bingkai Foto
document.getElementById('pf-size-range')?.addEventListener('input', (e) => {
  document.getElementById('pf-size-lbl').textContent = e.target.value + 'px';
});

document.getElementById('close-frame-modal')?.addEventListener('click', () => {
  document.getElementById('photo-frame-modal')?.classList.add('hidden');
});

document.getElementById('save-frame-btn')?.addEventListener('click', () => {
  if (!selectedTargetId) return;
  const hostId = getFrameHostId(selectedTargetId);
  const shape = document.getElementById('pf-shape')?.value || 'circle';
  const size = Number(document.getElementById('pf-size-range')?.value || 170);
  const caption = document.getElementById('pf-caption')?.value.trim() || '';
  const urlIn = document.getElementById('pf-img-url')?.value.trim() || '';
  const fileIn = document.getElementById('pf-img-file');

  const commitFrame = (finalUrl) => {
    if (!finalUrl) return alert('Masukkan URL gambar atau pilih foto dari perangkat.');
    recordSnapshot();
    appData.photoFrames = appData.photoFrames || {};
    appData.photoFrames[hostId] = { shape, size, caption, url: finalUrl };
    document.getElementById('photo-frame-modal')?.classList.add('hidden');
    persistAndRender();
    const widget = document.getElementById('pf-widget-' + hostId);
    if (widget && isSelectorMode) selectElementForInspector(widget);
  };

  if (fileIn?.files?.[0]) {
    const reader = new FileReader();
    reader.onload = (evt) => commitFrame(String(evt.target?.result || ''));
    reader.readAsDataURL(fileIn.files[0]);
  } else {
    commitFrame(urlIn || appData.photoFrames?.[hostId]?.url || '');
  }
});

document.getElementById('remove-frame-btn')?.addEventListener('click', () => {
  if (!selectedTargetId) return;
  const hostId = getFrameHostId(selectedTargetId);
  recordSnapshot();
  if (appData.photoFrames) delete appData.photoFrames[hostId];
  if (appData.elementStyles) delete appData.elementStyles['pf-widget-' + hostId];
  clearElementSelection();
  document.getElementById('photo-frame-modal')?.classList.add('hidden');
  persistAndRender();
});

// Menu Mobile, Undo, Redo & Mode Pratinjau Pengunjung
document.getElementById('menu-toggle')?.addEventListener('click', () => {
  document.getElementById('nav-links')?.classList.toggle('active');
});

document.getElementById('preview-mode-btn')?.addEventListener('click', () => {
  isEditorActive = false;
  isSelectorMode = false;
  clearElementSelection();
  syncEditorModeAttributes();
  updateBottomSafePadding();
});

document.getElementById('resume-edit-btn')?.addEventListener('click', () => {
  if (!isAdminLoggedIn) return;
  isEditorActive = true;
  syncEditorModeAttributes();
  updateBottomSafePadding();
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

// Warna Teks Pilihan
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
    if (typeof pushDataToFirebase === 'function') pushDataToFirebase();
  }
});

// Tambah Blok Teks & Halaman Baru
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

// Estetika: Tema, Background, Tipografi & Sudut
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
    if (typeof pushDataToFirebase === 'function') pushDataToFirebase();
  });
});

document.getElementById('bg-opacity-range')?.addEventListener('input', (e) => {
  const val = Number(e.target.value);
  appData.theme.bgOpacity = val;
  document.getElementById('bg-op-lbl').textContent = val + '%';
  applyTheme();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  if (typeof pushDataToFirebase === 'function') pushDataToFirebase();
});

document.getElementById('bg-blur-range')?.addEventListener('input', (e) => {
  const val = Number(e.target.value);
  appData.theme.bgBlur = val;
  document.getElementById('bg-blur-lbl').textContent = val + 'px';
  applyTheme();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  if (typeof pushDataToFirebase === 'function') pushDataToFirebase();
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
  if (typeof pushDataToFirebase === 'function') pushDataToFirebase();
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
  cloneDoc.querySelector('body')?.classList.remove('editor-active', 'selector-mode-active', 'drawer-open');
  cloneDoc.querySelector('body')?.style.removeProperty('padding-bottom');
  cloneDoc.querySelectorAll('#editor-dock, #admin-preview-dock, #editor-panel, #selector-mode-banner, #smart-guide-v, #smart-guide-h, .page-length-bar, .canva-resize-overlay, #media-card-modal, #photo-frame-modal, #admin-login-modal, .nav-admin-login-item, .delete-section-btn, .delete-page-nav-btn, .card-editor-tools, .editor-only-inline').forEach(el => el.remove());
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

// =========================================================
// REAL-TIME CLOUD SYNC DENGAN FIREBASE AUTH TOKEN
// =========================================================
const FIREBASE_URL_KEY = 'hamz_firebase_db_url';
const FIREBASE_TOKEN_KEY = 'hamz_fb_id_token';
const FIREBASE_REFRESH_KEY = 'hamz_fb_refresh_token';

const DEFAULT_FIREBASE_URL = 'https://ilham-portofolio-b57dc-default-rtdb.asia-southeast1.firebasedatabase.app';
const FIREBASE_WEB_API_KEY = 'AIzaSyCmlrxwQ1QJHne8dRFHopk2OZUWiPRodQ0';

function getFirebaseBaseUrl() {
  const saved = localStorage.getItem(FIREBASE_URL_KEY) || DEFAULT_FIREBASE_URL;
  return saved.trim().replace(/\/+$/, '');
}

async function getValidFirebaseToken() {
  const refreshToken = localStorage.getItem(FIREBASE_REFRESH_KEY);
  if (!refreshToken) return localStorage.getItem(FIREBASE_TOKEN_KEY) || '';

  try {
    const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${FIREBASE_WEB_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`
    });
    const data = await res.json();
    if (res.ok && data.id_token) {
      localStorage.setItem(FIREBASE_TOKEN_KEY, data.id_token);
      if (data.refresh_token) localStorage.setItem(FIREBASE_REFRESH_KEY, data.refresh_token);
      return data.id_token;
    }
  } catch {}
  return localStorage.getItem(FIREBASE_TOKEN_KEY) || '';
}

function setCloudStatusText(msg, isError = false) {
  const el = document.getElementById('cloud-sync-status');
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? '#ef4444' : '#00e5ff';
}

let cloudSyncTimer = null;
function pushDataToFirebase() {
  const baseUrl = getFirebaseBaseUrl();
  if (!baseUrl) return;

  setCloudStatusText('☁️ Menyimpan ke Cloud (Terautentikasi)...');
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(async () => {
    try {
      const token = await getValidFirebaseToken();
      if (!token) throw new Error('Sesi habis, silakan login ulang');

      const safePayload = { ...appData };
      delete safePayload.adminCreds;

      const res = await fetch(`${baseUrl}/portfolioData.json?auth=${encodeURIComponent(token)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(safePayload)
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCloudStatusText(`🔒 Tersinkron Aman (${now})`);
    } catch (err) {
      setCloudStatusText('⚠️ Gagal sync: Sesi habis atau UID tidak cocok.', true);
    }
  }, 600);
}

async function pullDataFromFirebase(showAlert = false) {
  const baseUrl = getFirebaseBaseUrl();
  if (!baseUrl) return;

  try {
    const res = await fetch(`${baseUrl}/portfolioData.json?t=${Date.now()}`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const cloudData = await res.json();
    if (cloudData && typeof cloudData === 'object' && cloudData.pages) {
      appData = {
        ...appData,
        ...cloudData,
        theme: { ...appData.theme, ...(cloudData.theme || {}) }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
      renderAllUI();
      updateBottomSafePadding();
      setCloudStatusText('🔒 Data terbaru dimuat dari Cloud');
      if (showAlert) alert('Berhasil menarik data terbaru dari Firebase!');
    } else if (showAlert) {
      alert('Database Firebase masih kosong. Tekan "Hubungkan & Sync" untuk mengunggah data.');
    }
  } catch (err) {
    setCloudStatusText('⚠️ Gagal memuat data Cloud.', true);
    if (showAlert) alert('Gagal membaca data dari Firebase.');
  }
}

const fbInput = document.getElementById('firebase-db-url');
if (fbInput) fbInput.value = getFirebaseBaseUrl();

document.getElementById('save-firebase-url-btn')?.addEventListener('click', () => {
  const val = fbInput?.value.trim().replace(/\/+$/, '') || '';
  if (!val.startsWith('https://')) {
    return alert('Masukkan URL Firebase Realtime Database yang valid (diawali https://...)');
  }
  localStorage.setItem(FIREBASE_URL_KEY, val);
  pushDataToFirebase();
});

document.getElementById('pull-firebase-btn')?.addEventListener('click', () => {
  pullDataFromFirebase(true);
});

// Inisialisasi Awal
const savedRaw = localStorage.getItem(STORAGE_KEY);
if (savedRaw) {
  try {
    const parsed = JSON.parse(savedRaw);
    appData = {
      ...appData,
      ...parsed,
      theme: { ...appData.theme, ...(parsed.theme || {}) }
    };
  } catch {}
}
renderAllUI();
updateBottomSafePadding();

if (getFirebaseBaseUrl()) {
  pullDataFromFirebase(false);
}
