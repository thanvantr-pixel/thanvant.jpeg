/**
 * =========================================================
 * THANVANT R — Photography Portfolio
 * main.js — Complete Site Logic
 * =========================================================
 */

'use strict';

/* ─── Gallery Configuration ──────────────────────────────
 * HOW TO UPDATE:
 * When you add new photos to a gallery folder, update the
 * number below to match how many images you have uploaded.
 *
 * Naming convention: wildlife-1.jpg, wildlife-2.jpg ...
 * ──────────────────────────────────────────────────────── */
const GALLERY_COUNTS = {
  wildlife:  12,   // ← Update this number after uploading images
  events:    9,
  portraits: 0,
  macro:     4,
  nature:    0,
  home:      0    // Featured images on homepage (images/home/home-1.jpg …)
};

/* Maximum number of images the auto-detector will try to load */
const MAX_GALLERY_PROBE = 60;

/* ─── Page Loader ────────────────────────────────────────── */
function initLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 450);
  });
  // Fallback: hide after 2.8 s regardless
  setTimeout(() => loader.classList.add('hidden'), 2800);
}

/* ─── Navbar ─────────────────────────────────────────────── */
function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const toggle  = document.querySelector('.nav-toggle');
  const drawer  = document.querySelector('.nav-drawer');
  if (!navbar) return;

  // Scroll state
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('open');
      drawer.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    // Close on link click
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        drawer.classList.remove('open');
        toggle.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
      });
    });
  }

  // Active link highlighting
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ─── Scroll Reveal ──────────────────────────────────────── */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach(el => observer.observe(el));
}

/* ─── Lazy Image Loading ─────────────────────────────────── */
function initLazyImages() {
  const images = document.querySelectorAll('img[data-src]');
  if (!images.length) return;

  if (!('IntersectionObserver' in window)) {
    images.forEach(img => { img.src = img.dataset.src; });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
        observer.unobserve(img);
      });
    },
    { rootMargin: '200px 0px' }
  );
  images.forEach(img => observer.observe(img));
}

/* ─── Lightbox ───────────────────────────────────────────── */
const LightboxState = {
  images: [],
  currentIndex: 0
};

function openLightbox(images, index = 0) {
  LightboxState.images = images;
  LightboxState.currentIndex = index;
  renderLightboxImage();
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}

function renderLightboxImage() {
  const lb   = document.getElementById('lightbox');
  const img  = lb.querySelector('.lightbox-img');
  const ctr  = lb.querySelector('.lightbox-counter');
  const { images, currentIndex } = LightboxState;

  if (!img) return;

  // Swap with fade
  img.style.opacity = '0';
  img.style.transform = 'scale(0.96)';

  const newSrc = images[currentIndex];
  const tempImg = new Image();
  tempImg.onload = () => {
    img.src = newSrc;
    img.alt = `Photo ${currentIndex + 1}`;
    requestAnimationFrame(() => {
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
    });
  };
  tempImg.onerror = () => {
    img.src = newSrc; // Try anyway
  };
  tempImg.src = newSrc;

  if (ctr) {
    ctr.innerHTML = `<strong>${currentIndex + 1}</strong> / ${images.length}`;
  }
}

function lightboxPrev() {
  const { images } = LightboxState;
  LightboxState.currentIndex = (LightboxState.currentIndex - 1 + images.length) % images.length;
  renderLightboxImage();
}

function lightboxNext() {
  const { images } = LightboxState;
  LightboxState.currentIndex = (LightboxState.currentIndex + 1) % images.length;
  renderLightboxImage();
}

function initLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  lb.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  lb.querySelector('.lightbox-prev')?.addEventListener('click', lightboxPrev);
  lb.querySelector('.lightbox-next')?.addEventListener('click', lightboxNext);

  // Close on backdrop click
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   lightboxPrev();
    if (e.key === 'ArrowRight')  lightboxNext();
  });

  // Touch swipe support
  let touchStartX = 0;
  lb.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend',   (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? lightboxNext() : lightboxPrev();
    }
  });
}

/* ─── Image Auto-Detector ────────────────────────────────── */
/**
 * Probes for images named {prefix}-1.jpg through {prefix}-N.jpg
 * Stops when it hits `maxConsecutiveMisses` consecutive 404s.
 * Falls back to placeholder display if count = 0.
 */
function probeAndLoadGallery({
  containerId,
  folder,
  prefix,
  configCount = 0,
  basePath = '../images',
  maxProbe = MAX_GALLERY_PROBE,
  onComplete
}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Show loading state
  container.innerHTML = buildLoadingHTML();

  // If config count is specified and > 0, use it directly (faster)
  if (configCount > 0) {
    const srcList = [];
    for (let i = 1; i <= Math.min(configCount, 50); i++) {
      srcList.push(`${basePath}/${folder}/${prefix}-${i}.jpg`);
    }
    renderGallery(container, srcList, onComplete);
    return;
  }

  // Auto-probe mode
  const srcList = [];
  let checked = 0;
  let found = 0;
  let consecutiveMisses = 0;
  const MAX_CONSECUTIVE_MISS = 3;

  function checkImage(index) {
    if (consecutiveMisses >= MAX_CONSECUTIVE_MISS || index > maxProbe) {
      // Done probing
      if (srcList.length === 0) {
        showEmptyState(container, folder);
      } else {
        renderGallery(container, srcList, onComplete);
      }
      return;
    }

    const img = new Image();
    const src = `${basePath}/${folder}/${prefix}-${index}.jpg`;

    img.onload = () => {
      srcList.push(src);
      found++;
      consecutiveMisses = 0;
      checkImage(index + 1);
    };
    img.onerror = () => {
      consecutiveMisses++;
      checkImage(index + 1);
    };
    img.src = src;
  }

  checkImage(1);
}

