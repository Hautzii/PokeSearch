// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },
  css: ['~/assets/css/main.css', '~/assets/css/autoComplete.css', '~/assets/css/tungsten.css'],
  modules: ['@pinia/nuxt'],
})