<template>
  <span ref="textEl" class="nav-item px-2" v-b-tooltip.hover="tooltipTitle">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const textEl = ref<HTMLElement | null>(null);
const isOverflowing = ref(false);
const tooltipTitle = ref('');

const updateOverflowStatus = () => {
  if (textEl.value) {
    isOverflowing.value = textEl.value.scrollWidth > textEl.value.clientWidth;
    tooltipTitle.value = isOverflowing.value ? textEl.value.textContent ?? '' : '';
  }
};

onMounted(() => {
  updateOverflowStatus();
  const resizeObserver = new ResizeObserver(updateOverflowStatus);
  if (textEl.value) resizeObserver.observe(textEl.value);
});
</script>

<style scoped>
.nav-item {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #212529;
}
</style>
