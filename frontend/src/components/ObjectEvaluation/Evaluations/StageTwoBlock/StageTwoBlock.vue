<template>
  <div
    :class="{ 'my-pointer-event': $calculations.evaluationStatus === 'E' }"
    class="overflow-y-auto overflow-x-hidden position-relative h-100"
  >
    <table class="table table-content" style="table-layout: fixed">
      <thead id="_columns" class="w-100">
        <tr>
          <th
            v-if="props.tabs[activeTabIndex] !== stageTabName2 && props.tabs[activeTabIndex] !== stageTabName3"
            class="col align-middle text-center"
            scope="col"
            style="width: 3%"
          ></th>
          <th class="col" scope="col" style="width: 20%">Показатель</th>
          <th
            :style="{
              width:
                props.tabs[activeTabIndex] !== stageTabName2 && props.tabs[activeTabIndex] !== stageTabName3
                  ? '17%'
                  : '20%',
            }"
            class="col"
            scope="col"
          >
            Объект оценки
          </th>
          <th v-for="(analog, index) of displayedAnalogs" class="col" scope="col" style="width: 20%">
            <div class="d-flex w-100 justify-content-lg-start">
              <div class="position-relative">
                <div
                  v-if="$calculations.selectedAnalogs.length > 3 && index === 0"
                  class="btn btn-outline-secondary btn-sm-rounded analogs-carousel left"
                  :class="{ disabled: analogsViewStartIndex === 0 }"
                >
                  <i class="icon icon-lg fi_chevron-left" @click="() => switchAnalogsCarousel('-')" />
                </div>
              </div>
              <div
                :id="`row_${index}_${analog.id}`"
                :class="{
                  'text-danger': 'is_deleted_error' in analog && analog['is_deleted_error'],
                }"
                class="d-flex align-items-center"
                style="white-space: nowrap"
              >
                Предложение #{{ analogsViewStartIndex + index + 1 }}
                <div
                  class="btn btn-outline-secondary btn-sm-rounded analogs-carousel-func"
                  @click="() => openGallery(analog)"
                >
                  <i class="icon icon-lg fi_image" />
                </div>
                <div
                  v-if="$calculations.evaluationStatus !== 'E'"
                  class="btn btn-outline-secondary btn-sm-rounded analogs-carousel-func"
                  @click="() => removeAnalog(analog)"
                >
                  <i class="icon icon-lg fi_x" />
                </div>
              </div>
              <div class="position-relative">
                <div
                  v-if="$calculations.selectedAnalogs.length > 3 && index === displayedAnalogs.length - 1"
                  class="btn btn-outline-secondary btn-sm-rounded analogs-carousel right"
                  :class="{ disabled: analogsViewStartIndex + 3 === $calculations.selectedAnalogs.length }"
                  style="right: -40px"
                >
                  <i class="icon icon-lg fi_chevron-right" @click="() => switchAnalogsCarousel('+')" />
                </div>
              </div>
            </div>
            <BTooltip
              v-if="'is_deleted_error' in analog && analog['is_deleted_error']"
              :target="`row_${index}_${analog.id}`"
              custom-class="tooltip-xl"
              placement="left"
              triggers="hover"
            >
              <div class="text-start w-100">{{ analog_error_text }}</div>
            </BTooltip>
          </th>
        </tr>
      </thead>

      <tbody id="_body">
        <template v-for="(group, index) of fieldsForStage" class="table-string">
          <GroupTitle
            v-if="group.title && group.title === tabs[activeTabIndex]"
            :title="group.title"
            :tab-title="props.tabs[activeTabIndex]"
            :displayed-analogs-length="displayedAnalogs.length"
          />

          <template
            v-for="field in group.fields"
            v-if="
              (group.group === 'general_information' && activeTabIndex !== tabs.length - 1) ||
              (group.group === 'utilities_and_operating_costs' && activeTabIndex === 1) ||
              group.title === tabs[activeTabIndex]
            "
            :key="field"
          >
            <ObjectAreaRowInGeneralInformation
              v-if="
                generalInformationFields.includes(field) &&
                generalInformationFields.indexOf(field) === generalInformationFields.length - 2
              "
              :analogs-view-start-index="analogsViewStartIndex"
              :tab-title="props.tabs[activeTabIndex]"
            />

            <UtilitiesTitleRow
              v-if="field === utilitiesArray[0]"
              :analogs-view-start-index="analogsViewStartIndex"
              :tab-title="props.tabs[activeTabIndex]"
              :field="field"
              @setReferencesModal="setReferencesModal"
            />

            <FieldValueRow
              v-if="isShowRow(field)"
              :field="field"
              :analogs-view-start-index="analogsViewStartIndex"
              :tab-title="props.tabs[activeTabIndex]"
              :tabs-length="props.tabs.length"
              @setReferencesModal="setReferencesModal"
              @updateAdjustableFields="updateAdjustableFields"
            />

            <RentCalculationBlock
              v-if="rentCalculationArray.includes(field)"
              :field="field"
              :analogs-view-start-index="analogsViewStartIndex"
              :tab-title="props.tabs[activeTabIndex]"
            />

            <FieldWithValuesAccordingGuideBlock
              v-if="fieldsWithValuesAccordingGuideArray.includes(field)"
              :field="field"
              :analogs-view-start-index="analogsViewStartIndex"
              :tab-title="props.tabs[activeTabIndex]"
              @setReferencesModal="setReferencesModal"
            />

            <BasicCorrectionBlock
              v-if="$calculations.getIsCorrectionLine(field) || fieldsWithValuesAccordingGuideArray.includes(field)"
              :field="field"
              :analogs-view-start-index="analogsViewStartIndex"
              :tab-title="props.tabs[activeTabIndex]"
            />

            <LocationFloorCorrectionBlock
              v-if="field === locationFloorArray[locationFloorArray.length - 1]"
              :field="field"
              :analogs-view-start-index="analogsViewStartIndex"
            />

            <EngineeringCommunicationCorrectionBlock
              v-if="field === engineeringCommunicationArray[engineeringCommunicationArray.length - 1]"
              :field="field"
              :analogs-view-start-index="analogsViewStartIndex"
            />
          </template>
        </template>

        <AddFactorsBlock
          v-if="isSecondGroupAdjustmentsTab && addFactorsArray?.length"
          v-for="field in addFactorsArray"
          :field="field"
          :analogs-view-start-index="analogsViewStartIndex"
          :tab-title="props.tabs[activeTabIndex]"
          @setReferencesModal="setReferencesModal"
          @updateAdjustableFields="updateAdjustableFields"
        />
      </tbody>
    </table>

    <template v-if="isBuildingForSale && props.tabs[activeTabIndex] === stageTabName5">
      <CorrectionIntoAccountLandPlotBlock :analogs-view-start-index="analogsViewStartIndex" />
    </template>

    <template v-if="isBuildingForSale && props.tabs[activeTabIndex] === stageTabName6">
      <IsolatingCostOfLandPlotsBlock :analogs-view-start-index="analogsViewStartIndex" />
    </template>

    <template v-if="activeTabIndex === tabs.length - 2">
      <!-- Итоговая корректировка по независимым элементам и Скорректированная стоимость -->
      <table class="table table-content" style="table-layout: fixed">
        <tbody>
          <template v-for="key in Object.keys(results).slice(0, 2)">
            <tr>
              <td class="fw-medium">
                {{ key }}
              </td>
              <td>—</td>
              <td v-for="data of results[key]">
                {{ data }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </template>

    <template v-if="activeTabIndex === tabs.length - 1">
      <!-- Результаты по stage -->
      <table class="table table-content" style="table-layout: fixed">
        <tbody>
          <template v-for="key in Object.keys(results).slice(1)">
            <tr>
              <td class="fw-medium">
                {{ key }}
              </td>
              <td>—</td>
              <td v-for="data of results[key]">
                {{ data }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <table class="table table-content" style="table-layout: fixed">
        <tbody>
          <tr>
            <td :colspan="displayedAnalogs.length + 2">
              {{ weightedAverageOfMarketValue[aim.object_type][aim.ads_type] }}
            </td>
            <td>
              {{
                typeof weightedAverageCost === 'number'
                  ? `${numberWithSpaces(weightedAverageCost.toFixed(0))}  ₽`
                  : weightedAverageCost
              }}
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Итоговые  результаты -->
      <div class="h5 text-primary-emphasis mt-5 mb-3">Итоговые результаты расчётов</div>
      <table class="table table-content w-50">
        <tbody>
          <template v-for="[key, value] in Object.entries(finalResults)" :key="weightedAverageCost">
            <tr>
              <td class="fw-medium">
                {{ key }}
              </td>
              <td class="text-nowrap">
                {{ value }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </template>

    <ReferencesModal
      v-model="referencesModal"
      :files="computedFiles"
      @deleteFile="deleteFile"
      @fileUpload="fileUpload"
    />
    <Gallery v-model="isGalleryOpen" :imgSrcList="imgSrcList" :index="0"></Gallery>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import { isEmpty } from 'lodash'
import {
  absoluteValuesSumCorrectionTitle,
  adjustedCostTitleObject,
  analogueObjectWeightTitle,
  complianceWithObjectEvaluationCoefficient,
  finalAdjustment,
  rentCalculationArray,
  weightedAverageOfMarketValue,
  stageTabName2,
  stageTabName3,
  stageTabName4,
  stageTabName5,
  stageTabName6,
  stageTabName7,
} from '~/app_constants/calculationsConsts'
import { pathToImagesLink } from '~/app_constants/filesGroup'
import type { aimType } from '~/types/calculationsTypes'
import { numberWithSpaces } from '~/utils/calculationsUtils'
import GroupTitle from '~/components/ObjectEvaluation/Evaluations/StageTwoBlock/GroupTitle.vue'
import ObjectAreaRowInGeneralInformation from '~/components/ObjectEvaluation/Evaluations/StageTwoBlock/ObjectAreaRowInGeneralInformation.vue'
import UtilitiesTitleRow from '~/components/ObjectEvaluation/Evaluations/StageTwoBlock/UtilitiesTitleRow.vue'
import FieldValueRow from '~/components/ObjectEvaluation/Evaluations/StageTwoBlock/FieldValueRow.vue'
import RentCalculationBlock from '~/components/ObjectEvaluation/Evaluations/StageTwoBlock/RentCalculationBlock.vue'
import FieldWithValuesAccordingGuideBlock from '~/components/ObjectEvaluation/Evaluations/StageTwoBlock/FieldWithValuesAccordingGuideBlock.vue'
import BasicCorrectionBlock from '~/components/ObjectEvaluation/Evaluations/StageTwoBlock/BasicCorrectionBlock.vue'
import LocationFloorCorrectionBlock from '~/components/ObjectEvaluation/Evaluations/StageTwoBlock/LocationFloorCorrectionBlock.vue'
import EngineeringCommunicationCorrectionBlock from '~/components/ObjectEvaluation/Evaluations/StageTwoBlock/EngineeringCommunicationCorrectionBlock.vue'
import AddFactorsBlock from '~/components/ObjectEvaluation/Evaluations/StageTwoBlock/AddFactorsBlock.vue'
import CorrectionIntoAccountLandPlotBlock from '~/components/ObjectEvaluation/Evaluations/StageTwoBlock/CorrectionIntoAccountLandPlotBlock.vue'
import IsolatingCostOfLandPlotsBlock from '~/components/ObjectEvaluation/Evaluations/StageTwoBlock/IsolatingCostOfLandPlotsBlock.vue'
import ReferencesModal from '~/components/ObjectEvaluation/Evaluations/StageTwoBlock/ReferencesModal.vue'
import Gallery from '~/components/UI-KIT/Gallery.vue'
import { analog_error_text } from '~/app_constants/wordAbbreviations'

const props = defineProps({
  tabs: { type: Array as PropType<string[]>, required: true },
})

const { $calculations, $baseURL }: any = useNuxtApp()
const analogsViewStartIndex = ref(0)

const activeTabIndex = computed(() => $calculations.activeTabIndex)
const aim = computed(() => $calculations.aim)
const analogs = computed(() => $calculations.selectedAnalogs)
const fieldsForStage = computed(() => $calculations.stageTwoTable)
const generalInformationFields = computed(
  () => fieldsForStage.value.filter((group: Record<string, any>) => group.group === 'general_information')[0].fields,
)
const displayedAnalogs = computed(() =>
  $calculations.selectedAnalogs.slice(analogsViewStartIndex.value, analogsViewStartIndex.value + 3),
)
const fieldsWithValuesAccordingGuideArray = computed(() => $calculations.fieldsWithValuesAccordingGuideArray)
const adjustableFields = computed(() => $calculations.adjustableFields)
const computedFiles = computed(() => {
  const files = $calculations.savedOrderId ? $calculations.orderFiles : $calculations.notSavedOrderFiles
  return files.filter((file: any) => file.description === $calculations.fieldForCorrection)
})

const locationFloorArray = computed(() => $calculations.locationFloorArray)
const isBuildingForSale = computed(() => $calculations.isBuildingForSale)
const engineeringCommunicationArray = computed(() => $calculations.engineeringCommunicationArray)
const utilitiesArray = computed(() => $calculations.utilitiesArray)
const addFactorsArray = computed(() => $calculations.getAddFactorsArray())
const order = computed(() => $calculations.order)
const finalAdjustmentTitle = computed(() =>
  isBuildingForSale.value
    ? $calculations.finalAdjustmentForCorrectionWithoutAccountLandPlot.label
    : finalAdjustment[$calculations.aim.ads_type],
)
const isShowEngineeringCommunicationCorrections = computed(
  () => $calculations.isShowEngineeringCommunicationCorrections,
)
const isShowLocationFloorCorrections = computed(() => $calculations.isShowLocationFloorCorrections)

const adjustedCostTitle = computed(() => adjustedCostTitleObject[$calculations.aim.ads_type])

const finalComplianceWithObjectEvaluationCoefficientsArray = computed(
  () => $calculations.finalComplianceWithObjectEvaluationCoefficientsArray,
)
const finalAnalogueObjectWeightsArray = computed(() => $calculations.finalAnalogueObjectWeightsArray)
const finalAdjustmentsArray = computed(() => $calculations.finalAdjustmentsArray)
const adjustedCostValueArray = computed(() =>
  $calculations.adjustedCostValueArray.map((cost: number | 'Ошибка!') => {
    if (cost !== 'Ошибка!') {
      return `${numberWithSpaces(Number(cost).toFixed(0))} ₽`
    }
    return cost
  }),
)
const absoluteSumCorrectionArray = computed(() => $calculations.absoluteSumCorrectionArray)

const weightedAverageCost = computed(() => $calculations.weightedAverageCost)

const results = computed(() => {
  return {
    [finalAdjustmentTitle.value]: finalAdjustmentsArray.value.slice(
      analogsViewStartIndex.value,
      analogsViewStartIndex.value + 3,
    ),
    [adjustedCostTitle.value]: adjustedCostValueArray.value.slice(
      analogsViewStartIndex.value,
      analogsViewStartIndex.value + 3,
    ),
    [absoluteValuesSumCorrectionTitle]: absoluteSumCorrectionArray.value.slice(
      analogsViewStartIndex.value,
      analogsViewStartIndex.value + 3,
    ),
    [complianceWithObjectEvaluationCoefficient]: finalComplianceWithObjectEvaluationCoefficientsArray.value.slice(
      analogsViewStartIndex.value,
      analogsViewStartIndex.value + 3,
    ),
    [analogueObjectWeightTitle]: finalAnalogueObjectWeightsArray.value.slice(
      analogsViewStartIndex.value,
      analogsViewStartIndex.value + 3,
    ),
  }
})

const finalResults = computed(() => $calculations.getFinalResults())

const fileUpload = (filesData: any) => {
  console.log('fileUpload filesData ', filesData)
  const filesWithDescriptions = Array.from(filesData).map((file: any) => {
    file.description = $calculations.fieldForCorrection
    return file
  })
  $calculations.orderFilesUpload(filesWithDescriptions)
}
const deleteFile = (file: any) => {
  $calculations.orderFilesDelete(file)
}

const switchAnalogsCarousel = (sign: string) => {
  if (sign === '-' && analogsViewStartIndex.value > 0) {
    analogsViewStartIndex.value--
  }
  if (sign === '+' && analogsViewStartIndex.value < analogs.value.length - 3) {
    analogsViewStartIndex.value++
  }
}

const referencesModal = ref(false)

const setReferencesModal = (bool: boolean, field: string) => {
  if (!adjustableFields.value.includes(field)) return

  $calculations.setFieldForCorrection(field)
  referencesModal.value = bool
}

const isSecondGroupAdjustmentsTab = computed(() => {
  return (
    $calculations.activeTabIndex === props.tabs.indexOf(stageTabName4) ||
    $calculations.activeTabIndex === props.tabs.indexOf(stageTabName7)
  )
})

const getAnalogIndex = (analog: Record<string, any>) => {
  const idsArr = analogs.value.map((analog: Record<string, any>) => analog.id)
  return idsArr.indexOf(analog.id)
}

const isShowRow = (field: string) => {
  if (fieldsWithValuesAccordingGuideArray.value.includes(field) || rentCalculationArray.includes(field)) return false
  if (locationFloorArray.value.slice(1).includes(field) && !isShowLocationFloorCorrections.value) return false
  return !(
    engineeringCommunicationArray.value.slice(1).includes(field) && !isShowEngineeringCommunicationCorrections.value
  )
}

const updateAdjustableFields = (field: string) => {
  if (!isEmpty(order.value) && order.value.evaluation_status === 'E') return
  $calculations.updateAdjustableFields(field)
}

const removeAnalog = async (analog: aimType) => {
  const filteredAnalogs = $calculations.selectedAnalogs.filter((item: aimType) => item.id !== analog.id)
  $calculations.initSelectedAnalogs()
  $calculations.setSelectedAnalogs(filteredAnalogs)
  if ($calculations.selectedAnalogs.length === 0) {
    navigateTo(`/evaluation/${$calculations.aim.id}#Расчёты`)
  } else {
    await $calculations.onRunCalculations()
  }
}

const isGalleryOpen: Ref<boolean> = ref(false)
const imgSrcList: Ref<any> = ref([])
const openGallery = (analog: aimType) => {
  const result: { title: string; url: string }[] = []
  if ('ads_screenshot' in analog) {
    result.push({
      title: analog.ads_screenshot.split('/')[-1],
      url: analog.ads_screenshot.includes('http')
        ? analog.ads_screenshot
        : $baseURL + pathToImagesLink + analog.ads_screenshot,
    })
  }
  if ('images_links' in analog) {
    analog.images_links.forEach((link: string) => {
      result.push({
        title: link.split('/')[-1],
        url: link.includes('http') ? link : $baseURL + pathToImagesLink + link,
      })
    })
  }
  imgSrcList.value = result
  isGalleryOpen.value = true
}
</script>
