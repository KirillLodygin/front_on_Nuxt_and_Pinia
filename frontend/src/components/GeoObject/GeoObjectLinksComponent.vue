<template>
  <div class="h-100 w-100 overflow-y">
    <div class="table-block h-100">
      <GeoObjectLinkedObjectsFunctionalButtons :data="functionalButtonsByType" />
      <LoadingCover v-if="$geoObject.isTableLoading" />
      <template v-else>
        <ks-dropdown ref="rowCtxMenu" :target="'_body'" drop-pos="pointer" :hide-on-menu-click="true">
          <div v-for="buttonData in functionalButtonsByType">
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
        <GeoObjectLinksTable
          :linked-objects="$geoObject.linkedObjectsToDisplayInTable"
          :linked-cards="$geoObject.linkedCardsToDisplayInTable"
          :sortable-header-data="sortableHeaderData"
          :active-item="activeItem"
          :loading="false"
          :style="showMap ? 'height: ' + tableSplHeight + '%' : 'height: 90%; margin-bottom: 30px'"
          @onRowCtx="onRowCtx"
          @setActiveItem="setActiveItem"
          @on-column-click="onColumnClick"
          @on-row-dbl-click="openActiveItem"
        />
      </template>
      <!-- <splitter v-if="showMap" v-model="tableSplHeight" :max="60" :min="20" style="margin: -14px 0"></splitter> -->
    </div>
    <TableSettingsModal
      v-model="isModalVisible"
      :data="tableParamsData"
      :table-params="tableParams"
      @accept-parameters="acceptParameters"
    />
    <AddObjectModal v-model="isAddObjectModalVisible" />
  </div>
</template>

<script lang="ts" setup>
import GeoObjectLinkedObjectsFunctionalButtons from '../UI-KIT/Buttons/ButtonsGroup/GeoObjectLinkedObjectsFunctionalButtons.vue'
import KsDropdown from '../MapComponent/KsDropdown.vue'
import TableSettingsModal from '../UI-KIT/Modals/TableSettingsModal.vue'
import AddObjectModal from './AddObjectModal.vue'
import Splitter from '~/components/UI-KIT/Splitter.vue'
import ObjectsLayer from '../MapComponent/ObjectsLayer.vue'
import LoadingCover from '../UI-KIT/Loaders/LoadingCover.vue'
import {
  createAnalog,
  createEvaluation,
  createResearch,
  linkExistingCard,
  linkExistingObject,
} from '~/app_constants/geoObjectTabs'
import _ from 'lodash'
import { calcTypeToPath } from '~/app_constants/routes'

const { $geoObject, $userStore, $filtersStore, $auth, $objectModelTable } = useNuxtApp()

onRenderTriggered(({ key, target, type }) => {
  console.log({ key, target, type }, 'TRIGGER')
})

const showMap = ref(false)
const tableSplHeight = ref(40)
const isModalVisible = ref(false)
const isAddObjectModalVisible = ref(false)

interface TableParamsDataInterface {
  limit: number
  displayedColumns: string[]

  sortField: string
  sortDirection: string
}
const tableParamsData = reactive<TableParamsDataInterface>({
  limit: 15,
  displayedColumns: [
    'index',
    'type',
    'name',
    'object_area',
    'price_sale',
    'date',
    'ads_type',
    'func_purpose',
    'ads_updated_internal',
  ],

  sortField: 'index',
  sortDirection: 'asc',
})
$geoObject.displayedColumns = [...tableParamsData.displayedColumns]
interface SortableHeaderInterface {
  title: string
  field: string
  sortDirection: 'none' | 'asc' | 'desc'
  sorted: boolean
  type: string
  visible: boolean
  accessor?: string
}

