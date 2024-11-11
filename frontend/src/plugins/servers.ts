export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()

  const baseURL = runtimeConfig.public.baseURL
  const tileServer = runtimeConfig.public.tileServer
  const searchServer = runtimeConfig.public.searchServer
  const routingServer = runtimeConfig.public.routingServer

  return {
    provide: {
      baseURL,
      tileServer,
      searchServer,
      routingServer,
    },
  }
})
