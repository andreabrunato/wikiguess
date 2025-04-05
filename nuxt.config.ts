// filepath: /c:/Users/andre/OneDrive/Desktop/dev/wikiguess/wikiguess/nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  target: 'static',
  router: {
    base: '/wikiguess/'
  },
  generate: {
    fallback: true
  },
  modules: [
    '@nuxtjs/i18n',
    // ...other modules...
  ],
  i18n: {
    locales: [
      { code: 'en', name: 'English' },
      { code: 'it', name: 'Italiano' }
    ],
    defaultLocale: 'en',
    vueI18n: './i18n.config.ts' // Usa un file separato per la configurazione di i18n
  }
})