// Homemade Apps — language switcher
// Depends on translations.js being loaded first.

(function () {
  const SUPPORTED = window.HA_LANGUAGES.map(l => l.code);
  const DEFAULT_LANG = 'en';
  const STORAGE_KEY = 'ha_lang';
  const QUERY_KEY = 'lang';

  // Accepts anything a hand-written link might carry: es, ES, es-MX, pt_BR.
  function normalize(code) {
    const base = (code || '').trim().toLowerCase().split(/[-_]/)[0];
    return SUPPORTED.includes(base) ? base : null;
  }

  function requestedLang() {
    return normalize(new URLSearchParams(location.search).get(QUERY_KEY));
  }

  function detectLang() {
    // ?lang=fr wins over everything: the apps link out with the language
    // they're being played in, which beats a stale stored choice or a phone
    // whose system language isn't the one at the table. Remembered too, so
    // the rest of the visit stays in it.
    const requested = requestedLang();
    if (requested) {
      localStorage.setItem(STORAGE_KEY, requested);
      return requested;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
    const browser = (navigator.language || '').slice(0, 2).toLowerCase();
    return SUPPORTED.includes(browser) ? browser : DEFAULT_LANG;
  }

  function applyTranslations(lang) {
    const t = window.HA_TRANSLATIONS[lang] || window.HA_TRANSLATIONS[DEFAULT_LANG];
    const year = new Date().getFullYear();

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.textContent = t[key].replace('{year}', year);
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (t[key] !== undefined) el.innerHTML = t[key];
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (t[key] !== undefined) el.setAttribute('aria-label', t[key]);
    });

    const titleKey = document.documentElement.getAttribute('data-page') + '.meta_title';
    if (t[titleKey]) document.title = t[titleKey];

    const metaDesc = document.querySelector('meta[name="description"]');
    const descKey = document.documentElement.getAttribute('data-page') + '.meta_desc';
    if (metaDesc && t[descKey]) metaDesc.setAttribute('content', t[descKey]);
  }

  function applyLangAttrs(lang) {
    const entry = window.HA_LANGUAGES.find(l => l.code === lang) || { dir: 'ltr' };
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', entry.dir);
  }

  // Only rewrites a ?lang= that's already there. Without this the param would
  // win again on reload and undo the switch the visitor just made; clean URLs
  // are left clean so they stay shareable in whatever language the reader picks.
  function syncQueryParam(lang) {
    if (!requestedLang() || !history.replaceState) return;
    const url = new URL(location.href);
    url.searchParams.set(QUERY_KEY, lang);
    history.replaceState(null, '', url);
  }

  function initSwitcher(lang) {
    const selects = document.querySelectorAll('.lang-switcher');
    selects.forEach(sel => {
      if (sel.options.length === 0) {
        window.HA_LANGUAGES.forEach(l => {
          const opt = document.createElement('option');
          opt.value = l.code;
          opt.textContent = l.label;
          opt.setAttribute('lang', l.code);
          sel.appendChild(opt);
        });
      }
      sel.value = lang;

      sel.addEventListener('change', function () {
        const chosen = this.value;
        localStorage.setItem(STORAGE_KEY, chosen);
        syncQueryParam(chosen);
        applyLangAttrs(chosen);
        applyTranslations(chosen);
        document.querySelectorAll('.lang-switcher').forEach(s => { s.value = chosen; });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const lang = detectLang();
    applyLangAttrs(lang);
    applyTranslations(lang);
    initSwitcher(lang);
  });
})();
