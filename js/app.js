function toggle_theme() {
    const root = document.documentElement;
    const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', newTheme);
    try {
        localStorage.setItem('theme', newTheme);
    } catch (e) {
        // Storage can be blocked (private window); the toggle still works for this visit.
    }
}

function set_nav_open(open) {
    document.documentElement.classList.toggle('nav-open', open);
    const nav_toggle_btn = document.querySelector('.nav-toggle');
    if (nav_toggle_btn) nav_toggle_btn.setAttribute('aria-expanded', open);
}

window.addEventListener('DOMContentLoaded', () => {
    const year = document.querySelector('.year');
    if (year) year.innerText = new Date().getFullYear();

    const theme_toggle_btn = document.querySelector('.theme-toggle');
    if (theme_toggle_btn) theme_toggle_btn.addEventListener('click', toggle_theme);

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
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') set_nav_open(false);
    });

    // Close the menu when the window grows to the desktop layout
    window.matchMedia('(min-width: 992px)').addEventListener('change', () => set_nav_open(false));
});