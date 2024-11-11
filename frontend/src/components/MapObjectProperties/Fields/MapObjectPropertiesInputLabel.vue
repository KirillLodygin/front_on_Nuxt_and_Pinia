<template>
  <div
    class="map-object-properties_body_input_label-wrapper d-flex justify-content-start align-self-end"
    :style="doubleLineLabel ? { marginBottom: '28px' } : {}"
  >
    <span class="map-object-properties_body_input_label-text">{{ objectData && objectData.label }}</span>
    <i v-if="requiredComputed" class="icon form_required-star map-object-properties_body_input_required-star" />
    <div v-if="info" :id="objectData && objectData.label" :style="infoCssProp" class="info-icon"></div>
    <BTooltip v-if="info" :target="objectData && objectData.label" triggers="hover" custom-class="custom-tooltip"
      >{{ info }}
    </BTooltip>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  requiredComputed: { type: Boolean, required: true },
  objectData: { type: Object, required: true },
  info: { type: String, required: false },
  doubleLineLabel: { type: Boolean, required: false },
})

const infoCssProp = computed(() => {
  return { backgroundImage: `url(/img/info-main.svg)` }
})
</script>

<style scoped></style>
