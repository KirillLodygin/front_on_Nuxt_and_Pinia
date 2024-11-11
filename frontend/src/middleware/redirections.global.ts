export default defineNuxtRouteMiddleware((to, from) => {
  const { $auth, $userStore } = useNuxtApp()
  if (to.path !== '/login' && !$auth.user) {
    const fullPath = {
      path: to.path,
      query: to.query,
      params: to.params,
    }

    // Сохраняем объект в localStorage
    localStorage.setItem('savedPath', JSON.stringify(fullPath))
    $userStore.setOldPath(fullPath)

    return navigateTo('/login')
  }
})
