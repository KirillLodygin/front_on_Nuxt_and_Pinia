<template>
  <div class="input-group-inner">
    <input
      :id="props.id"
      v-model="value"
      :disabled="disabled"
      :step="step"
      class="form-control form-control-lg lh-1"
      style="font-size: 14px"
      type="number"
      :readonly="isReadonly"
    />
    <i
      class="icon caret-icon btn-icon fi_chevron-up number-chevron-up"
      @click="
        () => {
          if (!props.disabled) {
            value =
              area && area === COMPARE
                ? parseFloat((+value + step).toFixed(0))
                : parseFloat((+value + step).toFixed(2))
          }
        }
      "
    />
    <i
      class="icon caret-icon btn-icon fi_chevron-down number-chevron-down"
      @click="
        () => {
          if (!props.disabled) {
            value =
              area && area === COMPARE
                ? parseFloat((+value - step).toFixed(0))
                : parseFloat((+value - step).toFixed(2))
          }
        }
      "
    />
  </div>
</template>

<script lang="ts" setup>
import { BASE_LAND_PLOT_COST, rentCalculationArray } from '~/app_constants/calculationsConsts'
import { formatCorrectionFloat } from '~/utils/calculationsUtils'
import { COMPARE } from '~/app_constants/comparisonConsts'

const props = defineProps({
  defaultValue: { type: [Number, String], required: false },
  field: { type: String, required: false },
  index: { type: Number, required: true },
  step: { type: Number, required: false, default: 0.1 },
  disabled: { type: Boolean, required: false, default: false },
  id: { type: String, required: false },
  area: { type: String, required: false },
  isReadonly: { type: Boolean, required: false, default: false },
})

const { $calculations, $comparison }: any = useNuxtApp()

const value = computed({
  get: () => Number(getCorrectionValueToTable(props.defaultValue)),
  set: (value: number) => {
    setCorrectionValue(value)
  },
})

const adjustableFields = computed(() => $calculations.adjustableFields)
const utilitiesArray = computed(() => $calculations.utilitiesArray)
const operatingCostsArray = computed(() => $calculations.operatingCostsArray)
const corrections = computed(() => $calculations.corrections)
const fieldsForLandPlotCorrection = computed(() => $calculations.fieldsForLandPlotCorrection)
const isBuildingForSale = computed(() => $calculations.isBuildingForSale)

const setCorrectionValue = (value: number | null) => {
  if (props.area && props.field) {
    if (props.area === COMPARE) {
      $comparison.setNewWeightValue(value ? value : 1, props.field)
      return
    }
    if (props.area === 'pricing') {
      $comparison.setPricingFactorNewWeightValue(value ? value : 1, props.field)
      return
    }
  }

  if (props.field && props.field === BASE_LAND_PLOT_COST) {
    $calculations.setBaseLandPlotCost(value ? value : '', props.index)
    return
  }

  if (!adjustableFields.value.includes(props.field)) return

  if (props.field && !props.disabled) {
    $calculations.setCorrectionValue(props.field, props.index, value)

    if (utilitiesArray.value.slice(1).includes(props.field)) {
      let sum = 0
      utilitiesArray.value.slice(1).forEach((item: string) => {
        sum += corrections.value[item][props.index]
      })
      $calculations.corrections.utilities[props.index] = +sum.toFixed(3)
      rentCalculationArray.forEach((field: string) => {
        $calculations.setRentCalculation(field, props.index - 1)
      })
    }

    if (operatingCostsArray.value.slice(1).includes(props.field)) {
      let sum = 0
      operatingCostsArray.value.slice(1).forEach((item: string) => {
        sum += corrections.value[item][props.index]
      })
      corrections.value.operating_costs[props.index] = +sum.toFixed(3)
      rentCalculationArray.forEach((field: string) => {
        $calculations.setRentCalculation(field, props.index - 1)
      })
    }

    if (!utilitiesArray.value.concat(operatingCostsArray.value).includes(props.field)) {
      $calculations.setCurrentPrice(props.index - 1, props.field)
    }

    if (isBuildingForSale.value && fieldsForLandPlotCorrection.value.includes(props.field)) {
      $calculations.setIsolatingCostOfLandPlotsFieldsAllObjects(props.index)
    }
  }
}

const getCorrectionValueToTable = (value: string | number | undefined | null) => {
  if (!value) return ''
  if (typeof value === 'string') return value

  if (props.field === BASE_LAND_PLOT_COST) {
    return value.toFixed(2)
  }

  return props.area && (props.area === COMPARE || props.area === 'pricing')
    ? formatCorrectionFloat(value.toFixed(0))
    : formatCorrectionFloat(value.toFixed(2))
}
</script>
