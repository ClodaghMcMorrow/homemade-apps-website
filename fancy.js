// Homemade Apps — home page only (interactive phone, app details window).
// Load after translations.js and before lang.js: the strings below are merged
// into HA_TRANSLATIONS so lang.js translates them like any other key.

(function () {
  const STRINGS = {
    en: { hint: 'Tap an app to peek inside',         nudge: 'Tap one of the Homemade apps',            close: 'Close' },
    fr: { hint: 'Touchez une app pour en savoir plus', nudge: 'Touchez l’une des apps Homemade',        close: 'Fermer' },
    de: { hint: 'Tippe auf eine App für mehr',        nudge: 'Tippe auf eine der Homemade-Apps',        close: 'Schließen' },
    es: { hint: 'Toca una app para ver más',          nudge: 'Toca una de las apps Homemade',           close: 'Cerrar' },
    it: { hint: 'Tocca un’app per saperne di più',    nudge: 'Tocca una delle app Homemade',            close: 'Chiudi' },
    pt: { hint: 'Toque numa app para ver mais',       nudge: 'Toque numa das apps Homemade',            close: 'Fechar' },
    zh: { hint: '点按应用了解更多',                     nudge: '请点按其中一个 Homemade 应用',              close: '关闭' },
    ja: { hint: 'アプリをタップして詳しく見る',           nudge: 'Homemade のアプリをタップしてください',       close: '閉じる' },
    ko: { hint: '앱을 탭해 자세히 보기',                nudge: 'Homemade 앱 중 하나를 탭하세요',            close: '닫기' },
    hi: { hint: 'और जानने के लिए कोई ऐप टैप करें',      nudge: 'किसी एक Homemade ऐप पर टैप करें',          close: 'बंद करें' },
    ar: { hint: 'اضغط على تطبيق لمعرفة المزيد',        nudge: 'اضغط على أحد تطبيقات Homemade',           close: 'إغلاق' }
  };
  Object.keys(STRINGS).forEach(lang => {
    const t = window.HA_TRANSLATIONS && window.HA_TRANSLATIONS[lang];
    if (!t) return;
    Object.keys(STRINGS[lang]).forEach(k => { t['fancy.' + k] = STRINGS[lang][k]; });
  });

  document.addEventListener('DOMContentLoaded', function () {
    const screen = document.getElementById('deviceScreen');
    const nudge = document.getElementById('screenNudge');
    const sheet = document.getElementById('appSheet');
    if (!screen || !sheet) return;
    const device = screen.closest('.device');
    // The arrow's shimmer is SMIL, which the reduced-motion CSS can't reach
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.tap-hint-arrow animateTransform').forEach(el => el.remove());
    }
    let nudgeTimer;

    function openApp(app) {
      sheet.querySelectorAll('.app-sheet-panel').forEach(p => { p.hidden = p.dataset.app !== app; });
      nudge.hidden = true;
      // They've got the idea: retire the demo touch
      device.parentElement.classList.add('is-discovered');
      sheet.showModal();
      sheet.scrollTop = 0;
    }

    function showNudge() {
      clearTimeout(nudgeTimer);
      nudge.hidden = false;
      // Restart the shake if they tap again while it's still running
      device.classList.remove('is-nudging');
      void device.offsetWidth;
      device.classList.add('is-nudging');
      nudgeTimer = setTimeout(function () {
        nudge.hidden = true;
        device.classList.remove('is-nudging');
      }, 2600);
    }

    screen.addEventListener('click', function (e) {
      const spot = e.target.closest('.app-hotspot');
      if (spot) openApp(spot.dataset.app);
      else showNudge();
    });

    // "My promise to you": each line slides in as it scrolls into view
    const promises = document.querySelectorAll('.promise-list li');
    if (promises.length && 'IntersectionObserver' in window) {
      document.documentElement.classList.add('has-reveal');
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      }, { threshold: 0.2 });
      promises.forEach(li => io.observe(li));
    }

    document.getElementById('appSheetClose').addEventListener('click', () => sheet.close());
    // A click on the backdrop lands on the <dialog> itself
    sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });
  });
})();
