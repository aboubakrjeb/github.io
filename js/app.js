// Page behaviour. The texts live in js/i18n.js (loaded first, defines `translations`).
// Each language has its own pre-rendered page (/, /en/, /ar/), so nothing is translated
// here except the texts that change at runtime.

const SUPPORTED_LANGS = ['nl', 'ar', 'en'];

function get_lang() {
    const lang = document.documentElement.getAttribute('lang');
    return SUPPORTED_LANGS.includes(lang) ? lang : 'nl';
}

function get_dict() {
    return translations[get_lang()] || translations.nl;
}

function toggle_theme() {
    const root = document.documentElement;
    const new_theme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', new_theme);
    try {
        localStorage.setItem('theme', new_theme);
    } catch (e) {
        // Storage can be blocked (private window); the toggle still works for this visit.
    }
}

// Footer: the current year (the HTML keeps a fallback)
function fill_year() {
    const year = document.querySelector('.year');
    if (year) year.textContent = new Date().getFullYear();
}

function set_lang_menu_open(open) {
    const lang_switch = document.querySelector('.lang-switch');
    const lang_toggle_btn = document.querySelector('.lang-toggle');
    if (!lang_switch || !lang_toggle_btn) return;
    lang_switch.classList.toggle('open', open);
    lang_toggle_btn.setAttribute('aria-expanded', open);
}

// Before/after sliders: the range input lies invisibly over the images, so
// dragging (or the arrow keys) moves the line between them.
function init_compare_sliders() {
    document.querySelectorAll('.compare').forEach((compare) => {
        const range = compare.querySelector('.compare-range');
        const update = () => compare.style.setProperty('--pos', range.value + '%');
        range.addEventListener('input', update);
        update();
    });
}

// Budget slider: the build packages from the highest minimum down.
// Keep these minimums in line with the prices in index.html and js/i18n.js.
const BUDGET_TIERS = [
    { min: 750, id: 'maatwerk', title: 'pkgCustomTitle' },
    { min: 500, id: 'webshop', title: 'pkgShopTitle' },
    { min: 250, id: 'basis', title: 'pkgBasisTitle' },
];

function budget_tier(value) {
    return BUDGET_TIERS.find((tier) => value >= tier.min) || BUDGET_TIERS[BUDGET_TIERS.length - 1];
}

// Western digits in every language, like the other prices on the site
function format_euro(value, lang) {
    return '€' + value.toLocaleString(lang === 'nl' ? 'nl-NL' : 'en-US');
}

function update_budget() {
    const budget = document.querySelector('.budget');
    if (!budget || budget.hidden) return;

    const lang = get_lang();
    const dict = get_dict();
    const range = budget.querySelector('.budget-range');
    const value = Number(range.value);
    const min = Number(range.min);
    const max = Number(range.max);
    // The far end has no amount: bigger budgets are "in overleg"
    const is_open = value >= max;
    const tier = budget_tier(value);
    const package_name = dict[tier.title];
    const amount = format_euro(value, lang);
    const shown = is_open ? dict.budgetOpen : amount;

    budget.querySelector('.budget-value').textContent = shown;
    budget.querySelector('.budget-match').innerHTML = dict.budgetMatch.replace('{package}', package_name);
    range.setAttribute('aria-valuetext', dict.budgetValueText.replace('{budget}', shown).replace('{package}', package_name));
    range.style.setProperty('--fill', ((value - min) / (max - min)) * 100 + '%');

    const subject = is_open
        ? dict.budgetMailSubjectOpen.replace('{package}', package_name)
        : dict.budgetMailSubject.replace('{package}', package_name).replace('{budget}', amount);
    budget.querySelector('.budget-cta').href = 'mailto:info@chamaliwebsolutions.nl?subject=' + encodeURIComponent(subject);

    document.querySelectorAll('.packages-build .package').forEach((card) => {
        card.classList.toggle('is-match', card.getAttribute('data-package') === tier.id);
    });
}

// The slider is hidden in the HTML, so visitors without JavaScript never see a dead control
function init_budget_slider() {
    const budget = document.querySelector('.budget');
    if (!budget) return;
    budget.hidden = false;
    budget.querySelector('.budget-range').addEventListener('input', update_budget);
    update_budget();
}

// Highlight the nav link of the section that crosses the middle of the screen
function init_active_nav() {
    if (!('IntersectionObserver' in window)) return;
    const links = new Map();
    document.querySelectorAll('.nav-links a[href^="#"]').forEach((link) => {
        const section = document.querySelector(link.getAttribute('href'));
        if (section) links.set(section, link);
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const link = links.get(entry.target);
            if (link) link.classList.toggle('is-active', entry.isIntersecting);
        });
    }, { rootMargin: '-50% 0px -50% 0px' });

    links.forEach((_, section) => observer.observe(section));
}

function set_nav_open(open) {
    document.documentElement.classList.toggle('nav-open', open);
    const nav_toggle_btn = document.querySelector('.nav-toggle');
    if (nav_toggle_btn) nav_toggle_btn.setAttribute('aria-expanded', open);
}

window.addEventListener('DOMContentLoaded', () => {
    fill_year();
    init_compare_sliders();
    init_budget_slider();
    init_active_nav();

    const theme_toggle_btn = document.querySelector('.theme-toggle');
    if (theme_toggle_btn) theme_toggle_btn.addEventListener('click', toggle_theme);

    // Language dropdown: a button that shows links to the three language pages
    const lang_toggle_btn = document.querySelector('.lang-toggle');
    const lang_switch = document.querySelector('.lang-switch');
    if (lang_toggle_btn && lang_switch) {
        lang_toggle_btn.addEventListener('click', (event) => {
            event.stopPropagation();
            set_lang_menu_open(!lang_switch.classList.contains('open'));
        });

        document.addEventListener('click', (event) => {
            if (!lang_switch.contains(event.target)) set_lang_menu_open(false);
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        set_nav_open(false);
        set_lang_menu_open(false);
    });

    // Offcanvas menu (tablet and smaller)
    const nav_toggle_btn = document.querySelector('.nav-toggle');
    if (!nav_toggle_btn) return;

    nav_toggle_btn.addEventListener('click', () => {
        set_nav_open(!document.documentElement.classList.contains('nav-open'));
    });

    document.querySelector('.nav-backdrop').addEventListener('click', () => set_nav_open(false));
    document.querySelectorAll('.nav-links a').forEach((link) => {
        link.addEventListener('click', () => set_nav_open(false));
    });

    // Close the menu when the window grows to the desktop layout
    window.matchMedia('(min-width: 992px)').addEventListener('change', () => set_nav_open(false));
});