const sortableHeaderData: Ref<Record<string, SortableHeaderInterface>> = ref({
  type: {
    title: 'Тип',
    sortDirection: 'none',
    sorted: false,
    field: 'type',
    type: 'string',
    visible: true,
  },
  name: { title: 'Название', sortDirection: 'none', sorted: false, field: 'name', type: 'string', visible: true },

  object_area: {
    title: 'Площадь, м кв.',
    sortDirection: 'none',
    sorted: false,
    field: 'object_area',
    type: 'number',
    visible: true,
  },
  price_sale: {
    title: 'Цена, р.',
    sortDirection: 'none',
    sorted: false,
    field: 'price_sale',
    type: 'number',
    visible: true,
  },
  date: {
    title: 'Дата оценки/предложения',
    sortDirection: 'none',
    sorted: false,
    field: 'date',
    type: 'date',
    visible: true,
  },
  ads_type: {
    title: 'Тип оценки/торгов',
    sortDirection: 'none',
    sorted: false,
    field: 'ads_type',
    type: 'string',
    visible: true,
  },
  func_purpose: {
    title: 'Функциональное назначение',
    sortDirection: 'none',
    sorted: false,
    field: 'func_purpose',
    type: 'string',
    accessor: 'name',
    visible: true,
  },
  ads_updated_internal: {
    title: 'Изменён',
    sortDirection: 'none',
    sorted: false,
    field: 'ads_updated_internal',
    type: 'date',
    visible: true,
  },
})
const tableParams = {
  limit: {
    label: 'Число записей в таблице',
    required: true,
    options: [
      { value: 15, display_name: '15' },
      { value: 30, display_name: '30' },
      { value: 50, display_name: '50' },
      { value: 100, display_name: '100' },
    ],
    type: 'choice',
    isCube: true,
  },
  displayedColumns: {
    label: 'Отображение столбцов',
    required: true,

    options: Object.keys(sortableHeaderData.value).map((item) => {
      return {
        value: sortableHeaderData.value[item].field,
        display_name: sortableHeaderData.value[item].title,
      }
    }),
    type: 'checkbox',
    isCube: false,
  },
  sortField: {
    label: 'Сортировка по столбцу',
    required: false,
    options: Object.keys(sortableHeaderData.value).map((item) => {
      return {
        value: sortableHeaderData.value[item].field,
        display_name: sortableHeaderData.value[item].title,
      }
    }),
    type: 'choice',
    isCube: false,
  },
  sortDirection: {
    label: 'Направление сортировки',
    required: true,
    options: [
      { value: 'asc', display_name: 'По возрастанию' },
      { value: 'desc', display_name: 'По убыванию' },
      { value: 'none', display_name: 'По умолчанию' },
    ],
    type: 'choice',
    isCube: true,
  },
}
const acceptParameters = (data: TableParamsDataInterface) => {
  Object.assign(tableParamsData, JSON.parse(JSON.stringify(data)))
  $geoObject.displayedColumns = [...tableParamsData.displayedColumns]
  Object.keys(sortableHeaderData.value).forEach((item) => {
    sortableHeaderData.value[item].visible = tableParamsData.displayedColumns.includes(item)
  })
}
function onColumnClick(field: string, direction: 'asc' | 'desc' | 'none') {
  tableParamsData.sortField = field
  tableParamsData.sortDirection = direction
  clearSortedInfo()
  sortableHeaderData.value[field].sortDirection = direction
  sortableHeaderData.value[field].sorted = direction !== 'none'
  console.log('onColumnClick', field, direction)
}
function clearSortedInfo() {
  for (const key in sortableHeaderData.value) {
    sortableHeaderData.value[key].sortDirection = 'none'
    sortableHeaderData.value[key].sorted = false
  }
}
watch([() => tableParamsData.sortDirection, () => tableParamsData.sortField], () => {
  $geoObject.linkedCards.sort((a, b) => {
    // typeof a.file[sortField.value] === 'string'
    const sortField = tableParamsData.sortField ? tableParamsData.sortField : 'index'
    const sortDirection = tableParamsData.sortDirection
    console.log(sortField, sortDirection, 'SORT')
    if (sortDirection === 'none') {
      return a.index - b.index
    } else if (sortableHeaderData.value[sortField].type === 'string' && sortableHeaderData.value[sortField]) {
      let aValue: string
      let bValue: string
      const accessor = sortableHeaderData.value[sortField].accessor
      if (accessor) {
        aValue = a[sortField][accessor] ? a[sortField][accessor] : '-'
        bValue = b[sortField][accessor] ? b[sortField][accessor] : '-'
      } else if (sortField === 'type') {
        aValue = a.object_type_calc ? a.object_type_calc : '-'
        bValue = b.object_type_calc ? b.object_type_calc : '-'
      } else {
        aValue = a[sortField] ? a[sortField] : '-'
        bValue = b[sortField] ? b[sortField] : '-'
      }
      console.log(aValue, bValue, aValue.localeCompare(bValue), bValue.localeCompare(aValue))
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    } else if (sortableHeaderData.value[sortField].type === 'date' && sortableHeaderData.value[sortField]) {
      let aDate: number
      let bDate: number
      if (sortField === 'date') {
        if (a.object_type_calc === 'OA') {
          aDate = new Date(a.ads_updated).getTime()
        } else aDate = new Date(a.date_calc).getTime()
        if (b.object_type_calc === 'OA') {
          bDate = new Date(b.ads_updated).getTime()
        } else bDate = new Date(b.date_calc).getTime()
      } else {
        aDate = new Date(a[sortField]).getTime()
        bDate = new Date(b[sortField]).getTime()
      }

      return sortDirection === 'desc' ? aDate - bDate : bDate - aDate
    } else {
      return sortDirection === 'desc' ? a[sortField] - b[sortField] : b[sortField] - a[sortField]
    }
  })
  $geoObject.linkedObjects.sort((a, b) => {
    // typeof a.file[sortField.value] === 'string'
    const sortField = tableParamsData.sortField ? tableParamsData.sortField : 'index'
    const sortDirection = tableParamsData.sortDirection
    console.log(sortField, sortDirection, 'SORT')
    if (sortDirection === 'none') {
      return a.index - b.index
    } else if (sortableHeaderData.value[sortField].type === 'string' && sortableHeaderData.value[sortField]) {
      let aValue: string
      let bValue: string
      const accessor = sortableHeaderData.value[sortField].accessor
      if (accessor) {
        aValue = a[sortField][accessor] ? a[sortField][accessor] : '-'
        bValue = b[sortField][accessor] ? b[sortField][accessor] : '-'
      } else if (sortField === 'type') {
        aValue = a.object_type ? a.object_type : '-'
        bValue = b.object_type ? b.object_type : '-'
      } else {
        aValue = a[sortField] ? a[sortField] : '-'
        bValue = b[sortField] ? b[sortField] : '-'
      }
      console.log(aValue, bValue, aValue.localeCompare(bValue), bValue.localeCompare(aValue))
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    } else if (sortableHeaderData.value[sortField].type === 'date' && sortableHeaderData.value[sortField]) {
      const aDate = new Date(a[sortField]).getTime()
      const bDate = new Date(b[sortField]).getTime()

      return sortDirection === 'desc' ? aDate - bDate : bDate - aDate
    } else {
      return sortDirection === 'desc' ? a[sortField] - b[sortField] : b[sortField] - a[sortField]
    }
  })
})

