<template>
  <tr>
    <td @click="onShowEngineeringCommunicationCorrections()">
      <i
        :class="
          isShowEngineeringCommunicationCorrections ? 'icon icon-lg fi_chevron-down' : 'icon icon-lg fi_chevron-right'
        "
      />
    </td>
    <td>Корректирующий коэффициент</td>
    <td class="position-relative">
      <template v-if="referenceBooksSelected[engineeringCommunicationArray[0]]?.source !== 'Ручное'">
        <NumberInput
          :id="`Корректирующий_коэффициент_${field}_0`"
          :default-value="getEngineeringCommunicationGroupCoefficients(0)"
          :disabled="referenceBooksSelected[engineeringCommunicationArray[0]]?.source !== 'Ручное'"
          :field="engineeringCommunicationArray[0]"
          :index="0"
        />
        <Tooltip
          :target="`Корректирующий_коэффициент_${field}_0`"
          :value="getEngineeringCommunicationGroupCoefficients(0)"
        />
      </template>
      <span v-else>—</span>
    </td>
    <td v-for="(analog, index) of displayedAnalogs" class="position-relative">
      <template v-if="referenceBooksSelected[engineeringCommunicationArray[0]]?.source !== 'Ручное'">
        <NumberInput
          :id="`Корректирующий_коэффициент_${field}_${getAnalogIndex(analog) + 1}`"
          :default-value="getEngineeringCommunicationGroupCoefficients(getAnalogIndex(analog) + 1)"
          :disabled="referenceBooksSelected[engineeringCommunicationArray[0]]?.source !== 'Ручное'"
          :field="engineeringCommunicationArray[0]"
          :index="getAnalogIndex(analog) + 1"
        />
        <Tooltip
          :target="`Корректирующий_коэффициент_${field}_${getAnalogIndex(analog) + 1}`"
          :value="getEngineeringCommunicationGroupCoefficients(getAnalogIndex(analog) + 1)"
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
      <template v-if="referenceBooksSelected[engineeringCommunicationArray[0]]?.source !== 'Ручное'">
        <span :id="`Корректировка_${field}_${getAnalogIndex(analog) + 1}`">
          {{
            getEngineeringCommunicationGroupCorrection(getAnalogIndex(analog) + 1) !== 'Ошибка!'
              ? (Number(getEngineeringCommunicationGroupCorrection(getAnalogIndex(analog) + 1)) * 100).toFixed(2)
              : getEngineeringCommunicationGroupCorrection(getAnalogIndex(analog) + 1)
          }}
        </span>
        <Tooltip
          :target="`Корректировка_${field}_${getAnalogIndex(analog) + 1}`"
          :value="
            getEngineeringCommunicationGroupCorrection(getAnalogIndex(analog) + 1) !== 'Ошибка!'
              ? Number(getEngineeringCommunicationGroupCorrection(getAnalogIndex(analog) + 1)) * 100
              : getEngineeringCommunicationGroupCorrection(getAnalogIndex(analog) + 1)
          "
        />
      </template>

      <template v-else>
        <NumberInput
          :id="`Корректировка_${field}_${getAnalogIndex(analog) + 1}`"
          :key="`${field}_${referenceBooksSelected[field]?.source}_${getAnalogIndex(analog)}`"
          :default-value="Number(getEngineeringCommunicationGroupCorrection(getAnalogIndex(analog) + 1)) * 100"
          :disabled="false"
          :field="engineeringCommunicationArray[0]"
          :index="getAnalogIndex(analog) + 1"
        />
        <Tooltip
          :target="`Корректировка_${field}_${getAnalogIndex(analog) + 1}`"
          :value="Number(getEngineeringCommunicationGroupCorrection(getAnalogIndex(analog) + 1)) * 100"
        />
      </template>
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import Tooltip from '~/components/UI-KIT/Tooltip.vue'
import NumberInput from '~/components/UI-KIT/Inputs/NumberInput.vue'
import { useEngineeringCommunicationGroupCoefficients } from '~/composables/Calculations/useEngineeringCommunicationGroupCoefficients'
import { useEngineeringCommunicationGroupCorrection } from '~/composables/Calculations/useEngineeringCommunicationGroupCorrection'

const props = defineProps({
  analogsViewStartIndex: { type: Number, required: true },
  field: { type: String, required: true },
})

const { $calculations }: any = useNuxtApp()
const displayedAnalogs = computed(() =>
  $calculations.selectedAnalogs.slice(props.analogsViewStartIndex, props.analogsViewStartIndex + 3),
)
const analogs = computed(() => $calculations.selectedAnalogs)
const engineeringCommunicationArray = computed(() => $calculations.engineeringCommunicationArray)
const referenceBooksSelected = computed(() => $calculations.referenceBooksSelected)
const isShowEngineeringCommunicationCorrections = computed(
  () => $calculations.isShowEngineeringCommunicationCorrections,
)

const getAnalogIndex = (analog: Record<string, any>) => {
  const idsArr = analogs.value.map((analog: Record<string, any>) => analog.id)
  return idsArr.indexOf(analog.id)
}
const onShowEngineeringCommunicationCorrections = () => {
  if (referenceBooksSelected.value[engineeringCommunicationArray.value[0]].source === 'Ручное') return false
  $calculations.changeIsShowEngineeringCommunicationCorrections()
}
const getEngineeringCommunicationGroupCoefficients = (index: number) => {
  return useEngineeringCommunicationGroupCoefficients(index)
}
const getEngineeringCommunicationGroupCorrection = (index: number) => {
  return useEngineeringCommunicationGroupCorrection(index)
}
</script>
