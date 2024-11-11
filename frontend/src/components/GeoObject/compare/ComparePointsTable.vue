<template>
  <div>
    <table class="table table-content" style="table-layout: fixed">
      <thead id="_columns" class="w-100">
        <tr>
          <th>Объект</th>
          <th v-for="(comparisonObject, index) of displayedComparisonObjects" class="col new-style-table" scope="col">
            <div class="d-flex w-100 justify-content-lg-start">
              <div class="position-relative">
                <div
                  v-if="comparisonObjects.length > 4 && index === 0"
                  class="btn btn-outline-secondary btn-sm-rounded analogs-carousel left"
                  :class="{ disabled: comparisonObjectsViewStartIndex === 0 }"
                >
                  <i class="icon icon-lg fi_chevron-left" @click="() => switchComparisonObjectsCarousel('-')" />
                </div>
              </div>
              <div :id="`row_${index}_${comparisonObject.id}`" class="d-flex align-items-center">
                <span v-html="getObjectName(comparisonObject)"></span>
                <div
                  class="btn btn-outline-secondary btn-sm-rounded analogs-carousel-func"
                  @click="() => removeComparisonObject(comparisonObject)"
                >
                  <i class="icon icon-lg fi_x" />
                </div>
              </div>
              <div class="position-relative">
                <div
                  v-if="comparisonObjects.length > 4 && index === displayedComparisonObjects.length - 1"
                  class="btn btn-outline-secondary btn-sm-rounded analogs-carousel right"
                  :class="{ disabled: comparisonObjectsViewStartIndex + 4 === comparisonObjects.length }"
                  style="right: -40px"
                >
                  <i class="icon icon-lg fi_chevron-right" @click="() => switchComparisonObjectsCarousel('+')" />
                </div>
              </div>
            </div>
          </th>
        </tr>
        <tr>
          <th>Адрес</th>
          <th v-for="comparisonObject of displayedComparisonObjects" class="col new-style-table" scope="col">
            {{ comparisonObject.address_raw }}
          </th>
        </tr>
      </thead>

      <tbody id="_body" class="w-100">
        <tr v-for="pricingFactor of pricingFactors" class="table-string">
          <td>{{ pricingFactor.pricing_factor.label }}</td>
          <td v-for="comparisonObject of displayedComparisonObjects">
            <div class="d-flex gap-3">
              <div class="weight-label">
                {{
                  getCoefficient(
                    comparisonObject.coefficients[pricingFactor.pricing_factor.field],
                    comparisonObject[`${pricingFactor.pricing_factor.field}${_DESCR}`],
                  )
                }}
              </div>
              <div>
                <i class="icon" :class="getIcon(pricingFactor.all_types)" />{{
                  getValueString(
                    pricingFactor.all_types,
                    comparisonObject[`${pricingFactor.pricing_factor.field}${_DESCR}`],
                  )
                }}
              </div>
            </div>
          </td>
        </tr>
        <tr class="table-string">
          <td class="font-500">Общий балл</td>
          <td v-for="comparisonObject of displayedComparisonObjects">
            {{
              comparisonObject.final_coefficient === noDataAvailable
                ? comparisonObject.final_coefficient
                : comparisonObject.final_coefficient.toFixed(1)
            }}
            <i v-if="isMaxFinalCoefficient(comparisonObject.final_coefficient)" class="icon icon-lg fi_award" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import {useNuxtApp, useRoute} from 'nuxt/app'
import { max } from 'lodash'
import { computed, ref } from 'vue'
import { getOnFootLine, getOnCarLine, getDirectLine } from '~/utils/tableCellsValues'
import { _DESCR } from '~/app_constants/geoTsofTable'
import { noDataAvailable } from '~/app_constants/comparisonConsts'

const { $comparison } = useNuxtApp()
const comparisonObjectsViewStartIndex = ref(0)

const comparisonObjects = computed(() => $comparison.currentComparisonObjects)
const displayedComparisonObjects = computed(() =>
  $comparison.currentComparisonObjects.slice(
    comparisonObjectsViewStartIndex.value,
    comparisonObjectsViewStartIndex.value + 4,
  ),
)
const pricingFactors = computed(() => $comparison.currentPricingFactorsArr.filter((item) => item.is_checked))

const finalCoefficientsArray = computed(() => $comparison.currentComparisonObjects.map((obj) => obj.final_coefficient))

const description = computed(() => $comparison.description)

const compareNewLabel = computed(() => $comparison.compareNewLabel)

const getObjectName = (obj: Record<string, any>) => (obj.name ? obj.name : `${obj.geo_pos.coordinates}`)

const removeComparisonObject = (obj: Record<string, any>) => {
  $comparison.removeComparisonObject(obj)
  if (comparisonObjects.value.length < 2) {
    $comparison.switchIsCompareStart(false)
    return
  }
  $comparison.isUpdateComparisonObjectsCoefficients()
}

const switchComparisonObjectsCarousel = (sign: string) => {
  if (sign === '-' && comparisonObjectsViewStartIndex.value > 0) {
    comparisonObjectsViewStartIndex.value--
  }
  if (sign === '+' && comparisonObjectsViewStartIndex.value < comparisonObjects.value.length - 3) {
    comparisonObjectsViewStartIndex.value++
  }
}

const getIcon = (pricingFactorType: string) => {
  switch (pricingFactorType) {
    case 'by_foot':
      return 'ic-walk'

    case 'by_car':
      return 'ic-rent_car'

    default:
      return 'fi_line'
  }
}

const getValueString = (pricingFactorType: string, pricingFactorFieldObject: Record<string, any>) => {
  switch (pricingFactorType) {
    case 'by_foot':
      return getOnFootLine(pricingFactorFieldObject)

    case 'by_car':
      return getOnCarLine(pricingFactorFieldObject)

    default:
      return getDirectLine(pricingFactorFieldObject)
  }
}

const getCoefficient = (weight: number | string, pricingFactorFieldObject: Record<string, any> | null) => {
  if (!pricingFactorFieldObject) return 0

  return weight === noDataAvailable ? weight : Number(weight).toFixed(1)
}

const isMaxFinalCoefficient = (weight: number) =>
  weight === max(finalCoefficientsArray.value.filter((item) => item !== noDataAvailable))

const setCompareNewLabel = (event: Event) => {
  const target = event.target as HTMLInputElement
  $comparison.setCompareNewLabel(target.value)
}
</script>

<style lang="scss" scoped>
.new-style-table {
  word-break: break-word;
  overflow-wrap: break-word;
}
</style>
