<template>
  <div
    :class="['d-flex sortable-column-header', { 'sorted-column': props.sorted && props.sortDirection !== 'none' }]"
    @click="onSort"
    role="button"
  >
    <i v-if="props.icon" :class="props.icon"></i>
    <span v-if="props.title" class="flex-fill" v-html="props.title"></span>
    <slot v-else></slot>
    <div class="d-flex align-items-center">
      <i :class="['icon ms-1', sortIcons[props.sortDirection]]"></i>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, type PropType } from 'vue'
import { type sortDirectionType } from '~/types/objectsFiltersStoreTypes'

const props = defineProps({
  sorted: { type: Boolean, required: true },
  sortDirection: { type: String as PropType<sortDirectionType>, required: true, default: 'asc' },
  title: { type: String, required: false },
  field: { type: String, required: true },
  icon: { type: String, required: false },
})

const emit = defineEmits(['sort'])

const sortIcons = {
  asc: 'fi_sort-up',
  desc: 'fi_sort-down',
  none: 'fi_sort-up-down',
}

const onSort = () => {
  emit('sort', props.field)
}
</script>
