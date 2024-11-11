<template>
  <div class="icons-container">
    <div
      v-for="icon in iconsList"
      :key="icon"
      class="icon-item"
    >
      <Icon :name="icon" size="lg" color="primary" />
      <div class="icon-name">{{ icon }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from '~/components/UI-KIT/Icon.vue';

// Список всех иконок без префиксов
const iconsList = [
  'user',
  'logout',
  'compare',
  'compare-off',
  'broom-wide',
  'headset',
  'help-circle',
  'alert-octagon',
  'alert-triangle',
  'grid',
  'map-pin',
  'rotate-ccw',
  'redo',
  'sliders',
  'menu',
  'chevron-right',
  'chevron-down',
  'chevron-up',
  'chevron-left',
  'compare',
  'square',
  'x-square',
  'check-square',
  'square-v2',
  'check-square-v2',
  'filter',
  'filter-select',
  'log-in',
  'trash',
  'more-vertical'
];

// Добавляем мета-тег noindex для данной страницы
definePageMeta({
  head: {
    meta: [
      { name: 'robots', content: 'noindex, nofollow' }
    ]
  }
});
</script>

<style scoped>
.icons-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
}

.icon-name {
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  word-break: break-word;
}
</style>
