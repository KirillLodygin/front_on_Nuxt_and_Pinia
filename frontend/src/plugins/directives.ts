export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('click-outside', {
    beforeMount(el, { value }) {
      el.clickOutside = (e: Event) => {
        if (!(el === e.target) && !el.contains(e.target)) {
          value(e)
        }
      }
      document.body.addEventListener('click', el.clickOutside)
    },
    unmounted(el) {
      document.body.removeEventListener('click', el.clickOutside)
    },
  })
})
