<template>
  <div class="tab_files_header_menu gap-3 align-items-start p-2">
    <div><i class="icon fi_alert-circle" /></div>
    <div>{{ label }}</div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  // Текст. Используется, если не задан слот по умолчанию
  label: {
    type: String,
    default:
      'Выберите показатели, по которым необходимо сравнить объекты. При необходимости задайте вес показателя, чтобы выделить наиболее важные',
  },
})
</script>
