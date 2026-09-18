// Immediately set theme to avoid visual flashing
document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');

/**
 * nav_exam.js - Minimal navigation for the EXAM-PREP crash course.
 *
 * This is intentionally separate from nav.js (the full course notes nav).
 * It lists ONLY the focused 1-2 day exam-prep pages. The original chapter
 * pages and their nav.js are left completely untouched and remain reachable
 * via full_notes.html.
 *
 * Entries marked root:true live at the site root; the rest live in _build/.
 */

const topics = [
    { id: 'index',     title: 'Πλάνο',        path: 'index.html',                  icon: '🎯', root: true },
    { id: 'theme1',    title: 'Θέμα 1 · Prolog',   path: 'exam_theme1_prolog.html'   , icon: '💻' },
    { id: 'drill1',    title: 'Θ1 · Προπόνηση',    path: 'exam_theme1_practice.html' , icon: '🏋️' },
    { id: 'theme2',    title: 'Θέμα 2 · CSP',      path: 'exam_theme2_csp.html'      , icon: '🧩' },
    { id: 'theme3',    title: 'Θέμα 3 · Herbrand', path: 'exam_theme3_herbrand.html' , icon: '∀'  },
    { id: 'theme4',    title: 'Θέμα 4 · Γνώση',    path: 'exam_theme4_kr.html'       , icon: '🕸️' },
    { id: 'cheat',     title: 'Cheat-sheet',       path: 'exam_cheatsheet.html'      , icon: '📋' },
    { id: 'full',      title: 'Πλήρεις Σημειώσεις', path: 'full_notes.html',            icon: '📚', root: true }
];

function initNav() {
    const navContainer = document.getElementById('site-nav');
    if (!navContainer) return;

    const isInBuild = window.location.pathname.includes('/_build/');
    const rootPrefix = isInBuild ? '../' : '';
    const buildPrefix = isInBuild ? '' : '_build/';

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    const logo = document.createElement('a');
    logo.href = rootPrefix + 'index.html';
    logo.className = 'nav-logo';
    logo.innerHTML = `<span>⚡</span> Exam Prep`;

    const linksContainer = document.createElement('div');
    linksContainer.className = 'nav-links';

    topics.forEach(topic => {
        const link = document.createElement('a');
        link.href = topic.root ? (rootPrefix + topic.path) : (buildPrefix + topic.path);
        link.className = 'nav-link';
        if (currentPath === topic.path) link.classList.add('active');
        link.title = topic.title;
        link.innerHTML = `<span>${topic.icon}</span> ${topic.title}`;
        linksContainer.appendChild(link);
    });

    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper';
    navWrapper.appendChild(logo);

    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger-btn';
    hamburger.innerHTML = '☰';
    hamburger.setAttribute('aria-label', 'Toggle Menu');

    const toggleMenu = () => {
        linksContainer.classList.toggle('show');
        overlay.classList.toggle('show');
    };

    hamburger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    navWrapper.appendChild(hamburger);
    navWrapper.appendChild(linksContainer);
    navContainer.appendChild(navWrapper);
}

function initTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const linksContainer = document.querySelector('.nav-links');
    if (!linksContainer) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'theme-toggle';
    toggleBtn.setAttribute('aria-label', 'Toggle Theme');
    toggleBtn.innerHTML = currentTheme === 'light' ? '🌙' : '☀️';

    toggleBtn.addEventListener('click', () => {
        const activeTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = activeTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        toggleBtn.innerHTML = newTheme === 'light' ? '🌙' : '☀️';
    });

    linksContainer.appendChild(toggleBtn);
}

// Simple search for the hub page
function initSearch() {
    const searchInput = document.getElementById('topic-search');
    if (!searchInput) return;
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.topic-card').forEach(card => {
            card.style.display = card.innerText.toLowerCase().includes(term) ? '' : 'none';
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initTheme();
    initSearch();
});
