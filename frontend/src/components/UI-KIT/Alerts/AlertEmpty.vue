<!--
    Выводит сообщение в таблице об отсутствии записей (например, записи не были загружены с сервера)
-->
<template>
  <div class="alert d-flex align-items-center mx-4 my-0">
    <i :class="['icon icon-lg', props.icon]" style="flex: 0 0 2.5rem"></i>
    <slot>
      {{ props.label }}
    </slot>
  </div>
</template>

<script lang="ts" name="AlertEmpty" setup>
const props = defineProps({
  // Название иконки
  icon: { type: String, default: 'fi_alert-circle' },
  // Текст. Используется, если не задан слот по умолчанию
  label: { type: String, default: 'Не загружена ни одна запись' },
})
</script>
