<template>
  <div class="main-h">
    <LogoLine />
    <div class="d-block overflow-x-hidden overflow-y-auto down-from-top-menu">
      <slot />
    </div>
  </div>
</template>

<script setup>
import LogoLine from '~/layouts/menu/LogoLine.vue'

// useHead({
//   htmlAttrs: {
//     class: 'light-theme',
//   },
// })
</script>
