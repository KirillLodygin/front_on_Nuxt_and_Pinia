<template>
  <BNavbarNav>
    <BNavItemDropdown
      v-model="viewLayerMenu"
      :menu-class="['overflow-visible shadow bg-inherit', { 'd-block': viewLayerMenu }]"
      :variant="null"
      right
      no-caret
      :skip-wrapper="true"
      class="m-0 p-0 bg-opacity-10 cursor-pointer"
      toggle-class="d-flex align-items-center"
    >
      <template #button-content>
        <i class="icon fi_more-vertical cursor-pointer me-2" />
      </template>
      <template #default v-if="viewLayerMenu">
        <BDropdownItem :variant="null" @click.stop="() => $mapStore.startSettings('main')">
          <i class="icon fi_edit-3 me-1" /> Изменить параметры
        </BDropdownItem>
        <BDropdownItem :variant="null" @click.stop="() => $mapStore.startSettings('style')">
          <i class="icon ksi_brush me-1" /> Настроить стиль
        </BDropdownItem>
        <BDropdownItem :variant="null" @click.stop="() => addGeoLayer(true)">
          <i class="icon fi_layers-plus-up me-1" /> Добавить слой впереди
        </BDropdownItem>
        <BDropdownItem :variant="null" @click.stop="() => addGeoLayer()">
          <i class="icon fi_layers-plus-up me-1" /> Добавить вложенный слой
        </BDropdownItem>
        <BDropdownItem :variant="null" @click.stop="() => $mapStore.setImportObjectsModal(true)">
          <i class="icon fi_log-in me-1" /> Импортировать объекты
        </BDropdownItem>
        <BDropdownDivider />
        <BDropdownItem :variant="null" @click.stop="() => $mapStore.setLayerClearModal(true)">
          <i class="icon fi_broom-wide me-1" /> Очистить слой
        </BDropdownItem>
        <BDropdownItem :variant="null" @click.stop="() => $mapStore.setLayerRemoveModal(true)">
          <i class="icon fi_trash me-1" /> Каскадное удаление
        </BDropdownItem>
      </template>
    </BNavItemDropdown>
  </BNavbarNav>
</template>

<script lang="ts" setup>
import { cloneDeep } from 'lodash'
import { geoLayerDefaultSettings } from '~/app_constants/mapInstrumentsData'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
})
const emit = defineEmits(['update:modelValue'])
const { $mapStore } = useNuxtApp()

const layersMenuShow = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const viewLayerMenu = ref(true)

const addGeoLayer = (root: boolean = false) => {
  const data = cloneDeep(geoLayerDefaultSettings)
  const parent = cloneDeep($mapStore.geoLayerNode)
  if (parent?.id) {
    if (root) {
      data.target_id = parent.id
    } else {
      data.tn_parent = parent.id
    }
  }
  $mapStore.setGeoLayerNode(data)
  $mapStore.startSettings('main')
}

watch(
  () => viewLayerMenu.value,
  () => {
    if (!viewLayerMenu.value) {
      emit('update:modelValue', viewLayerMenu.value)
    }
  },
)
</script>
