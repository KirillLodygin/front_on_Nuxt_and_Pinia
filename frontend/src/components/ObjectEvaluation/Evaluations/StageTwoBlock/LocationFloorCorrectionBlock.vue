<template>
  <tr>
    <td class="corrections-carousel-func" @click="onShowLocationFloorCorrections()">
      <i :class="isShowLocationFloorCorrections ? 'icon icon-lg fi_chevron-down' : 'icon icon-lg fi_chevron-right'" />
    </td>
    <td>Корректирующий коэффициент</td>
    <td class="position-relative">
      <template v-if="referenceBooksSelected[locationFloorArray[0]]?.source !== 'Ручное'">
        <NumberInput
          :id="`Корректирующий_коэффициент_${props.field}_0`"
          :default-value="getFloorNumberGroupCoefficients(0)"
          :disabled="referenceBooksSelected[locationFloorArray[0]]?.source !== 'Ручное'"
          :field="locationFloorArray[0]"
          :index="0"
        />
        <Tooltip :target="`Корректирующий_коэффициент_${props.field}_0`" :value="getFloorNumberGroupCoefficients(0)" />
      </template>
      <span v-else>—</span>
    </td>
    <td v-for="(analog, index) of displayedAnalogs" class="position-relative">
      <template v-if="referenceBooksSelected[locationFloorArray[0]]?.source !== 'Ручное'">
        <NumberInput
          :id="`Корректирующий_коэффициент_${props.field}_${getAnalogIndex(analog) + 1}`"
          :default-value="getFloorNumberGroupCoefficients(getAnalogIndex(analog) + 1)"
          :disabled="referenceBooksSelected[locationFloorArray[0]]?.source !== 'Ручное'"
          :field="locationFloorArray[0]"
          :index="getAnalogIndex(analog) + 1"
        />
        <Tooltip
          :target="`Корректирующий_коэффициент_${props.field}_${getAnalogIndex(analog) + 1}`"
          :value="getFloorNumberGroupCoefficients(getAnalogIndex(analog) + 1)"
        />
      </template>
      <span v-else>—</span>
    </td>
  </tr>
  <tr>
    <td></td>
    <td>Корректировка, %</td>
    <td>—</td>
    <td v-for="(analog, index) of displayedAnalogs">
      <template v-if="referenceBooksSelected[locationFloorArray[0]]?.source !== 'Ручное'">
        <span :id="`Корректировка_${props.field}_${getAnalogIndex(analog) + 1}`">
          {{
            getFloorNumberGroupCorrection(getAnalogIndex(analog) + 1) !== 'Ошибка!'
              ? (Number(getFloorNumberGroupCorrection(getAnalogIndex(analog) + 1)) * 100).toFixed(2)
              : getFloorNumberGroupCorrection(getAnalogIndex(analog))
          }}
        </span>
        <Tooltip
          :target="`Корректировка_${props.field}_${getAnalogIndex(analog) + 1}`"
          :value="
            getFloorNumberGroupCorrection(getAnalogIndex(analog) + 1) !== 'Ошибка!'
              ? Number(getFloorNumberGroupCorrection(getAnalogIndex(analog) + 1)) * 100
              : getFloorNumberGroupCorrection(getAnalogIndex(analog))
          "
        />
      </template>
      <template v-else>
        <NumberInput
          :id="`Корректировка_${props.field}_${getAnalogIndex(analog) + 1}`"
          :key="`${props.field}_${referenceBooksSelected[props.field]?.source}_${getAnalogIndex(analog)}`"
          :default-value="Number(getFloorNumberGroupCorrection(getAnalogIndex(analog) + 1)) * 100"
          :disabled="false"
          :field="locationFloorArray[0]"
          :index="getAnalogIndex(analog) + 1"
        />
        <Tooltip
          :target="`Корректировка_${props.field}_${getAnalogIndex(analog)}`"
          :value="Number(getFloorNumberGroupCorrection(getAnalogIndex(analog) + 1)) * 100"
        />
      </template>
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import { useFloorNumberGroupCoefficients } from '~/composables/Calculations/useFloorNumberGroupCoefficients'
import { useFloorNumberGroupCorrection } from '~/composables/Calculations/useFloorNumberGroupCorrection'
import Tooltip from '~/components/UI-KIT/Tooltip.vue'
import NumberInput from '~/components/UI-KIT/Inputs/NumberInput.vue'

const props = defineProps({
  analogsViewStartIndex: { type: Number, required: true },
  field: { type: String, required: true },
})

const { $calculations }: any = useNuxtApp()
const displayedAnalogs = computed(() =>
  $calculations.selectedAnalogs.slice(props.analogsViewStartIndex, props.analogsViewStartIndex + 3),
)
const analogs = computed(() => $calculations.selectedAnalogs)
const locationFloorArray = computed(() => $calculations.locationFloorArray)
const referenceBooksSelected = computed(() => $calculations.referenceBooksSelected)
const isShowLocationFloorCorrections = computed(() => $calculations.isShowLocationFloorCorrections)

const getAnalogIndex = (analog: Record<string, any>) => {
  const idsArr = analogs.value.map((analog: Record<string, any>) => analog.id)
  return idsArr.indexOf(analog.id)
}
const onShowLocationFloorCorrections = () => {
  if (referenceBooksSelected.value[locationFloorArray.value[0]].source === 'Ручное') return false
  $calculations.changeIsShowLocationFloorCorrections()
}
const getFloorNumberGroupCoefficients = (index: number) => {
  return useFloorNumberGroupCoefficients(index)
}
const getFloorNumberGroupCorrection = (analogCounter: number) => {
  return useFloorNumberGroupCorrection(analogCounter)
}
</script>
