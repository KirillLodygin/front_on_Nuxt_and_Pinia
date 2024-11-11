<template>
  <table class="table table-content" style="table-layout: fixed">
    <tbody>
      <tr>
        <td>{{ finalAdjustmentForCorrectionIntoAccountLandPlot.label }}</td>
        <td class="position-relative">—</td>
        <td
          v-for="(analog, index) of displayedAnalogs"
          :key="`${finalAdjustmentForCorrectionIntoAccountLandPlot.label}_${index}`"
          class="position-relative"
        >
          {{ intoAccountLandPlotCorrections[getAnalogIndex(analog)].toFixed(2) }}
        </td>
      </tr>
      <tr>
        <td>{{ adjustedCostLabel }}</td>
        <td class="position-relative">—</td>
        <td v-for="(analog, index) of displayedAnalogs" class="position-relative">
          {{ newPrices[getAnalogIndex(analog)][newPrices[getAnalogIndex(analog)].length - 2].toFixed(2) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import { adjustedCostTitleObject } from '~/app_constants/calculationsConsts'

const props = defineProps({
  analogsViewStartIndex: { type: Number, required: true },
})

const { $calculations }: any = useNuxtApp()
const finalAdjustmentForCorrectionIntoAccountLandPlot = computed(
  () => $calculations.finalAdjustmentForCorrectionIntoAccountLandPlot,
)
const displayedAnalogs = computed(() =>
  $calculations.selectedAnalogs.slice(props.analogsViewStartIndex, props.analogsViewStartIndex + 3),
)
const intoAccountLandPlotCorrections = computed(() => $calculations.intoAccountLandPlotCorrections)
const adjustedCostLabel = computed(() => {
  const adsType: 'S' | 'R' = $calculations.adsType
  return adsType ? adjustedCostTitleObject[adsType] : adjustedCostTitleObject['R']
})
const newPrices = computed(() => $calculations.newPrices)
const analogs = computed(() => $calculations.selectedAnalogs)

const getAnalogIndex = (analog: Record<string, any>) => {
  const idsArr = analogs.value.map((analog: Record<string, any>) => analog.id)
  return idsArr.indexOf(analog.id)
}
</script>
