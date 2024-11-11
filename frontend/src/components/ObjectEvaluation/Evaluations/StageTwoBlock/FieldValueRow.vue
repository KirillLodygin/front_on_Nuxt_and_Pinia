<template>
  <tr class="stage-two-table-field-tr">
    <td v-if="props.tabTitle !== stageTabName2 && props.tabTitle !== stageTabName3" class="align-middle text-center">
      <i
        v-if="
          !engineeringCommunicationArray.slice(1).includes(props.field) &&
          !locationFloorArray.slice(1).includes(props.field) &&
          !generalInformationFields.includes(props.field)
        "
        :class="[
          'icon icon-lg',
          adjustableFields.includes(props.field) || adjustableFields.includes(`${props.field}${ACCORDING_GUIDE}`)
            ? 'fi_checked-theme icon-primary'
            : 'fi_unchecked-theme icon-secondary',
        ]"
        @click="updateAdjustableFields(props.field)"
      />
    </td>
    <td class="align-middle">
      <div class="row m-1 justify-content-around">
        <div class="col p-0">
          {{ getFieldName(props.field) }}
        </div>
        <div v-if="useIsCorrectionFactorBlock(props.field)" class="col-3 h-100">
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

    <td>
      <template
        v-if="
          (locationFloorArray.includes(props.field) && props.field !== 'floor_number') ||
          (engineeringCommunicationArray.includes(props.field) && props.field !== engineeringCommunicationArray[0])
        "
      >
        <NumberInput
          :id="`${props.field}_0`"
          :default-value="getCorrectionValue(props.field, 0)"
          :disabled="referenceBooksSelected[props.field]?.source !== 'Ручное'"
          :field="props.field"
          :index="0"
        />
        <Tooltip :target="`${props.field}_0`" :value="getCorrectionValue(props.field, 0)" />
      </template>
      <template v-else-if="props.field === engineeringCommunicationArray[0]">
        <span v-for="string of getAimEngineeringCommunicationList()" :key="string">{{ string }}<br /></span>
      </template>

      <template v-else>
        {{
          props.field === 'date_calc'
            ? dateFormatting(getObjectFieldName(aim, props.field))
            : getObjectFieldName(aim, props.field)
        }}
      </template>
    </td>

    <td v-for="(analog, index) of displayedAnalogs" class="position-relative">
      <template
        v-if="
          (locationFloorArray.includes(props.field) && props.field !== 'floor_number') ||
          (engineeringCommunicationArray.includes(props.field) && props.field !== engineeringCommunicationArray[0])
        "
      >
        <NumberInput
          :id="`${props.field}_${index + 1}`"
          :default-value="getCorrectionValue(props.field, getAnalogIndex(analog) + 1)"
          :disabled="referenceBooksSelected[props.field]?.source !== 'Ручное'"
          :field="props.field"
          :index="getAnalogIndex(analog) + 1"
        />
        <Tooltip
          :target="`${props.field}_${index + 1}`"
          :value="getCorrectionValue(props.field, getAnalogIndex(analog) + 1)"
        />
      </template>
      <template v-else-if="props.field === engineeringCommunicationArray[0]">
        <span v-for="string of getAnalogEngineeringCommunicationList(analog)" :key="string">{{ string }}<br /></span>
      </template>
      <template v-else-if="utilitiesArray.includes(props.field) || operatingCostsArray.includes(props.field)">
        <NumberInput
          :key="`${props.field}_${getAnalogIndex(analog) + 1}`"
          :default-value="getCorrectionValue(props.field, getAnalogIndex(analog) + 1)"
          :disabled="isCorrectionFieldDisabled(field, !getUtilitiesAndOperatingCostsList(analog).length)"
          :field="props.field"
          :index="getAnalogIndex(analog) + 1"
          :step="0.01"
        />
        <Tooltip
          :target="`${props.field}_${index + 1}`"
          :value="getCorrectionValue(props.field, getAnalogIndex(analog) + 1)"
        />
      </template>
      <template v-else>
        {{ getAnalogFieldValue(props.field, analog) }}
      </template>
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import { ACCORDING_GUIDE, stageTabName2, stageTabName3 } from '~/app_constants/calculationsConsts'
import type { aimType } from '~/types/calculationsTypes'
import { dateFormatting } from '~/utils/calculationsUtils'
import { useNewPrice } from '~/composables/Calculations/useNewPrice'
import { useIsCorrectionFactorBlock } from '~/composables/Calculations/useIsCorrectionFactorBlock'
import { useUtilitiesAndOperatingCostsList } from '~/composables/Calculations/useUtilitiesAndOperatingCostsList'
import { useAimEngineeringCommunicationList } from '~/composables/Calculations/useAimEngineeringCommunicationList'
import { useAnalogEngineeringCommunicationList } from '~/composables/Calculations/useAnalogEngineeringCommunicationList'
import { useCorrectionValue } from '~/composables/Calculations/useCorrectionValue'
import NumberInput from '~/components/UI-KIT/Inputs/NumberInput.vue'
import Tooltip from '~/components/UI-KIT/Tooltip.vue'

