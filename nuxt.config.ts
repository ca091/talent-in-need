// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],
  css: ['~/assets/css/main.css'],
  icon: {
    provider: 'none',
    clientBundle: {
      scan: true,
      icons: [
        'lucide:chevron-left',
        'lucide:chevron-right',
        'lucide:chevrons-left',
        'lucide:chevrons-right',
        'lucide:ellipsis',
        'lucide:upload',
      ],
    },
  },
  sourcemap: false,
  devServer: {
    host: '0.0.0.0',
    port: 3009,
  },
})
