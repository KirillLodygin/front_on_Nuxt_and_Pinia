<template>
  <b-dropdown :id="id" :text="text" :variant="variant" :class="[customClass]" right>
    <template #button-content>
      <slot name="button-content">{{ text }}</slot>
    </template>

    <b-dropdown-item v-for="(item, index) in items" :key="index" @click="itemClicked(item.action)">
      <i class="icon" :class="item.icon" v-if="item.icon"></i>
      {{ item.text }}
    </b-dropdown-item>
    <slot></slot>
  </b-dropdown>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  text: String,
  variant: { type: String, default: 'secondary' },
  items: { type: Array, default: () => [] },
  customClass: String,
})
const emit = defineEmits(['action'])
function itemClicked(action) {
  emit('action', action)
}
</script>
