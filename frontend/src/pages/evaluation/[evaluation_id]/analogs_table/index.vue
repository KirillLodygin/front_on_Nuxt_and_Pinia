<template>
  <div class="table-wrapper page-card h-100">
    <div class="content-block">
      <div class="h-100">
        <h1 class="page-header">ПРЕДЛОЖЕНИЯ</h1>
        <FiltersMenu />
        <FiltersAdditionalParametersModal v-if="isShowFiltersAdditionalParameters" />
      </div>
      <div
        v-if="isAllAnalogsInSelection ? isObjectsRespLoading : isAnalogsTableDataLoading"
        class="table-block h-100 w-100 overflow-hidden overflow-y-auto"
      >
        <div class="table-load-bg h-100 w-100 position-relative">
          <div class="table-load">
            <div class="spinner-border" role="status"></div>
            <div>Загрузка данных...</div>
          </div>
        </div>
      </div>
      <div v-else id="table-block" class="table-block h-100 overflow-hidden">
        <div ref="tableFiltersLine" class="p-0 m-0">
          <TableFiltersLine :table-header-filters="tableHeaderFilters"></TableFiltersLine>
        </div>
        <div ref="functionalButtons" class="p-0 m-0">
          <FunctionalButtons :data="functionalButtonsData" />
        </div>
        <div :style="{ height: computedHeight }" class="table-block p-0 m-0">
          <AnalogsTable
            :active-analog="activeAnalog"
            :analogs="computedAnalogs"
            :items-per-page="itemsPerPage"
            :loading="false"
            :page="page"
            :selected-analogs="$calculations.selectedAnalogs"
            @navTo="navTo"
            @onRowCtx="onRowCtx"
            @selectAnalog="selectAnalog"
            @setActiveAnalog="setActiveAnalog"
          />
        </div>
        <div ref="pager" class="p-0 m-0">
          <Pager
            :page="page"
            :pages="pages"
            :records="records"
            class="px-1 pb-1"
            @onChange="getRecords"
            @onRefresh="getRecords(page)"
          />
        </div>
        <div ref="buttons" class="row mt-auto">
          <div class="col-2">
            <ButtonWithLoader
              button-class="fixed-fs-17 w-100"
              height="100%"
              start-icon-class="icon fi_arrow-left"
              value="Вернуться к расчёту"
              variant="light"
              @click="returnToCalculation"
            />
          </div>
          <div class="col-10 d-flex">
            <div class="row w-100">
              <div class="col-1 text-center align-middle">
                <i class="icon icon-lg fi_alert-circle" />
              </div>
              <div class="col-11">
                <span>
                  Для добавления объектов в расчёт, выделите нужные предложения и нажмите кнопку “Вернуться к расчёту”
                </span>
              </div>
            </div>
          </div>
        </div>
        <ks-dropdown ref="rowCtxMenu" :target="'_body'" drop-pos="pointer">
          <div v-for="buttonData in functionalButtonsData">
            <button
              v-if="buttonData.type === 'button' && buttonData.for.includes('ctx')"
              :disabled="buttonData.disabled"
              class="dropdown-item cursor-pointer"
              @click="buttonData.function"
            >
              <i :class="buttonData.iconClass"></i> {{ buttonData.title }}
            </button>
          </div>
        </ks-dropdown>
        <ModalMessage v-model="infoModal" okOnly title="ИНФОРМАЦИЯ">
          Вы не можете добавить предложение в выборку пока он не проверен
        </ModalMessage>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AnalogsTable from '~/components/ObjectEvaluation/AnalogsComponents/AnalogsTable.vue'
import type { aimType } from '~/types/calculationsTypes'
import ModalMessage from '~/components/UI-KIT/Alerts/ModalMessage.vue'
import KsDropdown from '~/components/MapComponent/KsDropdown.vue'
import FunctionalButtons from '~/components/UI-KIT/Buttons/ButtonsGroup/FunctionalButtons.vue'
import TableFiltersLine from '~/components/UI-KIT/Table/TableFiltersLine.vue'
import FiltersMenu from '~/components/UI-KIT/FilterTable/FiltersMenu.vue'
import { cloneDeep } from 'lodash'
import ButtonWithLoader from '~/components/UI-KIT/Buttons/BaseFormButton.vue'
import Pager from '~/components/UI-KIT/Table/Pager.vue'
import FiltersAdditionalParametersModal from '~/components/UI-KIT/Modals/FiltersAdditionalParametersModal.vue'
import { computed } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import { calculateSimilarity } from '~/utils/similarity'

const { $calculations, $filtersStore, $userStore, $bvModal } = useNuxtApp()

