<template>
  <div aria-label="Панель инструментов" class="table-toolbar d-flex flex-wrap" role="toolbar">
    <GeoObjectLinkedObjectsFunctionalButtons :data="buttonList" />
  </div>
</template>

<script lang="ts" name="ToolLine" setup>
import { defineProps, defineEmits } from 'vue'
import GeoObjectLinkedObjectsFunctionalButtons from '../UI-KIT/Buttons/ButtonsGroup/GeoObjectLinkedObjectsFunctionalButtons.vue'
import { titleForAddButton } from '~/app_constants/objectsTable'
const { $geoObject } = useNuxtApp()

const props = defineProps({
  activeItem: { type: Object as PropType<any>, default: null },
  showMap: { type: Boolean, default: false },
  navigateStringForAddButton: { type: String, required: true },
})

const emit = defineEmits([
  'onOpenTableForProgramClick',
  'onOpenTableForReportClick',
  'onOpenObjectClick',
  'onOptionsClick',
  'onAddItemClick',
])

const getNavigateOptions = (event: MouseEvent) => {
  return event.button == 1 || $geoObject.linkExistingCardTable || $geoObject.linkExistingObjectsTable
    ? { open: { target: '_blank' } }
    : {}
}

const openTableForProgram = () => {
  // Ваш код для открытия таблицы для программы
  emit('onOpenTableForProgramClick')
}

const openTableForReport = () => {
  // Ваш код для открытия таблицы в отчёт
  emit('onOpenTableForReportClick')
}

const onOpenObjectClick = (event: MouseEvent) => {
  if (props.activeItem) {
    navigateTo(props.navigateStringForAddButton + props.activeItem.id, getNavigateOptions(event))
  }
}

const onOptionsClick = (event: MouseEvent) => {
  emit('onOptionsClick')
}

const onAddItemClick = (event: Event) => {
  emit('onAddItemClick')
}

const buttonList: any = computed(() => [
  {
    type: 'button',
    for: ['panel'],
    title: titleForAddButton.references,
    disabled: false,
    iconClass: 'icon fi_plus-circle fa-fw',
    objectType: ['B', 'Q', 'L'],
    group: null,
    visibale: true,
    disabledByReadonly: false,
    function: onAddItemClick,
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Открыть таблицу для программы',
    disabled: !props.activeItem,
    iconClass: 'icon fi_file fa-fw',
    objectType: ['B', 'Q', 'L'],
    group: null,
    visibale: true,
    disabledByReadonly: false,
    function: openTableForProgram,
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Открыть таблицу в отчёт',
    disabled: !props.activeItem,
    iconClass: 'icon fi_file fa-fw',
    objectType: ['B', 'Q', 'L'],
    group: null,
    visibale: true,
    disabledByReadonly: false,
    function: openTableForReport,
  },
  {
    type: 'button',
    for: ['panel'],
    title: 'Удалить',
    disabled: true,
    iconClass: 'icon fi_trash fa-fw',
    objectType: ['B', 'Q', 'L'],
    group: null,
    visibale: true,
    disabledByReadonly: false,
    function: onOpenObjectClick,
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
    customClass: 'ms-auto',
    disabledByReadonly: false,
    function: onOptionsClick,
  },
])
</script>
