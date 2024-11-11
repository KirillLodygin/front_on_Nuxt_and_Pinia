import useUserStore from '~/store/userStore'
export default defineNuxtPlugin((nuxtApp) => {
  const { $http } = useNuxtApp()

  $http.onResponseError((error) => {
    if ([500, 501, 502, 503, 504].includes(error.response?.status)) {
      useUserStore().setErrorModal(true)
    }
    return Promise.reject(error)
  })
})
