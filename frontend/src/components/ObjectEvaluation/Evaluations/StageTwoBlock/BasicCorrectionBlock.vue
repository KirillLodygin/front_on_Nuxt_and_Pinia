<template>
  <tr
    v-if="
      !firstGroupFields.includes(props.field) &&
      !locationFloorArray.includes(props.field) &&
      !engineeringCommunicationArray.includes(props.field)
    "
  >
    <td v-if="props.tabTitle !== stageTabName2 && props.tabTitle !== stageTabName3"></td>
    <td>Корректирующий коэффициент</td>
    <td class="position-relative">
      <template v-if="referenceBooksSelected[props.field]?.source !== 'Ручное'">
        <NumberInput
          :id="`Корректирующий_коэффициент_${props.field}_0`"
          :key="`${props.field}_0`"
          :default-value="getCorrectionValue(props.field, 0)"
          :disabled="referenceBooksSelected[props.field]?.source !== 'Ручное'"
          :field="props.field"
          :index="0"
        />
        <Tooltip :target="`Корректирующий_коэффициент_${props.field}_0`" :value="getCorrectionValue(props.field, 0)" />
      </template>
      <span v-else>—</span>
    </td>
    <td v-for="(analog, index) of displayedAnalogs" class="position-relative">
      <template v-if="referenceBooksSelected[props.field]?.source !== 'Ручное'">
        <NumberInput
          :id="`Корректирующий_коэффициент_${props.field}_${getAnalogIndex(analog) + 1}`"
          :key="`${props.field}_${getAnalogIndex(analog) + 1}`"
          :default-value="getCorrectionValue(props.field, getAnalogIndex(analog) + 1)"
          :disabled="referenceBooksSelected[props.field]?.source !== 'Ручное'"
          :field="props.field"
          :index="getAnalogIndex(analog) + 1"
        />
        <Tooltip
          :target="`Корректирующий_коэффициент_${props.field}_${getAnalogIndex(analog) + 1}`"
          :value="getCorrectionValue(props.field, getAnalogIndex(analog) + 1)"
        />
      </template>
      <span v-else>—</span>
    </td>
  </tr>
  <tr v-if="!['floor_number', engineeringCommunicationArray[0]].includes(props.field)">
    <td v-if="props.tabTitle !== stageTabName2 && props.tabTitle !== stageTabName3"></td>
    <td>Корректировка, %</td>
    <td>—</td>
    <td v-for="(analog, index) of displayedAnalogs" class="position-relative">
      <template v-if="!firstGroupFields.includes(props.field)">
        <template v-if="referenceBooksSelected[props.field]?.source !== 'Ручное'">
          <span :id="`Корректировка_${props.field}_${index + 1}`">
            {{
              getCorrectionCalculatedValue(
                props.field,
                getCorrectionValue(props.field, 0),
                getCorrectionValue(props.field, getAnalogIndex(analog) + 1),
              ) !== 'Ошибка!' &&
              getCorrectionCalculatedValue(
                props.field,
                getCorrectionValue(props.field, 0),
                getCorrectionValue(props.field, getAnalogIndex(analog) + 1),
              ) !== '—'
                ? Number(
                    getCorrectionCalculatedValue(
                      props.field,
                      getCorrectionValue(props.field, 0),
                      getCorrectionValue(props.field, getAnalogIndex(analog) + 1),
                    ),
                  ).toFixed(2)
                : getCorrectionCalculatedValue(
                    props.field,
                    getCorrectionValue(props.field, 0),
                    getCorrectionValue(props.field, getAnalogIndex(analog) + 1),
                  )
            }}
          </span>
          <Tooltip
            :target="`Корректировка_${props.field}_${index + 1}`"
            :value="
              getCorrectionCalculatedValue(
                props.field,
                getCorrectionValue(props.field, 0),
                getCorrectionValue(props.field, getAnalogIndex(analog) + 1),
              )
            "
          />
        </template>
        <template v-else>
          <NumberInput
            :id="`Корректировка_${props.field}_${index + 1}`"
            :key="`${props.field}_${referenceBooksSelected[props.field]?.source}_${getAnalogIndex(analog)}`"
            :default-value="
              props.field === 'terms_of_sale'
                ? getCorrectionValue(props.field, getAnalogIndex(analog) + 1)
                : getCorrection(props.field, getAnalogIndex(analog) + 1)
            "
            :disabled="false"
            :field="props.field"
            :index="getAnalogIndex(analog) + 1"
          />
          <Tooltip
            :target="`Корректировка_${props.field}_${index + 1}`"
            :value="
              props.field === 'terms_of_sale'
                ? getCorrectionValue(props.field, getAnalogIndex(analog) + 1)
                : getCorrection(props.field, getAnalogIndex(analog) + 1)
            "
          />
        </template>
      </template>

      <template v-else>
        <NumberInput
          :id="`Корректировка_${props.field}_${index + 1}`"
          :key="`${props.field}_${referenceBooksSelected[props.field]?.source}_${getAnalogIndex(analog)}`"
          :default-value="
            props.field === 'terms_of_sale'
              ? getCorrectionValue(props.field, getAnalogIndex(analog) + 1)
              : getCorrection(props.field, getAnalogIndex(analog) + 1)
          "
          :disabled="isNumberInputDisabled(props.field)"
          :field="props.field"
          :index="getAnalogIndex(analog) + 1"
        />
        <Tooltip
          :target="`Корректировка_${props.field}_${index + 1}`"
          :value="
            props.field === 'terms_of_sale'
              ? getCorrectionValue(props.field, getAnalogIndex(analog) + 1)
              : getCorrection(props.field, getAnalogIndex(analog) + 1)
          "
        />
      </template>
    </td>
  </tr>
  <tr v-if="isComparisonElementsFirstGroup(props.field) || props.field === rentCalculationArray[0]">
    <td v-if="props.tabTitle !== stageTabName2 && props.tabTitle !== stageTabName3"></td>
    <td>{{ adjustedCostLabel }}</td>
    <td></td>
    <td v-for="(analog, index) of displayedAnalogs">
      <span :id="`${adjustedCostLabel}_${props.field}_${index + 1}`">{{
        getNewPrice(getAnalogIndex(analog), hasCorrectionsFields.indexOf(props.field)) &&
        getNewPrice(getAnalogIndex(analog), hasCorrectionsFields.indexOf(props.field)) !== 'Ошибка!'
          ? Number(getNewPrice(getAnalogIndex(analog), hasCorrectionsFields.indexOf(props.field))).toFixed(2)
          : getNewPrice(getAnalogIndex(analog), hasCorrectionsFields.indexOf(props.field))
      }}</span>
      <Tooltip
        :target="`${adjustedCostLabel}_${props.field}_${index + 1}`"
        :value="getNewPrice(getAnalogIndex(analog), hasCorrectionsFields.indexOf(props.field))"
      />
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import {
  adjustedCostTitleObject,
  rentCalculationArray,
  stageTabName2,
  stageTabName3,
} from '~/app_constants/calculationsConsts'
import type { metaGroupType } from '~/types/calculationsTypes'
import { useNewPrice } from '~/composables/Calculations/useNewPrice'
import { useCorrectionCalculatedValue } from '~/composables/Calculations/useCorrectionCalculatedValue'
import { useGetCorrection } from '~/composables/Calculations/useGetCorrection'
import { useCorrectionValue } from '~/composables/Calculations/useCorrectionValue'
import Tooltip from '~/components/UI-KIT/Tooltip.vue'
import NumberInput from '~/components/UI-KIT/Inputs/NumberInput.vue'

