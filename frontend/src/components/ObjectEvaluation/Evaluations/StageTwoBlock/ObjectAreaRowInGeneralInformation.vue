<template>
  <tr class="stage-two-table-field-tr">
    <td v-if="props.tabTitle !== stageTabName2 && props.tabTitle !== stageTabName3" class="align-middle text-center" />

    <td class="align-middle">
      <div class="row m-1 justify-content-around">
        <div class="col p-0">
          {{ getFieldName('object_area') }}
        </div>
      </div>
    </td>
    <td>{{ getObjectFieldName(aim, 'object_area') }}</td>
    <td v-for="(analog, index) of displayedAnalogs" class="position-relative">
      {{ getAnalogFieldValue('object_area', analog) }}
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import { stageTabName2, stageTabName3 } from '~/app_constants/calculationsConsts'
import type { aimType } from '~/types/calculationsTypes'

interface Props {
  analogsViewStartIndex: number
  tabTitle: string
}

const props = defineProps<Props>()

const { $calculations }: any = useNuxtApp()

const aim = computed(() => $calculations.aim)
const analogs = computed(() => $calculations.selectedAnalogs)
const displayedAnalogs = computed(() =>
  $calculations.selectedAnalogs.slice(props.analogsViewStartIndex, props.analogsViewStartIndex + 3),
)

const getAnalogIndex = (analog: Record<string, any>) => {
  const idsArr = analogs.value.map((analog: Record<string, any>) => analog.id)
  return idsArr.indexOf(analog.id)
}
const getFieldName = (field: string) => {
  return $calculations.getFieldName(field)
}
const getObjectFieldName = (object: any, field: string, index?: undefined | number) => {
  return $calculations.getObjectFieldName(object, field, index)
}
const getAnalogFieldValue = (field: string, analog: aimType) => {
  return getObjectFieldName(analog, field, getAnalogIndex(analog))
}
</script>
