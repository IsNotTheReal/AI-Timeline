/**
 * ═══════════════════════════════════════════════════════════
 * AI TIMELINES — app.js
 * ═══════════════════════════════════════════════════════════
 *
 * Reads the TIMELINES array from data/timelines.js and
 * renders the full UI dynamically. You should rarely need
 * to edit this file — all content lives in data/timelines.js.
 *
 * MODULE OVERVIEW
 * ───────────────
 * render.buildHeader()   — creates the fixed nav header
 * render.buildSection()  — creates one full section (hero + timeline)
 * render.buildHero()     — creates the hero area of a section
 * render.buildTimeline() — creates the timeline from events data
 * render.buildEvent()    — creates one event card row
 *
 * nav.switchTo(id)       — activates a section, resets animations
 *
 * observer               — IntersectionObserver for scroll-in animations
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

/* ── UTILITIES ── */

/** Escape HTML special characters in text content. */
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Group an array of events by their `year` property.
 * Returns an array of [year, events[]] pairs, sorted ascending.
 */
function groupByYear(events) {
  const map = new Map();
  events.forEach(ev => {
    if (!map.has(ev.year)) map.set(ev.year, []);
    map.get(ev.year).push(ev);
  });
  return [...map.entries()].sort((a, b) => a[0] - b[0]);
}


/* ── SCROLL OBSERVER ── */

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('vis');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

/** Register all [data-obs] elements inside a section with the observer. */
function observeSection(sectionEl) {
  sectionEl.querySelectorAll('[data-obs]').forEach(el => observer.observe(el));
}

/** Unregister and reset animation state for [data-obs] elements. */
function resetSection(sectionEl) {
  sectionEl.querySelectorAll('[data-obs]').forEach(el => {
    el.classList.remove('vis');
    observer.unobserve(el);
  });
}


/* ── RENDER ── */

const render = {

  /**
   * Build and inject the fixed header + nav into #app-header.
   * Called once on page load.
   */
  buildHeader() {
    const header = document.getElementById('app-header');

    const nav = TIMELINES.map((tl, i) =>
      `<button class="nav-btn${i === 0 ? ' active' : ''}" data-section="${tl.id}">
        ${escHtml(tl.label)}
      </button>`
    ).join('');

    header.innerHTML = `
      <header>
        <div class="brand">AI <em>//</em> Timelines</div>
        <nav id="nav">${nav}</nav>
      </header>`;

    // Attach click handlers
    header.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => nav_module.switchTo(btn.dataset.section));
    });
  },

  /**
   * Build one full <section> element for a timeline category.
   * @param {object} tl - timeline data object from TIMELINES
   * @param {boolean} isFirst - whether to add 'active' class
   * @returns {HTMLElement}
   */
  buildSection(tl, isFirst) {
    const section = document.createElement('section');
    section.id = `sec-${tl.id}`;
    section.className = `section${isFirst ? ' active' : ''}`;

    section.appendChild(this.buildHero(tl));

    const divider = document.createElement('div');
    divider.className = 'section-divider';
    section.appendChild(divider);

    section.appendChild(this.buildTimeline(tl));

    return section;
  },

  /**
   * Build the hero area of a section.
   */
  buildHero(tl) {
    const hero = document.createElement('div');
    hero.className = 'hero';

    // Inline gradient using the category's rgbColor
    hero.innerHTML = `
      <div class="hero-bg" style="background: radial-gradient(ellipse 70% 60% at 40% 90%, rgba(${tl.rgbColor},0.08) 0%, transparent 70%);"></div>
      <div class="hero-eyebrow" style="color:${tl.color}">${escHtml(tl.eyebrow)}</div>
      <h1 class="hero-title">${tl.titleHtml}</h1>
      <p class="hero-desc">${escHtml(tl.desc)}</p>
      <div class="hero-count">${tl.events.length}</div>`;

    return hero;
  },

  /**
   * Build the full timeline (spine + year groups + events).
   */
  buildTimeline(tl) {
    const wrap = document.createElement('div');
    wrap.className = 'timeline-wrap';

    const spine = document.createElement('div');
    spine.className = 'tl-spine';
    wrap.appendChild(spine);

    const groups = groupByYear(tl.events);
    let globalIndex = 0; // used to alternate left/right

    groups.forEach(([year, events]) => {
      // Year label
      const yearEl = document.createElement('div');
      yearEl.className = 'tl-year';
      yearEl.setAttribute('data-obs', '');
      yearEl.innerHTML = `<div class="tl-year-label">${year}</div>`;
      wrap.appendChild(yearEl);

      // Events
      events.forEach(ev => {
        const side = globalIndex % 2 === 0 ? 'left' : 'right';
        wrap.appendChild(this.buildEvent(ev, side));
        globalIndex++;
      });
    });

    return wrap;
  },

  /**
   * Build one event row (card + node + void).
   * @param {object} ev   - event data
   * @param {string} side - 'left' | 'right'
   */
  buildEvent(ev, side) {
    const row = document.createElement('div');
    row.className = `tl-event ${side}${ev.milestone ? ' milestone' : ''}`;
    row.style.setProperty('--accent', ev.accent);
    row.setAttribute('data-obs', '');

    const card = `
      <div class="tl-card">
        <div class="card-date">${escHtml(ev.date)}</div>
        <div class="card-title">${escHtml(ev.title)}</div>
        <div class="card-sub">${escHtml(ev.sub)}</div>
        <p class="card-desc">${escHtml(ev.desc)}</p>
        <div class="card-tag">${escHtml(ev.tag)}</div>
      </div>`;

    const node = `
      <div class="tl-node">
        <div class="node-ring"><div class="node-dot"></div></div>
      </div>`;

    const voidEl = `<div class="tl-void"></div>`;

    if (side === 'left') {
      row.innerHTML = card + node + voidEl;
    } else {
      row.innerHTML = voidEl + node + card;
    }

    return row;
  },
};


/* ── NAVIGATION ── */

const nav_module = {

  /**
   * Switch the visible section to the one matching `id`.
   * Handles: hide old → show new → reset + re-observe animations.
   */
  switchTo(id) {
    const allSections = document.querySelectorAll('.section');
    const allBtns     = document.querySelectorAll('.nav-btn');

    // Deactivate all
    allSections.forEach(s => {
      s.classList.remove('active', 'fade-in');
      resetSection(s);
    });
    allBtns.forEach(b => b.classList.remove('active'));

    // Activate target
    const target = document.getElementById(`sec-${id}`);
    const btn    = document.querySelector(`.nav-btn[data-section="${id}"]`);
    if (!target || !btn) return;

    target.classList.add('active');
    btn.classList.add('active');

    // Double rAF ensures display:block has rendered before opacity transition
    requestAnimationFrame(() => requestAnimationFrame(() => {
      target.classList.add('fade-in');
      observeSection(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
  },
};


/* ── INIT ── */

function init() {
  // Build header
  render.buildHeader();

  // Build all sections and append to main
  const main = document.getElementById('app-main');
  TIMELINES.forEach((tl, i) => {
    const section = render.buildSection(tl, i === 0);
    main.appendChild(section);
  });

  // Activate first section + observe its elements
  const firstSection = document.getElementById(`sec-${TIMELINES[0].id}`);
  if (firstSection) {
    firstSection.classList.add('fade-in');
    observeSection(firstSection);
  }
}

// Run after DOM is ready
document.addEventListener('DOMContentLoaded', init);
