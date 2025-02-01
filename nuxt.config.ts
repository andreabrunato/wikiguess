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
  }
})