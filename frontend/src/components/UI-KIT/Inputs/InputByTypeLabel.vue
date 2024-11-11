<template>
  <div class="map-object-properties_body_input_label-wrapper d-flex justify-content-start">
    <span class="map-object-properties_body_input_label-text">{{ label }}</span>
    <i v-if="required" class="icon form_required-star map-object-properties_body_input_required-star" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  required?: boolean
}
const { label, required } = defineProps<Props>()
</script>

<style scoped></style>
