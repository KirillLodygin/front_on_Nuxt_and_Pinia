<!--
    Выводит сообщение в таблице об отсутствии записей (например, записи не были загружены с сервера)
-->
<template>
  <div class="alert d-flex align-items-top mx-1 my-0 rounded" style="background-color: var(--gray-l10)">
    <div class="my-1">
      <i :class="['icon icon-lg', props.icon]" style="flex: 0 0 2.5rem"></i>
    </div>
    <div class="mx-2">
      {{ props.label }}
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  // Название иконки
  icon: { type: String, default: 'fi_alert-circle' },
  // Текст. Используется, если не задан слот по умолчанию
  label: { type: String, default: 'Выберите показатели, по которым необходимо сравнить объекты.' },
})
</script>
