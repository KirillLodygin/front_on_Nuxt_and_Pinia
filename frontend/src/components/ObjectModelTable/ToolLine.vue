<template>
  <div aria-label="Панель инструментов" class="table-toolbar d-flex flex-wrap" role="toolbar">
    <GeoObjectLinkedObjectsFunctionalButtons :data="buttonList" />
  </div>
</template>

<script lang="ts" name="ToolLine" setup>
import { defineProps, defineEmits } from 'vue'
import GeoObjectLinkedObjectsFunctionalButtons from '../UI-KIT/Buttons/ButtonsGroup/GeoObjectLinkedObjectsFunctionalButtons.vue'
const { $geoObject } = useNuxtApp()

const props = defineProps({
  activeItem: { type: Object as PropType<any>, default: null },
  showMap: { type: Boolean, default: false },
  titleForAddButton: { type: String, required: true },
  navigateStringForAddButton: { type: String, required: true },
})

const emit = defineEmits([
  'onOpenObjectClick',
  'onAddItemClick',
  'onShowMapClick',
  'onOptionsClick',
  'onOpenFeature',
  'onAddCatalog',
  'onAddObject',
  'addComparison',
])

const getNavigateOptions = (event: MouseEvent) => {
  return event.button == 1 || $geoObject.linkExistingCardTable || $geoObject.linkExistingObjectsTable
    ? { open: { target: '_blank' } }
    : {}
}

const onAddObject = (value: any) => {
  emit('onAddObject', value)
}

const onOpenObjectClick = (event: MouseEvent) => {
  if (props.activeItem) {
    navigateTo(props.navigateStringForAddButton + props.activeItem.id, getNavigateOptions(event))
  }
}

const addComparison = (event: MouseEvent) => {
  if (props.activeItem) {
    emit('addComparison', props.activeItem)
  }
}

const onShowMapClick = () => {
  emit('onShowMapClick')
}

const onOptionsClick = () => {
  emit('onOptionsClick')
}

const buttonList: any = computed(() => [
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
        disabled: false,
        iconClass: 'icon fi_link',
        value: 'L',
        function: () => onAddObject('L'),
      },
      {
        title: 'Здание',
        disabled: false,
        iconClass: 'icon fi_link',
        value: 'B',
        function: () => onAddObject('B'),
      },
      {
        title: 'Помещение',
        disabled: false,
        iconClass: 'icon fi_link',
        value: 'Q',
        function: () => onAddObject('Q'),
      },
    ],
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
    function: onOpenObjectClick,
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Добавить в сравнение',
    disabled: props.activeItem == null,
    iconClass: 'icon fi_compare',
    objectType: ['B', 'Q', 'L'],
    group: null,
    visibale: true,
    disabledByReadonly: false,
    function: addComparison,
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