// watch(
//   () => activeItem.value,
//   () => {
//     const newButtons = _.cloneDeep(functionalButtonsData.value)
//     newButtons.forEach((button: any) => {
//       if (button.title === 'Открыть') {
//         button.disabled = !activeItem.value
//       }
//     })
//     functionalButtonsData.value = newButtons
//   },
// )

const functionalButtonsData = ref([
  {
    type: 'button',
    for: ['panel'],
    title: 'Добавить помещение',
    disabled: false,
    iconClass: 'icon fi_plus-circle',
    objectType: ['B'],
    group: null,
    visibale: true,
    disabledByReadonly: true,
    function: (): void => {
      isAddObjectModalVisible.value = true
    },
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Добавить здание',
    disabled: false,
    iconClass: 'icon fi_plus-circle',
    objectType: ['L'],
    group: null,
    visibale: true,
    disabledByReadonly: true,
    function: (): void => {
      isAddObjectModalVisible.value = true
    },
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Привязать здание',
    disabled: false,
    iconClass: 'icon fi_link',
    objectType: ['L'],
    group: null,
    visibale: true,
    disabledByReadonly: true,
    function: linkExistingBuildingObjectsTable,
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Привязать помещение',
    disabled: false,
    iconClass: 'icon fi_link',
    objectType: ['B'],
    group: null,
    visibale: true,
    disabledByReadonly: true,
    function: linkExistingQuarterObjectsTable,
  },
  {
    type: 'select',
    for: ['panel'],
    title: 'Добавить карточку',
    disabled: false,
    iconClass: 'icon fi_plus-circle',
    objectType: ['B', 'Q', 'L'],
    group: null,
    visibale: true,
    disabledByReadonly: true,
    options: [
      {
        title: 'Оценки',
        disabled: false,
        iconClass: 'icon fi_plus-circle',
        function: createEvaluationCard,
      },
      { title: 'Предложения', disabled: false, iconClass: 'icon fi_plus-circle', function: createAnalogCard },
      { title: 'Исследования', disabled: false, iconClass: 'icon fi_plus-circle', function: createResearchCard },
    ],
  },
  {
    type: 'select',
    for: ['panel'],
    title: 'Привязать карточку',
    disabled: false,
    iconClass: 'icon fi_link',
    objectType: ['B', 'Q', 'L'],
    group: null,
    visibale: true,
    disabledByReadonly: true,
    options: [
      {
        title: 'Оценки',
        disabled: false,
        iconClass: 'icon fi_link',
        function: linkExistingEvaluationCardsTable,
      },
      {
        title: 'Предложения',
        disabled: false,
        iconClass: 'icon fi_link',
        function: linkExistingAnalogsCardsTable,
      },
      {
        title: 'Исследования',
        disabled: false,
        iconClass: 'icon fi_link',
        function: linkExistingResearchCardsTable,
      },
    ],
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Открыть',
    disabled: true,
    iconClass: 'icon fi_edit-3',
    objectType: ['B', 'Q', 'L'],
    group: null,
    visibale: true,
    disabledByReadonly: false,
    function: openActiveItem,
  },
  {
    type: 'button',
    for: ['ctx'],
    title: 'Открыть сводную карточку',
    disabled: false,
    iconClass: 'icon fi_edit-3',
    objectType: ['B', 'Q', 'L'],
    group: 'object',
    visibale: true,
    disabledByReadonly: false,
    function: openObject,
  },
  {
    type: 'button',
    for: ['ctx'],
    title: 'Удалить связь с объектом',
    disabled: false,
    iconClass: 'icon fi_unlink icon-sm',
    objectType: ['B', 'Q', 'L'],
    group: 'object',
    visibale: true,
    disabledByReadonly: true,
    function: deleteLinkObject,
  },
  {
    type: 'button',
    for: ['ctx'],
    title: 'Открыть карточку',
    disabled: false,
    iconClass: 'icon fi_edit-3',
    objectType: ['B', 'Q', 'L'],
    group: 'card',
    visibale: true,
    disabledByReadonly: false,
    function: openCard,
  },
  {
    type: 'button',
    for: ['ctx'],
    title: 'Удалить связь с объектом',
    disabled: false,
    iconClass: 'icon fi_unlink icon-sm',
    objectType: ['B', 'Q', 'L'],
    group: 'card',
    visibale: true,
    disabledByReadonly: true,
    function: deleteLinkCard,
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Показать карту',
    disabled: true,
    iconClass: 'icon fi_map-pin',
    active: false,
    group: null,
    visibale: true,
    customClass: 'ms-auto',
    objectType: ['B', 'Q', 'L'],
    disabledByReadonly: false,
    function: () => (showMap.value = !showMap.value),
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Параметры',
    disabled: false,
    iconClass: 'icon fi_sliders',
    objectType: ['B', 'Q', 'L'],
    group: null,
    visibale: true,

    disabledByReadonly: false,
    function: () => (isModalVisible.value = true),
  },
])

