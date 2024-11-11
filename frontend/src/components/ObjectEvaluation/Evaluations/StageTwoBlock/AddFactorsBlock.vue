<template>
  <tr class="stage-two-table-field-tr">
    <td class="align-middle text-center">
      <i
        :class="[
          'icon icon-lg',
          adjustableFields.includes(props.field)
            ? 'fi_checked-theme icon-primary'
            : 'fi_unchecked-theme icon-secondary',
        ]"
        @click="updateAdjustableFields(props.field)"
      />
    </td>
    <td class="align-middle">
      <div class="row m-1 justify-content-around">
        <div class="col p-0 text-break">{{ getAddFactorLabel(props.field) }}</div>
        <div class="col-3 h-100">
          <div
            :class="[
              'analogs-carousel-func btn btn-sm-rounded',
              $calculations.getCorrectionButtonStyle(props.field, props.tabTitle),
            ]"
            @click="() => setReferencesModal(props.field)"
          >
            <i class="icon fi_sliders order" />
          </div>
        </div>
      </div>
    </td>

    <td>{{ getAddFactorValue(props.field) }}</td>

    <td v-for="(analog, index) of displayedAnalogs">
      <TextInput
        :key="analog.id"
        :default-value="getAnalogAddFactorValue(analog, props.field)"
        :field="props.field"
        :index="getAnalogIndex(analog)"
        :label="getAddFactorLabel(props.field)"
        @input="setAnalogAddFactorValue"
      />
    </td>
  </tr>

  <tr>
    <td v-if="props.tabTitle !== stageTabName2 && props.tabTitle !== stageTabName3"></td>
    <td>Корректировка, %</td>
    <td>—</td>
    <td v-for="(analog, index) of displayedAnalogs">
      <NumberInput
        :default-value="getCorrectionValueToTable(getCorrectionValue(props.field, getAnalogIndex(analog) + 1))"
        :disabled="isNumberInputDisabled(props.field)"
        :field="props.field"
        :index="getAnalogIndex(analog) + 1"
      />
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import type { aimType } from '~/types/calculationsTypes'
import { stageTabName2, stageTabName3 } from '~/app_constants/calculationsConsts'
import { formatCorrectionFloat } from '~/utils/calculationsUtils'
import { useCorrectionValue } from '~/composables/Calculations/useCorrectionValue'
import NumberInput from '~/components/UI-KIT/Inputs/NumberInput.vue'
import TextInput from '~/components/UI-KIT/Inputs/TextInput.vue'

const props = defineProps({
  analogsViewStartIndex: { type: Number, required: true },
  tabTitle: { type: String, required: true },
  field: { type: String, required: true },
})

const { $calculations }: any = useNuxtApp()
const adjustableFields = computed(() => $calculations.adjustableFields)
const aim = computed(() => $calculations.aim)
const analogs = computed(() => $calculations.selectedAnalogs)
const displayedAnalogs = computed(() =>
  $calculations.selectedAnalogs.slice(props.analogsViewStartIndex, props.analogsViewStartIndex + 3),
)
const referenceBooksSelected = computed(() => $calculations.referenceBooksSelected)
const referenceBooks = computed(() => $calculations.referenceBooks)

const getAddFactorLabel = (field: string) => {
  return 'ДЦОФ: ' + aim.value.add_factors.filter((obj: Record<string, string>) => obj.field === field)[0].label
}
const getAddFactorValue = (field: string) => {
  return aim.value.add_factors.filter((obj: Record<string, string>) => obj.field === field)[0].value
}
const getAnalogIndex = (analog: Record<string, any>) => {
  const idsArr = analogs.value.map((analog: Record<string, any>) => analog.id)
  return idsArr.indexOf(analog.id)
}
const setAnalogAddFactorValue = (field: string, label: string, index: number, value: string) => {
  const analogs = $calculations.selectedAnalogs.map((analog: aimType, i: number) => {
    if (i === index) {
      if ('add_factors' in analog) {
        let obj = analog.add_factors.find((item: any) => item.field === field)
        if (obj) {
          obj.value = value
        } else {
          analog.add_factors.push({ field, label, value })
        }
      } else {
        analog.add_factors = [{ field, label, value }]
      }
    }
    return analog
  })
  $calculations.setSelectedAnalogs(analogs)
}
const isNumberInputDisabled = (field: string) => {
  if (Object.keys(referenceBooks.value).includes(field)) {
    return referenceBooksSelected.value[field].source !== 'Ручное'
  }
  return false
}
const getCorrectionValueToTable = (value: string | number) => {
  if (typeof value === 'string') return value

  return formatCorrectionFloat(value.toFixed(2))
}
const getAnalogAddFactorValue = (analog: aimType, field: string) => {
  if (!analog.add_factors) {
    return ''
  }
  const obj = analog.add_factors.find((obj: Record<string, string>) => obj.field === field)
  return obj ? obj.value : ''
}

const emit = defineEmits(['setReferencesModal', 'updateAdjustableFields'])
const setReferencesModal = (field: string) => {
  emit('setReferencesModal', true, field)
}
const updateAdjustableFields = (field: string) => {
  emit('updateAdjustableFields', field)
}
const getCorrectionValue = (field: string, index: number) => {
  return useCorrectionValue(field, index)
}
</script>
