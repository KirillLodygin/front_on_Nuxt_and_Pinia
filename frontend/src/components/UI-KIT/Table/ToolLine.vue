<template>
  <template v-if="enableAdditionalButtons">
    <div aria-label="Панель инструментов" class="table-toolbar" role="toolbar">
      <button
        class="btn bth-tool d-flex align-items-center gap-1"
        name="addObjectBtn"
        type="button"
        @click="onAddItemClick"
      >
        <i class="icon fi_plus-circle fa-fw"></i> {{ titleForAddButton }}
      </button>
      <button
        :disabled="!props.activeItem"
        class="btn bth-tool d-flex align-items-center gap-1"
        name="openObjectBtn"
        type="button"
        @click="openTableForProgram"
      >
        <i class="icon fi_file fa-fw"></i> Открыть таблицу для программы
      </button>
      <button
        :disabled="!props.activeItem"
        class="btn bth-tool d-flex align-items-center gap-1"
        name="openObjectBtn"
        type="button"
        @click="openTableForReport"
      >
        <i class="icon fi_file fa-fw"></i> Открыть таблицу в отчёт
      </button>
      <button
        disabled
        class="btn bth-tool d-flex align-items-center gap-1 me-auto"
        name="openObjectBtn"
        type="button"
        @click="onOpenObjectClick"
      >
        <i class="icon fi_trash fa-fw"></i> Удалить
      </button>
      <button
        class="btn bth-tool d-flex align-items-center gap-1"
        name="optionsBtn"
        type="button"
        @click="onOptionsClick"
      >
        <i class="icon fi_sliders p-0"></i> Параметры
      </button>
    </div>
  </template>

  <div v-if="!enableAdditionalButtons">
    <div aria-label="Панель инструментов" class="table-toolbar" role="toolbar">
      <button
        v-if="!$geoObject.linkExistingCardTable && !$geoObject.linkExistingObjectsTable"
        id="btn-add"
        class="btn bth-tool"
        name="addObjectBtn"
        type="button"
        @click="onAddObjectClick"
        @click.middle="onAddObjectClick"
      >
        <i class="icon fi_plus-circle"></i> {{ titleForAddButton }}
      </button>
      <button
        id="btn-open"
        :disabled="props.activeItem == null"
        class="btn bth-tool me-auto"
        name="openObjectBtn"
        type="button"
        @click="onOpenObjectClick"
        @click.middle="onOpenObjectClick"
      >
        <i class="icon fi_edit-3"></i> Открыть
      </button>
      <button
        v-if="isAnalogsTable"
        :disabled="!$filtersStore.objectsRespData.results?.length"
        class="btn bth-tool me-2"
        @click="downloadAnalogs()"
      >
        <i class="icon fi_file_excel me-1" />
        Экспорт аналогов
        <BSpinner v-if="isFetching" :small="true" class="ms-1" variant="primary" />
      </button>
      <button
        id="btn-map"
        :class="['btn bth-tool', { active: props.showMap }]"
        name="showMapObjectBtn"
        type="button"
        @click="onShowMapClick"
      >
        <i class="icon fi_map-pin"></i> Показать карту
      </button>
      <button
        class="btn bth-tool d-flex align-items-center gap-1"
        name="optionsBtn"
        type="button"
        @click="onOptionsClick"
      >
        <i class="icon fi_sliders p-0"></i> Параметры
      </button>
    </div>
    <div class="custom-tooltip-wrapper">
      <BTooltip
        ref="$btnAddTooltip"
        :no-fade="true"
        placement="bottom"
        target="btn-add"
        custom-class="tooltip-xl"
        triggers="hover"
        :noninteractive="btnAddTooltipHide"
        @hide="btnAddTooltipHide = false"
      >
        <div class="text-start">
          Перед созданием объекта обязательно проверьте по адресу наличие объекта в полном перечне объектов<br />
          Чтобы увидеть все объекты, нужно <a href="#" @click.prevent="onResetFilterClick">сбросить фильтр</a>
        </div>
      </BTooltip>
    </div>
  </div>
</template>

<script lang="ts" name="ToolLine" setup>
import type { PropType } from 'vue'
import type { BTooltip } from 'bootstrap-vue-next'
import { useNuxtApp } from 'nuxt/app'

const { $filtersStore, $geoObject } = useNuxtApp()
const $btnAddTooltip = ref<InstanceType<typeof BTooltip>>()
const btnAddTooltipHide = ref(false)

const props = defineProps({
  activeItem: { type: Object as PropType<any>, default: null },
  showMap: { type: Boolean, default: false },
  titleForAddButton: { type: String, required: true },
  navigateStringForAddButton: { type: String, required: true },
  enableAdditionalButtons: {
    type: Boolean,
    default: false,
  },
  defaultNavigate: { type: Boolean, default: true },
})

const emit = defineEmits([
  'onOpenObjectClick',
  'onAddItemClick',
  'onOpenTableForProgramClick',
  'onOpenTableForReportClick',
  'onShowMapClick',
  'onOptionsClick',
  'onAddObjectClick',
])
const route = useRoute()
const isAnalogsTable = computed(() => route.path.includes('/analog'))
// Пример метода для открытия таблицы для программы
const openTableForProgram = () => {
  // Ваш код для открытия таблицы для программы
  emit('onOpenTableForProgramClick')
}

// Пример метода для открытия таблицы в отчёт
const openTableForReport = () => {
  // Ваш код для открытия таблицы в отчёт
  emit('onOpenTableForReportClick')
}

const onAddItemClick = (event: Event) => {
  emit('onAddItemClick')
}

// Возвращает доп.аргумент для функции navigateTo
// Если в event значится нажатой средняя кнопка мышки, то доп.аргумент позволит открыть ссылку в новой вкладке
// В противном случае доп.аргумент будет пустой
const getNavigateOptions = (event: MouseEvent) => {
  return event.button == 1 || $geoObject.linkExistingCardTable || $geoObject.linkExistingObjectsTable
    ? { open: { target: '_blank' } }
    : {}
}

const onAddObjectClick = (event: MouseEvent) => {
  if (props.defaultNavigate) {
    navigateTo(`${props.navigateStringForAddButton}0`, getNavigateOptions(event))
  } else {
    emit('onAddObjectClick')
    console.log('Перенаправление отключено')
  }
}

const onOpenObjectClick = (event: MouseEvent) => {
  if (props.activeItem) {
    navigateTo(props.navigateStringForAddButton + props.activeItem.id, getNavigateOptions(event))
  }
}

const onShowMapClick = (event: MouseEvent) => {
  emit('onShowMapClick')
}

const onOptionsClick = (event: MouseEvent) => {
  emit('onOptionsClick')
}

const onResetFilterClick = (event: MouseEvent) => {
  $filtersStore.cleanFilterFn()
  btnAddTooltipHide.value = true
}

const isFetching = ref(false)
const downloadAnalogs = async () => {
  isFetching.value = true
  const ids = $filtersStore.objectsRespData.results.map((item: Record<string, any>) => item.id)
  await $filtersStore.exportAnalogs(ids.join(','), 'xlsx')
  isFetching.value = false
}
</script>
