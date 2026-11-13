#!/usr/bin/env node
// Builds the English and Arabic pages from the Dutch source page.
//
//   node tools/build-i18n.mjs
//
// Reads index.html (Dutch) and js/i18n.js (all texts) and writes en/index.html and ar/index.html,
// so every language has its own URL that search engines can index. No dependencies.
// The build stops when a translation key is missing; it warns when the Dutch text in
// index.html no longer matches js/i18n.js.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://chamaliwebsolutions.nl';
const PAGES = {
    en: { path: '/en/', locale: 'en_GB', dir: 'ltr' },
    ar: { path: '/ar/', locale: 'ar_AR', dir: 'rtl' },
};

const read = (file) => readFileSync(join(ROOT, file), 'utf8');
const translations = new Function(read('js/i18n.js') + '\nreturn translations;')();
const source = read('index.html');

// ---------- Checks ----------
const problems = [];
const keys_in_html = new Set(
    [...source.matchAll(/\sdata-i18n(?:-alt|-aria-label)?="([^"]+)"/g)].map((m) => m[1]),
);
const nl_keys = Object.keys(translations.nl);
for (const [lang, dict] of Object.entries(translations)) {
    for (const key of keys_in_html) {
        if (!(key in dict)) problems.push(`${lang}: key "${key}" from index.html is missing`);
    }
    for (const key of nl_keys) {
        if (!(key in dict)) problems.push(`${lang}: key "${key}" exists in nl but not here`);
    }
    for (const key of Object.keys(dict)) {
        if (!nl_keys.includes(key)) problems.push(`${lang}: key "${key}" does not exist in nl`);
    }
}
if (problems.length) {
    console.error('Translation problems:\n  ' + problems.join('\n  '));
    process.exit(1);
}

// ---------- HTML helpers ----------
// Index just past the closing tag that matches the element opened right before `from`,
// counting nested elements with the same tag name.
function find_close(html, tag, from) {
    const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
    re.lastIndex = from;
    let depth = 1;
    let m;
    while ((m = re.exec(html))) {
        if (m[1]) {
            depth -= 1;
            if (depth === 0) return m.index;
        } else if (!m[0].endsWith('/>')) {
            depth += 1;
        }
    }
    throw new Error(`No closing </${tag}> found after position ${from}`);
}

// Calls fn(key, current_inner_html) for every element with data-i18n and puts back what it returns
function map_i18n_elements(html, fn) {
    const open_re = /<([a-z][a-z0-9]*)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>/gi;
    let out = '';
    let last = 0;
    let m;
    while ((m = open_re.exec(html))) {
        const content_start = m.index + m[0].length;
        const content_end = find_close(html, m[1], content_start);
        out += html.slice(last, content_start) + fn(m[2], html.slice(content_start, content_end));
        last = content_end;
        open_re.lastIndex = content_end;
    }
    return out + html.slice(last);
}

// Values in i18n.js are HTML, so only double quotes need escaping inside an attribute
const attr = (value) => value.replace(/"/g, '&quot;');

function set_attr_from_key(html, data_attr, target_attr, dict) {
    const re = new RegExp(`<[a-z][^>]*\\s${data_attr}="([^"]+)"[^>]*>`, 'gi');
    return html.replace(re, (tag, key) => {
        const value = attr(dict[key]);
        const existing = new RegExp(`(\\s${target_attr}=")[^"]*(")`);
        return existing.test(tag)
            ? tag.replace(existing, `$1${value}$2`)
            : tag.replace(/\s*\/?>$/, (end) => ` ${target_attr}="${value}"${end}`);
    });
}

function replace_once(html, re, replacement, label) {
    if (!re.test(html)) throw new Error(`Could not find ${label} in index.html`);
    return html.replace(re, replacement);
}

// ---------- Dutch sync check (warning only) ----------
const normalise = (text) => text.replace(/\s+/g, ' ').trim();
map_i18n_elements(source, (key, inner) => {
    if (normalise(inner) !== normalise(translations.nl[key])) {
        console.warn(`warning: Dutch text of "${key}" in index.html differs from js/i18n.js`);
    }
    return inner;
});

// ---------- Build ----------
for (const [lang, page] of Object.entries(PAGES)) {
    const dict = translations[lang];
    const url = SITE + page.path;
    let html = source;

    html = map_i18n_elements(html, (key) => dict[key]);
    html = set_attr_from_key(html, 'data-i18n-aria-label', 'aria-label', dict);
    html = set_attr_from_key(html, 'data-i18n-alt', 'alt', dict);

    html = replace_once(html, /<html lang="nl" dir="ltr">/, `<html lang="${lang}" dir="${page.dir}">`, '<html>');
    html = replace_once(html, /<title>[^<]*<\/title>/, `<title>${dict.pageTitle}</title>`, '<title>');
    html = replace_once(html, /(<meta name="description" content=")[^"]*(")/, `$1${attr(dict.metaDescription)}$2`, 'meta description');
    html = replace_once(html, /(<meta property="og:title" content=")[^"]*(")/, `$1${attr(dict.pageTitle)}$2`, 'og:title');
    html = replace_once(html, /(<meta property="og:description" content=")[^"]*(")/, `$1${attr(dict.metaDescription)}$2`, 'og:description');
    html = replace_once(html, /(<meta name="twitter:title" content=")[^"]*(")/, `$1${attr(dict.pageTitle)}$2`, 'twitter:title');
    html = replace_once(html, /(<meta name="twitter:description" content=")[^"]*(")/, `$1${attr(dict.metaDescription)}$2`, 'twitter:description');
    html = replace_once(html, /(<meta property="og:locale" content=")[^"]*(")/, `$1${page.locale}$2`, 'og:locale');
    html = replace_once(html, /(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`, 'og:url');
    html = replace_once(html, /(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`, 'canonical');

    // The page sits one folder deeper: ./css/… becomes ../css/…, and the language
    // links ./ ./en/ ./ar/ become ../ ../en/ ../ar/, which still point to the right pages.
    html = html.replace(/(\s(?:href|src)=")\.\//g, '$1../');

    // The current language is marked in the language menu
    html = html.replace(/(<a class="lang-option"[^>]*?)\s+aria-current="page"/g, '$1');
    html = replace_once(
        html,
        new RegExp(`(<a class="lang-option"[^>]*hreflang="${lang}"[^>]*?)>`),
        '$1 aria-current="page">',
        `language link for ${lang}`,
    );

    const notice = `<!-- Generated by tools/build-i18n.mjs from index.html and js/i18n.js. Do not edit; edit those and rebuild. -->\n`;
    html = html.replace(/^<!DOCTYPE html>\n/, (doctype) => doctype + notice);

    mkdirSync(join(ROOT, lang), { recursive: true });
    writeFileSync(join(ROOT, lang, 'index.html'), html);
    console.log(`wrote ${lang}/index.html`);
}
