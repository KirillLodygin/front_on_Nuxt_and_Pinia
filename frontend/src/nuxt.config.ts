// @ts-ignore
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Гисанда',
      htmlAttrs: {
        lang: 'ru',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // { hid: 'description', name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        // Большинство браузеров
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48.png' },
        { rel: 'icon', type: 'image/png', sizes: '72x72', href: '/favicon-72.png' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96.png' },
        { rel: 'icon', type: 'image/png', sizes: '120x120', href: '/favicon-120.png' },
        { rel: 'icon', type: 'image/png', sizes: '144x144', href: '/favicon-144.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon-192.png' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        // ios
        { rel: 'apple-touch-icon', sizes: '57x57', href: '/favicon-57.png' },
        { rel: 'apple-touch-icon', sizes: '60x60', href: '/favicon-60.png' },
        { rel: 'apple-touch-icon', sizes: '72x72', href: '/favicon-72.png' },
        { rel: 'apple-touch-icon', sizes: '76x76', href: '/favicon-76.png' },
        { rel: 'apple-touch-icon', sizes: '114x114', href: '/favicon-114.png' },
        { rel: 'apple-touch-icon', sizes: '120x120', href: '/favicon-120.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon-180.png' },        
        // desktop
        { rel: 'shortcut icon', href: '/favicon.ico' },
        // macos safari       
        { rel: 'mask-icon', href: '/favicon.svg' },
        // android
        { rel: 'manifest', href: '/manifest.json' }
      ]

    },
  },

  auth: {
    // redirect: {
    //   login: '/login',
    //   home: '/'
    //   // express: '/express'
    // },
    strategies: {
      local: {
        scheme: 'refresh',
        token: {
          property: 'access',
          maxAge: 1800,
          global: true,
          // type: 'Bearer',
        },
        refreshToken: {
          property: 'refresh',
          data: 'refresh',
          maxAge: 60 * 60 * 24 * 7,
          httpOnly: false,
          // required: true,
        },
        user: {
          property: 'user',
        },
        endpoints: {
          login: { url: '/api/v1/auth/api-token-auth/', method: 'post' },
          refresh: { url: '/api/v1/auth/api-token-refresh/', method: 'post' },
          user: { url: '/api/v1/auth/user/', method: 'get' },
          logout: false,
        },
        autoLogout: false,
      },
    },
  },

  vite: {
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    }
  },


  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    '~/assets/css/const.scss',
    '~/assets/css/style.scss',
    '~/assets/css/icons.scss',
    '~/assets/css/maplibre.scss',
    '~/assets/css/mapInstrument.scss',
    '~/assets/fonts/font-OpenSans.css',
    '~/assets/fonts/font-Manrope.css',
  ],

  devtools: {
    enabled: Boolean(process.env.DEVTOOLS_ENABLED),

    timeline: {
      enabled: true,
    },
  },

  http: {
    baseURL: process.env.API_HOST,
    browserBaseURL: process.env.API_HOST,
    headers: {
      accept: 'application/json, text/plain, */*',
    },
    // withCredentials: true
  },

  modules: ['@bootstrap-vue-next/nuxt', '@nuxt-alt/auth', '@nuxt-alt/http', '@pinia/nuxt', '@samk-dev/nuxt-vcalendar'],

  // pinia: {
  //   autoImports: [
  //     'defineStore',
  //     ['defineStore', 'definePiniaStore']
  //   ]
  // },

  // build: {
  //   extend(config, { isClient }) {
  //     if (isClient) {
  //       config.devtool = 'source-map'
  //     }
  //   }
  // },

  // env: {
  //   baseURL: process.env.API_HOST,
  //   tile_server: process.env.TILE_SERVER,
  //   search_server: process.env.SEARCH_SERVER,
  //   routing_server: process.env.ROUTING_SERVER
  // },
  runtimeConfig: {
    public: {
      baseURL: process.env.API_HOST,
      tileServer: process.env.TILE_SERVER,
      searchServer: process.env.SEARCH_SERVER,
      routingServer: process.env.ROUTING_SERVER,
      http: {
        browserBaseURL: process.env.API_HOST,
      },
    },
    private: {
      http: {
        baseURL: process.env.API_HOST,
      },
    },
  },
  ssr: false,
  typescript: {
    typeCheck: true,
    strict: true,
  },
})
