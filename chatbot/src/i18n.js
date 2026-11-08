// The workbench follows the platform language switch (web/i18n.js, loaded by
// index.html). Static Chinese copy is translated in the DOM through
// web/i18n-chat-en.js; text assembled from runtime values goes through t() so
// each language gets a natural sentence instead of translated fragments.
const runtime = () => (typeof window === "undefined" ? undefined : window);

export const isEnglish = () => runtime()?.lfLang?.() === "en";

export const t = (zh, en) => (isEnglish() ? en : zh);
