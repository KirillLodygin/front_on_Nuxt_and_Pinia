<template>
  <tr class="stage-two-table-field-tr">
    <td v-if="props.tabTitle !== stageTabName2 && props.tabTitle !== stageTabName3"></td>
    <td class="align-middle">
      <div class="row m-1 justify-content-around">
        <div class="col p-0">
          {{ utilitiesAndOperatingCostsTitle }}
        </div>
        <div class="col-3 h-100">
          <div
            :class="['analogs-carousel-func btn btn-sm-rounded', $calculations.getCorrectionButtonStyle(field)]"
            @click="() => setReferencesModal(props.field)"
          >
            <i class="icon fi_sliders order" />
          </div>
        </div>
      </div>
    </td>
    <td>{{ utilitiesAndOperatingCostsNotIncluded }}</td>
    <td v-for="(analog, index) of displayedAnalogs">
      <template v-if="!getUtilitiesAndOperatingCostsList(analog).length"
        >{{ utilitiesAndOperatingCostsNotIncluded }}
      </template>
      <template v-else>
        <span v-for="string of getUtilitiesAndOperatingCostsList(analog)"> {{ string }}<br /> </span>
      </template>
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import {
  utilitiesAndOperatingCostsNotIncluded,
  utilitiesAndOperatingCostsTitle,
  stageTabName2,
  stageTabName3,
} from '~/app_constants/calculationsConsts'
import { useUtilitiesAndOperatingCostsList } from '~/composables/Calculations/useUtilitiesAndOperatingCostsList'
import type { aimType } from '~/types/calculationsTypes'

interface Props {
  analogsViewStartIndex: number
  tabTitle: string
  field: string
}

const props = defineProps<Props>()
const emit = defineEmits(['setReferencesModal'])

const { $calculations }: any = useNuxtApp()

const displayedAnalogs = computed(() =>
  $calculations.selectedAnalogs.slice(props.analogsViewStartIndex, props.analogsViewStartIndex + 3),
)

const setReferencesModal = (field: string) => {
  emit('setReferencesModal', true, field)
}

const getUtilitiesAndOperatingCostsList = (analog: aimType) => {
  return useUtilitiesAndOperatingCostsList(analog)
}
</script>
