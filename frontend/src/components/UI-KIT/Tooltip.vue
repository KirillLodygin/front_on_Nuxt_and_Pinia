<template>
  <BTooltip :id="`${target}_tooltip`" :no-fade="true" :target="target" custom-class="custom-tooltip" triggers="hover"
    >{{ value }}
  </BTooltip>
</template>

<script lang="ts" setup>
const props = defineProps({
  target: { type: String, required: true },
  value: { type: [Number, String], required: true },
})
</script>
