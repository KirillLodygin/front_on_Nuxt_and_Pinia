<!-- components/UI/Icon.vue -->
<template>
  <span
    :class="[
      'icon',
      sizeClass,
      colorClass,
      iconClass,
      { empty: isEmpty },
    ]"
  ></span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg, xl, 2xl, etc.
  },
  color: {
    type: String,
    default: 'default', // primary, secondary, danger, etc.
  },
  isEmpty: {
    type: Boolean,
    default: false,
  },
});

const sizeClass = computed(() => `icon-${props.size}`);
const colorClass = computed(() => `icon-${props.color}`);
const iconClass = computed(() => `fi_${props.name}`);
</script>


<style scoped>
/* Ваш CSS для иконок */
@import '~/assets/css/icons.scss';
</style>
