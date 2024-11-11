<template>
  <div class="d-flex flex-column m-2">
    <div class="popup-container_title align-top overflow-y-scroll popup-field-value" style="width: 420px">
      {{ currentCompareObject.name }}
    </div>
    <div
      class="popup-container_title popup-container_title__sm mb-1 overflow-y-scroll popup-address-value"
      style="width: 420px"
    >
      {{ currentCompareObject.address_raw }}
    </div>
    <button v-if="toDisplayDelete" class="delete-from-comparison-popup-button p-2" @click="deleteObject">
      <i class="icon fi_compare-off me-2" />Убрать объект из сравнения
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentCompareObject: Record<string, any>
  toDisplayDelete: boolean
}
const props = defineProps<Props>()
const { $comparison } = useNuxtApp()

function deleteObject() {
  let newObj
  if (!props.currentCompareObject?.object_type) {
    newObj = {
      ...props.currentCompareObject,
      id: props.currentCompareObject.id * -1,
    }
  } else {
    newObj = {
      ...props.currentCompareObject,
    }
  }
  $comparison.removeComparisonObject(newObj)
}
</script>

<style scoped></style>
