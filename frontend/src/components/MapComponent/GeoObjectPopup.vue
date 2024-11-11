<template>
  <template v-if="props.toShowLoader">
    <div class="d-flex align-items-center justify-content-center" style="width: 265px">
      <BSpinner small></BSpinner>
    </div>
  </template>
  <template v-else>
    <div class="d-flex flex-column">
      <div class="popup-container_title pb-1" style="width: 265px">
        <span>Объект: </span>
        {{ props.label }}
      </div>
      <div
        class="popup-info-container overflow-y-auto"
        style="max-height: 200px; height: fit-content; overflow-x: hidden"
      >
        <table style="width: 400px">
          <tr
            v-for="(value, key) in props.currentAnalogPopupObject"
            :key="key"
            class="popup-container_title popup-container_title__sm p-1"
          >
            <td>
              <span class="p-0 text-start popup-container_row-title align-top">{{ key + ': ' }}</span>
              {{ value }}
            </td>
          </tr>
        </table>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
interface Props {
  label: string
  currentAnalogPopupObject: Record<string, any>
  toShowLoader: boolean
}
const props = defineProps<Props>()
</script>

<style scoped></style>