const activeAnalog: Ref<aimType> = ref({})
const selectedAnalogs: Ref<any> = ref([])
const rowCtxMenu: any = ref(null)
const searchParams: any = ref({})
const infoModal: Ref<boolean> = ref(false)
const page = computed({
  get: () => $calculations.analogsTablePageRegulator,
  set: (newValue) => ($calculations.analogsTablePageRegulator = newValue),
})
const itemsPerPage = 15
const initSearchParams = {
  object_type: $calculations.aim.object_type,
  date_calc: $calculations.aim.date_calc?.split('T')[0],
  source_area: $calculations.aim.object_area,
  lat: $calculations.aim.geo_pos?.coordinates[1],
  lon: $calculations.aim.geo_pos?.coordinates[0],
}
const isShowFiltersAdditionalParameters = computed(() => {
  return $bvModal.isShowFiltersAdditionalParameters
})

const getRecords = async (_page: number) => {
  console.log(_page)
  page.value = _page
  $filtersStore.getObjects(_page)
}

const tableHeaderFilters = computed(() => {
  return $filtersStore.tableHeaderFilters
})

const isAllAnalogsInSelection = computed(() => $calculations.isAllAnalogsInSelection)
const isObjectsRespLoading = computed(() => $filtersStore.objectsRespLoading)
const isAnalogsTableDataLoading = computed(() => $calculations.isAnalogsTableDataLoading)

const objects = computed(() => $filtersStore.objectsRespData.results)
const analogs = computed(() => $calculations.allAnalogs)
const records = computed(() =>
  isAllAnalogsInSelection.value ? $filtersStore.objectsRespData.rows_filtered : analogs.value.length,
)

const pages = computed(() =>
  isAllAnalogsInSelection.value ? $filtersStore.objectsRespData.total_pages : Math.ceil(records.value / itemsPerPage),
)

const computedAnalogs = computed(() => {
  let result = []
  if (isAllAnalogsInSelection.value) {
    result = objects.value
  } else {
    const index = (page.value - 1) * itemsPerPage
    result = analogs.value.slice(index, index + itemsPerPage)
  }
  return result.map((analog: aimType) => {
    if (!('similarity' in analog)) {
      analog.similarity = calculateSimilarity($calculations.aim, analog, $calculations.searchRadius)
    }
    return analog
  })
})

onMounted(async () => {
  if (!$calculations.aim.id) {
    navigateTo('/evaluation/')
  }
  $filtersStore.appStartingFilterFunctions().then(() => {
    $filtersStore.updateSearchObjectTypeCalc('OA')
    $filtersStore.initFilters('OA')
    $filtersStore.updateCheckedFilter('object_type', $calculations.aim.object_type, true, 'OA')
  })
  $calculations.setIsAnalogsTable(true)
  const deletedAnalogs = $calculations.allDeletedAnalogs
    ? $calculations.allDeletedAnalogs.map((item: aimType) => item.id)
    : []
  $calculations.setRequestParams(initSearchParams)

  if (!$calculations.analogs.length && !$calculations.isAllAnalogsInSelection) {
    $calculations.setIsAnalogsTableDataLoading(true)
    $calculations.onIsShowStub()
    const data = await $calculations.getAnalogs()
    $calculations.setAnalogsCount(data.rows_filtered)

    $calculations.setAllAnalogs(data.results)
    $calculations.setIsAnalogsTableDataLoading(false)
    $calculations.offIsShowStub()
  }
})

onUnmounted(() => {
  $calculations.setIsAnalogsTable(false)
})

const setActiveAnalog = (analog: aimType) => {
  activeAnalog.value = analog
}

const selectAnalog = (analog: aimType) => {
  if ('id' in analog) {
    setSelectedAnalog(analog)
  } else {
    setSelectedAnalog(activeAnalog.value)
  }
}

