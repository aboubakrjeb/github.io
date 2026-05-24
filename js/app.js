function toggle_data_bs_theme() {
    const currentTheme = document.body.getAttribute('data-bs-theme');
    let newTheme = '';
    if (currentTheme === 'dark') {
        newTheme = 'chocolate'
    }
    else if(currentTheme === 'chocolate') {
        newTheme = 'light'
    }
    else {
        newTheme = 'dark'
    }
    document.body.setAttribute('data-bs-theme', newTheme);
}

let colorSchemes = {'choclate': '#836953' }

window.addEventListener('DOMContentLoaded', () => {
    const date_ar = document.querySelector('.date-ar');
    if (date_ar) date_ar.innerText = new Date().getFullYear();

    const data_bs_theme_color_toggler_btn = document.querySelector('#data-bs-theme-color-toggler');
    if (!data_bs_theme_color_toggler_btn) {
        console.error('[data-bs-theme-color-toggler] not found!');
        return;
    }

    data_bs_theme_color_toggler_btn.addEventListener('click', toggle_data_bs_theme);
});