const functionalButtonsByType = computed(() => {
  return functionalButtonsData.value.filter(
    (item) => item.objectType.includes($geoObject.objectData.object_type) && item.visibale === true,
  )
})

function emptyFunction() {}
const activeItem: Ref<Record<string, any> | null> = ref(null)
const activeItemType: Ref<string | null> = ref(null)
const rowCtxMenu: any = ref(null)
const setActiveItem = (item: any, type: string) => {
  console.log(item, 'setActive')
  activeItem.value = item
  activeItemType.value = type

  mutateButtons()
}
const onRowCtx = (event: Event, item: any, type: string) => {
  console.log(item)
  activeItem.value = item
  activeItemType.value = type
  mutateButtons()
  if (rowCtxMenu.value) rowCtxMenu.value.show(event)
}
watch(
  () => $geoObject.readOnly,
  () => {
    mutateButtons()
  },
)
onMounted(() => {
  mutateButtons()
})
function mutateButtons() {
  functionalButtonsData.value.forEach((button: any) => {
    if ($geoObject.readOnly && button.disabledByReadonly) {
      button.disabled = true
    } else button.disabled = false
    if (button.title === 'Открыть') {
      button.disabled = !activeItem.value
    }
    if (button.title === 'Показать карту') {
      button.active = showMap.value
      button.disabled = true
    }
    if (button.group === null) {
      button.visibale = true
    } else if (button.group !== activeItemType.value) {
      button.visibale = false
    } else button.visibale = true
  })
}

