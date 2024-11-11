<template>
  <i v-if="isChecked" class="icon fi_check" />
  <i v-else class="icon fi_minus" />
</template>

<script setup lang="ts">
interface Props {
  id: number
}
const props = defineProps<Props>()
const { $geoObject } = useNuxtApp()
const isChecked = computed(() => {
  return $geoObject.linkExistingCardTable
    ? $geoObject.linkExistingCardIds.includes(props.id)
    : $geoObject.linkExistingObjectsIds.includes(props.id)
})
</script>

<style scoped></style>
