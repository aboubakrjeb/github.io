addEventListener("DOMContentLoaded", (event) => {
  let date_ar = document.querySelector(".date-ar");
  console.log(date_ar);
  if (!moment() instanceof moment)
    return console.error(
      "Please add https://cdnjs.com/libraries/moment.js to your HTML!"
    );
  console.dir(moment());
  let dark_mode_toggler_btn = document.querySelector('#dark-mode-toggler-btn')
  dark_mode_toggler_btn.addEventListener('click' , () => {
    if (document.documentElement.getAttribute('data-bs-theme') == 'dark') {
        document.documentElement.setAttribute('data-bs-theme','light')
    }
    else {
        document.documentElement.setAttribute('data-bs-theme','dark')
    }
  })
});
const toggle_dark_mode = () => {
  /*!
   * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
   * Copyright 2011-2025 The Bootstrap Authors
   * Licensed under the Creative Commons Attribution 3.0 Unported License.
   */

  (() => {
    "use strict";

    const getStoredTheme = () => localStorage.getItem("theme");
    const setStoredTheme = (theme) => localStorage.setItem("theme", theme);

    const getPreferredTheme = () => {
      const storedTheme = getStoredTheme();
      if (storedTheme) {
        return storedTheme;
      }

      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    };

    const setTheme = (theme) => {
      if (theme === "auto") {
        document.documentElement.setAttribute(
          "data-bs-theme",
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
        );
      } else {
        document.documentElement.setAttribute("data-bs-theme", theme);
      }
    };

    setTheme(getPreferredTheme());

    const showActiveTheme = (theme, focus = false) => {
      const themeSwitcher = document.querySelector("#bd-theme");

      if (!themeSwitcher) {
        return;
      }

      const themeSwitcherText = document.querySelector("#bd-theme-text");
      const activeThemeIcon = document.querySelector(".theme-icon-active use");
      const btnToActive = document.querySelector(
        `[data-bs-theme-value="${theme}"]`
      );
      const svgOfActiveBtn = btnToActive
        .querySelector("svg use")
        .getAttribute("href");

      document.querySelectorAll("[data-bs-theme-value]").forEach((element) => {
        element.classList.remove("active");
        element.setAttribute("aria-pressed", "false");
      });

      btnToActive.classList.add("active");
      btnToActive.setAttribute("aria-pressed", "true");
      activeThemeIcon.setAttribute("href", svgOfActiveBtn);
      const themeSwitcherLabel = `${themeSwitcherText.textContent} (${btnToActive.dataset.bsThemeValue})`;
      themeSwitcher.setAttribute("aria-label", themeSwitcherLabel);

      if (focus) {
        themeSwitcher.focus();
      }
    };

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        const storedTheme = getStoredTheme();
        if (storedTheme !== "light" && storedTheme !== "dark") {
          setTheme(getPreferredTheme());
        }
      });

    window.addEventListener("DOMContentLoaded", () => {
      showActiveTheme(getPreferredTheme());

      document.querySelectorAll("[data-bs-theme-value]").forEach((toggle) => {
        toggle.addEventListener("click", () => {
          const theme = toggle.getAttribute("data-bs-theme-value");
          setStoredTheme(theme);
          setTheme(theme);
          showActiveTheme(theme, true);
        });
      });
    });
  })();
};
