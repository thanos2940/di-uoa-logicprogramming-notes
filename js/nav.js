// Immediately set theme to avoid visual flashing
document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');

/**
 * nav.js - Modular Navigation for WebNotes
 *
 * 📝 SETUP INSTRUCTIONS FOR THE AGENT:
 *
 * Edit the `topics` array below to list every chapter in this course.
 * Each entry needs:
 *   - id:    unique short identifier (e.g. 'topic1', 'algos', 'graphs')
 *   - title: short name shown in the nav bar (3-4 words max)
 *   - path:  filename of the chapter HTML (e.g. 'topic1_intro.html')
 *   - icon:  single emoji to show next to the title
 *
 * The 'index' entry (Home) and 'quiz' entry (Interactive Quiz) should
 * remain at the start/end. Add chapter entries between them in order.
 */

const topics = [
    { id: 'index', title: 'Home', path: 'index.html', icon: '🏠' },
    { id: 'intro_prolog', title: 'Εισαγωγή', path: 'topic1_intro_prolog.html', icon: '🧠' },
    { id: 'lists_and_cut', title: 'Λίστες & Cut', path: 'topic2_lists_and_cut.html', icon: '📝' },
    { id: 'trees_graphs_search', title: 'Δέντρα & Γράφοι', path: 'topic3_trees_graphs_search.html', icon: '🌳' },
    { id: 'logic_theory_semantics', title: 'Θεωρία & Σημασιολογία', path: 'topic4_logic_theory_semantics.html', icon: '∀' },
    { id: 'advanced_programming', title: 'Προχωρημένος Προγραμματισμός', path: 'topic5_advanced_programming.html', icon: '⚙️' },
    { id: 'semantic_web', title: 'Λογική & Semantic Web', path: 'topic6_semantic_web.html', icon: '🌐' },
    { id: 'quiz', title: 'Interactive Quiz', path: 'interactive_quiz.html', icon: '📝' }
];

function initNav() {
    const navContainer = document.getElementById('site-nav');
    if (!navContainer) return;

    // Detect if we are inside the _build directory
    const isInBuild = window.location.pathname.includes('/_build/');
    const rootPrefix = isInBuild ? '../' : '';
    const buildPrefix = isInBuild ? '' : '_build/';

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    const logo = document.createElement('a');
    logo.href = rootPrefix + 'index.html';
    logo.className = 'nav-logo';
    logo.innerHTML = `<span>⚡</span> Course Notes`;

    const linksContainer = document.createElement('div');
    linksContainer.className = 'nav-links';

    topics.forEach(topic => {
        const link = document.createElement('a');
        
        // Adjust path based on topic type and current location
        let finalPath = topic.path;
        if (topic.id === 'index' || topic.id === 'quiz') {
            finalPath = rootPrefix + topic.path;
        } else {
            finalPath = buildPrefix + topic.path;
        }

        link.href = finalPath;
        link.className = 'nav-link';
        if (currentPath === topic.path) {
            link.classList.add('active');
        }
        link.title = topic.title;
        link.innerHTML = `<span>${topic.icon}</span> ${topic.title}`;
        linksContainer.appendChild(link);
    });

    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper';
    navWrapper.appendChild(logo);
    navWrapper.appendChild(linksContainer);

    navContainer.appendChild(navWrapper);
}

// Simple search for the index page
function initSearch() {
    const searchInput = document.getElementById('topic-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.topic-card');
        cards.forEach(card => {
            const text = card.innerText.toLowerCase();
            card.style.display = text.includes(term) ? '' : 'none';
        });
    });
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

document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initTheme();
    initSearch();
});
