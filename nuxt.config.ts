import { resolve } from 'path';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  target: 'static', // Imposta la modalità statica
  router: {
    base: '/wikiguess/' // Imposta il percorso base corretto per GitHub Pages
  },
  generate: {
    routes: ['/', '/about'] // Sostituisce fallback con una configurazione valida
  },
  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    // ...other modules...
  ],
  i18n: {
    locales: [
      { code: 'en', name: 'English' },
      { code: 'it', name: 'Italiano' }
    ],
    defaultLocale: 'en',
    vueI18n: resolve('./i18n.config.ts'), // Corregge l'uso di resolve
    bundle: {
      optimizeTranslationDirective: false // Disabilita la funzione per evitare il warning
    }
  }
})