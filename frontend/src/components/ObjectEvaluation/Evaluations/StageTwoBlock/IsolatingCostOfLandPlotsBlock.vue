<template>
  <table class="table table-content" style="table-layout: fixed">
    <tbody>
      <tr v-for="key in Object.keys(isolatingCostOfLandPlotsFieldsObject)" :key="key">
        <td>{{ isolatingCostOfLandPlotsFieldsObject[key].label }}</td>
        <td class="position-relative">—</td>
        <td
          v-for="(analog, index) of displayedAnalogs"
          :key="`${isolatingCostOfLandPlotsFieldsObject[key].label}_${index}`"
          class="position-relative"
        >
          <NumberInput
            v-if="key === BASE_LAND_PLOT_COST"
            :default-value="isolatingCostOfLandPlotsFieldsObject[key].value[getAnalogIndex(analog)]"
            :field="BASE_LAND_PLOT_COST"
            :index="getAnalogIndex(analog)"
          />
          <div v-else>
            <span :id="`${key}_${getAnalogIndex(analog)}`">{{
              getIsolatingCostOfLandPlotsFieldValue(getAnalogIndex(analog), key)
            }}</span>
            <Tooltip
              :target="`${key}_${getAnalogIndex(analog)}`"
              :value="isolatingCostOfLandPlotsFieldsObject[key].value[getAnalogIndex(analog)]"
            />
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import { BASE_LAND_PLOT_COST } from '~/app_constants/calculationsConsts'
import NumberInput from '~/components/UI-KIT/Inputs/NumberInput.vue'
import Tooltip from '~/components/UI-KIT/Tooltip.vue'

const props = defineProps({
  analogsViewStartIndex: { type: Number, required: true },
})

const { $calculations }: any = useNuxtApp()
const displayedAnalogs = computed(() =>
  $calculations.selectedAnalogs.slice(props.analogsViewStartIndex, props.analogsViewStartIndex + 3),
)
const isolatingCostOfLandPlotsFieldsObject = computed(() => $calculations.isolatingCostOfLandPlotsFieldsObject)
const analogs = computed(() => $calculations.selectedAnalogs)

const getAnalogIndex = (analog: Record<string, any>) => {
  const idsArr = analogs.value.map((analog: Record<string, any>) => analog.id)
  return idsArr.indexOf(analog.id)
}
const getIsolatingCostOfLandPlotsFieldValue = (index: number, key: string) => {
  if (!isolatingCostOfLandPlotsFieldsObject.value.baseLandPlotCost.value[index]) {
    return "Заполните поле 'Стоимость земельного участка объекта оценки (базового)'"
  }

  return isolatingCostOfLandPlotsFieldsObject.value[key].value[index]
    ? isolatingCostOfLandPlotsFieldsObject.value[key].value[index].toFixed(2)
    : 'Ошибка!'
}
</script>
