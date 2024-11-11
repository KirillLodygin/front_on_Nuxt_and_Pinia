<template>
  <MiniInfoModal
    v-model="isComparisonModal"
    :title="'ПАРАМЕТРЫ СРАВНЕНИЯ'"
    :icon="'fi_compare'"
    :footer-btn-title="'Продолжить'"
    :size="'lg'"
    :disabled="isDisabled"
    @onCloseModelValue="onCloseComparisonModel"
    @onRefuseChanges="onRefuseComparison"
    @onSaveChanges="continueComparison"
  >
    <template v-slot:content>
      <AlertInfo />
      <div class="overflow-y-auto position-relative w-100 mt-4 mb-2" style="height: 400px">
        <table class="table table-content" style="{table-layout: fixed}">
          <thead id="_columns" class="w-100">
          <tr>
            <th
              v-for="header in parametersComparisonTableHeaderObject"
              class="col"
              scope="col"
              :style="`width: ${getColumnWidthPercent(header.parameter)}`"
            >
              {{ header.title }}
            </th>
          </tr>
          </thead>

          <tbody id="_body" class="w-100">
          <tr v-for="(pricingFactor, index) of pricingFactorsArr" class="'table-string'">
            <td
              v-for="header in parametersComparisonTableHeaderObject"
              class="col"
              :style="`width: ${getColumnWidthPercent(header.parameter)}`"
              :key="header.parameter"
            >
              <div v-if="header.parameter === 'is_checked'" @click="onCheck(index)">
                <i class="icon" :class="pricingFactor[header.parameter] ? 'fi_check-square' : 'fi_square'" />
              </div>
              <div v-if="header.parameter === 'pricing_factor'">{{ pricingFactor[header.parameter].label }}}</div>
              <div v-if="header.parameter === 'all_types'">
                <ReferenceOptionSelect
                  :id="`all_types_${pricingFactor.pricing_factor.field}`"
                  :default-value="pricingFactor[header.parameter]"
                  :disabled="!pricingFactor.is_checked"
                  :field="pricingFactor.pricing_factor.field"
                  :options="distanceOptions"
                  area="pricing"
                  @setData="
                      (value) => {
                        setPricingFactorValue(value, index)
                      }
                    "
                />
              </div>
              <div v-if="header.parameter === 'weight'">
                <NumberInput
                  :id="`weight_${pricingFactor.pricing_factor.field}`"
                  :default-value="pricingFactor[header.parameter]"
                  :disabled="!pricingFactor.is_checked"
                  :field="pricingFactor.pricing_factor.field"
                  :index="0"
                  :step="1"
                  :isReadonly="true"
                  area="pricing"
                />
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </template>
  </MiniInfoModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { navigateTo, useNuxtApp } from 'nuxt/app'
import { parametersComparisonTableHeaderObject } from '~/app_constants/comparisonTable'
import { distanceOptions } from '~/app_constants/comparisonTable'

import MiniInfoModal from '~/components/UI-KIT/Modals/MiniInfoModal.vue'
import AlertInfo from '~/components/UI-KIT/Alerts/AlertInfo.vue'
import ReferenceOptionSelect from '~/components/UI-KIT/Selects/ReferenceOptionSelect.vue'
import NumberInput from '~/components/UI-KIT/Inputs/NumberInput.vue'

const { $comparison, $displayCompareObjectStore } = useNuxtApp()

const isComparisonModal = computed(() => $comparison.isComparisonModal)
const isDisabled = computed(() => !$comparison.currentPricingFactorsArr.map((item) => item.is_checked).includes(true))
const compareId = computed(() => $comparison.compareId)
const pricingFactorsArr = computed(() => $comparison.currentPricingFactorsArr)

const onCloseComparisonModel = () => {
  if (isComparisonModal.value) {
    $comparison.changeIsComparisonModal(false)
  }
}

const continueComparison = () => {
  $comparison.isUpdateComparisonObjectsCoefficients()
  $displayCompareObjectStore.mapRerenderKey = $displayCompareObjectStore.mapRerenderKey + 1
  $displayCompareObjectStore.route = null
  $comparison.offIsShowStub()
  navigateTo(`/compare/${compareId.value}`)
}

const onRefuseComparison = () => {
  console.log('onRefuseComparison')
}

const getColumnWidthPercent = (parameter: string) => {
  switch (parameter) {
    case 'is_checked':
      return '8%'

    case 'pricing_factor':
      return '37%'

    default:
      return '25%'
  }
}

const onCheck = (index: number) => {
  $comparison.onCheckPricingFactor(index)
}

const setPricingFactorValue = (value: string, index: number) => {
  $comparison.setPricingFactorValue(value, index)
}
</script>

<style scoped></style>
