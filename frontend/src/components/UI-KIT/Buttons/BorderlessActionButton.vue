<template>
  <a :href="href" :class="['icon-link', buttonClass]">
    <i :class="[iconClass, 'icon']"></i>
    {{ buttonText }}
  </a>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

// Определение пропсов с значениями по умолчанию
const props = defineProps({
  href: { type: String, default: '#' },
  buttonText: { type: String, default: 'Дополнительные параметры' },
  iconClass: { type: String, default: 'fi_modules' },
  buttonClass: { type: String, default: 'additional-parameters1' },
})
</script>

<style scoped></style>