function test() {}

function createEvaluationCard() {
  $geoObject.createCardCalcType = 'OO'
  $geoObject.noNavigateNewCard = true
  navigateTo({ hash: `#${createEvaluation}` })
}
function createAnalogCard() {
  $geoObject.createCardCalcType = 'OA'
  $geoObject.noNavigateNewCard = true
  navigateTo({ hash: `#${createAnalog}` })
}
function createResearchCard() {
  $geoObject.createCardCalcType = 'NE'
  $geoObject.noNavigateNewCard = true
  navigateTo({ hash: `#${createResearch}` })
}
function linkExistingEvaluationCardsTable() {
  $geoObject.linkExistingCardType = 'OO'
  $geoObject.linkExistingCardTable = true
  $userStore.setPageLoading(true)
  $filtersStore.appStartingFilterFunctions().then(() => {
    $filtersStore.updateSearchObjectTypeCalc('OO')

    $filtersStore.initFilters('OO')

    $filtersStore.getObjects()
    $userStore.setPageLoading(false)
  })
  navigateTo({ hash: `#${linkExistingCard}` })
}
function linkExistingAnalogsCardsTable() {
  $geoObject.linkExistingCardType = 'OA'
  $geoObject.linkExistingCardTable = true
  $userStore.setPageLoading(true)
  $filtersStore.appStartingFilterFunctions().then(() => {
    $filtersStore.updateSearchObjectTypeCalc('OA')

    $filtersStore.initFilters('OA')

    $filtersStore.getObjects()
    $userStore.setPageLoading(false)
  })
  navigateTo({ hash: `#${linkExistingCard}` })
}
function linkExistingResearchCardsTable() {
  $geoObject.linkExistingCardType = 'NE'
  $geoObject.linkExistingCardTable = true
  $userStore.setPageLoading(true)
  $filtersStore.appStartingFilterFunctions().then(() => {
    $filtersStore.updateSearchObjectTypeCalc('NE')

    $filtersStore.initFilters('NE')

    $filtersStore.getObjects()
    $userStore.setPageLoading(false)
  })
  navigateTo({ hash: `#${linkExistingCard}` })
}

function linkExistingQuarterObjectsTable() {
  $objectModelTable.$reset()
  $geoObject.linkExistingObjectsTableFiltersApplied = false
  $geoObject.linkExistingObjectsType = 'Q'
  $geoObject.linkExistingObjectsTable = true
  // $userStore.setPageLoading(true)

  navigateTo({ hash: `#${linkExistingObject}` })
}

function linkExistingBuildingObjectsTable() {
  $objectModelTable.$reset()
  $geoObject.linkExistingObjectsTableFiltersApplied = false
  $geoObject.linkExistingObjectsType = 'B'
  $geoObject.linkExistingObjectsTable = true
  // $userStore.setPageLoading(true)

  navigateTo({ hash: `#${linkExistingObject}` })
}

async function deleteLinkCard() {
  if (activeItem.value) {
    await $geoObject.unlinkCardsWithSideEffect([activeItem.value.id])
  }

  activeItem.value = null
  activeItemType.value = null
}
async function deleteLinkObject() {
  if (activeItem.value) {
    await $geoObject.unlinkObjectsWithSideEffect([activeItem.value.id])
  }

  activeItem.value = null
  activeItemType.value = null
}

function openCard() {
  if (activeItem.value) {
    navigateTo(`/${calcTypeToPath[activeItem.value.object_type_calc]}/${activeItem.value.id}`, {
      external: true,
      open: {
        target: '_blank',
      },
    })
  }
}
function openObject() {
  if (activeItem.value) {
    navigateTo(`/real_estate/${activeItem.value.id}`, {
      external: true,
      open: {
        target: '_blank',
      },
    })
  }
}
function openActiveItem() {
  if (activeItemType.value === 'object') {
    openObject()
  } else {
    openCard()
  }
}
</script>

<style lang="scss" scoped></style>
