<template>
  <div class="w-100 h-100 d-flex flex-column">
    <div class="d-flex align-items-center">
      <FunctionalButtons
        :data="
          savedComparisonsListLength && !comparisonObjectsLength
            ? savedComparisonsTableButtonsData
            : compareObjectsFunctionalButtonsData
        "
      />
    </div>
    <div class="overflow-y-auto position-relative w-100 mb-2" :class="isShowMap ? 'h-50' : 'h-100'">
      <LoadingCover v-if="isShowStub"></LoadingCover>
      <template v-else>
        <CompareObjectsTable
          v-if="comparisonObjectsLength"
          :functional-buttons-data="compareObjectsFunctionalButtonsData"
          @on-item-select="
            (obj) => {
              AddObjectsToCompareMapRef?.fitActiveItem()
            }
          "
        />
        <SavedComparisonsTable
          v-else-if="savedComparisonsListLength && !comparisonObjectsLength"
          :functional-buttons-data="savedComparisonsTableButtonsData"
        />
        <AlertInfo v-else label="Объекты для сравнения не выбраны!" />
      </template>
    </div>
    <AddObjectsToCompareMap
      ref="AddObjectsToCompareMapRef"
      v-if="!isShowStub && isShowMap"
      class="h-50"
      @on-item-select="
        (obj) => {
          console.log('SELECT OBJ FROM MAP', obj)
          $comparison.setActiveComparisonItem(obj)
        }
      "
    />
  </div>
</template>

<script lang="ts" setup>
import { navigateTo, useNuxtApp } from 'nuxt/app'
import { computed, onMounted, ref } from 'vue'
import { currentComparisonList } from '~/app_constants/comparisonConsts'

import CompareObjectsTable from '~/components/GeoObject/compare/CompareObjectsTable.vue'
import AddObjectsToCompareMap from '~/components/GeoObject/compare/AddObjectsToCompareMap.vue'
import SavedComparisonsTable from '~/components/GeoObject/compare/SavedComparisonsTable.vue'
import FunctionalButtons from '~/components/UI-KIT/Buttons/ButtonsGroup/FunctionalButtons.vue'
import AlertInfo from '~/components/UI-KIT/Alerts/AlertInfo.vue'
import LoadingCover from '~/components/UI-KIT/Loaders/LoadingCover.vue'

interface Props {
  setTabName: (tab: string) => void
}

const props = defineProps<Props>()

const { $comparison } = useNuxtApp()

const isMiniInfoModal = ref(false)
const AddObjectsToCompareMapRef = ref<InstanceType<typeof AddObjectsToCompareMap> | null>(null)
onMounted(async () => {
  $comparison.onIsShowStub()
  $comparison.resetActiveComparisonItem()
  $comparison.initCurrentCompare()
  $comparison.setSavedComparisons().then(() => {
    $comparison.offIsShowStub()
  })
})

const isShowStub = computed(() => $comparison.isShowStub)
const isShowMap = computed(() => $comparison.isShowMap)
const comparisonObjectsLength = computed(() => $comparison.currentComparisonObjects.length)
const savedComparisonsListLength = computed(() => $comparison.savedComparisonsList.length)
const compareId = computed(() => $comparison.compareId)
const activeComparisonItem = computed(() => $comparison.activeComparisonItem)
const compareName = computed(() => $comparison.compareName)

const isOpenCompareDisabled = computed(() => {
  if (!$comparison.compareId) return false
  if ($comparison.compareId === currentComparisonList) return !!$comparison.comparisonObjects.length
  return !!$comparison.savedComparisonsList.length
})

const compareObjectsFunctionalButtonsData = computed((): any[] => [
  {
    type: 'button',
    for: ['panel'],
    title: 'Добавить объект',
    disabled: false,
    iconClass: 'icon fi_plus-circle',
    function: addObject,
  },
  {
    type: 'button',
    for: ['panel', 'ctx'],
    title: 'Открыть',
    disabled: !activeComparisonItem.value,
    iconClass: 'icon fi_edit-3',
    function: navToAnalog,
  },
  {
    type: 'button',
    for: ['panel', 'ctx'],
    title: 'Убрать из сравнения',
    disabled: !activeComparisonItem.value,
    iconClass: 'icon fi_compare-off',
    function: isDeleteActiveComparisonItem,
  },
  {
    type: 'space',
    for: ['panel'],
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Показать карту',
    disabled: false,
    iconClass: 'icon fi_map-pin',
    active: isShowMap.value,
    function: () => {
      $comparison.switchIsShowMap()
    },
  },
])

const savedComparisonsTableButtonsData = computed((): any[] => [
  {
    type: 'button',
    for: ['panel'],
    title: 'Добавить объекты в сравнение',
    disabled: !compareId.value,
    iconClass: 'icon fi_plus-circle',
    function: addObject,
  },
  {
    type: 'button',
    for: ['panel', 'ctx'],
    title: 'Открыть сравнение',
    disabled: !isOpenCompareDisabled.value,
    iconClass: 'icon fi_compare',
    function: isOpenCompare,
  },
  {
    type: 'button',
    for: ['panel', 'ctx'],
    title: 'Удалить сравнение',
    disabled: !(compareId.value && compareId.value !== currentComparisonList),
    iconClass: 'icon fi_trash-2',
    function: deleteCompare,
  },
  {
    type: 'space',
    for: ['panel'],
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Показать карту',
    disabled: false,
    iconClass: 'icon fi_map-pin',
    active: isShowMap.value,
    function: () => {
      $comparison.switchIsShowMap()
    },
  },
])

function setIsMiniInfoModal() {
  isMiniInfoModal.value = true
}

function isDeleteActiveComparisonItem() {
  $comparison.isDeleteActiveComparisonItem()
  compareObjectsFunctionalButtonsData.value.forEach((item: any) => {
    if ((item.title === 'Открыть' || item.title === 'Убрать из сравнения') && !item.disabled) item.disabled = true
  })
}

function addObject() {
  isOpenCompare()
  navigateTo('/real_estate?mode=all')
}

function isOpenCompare() {
  $comparison.resetActiveComparisonItem()
  props.setTabName(`${compareId.value === currentComparisonList ? compareId.value : compareName.value}`)
  if (compareId.value !== currentComparisonList) {
    $comparison.setCompareId(Number(compareId.value))
    $comparison.resetActiveComparisonItem()
    $comparison.changeCurrentComparisonObjects()
    props.setTabName(`${$comparison.getComparisonObjectNameById(compareId.value || null)}`)
    return
  }
  $comparison.isOpenCurrentCompare()
}

function deleteCompare() {
  if (compareId.value) {
    $comparison.deleteCompare()
    return
  }
  $comparison.isClearComparisonObjects()
}

function navToAnalog() {
  if (!activeComparisonItem.value) return
  navigateTo(`/real_estate/${activeComparisonItem.value.id}#Стандартные%20поля`)
}
</script>

<style lang="scss" scoped>
.compare-title {
  height: max-content;
}
</style>
