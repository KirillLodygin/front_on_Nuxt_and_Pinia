<template>
  <tr>
    <td v-if="tabTitle !== stageTabName2 && tabTitle !== stageTabName3"></td>
    <td>{{ getFieldName(field) }}</td>
    <td>—</td>
    <td v-for="(analog, index) of displayedAnalogs">
      <span>{{ useRentCalculation(field, getAnalogIndex(analog)) }}</span>
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import { stageTabName2, stageTabName3 } from '~/app_constants/calculationsConsts'
import { useRentCalculation } from '~/composables/Calculations/useRentCalculation'

const props = defineProps({
  analogsViewStartIndex: { type: Number, required: true },
  tabTitle: { type: String, required: true },
  field: { type: String, required: true },
})

const { $calculations }: any = useNuxtApp()

const displayedAnalogs = computed(() =>
  $calculations.selectedAnalogs.slice(props.analogsViewStartIndex, props.analogsViewStartIndex + 3),
)
const analogs = computed(() => $calculations.selectedAnalogs)

const getFieldName = (field: string) => {
  return $calculations.getFieldName(field)
}
const getAnalogIndex = (analog: Record<string, any>) => {
  const idsArr = analogs.value.map((analog: Record<string, any>) => analog.id)
  return idsArr.indexOf(analog.id)
}
</script>