const props = defineProps({
  analogsViewStartIndex: { type: Number, required: true },
  tabTitle: { type: String, required: true },
  field: { type: String, required: true },
})

const { $calculations }: any = useNuxtApp()

const firstGroupFields = computed(() => $calculations.getFirstGroupFields())
const locationFloorArray = computed(() => $calculations.locationFloorArray)
const engineeringCommunicationArray = computed(() => $calculations.engineeringCommunicationArray)
const hasCorrectionsFields = computed(() => $calculations.hasCorrectionsFields)
const adjustedCostLabel = computed(() => {
  const adsType: 'S' | 'R' = $calculations.adsType
  return adsType ? adjustedCostTitleObject[adsType] : adjustedCostTitleObject['R']
})
const displayedAnalogs = computed(() =>
  $calculations.selectedAnalogs.slice(props.analogsViewStartIndex, props.analogsViewStartIndex + 3),
)
const aim = computed(() => $calculations.aim)
const analogs = computed(() => $calculations.selectedAnalogs)
const referenceBooks = computed(() => $calculations.referenceBooks)
const referenceBooksSelected = computed(() => $calculations.referenceBooksSelected)
const fieldsForStage = computed(() => $calculations.stageTwoTable)

const getAnalogIndex = (analog: Record<string, any>) => {
  const idsArr = analogs.value.map((analog: Record<string, any>) => analog.id)
  return idsArr.indexOf(analog.id)
}
const getCorrectionCalculatedValue = (field: string, corr1: number | string, corr2: number | string) => {
  return useCorrectionCalculatedValue(field, corr1, corr2)
}
const getNewPrice = (analogIndex: number, index: number) => {
  const priceIndex = aim.value.ads_type === 'R' ? index + 1 : index

  return useNewPrice(analogIndex, priceIndex)
}
const isComparisonElementsFirstGroup = (field: string) => {
  return fieldsForStage.value
    .filter((item: metaGroupType) => item.group === 'comparison_elements_first_group')[0]
    .fields.includes(field)
}
const isNumberInputDisabled = (field: string) => {
  if (Object.keys(referenceBooks.value).includes(field)) {
    return referenceBooksSelected.value[field].source !== 'Ручное'
  }
  return false
}
const getCorrection = (field: string, index: number) => {
  return useGetCorrection(field, index)
}
const getCorrectionValue = (field: string, index: number) => {
  return useCorrectionValue(field, index)
}
</script>
