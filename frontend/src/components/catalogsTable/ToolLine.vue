<template>
  <div aria-label="Панель инструментов" class="table-toolbar d-flex flex-wrap" role="toolbar">
    <GeoObjectLinkedObjectsFunctionalButtons class="h-auto m-0 p-0 border-0" :data="buttonList" />
  </div>
</template>

<script lang="ts" name="ToolLine" setup>
import type { PropType } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import { useRoute } from 'vue-router'
import GeoObjectLinkedObjectsFunctionalButtons from '../UI-KIT/Buttons/ButtonsGroup/GeoObjectLinkedObjectsFunctionalButtons.vue'

const route = useRoute()

const { $geoObject, $userStore, $filtersStore, $objectModelTable, $catalogsTable }: any = useNuxtApp()

const props = defineProps({
  activeItem: { type: Object as PropType<any>, default: null },
  showMap: { type: Boolean, default: false },
  titleForAddButton: { type: String, required: true },
  navigateStringForAddButton: { type: String, required: true },
})

const emit = defineEmits([
  'onOpenObjectClick',
  'onShowMapClick',
  'onOptionsClick',
  'onOpenFeature',
  'onAddCatalog',
  'onAddObject',
])

const onOpenObjectClick = (item: object) => {
  emit('onOpenObjectClick', item)
}

const onAddCatalog = (type: any) => {
  if (type === 2) {
    $catalogsTable.setActiveFolder({})
  }
  emit('onAddCatalog')
}

const onAddObject = (value: any) => {
  emit('onAddObject', value)
}

const onOpenFeature = (item: object) => {
  emit('onOpenFeature', item)
}

const onShowMapClick = (event: MouseEvent) => {
  emit('onShowMapClick')
}

const onOptionsClick = (event: MouseEvent) => {
  emit('onOptionsClick')
}

const linkExistingCardsTable = (object_type_calc: any) => {
  $geoObject.linkExistingCardType = object_type_calc
  $geoObject.linkExistingCardTable = true
  $userStore.setPageLoading(true)
  $filtersStore.appStartingFilterFunctions().then(() => {
    $filtersStore.updateSearchObjectTypeCalc(object_type_calc)

    $filtersStore.initFilters(object_type_calc)

    $filtersStore.getObjects()
    $userStore.setPageLoading(false)
  })
  $catalogsTable.prevHash = route.hash
  console.log('prevHash', $catalogsTable.prevHash)
  navigateTo({ hash: `#Привязка карточек к каталогу` })
}

function linkExistingObjectsTable() {
  $objectModelTable.$reset()
  $geoObject.linkExistingObjectsTableFiltersApplied = false
  $geoObject.linkExistingObjectsTable = true
  $catalogsTable.prevHash = route.hash
  console.log('prevHash', $catalogsTable.prevHash)
  navigateTo({ hash: `#Привязка объектов к каталогу` })
}

const buttonList: any = computed(() => [
  {
    type: 'select',
    for: ['panel'],
    title: 'Добавить каталог',
    disabled: false,
    iconClass: 'icon fi_folder-plus',
    objectType: ['B', 'Q', 'L'],
    group: null,
    visibale: true,
    disabledByReadonly: true,
    options: [
      {
        title: 'В текущую папку',
        disabled: false,
        iconClass: 'icon fi_folder-plus',
        value: '',
        function: () => onAddCatalog(1),
      },
      {
        title: 'В корень',
        disabled: false,
        iconClass: 'icon fi_folder-plus',
        value: '',
        function: () => onAddCatalog(2),
      },
    ],
  },
  {
    type: 'select',
    for: ['panel'],
    title: 'Добавить объект',
    disabled: false,
    iconClass: 'icon fi_plus-circle',
    objectType: ['B', 'Q', 'L'],
    group: null,
    visibale: true,
    disabledByReadonly: true,
    options: [
      {
        title: 'Земельный участок',
        disabled: true,
        iconClass: 'icon fi_plus-circle',
        value: 'L',
        function: () => onAddObject('L'),
      },
      {
        title: 'Здание',
        disabled: false,
        iconClass: 'icon fi_plus-circle',
        value: 'B',
        function: () => onAddObject('B'),
      },
      {
        title: 'Помещение',
        disabled: false,
        iconClass: 'icon fi_plus-circle',
        value: 'Q',
        function: () => onAddObject('Q'),
      },
    ],
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Привязать объект',
    disabled: false,
    iconClass: 'icon fi_link',
    objectType: ['B', 'Q', 'L'],
    group: null,
    visibale: true,
    disabledByReadonly: false,
    function: () => linkExistingObjectsTable(),
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
        function: () => linkExistingCardsTable('OO'),
      },
      {
        title: 'Предложения',
        disabled: false,
        iconClass: 'icon fi_link',
        function: () => linkExistingCardsTable('OA'),
      },
      {
        title: 'Исследования',
        disabled: false,
        iconClass: 'icon fi_link',
        function: () => linkExistingCardsTable('NE'),
      },
    ],
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Свойства',
    disabled: props.activeItem == null || !props.activeItem.children,
    iconClass: 'icon ksi_props',
    objectType: ['B', 'Q', 'L'],
    group: null,
    visibale: true,
    disabledByReadonly: false,
    function: () => onOpenFeature(props.activeItem),
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Открыть',
    disabled: props.activeItem == null,
    iconClass: 'icon fi_edit-3',
    objectType: ['B', 'Q', 'L'],
    group: null,
    visibale: true,
    disabledByReadonly: false,
    function: () => onOpenObjectClick(props.activeItem),
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Показать карту',
    disabled: false,
    iconClass: 'icon fi_map-pin',
    active: props.showMap,
    group: null,
    visibale: true,
    customClass: 'ms-auto',
    objectType: ['B', 'Q', 'L'],
    disabledByReadonly: false,
    function: onShowMapClick,
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Параметры',
    disabled: false,
    iconClass: 'icon fi_sliders p-0',
    objectType: ['B', 'Q', 'L'],
    group: null,
    visibale: true,
    disabledByReadonly: false,
    function: onOptionsClick,
  },
])
</script>

<style lang="scss" scoped>
:deep(.card-toolbar-wrapper) {
  flex-wrap: wrap-reverse;
  row-gap: 0.25rem;
  justify-content: flex-end;
}

:deep(#funcButtons > div > button:nth-child(8)) {
  width: 147.13px;
}
</style>
