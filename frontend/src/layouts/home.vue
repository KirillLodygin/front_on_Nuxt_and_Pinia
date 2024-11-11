<template>
  <div class="main-h">
    <TopMenu />
    <div class="under-menu overflow-y-auto">
      <slot />
    </div>
  </div>
</template>

<script setup>
import TopMenu from './menu/TopMenu'

// useHead({
//   htmlAttrs: {
//     class: 'light-theme',
//   },
// })
</script>
