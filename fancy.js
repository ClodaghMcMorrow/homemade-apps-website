// Homemade Apps — home page only (interactive phone, app details window).
// Load after translations.js and before lang.js: the strings below are merged
// into HA_TRANSLATIONS so lang.js translates them like any other key.

(function () {
  const STRINGS = {
    en: { hint: 'Tap an app to peek inside',         nudge: 'Tap one of the Homemade apps',            close: 'Close', preview: 'Preview the app', prev: 'Previous', next: 'Next' },
    fr: { hint: 'Touchez une app pour en savoir plus', nudge: 'Touchez l’une des apps Homemade',        close: 'Fermer', preview: 'Aperçu de l’app', prev: 'Précédent', next: 'Suivant' },
    de: { hint: 'Tippe auf eine App für mehr',        nudge: 'Tippe auf eine der Homemade-Apps',        close: 'Schließen', preview: 'App-Vorschau ansehen', prev: 'Zurück', next: 'Weiter' },
    es: { hint: 'Toca una app para ver más',          nudge: 'Toca una de las apps Homemade',           close: 'Cerrar', preview: 'Ver la app por dentro', prev: 'Anterior', next: 'Siguiente' },
    it: { hint: 'Tocca un’app per saperne di più',    nudge: 'Tocca una delle app Homemade',            close: 'Chiudi', preview: 'Anteprima dell’app', prev: 'Precedente', next: 'Successivo' },
    pt: { hint: 'Toque numa app para ver mais',       nudge: 'Toque numa das apps Homemade',            close: 'Fechar', preview: 'Pré-visualizar a app', prev: 'Anterior', next: 'Seguinte' },
    zh: { hint: '点按应用了解更多',                     nudge: '请点按其中一个 Homemade 应用',              close: '关闭', preview: '预览应用', prev: '上一张', next: '下一张' },
    ja: { hint: 'アプリをタップして詳しく見る',           nudge: 'Homemade のアプリをタップしてください',       close: '閉じる', preview: 'アプリをプレビュー', prev: '前へ', next: '次へ' },
    ko: { hint: '앱을 탭해 자세히 보기',                nudge: 'Homemade 앱 중 하나를 탭하세요',            close: '닫기', preview: '앱 미리보기', prev: '이전', next: '다음' },
    hi: { hint: 'और जानने के लिए कोई ऐप टैप करें',      nudge: 'किसी एक Homemade ऐप पर टैप करें',          close: 'बंद करें', preview: 'ऐप का प्रीव्यू देखें', prev: 'पिछला', next: 'अगला' },
    ar: { hint: 'اضغط على تطبيق لمعرفة المزيد',        nudge: 'اضغط على أحد تطبيقات Homemade',           close: 'إغلاق', preview: 'معاينة التطبيق', prev: 'السابق', next: 'التالي' }
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

    // Preview: the App Store screenshots, side by side with the same small
    // gaps as on the store so the ones drawn across two frames still line up.
    const SHOTS = { stories: 10, drawings: 8, breathing: 7, charades: 10, clues: 9 };
    const preview = document.getElementById('previewSheet');
    const strip = document.getElementById('previewStrip');
    const prevBtn = document.getElementById('previewPrev');
    const nextBtn = document.getElementById('previewNext');

    function updateNav() {
      const max = strip.scrollWidth - strip.clientWidth;
      prevBtn.disabled = strip.scrollLeft <= 2;
      nextBtn.disabled = strip.scrollLeft >= max - 2;
    }

    function openPreview(app, name) {
      document.getElementById('previewTitle').textContent = name;
      strip.textContent = '';
      for (let i = 1; i <= SHOTS[app]; i++) {
        const img = new Image();
        img.src = 'assets/screens/' + app + '/' + String(i).padStart(2, '0') + '.webp';
        img.alt = name + ' — ' + i + ' / ' + SHOTS[app];
        img.width = 660;
        img.height = 1434;
        img.decoding = 'async';
        if (i > 3) img.loading = 'lazy';
        strip.appendChild(img);
      }
      preview.showModal();
      strip.scrollLeft = 0;
      updateNav();
    }

    function page(dir) {
      const shot = strip.firstElementChild;
      if (!shot) return;
      const step = shot.getBoundingClientRect().width + parseFloat(getComputedStyle(strip).columnGap || 0);
      const perPage = Math.max(1, Math.floor(strip.clientWidth / step));
      strip.scrollBy({ left: dir * step * perPage, behavior: 'smooth' });
    }

    sheet.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-preview]');
      if (!btn) return;
      const name = btn.closest('.app-sheet-panel').querySelector('.app-name').textContent;
      openPreview(btn.dataset.preview, name);
    });
    prevBtn.addEventListener('click', () => page(-1));
    nextBtn.addEventListener('click', () => page(1));
    strip.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', updateNav);
    document.getElementById('previewClose').addEventListener('click', () => preview.close());
    preview.addEventListener('click', e => { if (e.target === preview) preview.close(); });

    document.getElementById('appSheetClose').addEventListener('click', () => sheet.close());
    // A click on the backdrop lands on the <dialog> itself
    sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });
  });
})();