function renderGallery(container, srcList, onComplete) {
  if (!container) return;
  const allSrcs = [...srcList];

  container.innerHTML = allSrcs.map((src, i) => `
    <div class="masonry-item reveal" data-index="${i}" style="transition-delay:${Math.min(i * 0.04, 0.5)}s">
      <img
        data-src="${src}"
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E"
        alt="Photo ${i + 1}"
        loading="lazy"
        decoding="async"
      >
      <div class="masonry-item-overlay">
        <div class="masonry-zoom-icon">
          ${ICON_EXPAND}
        </div>
      </div>
    </div>
  `).join('');

  // Bind lightbox clicks
  container.querySelectorAll('.masonry-item').forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(allSrcs, i));
  });

  // Trigger lazy load + reveal for newly added items
  initLazyImages();
  setTimeout(initScrollReveal, 50);

  if (typeof onComplete === 'function') onComplete(allSrcs.length);
}

function showEmptyState(container, folder) {
  container.innerHTML = `
    <div class="gallery-empty">
      ${ICON_CAMERA_LARGE}
      <h3>Gallery Coming Soon</h3>
      <p>
        Upload your <strong>${folder}</strong> photos to<br>
        <code>images/${folder}/${folder}-1.jpg</code><br>
        and they will appear here automatically.
      </p>
    </div>
  `;
}

function buildLoadingHTML() {
  return `<div class="gallery-loading"><span></span><span></span><span></span></div>`;
}

/* ─── Featured Home Gallery ──────────────────────────────── */
function initHomeFeaturedGallery() {
  const grid = document.getElementById('home-gallery-grid');
  if (!grid) return;

  const count = GALLERY_COUNTS.home;
  const allSrcs = [];

  // Build from home folder, or show decorative placeholders
  for (let i = 1; i <= 15; i++) {
    allSrcs.push(`images/home/home-${i}.jpg`);
  }

  // Inject images (they'll lazy load)
  grid.querySelectorAll('.g-item').forEach((item, i) => {
    const src = allSrcs[i];
    if (!src) return;

    // Replace placeholder with real image (lazy)
    const placeholder = item.querySelector('.g-placeholder');
    if (placeholder) placeholder.remove();

    const label = item.dataset.label || 'Photography';
    item.innerHTML = `
      <img
        data-src="${src}"
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'%3E%3C/svg%3E"
        alt="Featured photo ${i + 1}"
        loading="lazy"
        decoding="async"
      >
      <div class="g-item-overlay">
        <span class="g-item-label">${label}</span>
      </div>
    `;
    item.addEventListener('click', () => openLightbox(allSrcs, i));
  });

  initLazyImages();
}

/* ─── Contact Form (Formspree) ───────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn     = form.querySelector('.form-submit');
    const success = form.querySelector('.form-success');
    const origTxt = btn.textContent;

    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.reset();
        if (success) {
          form.style.display = 'none';
          success.classList.add('show');
        }
      } else {
        btn.disabled = false;
        btn.textContent = origTxt;
        alert('Oops! There was a problem submitting. Please try emailing directly.');
      }
    } catch (err) {
      btn.disabled = false;
      btn.textContent = origTxt;
      alert('Network error. Please try emailing thanvantr@gmail.com directly.');
    }
  });
}

/* ─── SVG Icon Constants ─────────────────────────────────── */
const ICON_EXPAND = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/></svg>`;

const ICON_CAMERA_LARGE = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1" width="64" height="64"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"/></svg>`;

/* ─── Specific Page Initializers ─────────────────────────── */

// Wildlife gallery page
function initWildlifeGallery() {
  probeAndLoadGallery({
    containerId: 'gallery-container',
    folder: 'wildlife',
    prefix: 'wildlife',
    configCount: GALLERY_COUNTS.wildlife,
    basePath: 'images'
  });
}

// Events gallery page
function initEventsGallery() {
  probeAndLoadGallery({
    containerId: 'gallery-container',
    folder: 'events',
    prefix: 'events',
    configCount: GALLERY_COUNTS.events,
    basePath: 'images'
  });
}

// Portraits gallery page
function initPortraitsGallery() {
  probeAndLoadGallery({
    containerId: 'gallery-container',
    folder: 'portraits',
    prefix: 'portraits',
    configCount: GALLERY_COUNTS.portraits,
    basePath: 'images'
  });
}

// Macro gallery page
function initMacroGallery() {
  probeAndLoadGallery({
    containerId: 'gallery-container',
    folder: 'macro',
    prefix: 'macro',
    configCount: GALLERY_COUNTS.macro,
    basePath: 'images'
  });
}

// Nature gallery page
function initNatureGallery() {
  probeAndLoadGallery({
    containerId: 'gallery-container',
    folder: 'nature',
    prefix: 'nature',
    configCount: GALLERY_COUNTS.nature,
    basePath: 'images'
  });
}

/* ─── Page Router ────────────────────────────────────────── */
function detectAndInitPage() {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  switch (true) {
    case page === '' || page === 'index.html':
      initHomeFeaturedGallery();
      break;
    case page.includes('wildlife'):
      initWildlifeGallery();
      break;
    case page.includes('events'):
      initEventsGallery();
      break;
    case page.includes('portraits'):
      initPortraitsGallery();
      break;
    case page.includes('macro'):
      initMacroGallery();
      break;
    case page.includes('nature'):
      initNatureGallery();
      break;
    default:
      break;
  }
}

/* ─── DOM Ready ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initNavbar();
  initLightbox();
  initScrollReveal();
  initLazyImages();
  initContactForm();
  detectAndInitPage();
});