const props = defineProps({
  analogsViewStartIndex: { type: Number, required: true },
  tabTitle: { type: String, required: true },
  field: { type: String, required: true },
  tabsLength: { type: Number, required: true },
})

const { $calculations }: any = useNuxtApp()

const displayedAnalogs = computed(() =>
  $calculations.selectedAnalogs.slice(props.analogsViewStartIndex, props.analogsViewStartIndex + 3),
)
const aim = computed(() => $calculations.aim)
const analogs = computed(() => $calculations.selectedAnalogs)
const adjustableFields = computed(() => $calculations.adjustableFields)
const activeTabIndex = computed(() => $calculations.activeTabIndex)
const engineeringCommunicationArray = computed(() => $calculations.engineeringCommunicationArray)
const locationFloorArray = computed(() => $calculations.locationFloorArray)
const utilitiesArray = computed(() => $calculations.utilitiesArray)
const operatingCostsArray = computed(() => $calculations.operatingCostsArray)
const fieldsForStage = computed(() => $calculations.stageTwoTable)
const generalInformationFields = computed(
  () => fieldsForStage.value.filter((group: Record<string, any>) => group.group === 'general_information')[0].fields,
)
const referenceBooksSelected = computed(() => $calculations.referenceBooksSelected)

const getFieldName = (field: string) => {
  return $calculations.getFieldName(field)
}
const getAnalogIndex = (analog: Record<string, any>) => {
  const idsArr = analogs.value.map((analog: Record<string, any>) => analog.id)
  return idsArr.indexOf(analog.id)
}
const getObjectFieldName = (object: any, field: string, index?: undefined | number) => {
  return $calculations.getObjectFieldName(object, field, index)
}
const getAnalogFieldValue = (field: string, analog: aimType) => {
  if (field === 'date_calc') {
    return dateFormatting(getObjectFieldName(analog, 'ads_updated', getAnalogIndex(analog)))
  }
  if (field === 'price_sale_per_m' && activeTabIndex.value === props.tabsLength - 2) {
    return useNewPrice(getAnalogIndex(analog), -1)
  }
  return getObjectFieldName(analog, field, getAnalogIndex(analog))
}
const isCorrectionFieldDisabled = (field: string, isUtilitiesAndOperatingCostsNotIncluded: boolean) => {
  if (isUtilitiesAndOperatingCostsNotIncluded) return true
  if (['utilities', 'operating_costs'].includes(field)) return true
  return referenceBooksSelected.value['utilities']?.source !== 'Ручное'
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
const getUtilitiesAndOperatingCostsList = (analog: aimType) => {
  return useUtilitiesAndOperatingCostsList(analog)
}
const getAimEngineeringCommunicationList = () => {
  return useAimEngineeringCommunicationList()
}
const getAnalogEngineeringCommunicationList = (analog: aimType) => {
  return useAnalogEngineeringCommunicationList(analog)
}
</script>