// const filterObject = (obj: aimType, keys: string[]) => {
//   return keys.reduce(
//     (filtered, key) => {
//       if (key in obj) {
//         filtered[key] = obj[key]
//       }
//       return filtered
//     },
//     { similarity: -1 } as Record<string, any>,
//   )
// }
//
// const keysOfShortObject = [
//   'id',
//   'geo_layer',
//   'object_type',
//   'price_sale',
//   'price_sale_currency',
//   'price_sale_per_m',
//   'price_sale_per_m_currency',
//   'geo_pos',
//   'address_raw',
//   'is_deleted',
//   'is_checked',
//   'address_region',
//   'offer_date',
//   'object_area',
//   'ads_updated',
//   'ads_num',
//   'object_type_calc',
//   'ads_link',
//   'func_purpose',
//   'land_rights',
//   'financing',
//   'terms_of_sale',
//   'type_obj_room_or_building',
//   'tech_status',
//   'condition_finish',
//   'access_type',
//   'engineering_electricity',
//   'engineering_water',
//   'engineering_heat',
//   'engineering_severage',
//   'ads_type',
//   'date_calc',
//   'floor_number',
// ]
const setSelectedAnalog = (analog: aimType) => {
  selectedAnalogs.value = cloneDeep($calculations.selectedAnalogs)
  const isIncludedAnalog = selectedAnalogs.value.some((item: any) => item.id === analog.id)
  if (!isIncludedAnalog) {
    if (analog.is_checked) {
      selectedAnalogs.value.push(analog)
      // selectedAnalogs.value.push(filterObject(analog, keysOfShortObject))
      $calculations.setSelectedAnalogs(selectedAnalogs.value)
    } else {
      infoModal.value = true
    }
  } else {
    selectedAnalogs.value = selectedAnalogs.value.filter((item: any) => item.id !== analog.id)
    $calculations.setSelectedAnalogs(selectedAnalogs.value)
  }
  $calculations.checkAnalogs(analog)
}

const onRowCtx = (event: Event, analog: aimType) => {
  activeAnalog.value = analog
  if (rowCtxMenu.value) rowCtxMenu.value.show(event)
}

const navTo = (analog: aimType) => {
  if ('id' in analog) {
    navigateTo(`/analog/${analog.id}`)
  } else {
    navigateTo(`/analog/${activeAnalog.value.id}`)
  }

  const route = useRoute()
  $calculations.setAimPath({
    path: route.path,
    hash: route.hash,
  })
}

const newAnalog = () => {
  navigateTo('/analog/0/')
}

const functionalButtonsData: Ref<any> = ref([
  {
    type: 'button',
    for: ['panel'],
    title: 'Добавить новое предложение',
    disabled: false,
    iconClass: 'icon fi_plus-circle',
    function: newAnalog,
  },
  {
    type: 'button',
    for: ['ctx'],
    title: 'Добавить в расчёт',
    disabled: true,
    iconClass: 'icon fi_scale-left',
    function: selectAnalog,
  },
  {
    type: 'button',
    for: ['panel', 'ctx'],
    title: 'Открыть',
    disabled: true,
    iconClass: 'icon fi_edit-3',
    function: navTo,
  },
])

// наблюдение за активным аналогом, чтобы активировать кнопки на панели
watch([() => activeAnalog.value, () => selectedAnalogs.value.length], () => {
  functionalButtonsData.value.forEach((button: any) => {
    if (button.for.includes('ctx')) {
      button.disabled = activeAnalog.value === null
    }
    if (button.title === 'Добавить в расчёт') {
      button.disabled = selectedAnalogs.value.some((item: any) => item.id === activeAnalog.value.id)
    }
  })
})

watch(
  () => $filtersStore.allFilters,
  () => collectSerachParams(),
)
const collectSerachParams = () => {
  const excludeParams = ['object_type_calc', 'limit']
  const filterSearchParams = Object.keys($filtersStore.searchParams).reduce(
    (obj, key) => (excludeParams.includes(key) ? obj : { ...obj, [key]: $filtersStore.searchParams[key] }),
    {},
  )

  $calculations.setRequestParams({ ...initSearchParams, ...filterSearchParams })
  console.log($calculations.requestParams)
}

const tableFiltersLine: Ref<HTMLElement | null> = ref(null)
const functionalButtons: Ref<HTMLElement | null> = ref(null)
const pager: Ref<HTMLElement | null> = ref(null)
const buttons: Ref<HTMLElement | null> = ref(null)
const computedHeight = ref<string>('')

watch([() => tableFiltersLine.value, () => functionalButtons.value, () => pager.value, () => buttons.value], () => {
  if (
    (document.querySelector('#table-block') as HTMLElement) &&
    tableFiltersLine.value &&
    functionalButtons.value &&
    pager.value &&
    buttons.value
  ) {
    const parent = document.querySelector('#table-block') as HTMLElement
    console.log(parent.clientHeight)
    const tableHeight =
      parent.clientHeight -
      tableFiltersLine.value.clientHeight -
      functionalButtons.value.clientHeight -
      pager.value.clientHeight -
      buttons.value.clientHeight -
      55
    computedHeight.value = `${tableHeight}px`
  }
})

const returnToCalculation = () => {
  if (isAllAnalogsInSelection.value) {
    $calculations.setIsAnalogsTableDataLoading(true)
    // $calculations.setAllAnalogsAfterRequestToUniverse()
    $calculations.offIsAllAnalogsInSelection()
    $calculations.offIsShowStub()
  }
  navigateTo(`/evaluation/${$calculations.aim.id}#Расчёты`)
}
</script>
