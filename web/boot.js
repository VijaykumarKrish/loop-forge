// Apply the language before paint; boot-theme.js owns the theme.
// i18n.js replaces this. Boot must still render if that script fails to load.
window.lfT = window.lfT || ((zh) => zh);
(() => {
  const root = document.documentElement;
  // A saved choice (中 / EN) wins. Without one (first visit, or the site is
  // opened under a new address, which has its own storage), follow the
  // browser: Chinese browsers get Chinese, everything else English.
  const browserLang = () => {
    const list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'zh'];
    return /^zh\b/i.test(String(list[0] || 'zh')) ? 'zh' : 'en';
  };
  let lang = 'zh';
  try {
    const saved = localStorage.getItem('loopforge.lang');
    lang = saved === 'en' || saved === 'zh' ? saved : browserLang();
  } catch (_) { lang = browserLang(); /* Restricted storage still permits a default interface. */ }
  root.dataset.lang = lang;
  root.lang = lang === 'en' ? 'en' : 'zh-CN';
})();
