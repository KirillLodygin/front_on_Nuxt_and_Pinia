<template>
  <div class="overflow-hidden overflow-y-auto" :style="{ height: `${computedHeight}px` }">
    <ul class="ps-0 h-100">
      <GeoLayersTreeItem v-for="node in treeData" :key="node.id" :node="node" />
    </ul>
  </div>
  <BModal v-model="styleSettingsModal" :without-icon="true" size="lg" body-class="p-0" centered>
    <template #title>
      <div class="col h5 my-1"><i class="icon icon-lg fi_layers me-1"></i> ПАРАМЕТРЫ СЛОЯ</div>
    </template>
    <GeoLayerSettings />
    <template #footer="{ cancel }">
      <div v-if="errorMessage" class="alert alert-danger my-3">{{ errorMessage }}</div>
      <div>
        <button
          :class="'btn btn-md btn-outline-secondary'"
          type="button"
          @click="
            () => {
              isSaving = false
              errorMessage = ''
              cancel()
            }
          "
        >
          {{ 'Отмена' }}
        </button>
        <button :class="'btn btn-md btn-primary ms-2'" type="button" :disabled="isSaving" @click="saveGeoLayerSettings">
          {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </div>
    </template>
  </BModal>
  <BModal v-model="importObjectsModal" body-class="px-4 py-3" centered>
    <template #title>
      <div class="col h5 my-1"><i class="icon icon-lg fi_log-in me-1"></i> ИМПОРТ ОБЪЕКТОВ В СЛОЙ</div>
    </template>
    <FileImport v-model:cleanBeforeImport="cleanBeforeImport" v-model:simplify="simplify" @get-file="getFile" />
    <template #footer="{ cancel }">
      <div v-if="errorMessage" class="alert alert-danger my-3">{{ errorMessage }}</div>
      <div>
        <button
          :class="'btn btn-md btn-outline-secondary'"
          type="button"
          @click="
            () => {
              isSaving = false
              errorMessage = ''
              cancel()
            }
          "
        >
          {{ 'Отмена' }}
        </button>
        <button :class="'btn btn-md btn-primary ms-2'" type="button" :disabled="isSaving" @click="uploadFile">
          {{ isSaving ? 'Загрузка...' : 'Загрузить' }}
        </button>
      </div>
    </template>
  </BModal>
  <ModalMessage
    v-model="layerClearModal"
    title="ОЧИСТКА СЛОЯ"
    variant="danger"
    ok-title="Очистить"
    ok-variant="secondary"
    @ok="() => $mapStore.clearGeoLayer()"
  >
    Слой "{{ node?.name }}" будет очищен от объектов. Действительно хотите очистить слой?
  </ModalMessage>
  <ModalMessage
    v-model="layerRemoveModal"
    title="КАСКАДНОЕ УДАЛЕНИЕ СЛОЯ"
    variant="danger"
    ok-title="Удалить"
    ok-variant="secondary"
    @ok="() => $mapStore.deleteGeoLayerSettings()"
  >
    Слой "{{ node?.name }}" будет удален вместе со всеми вложенными слоями и прикрепленными объектами. Действительно
    хотите удалить слой?
  </ModalMessage>
</template>

<script lang="ts" setup>
import type { geoLayerTreeNodeType } from '~/types/treeTypes'
import GeoLayersTreeItem from '~/components/MapInstruments/Tab1GeoLayersTree/GeoLayersTreeItem.vue'
import ModalMessage from '~/components/UI-KIT/Alerts/ModalMessage.vue'
import GeoLayerSettings from '~/components/MapInstruments/Tab1GeoLayersTree/GeoLayerSettings.vue'
import FileImport from '~/components/MapInstruments/Tab1GeoLayersTree/FileImport.vue'
import { computed } from 'vue'
import { geoLayerMainSettings } from '~/app_constants/mapInstrumentsData'

defineProps({
  treeData: { type: Array<geoLayerTreeNodeType>, required: false },
})
const { $mapStore } = useNuxtApp()

const isSaving = ref(false)
const errorMessage = ref('')

const layerRemoveModal = computed({
  get: () => $mapStore.layerRemoveModal,
  set: (value) => $mapStore.setLayerRemoveModal(value),
})

const layerClearModal = computed({
  get: () => $mapStore.layerClearModal,
  set: (value) => $mapStore.setLayerClearModal(value),
})

const saveGeoLayerSettings = async () => {
  isSaving.value = true
  errorMessage.value = ''
  try {
    await $mapStore.saveGeoLayerSettings()
    styleSettingsModal.value = false
  } catch (err: any) {
    console.error(err?.response._data)
    if (err?.response._data instanceof Object) {
      const fieldNamesMap = geoLayerMainSettings.reduce(
        (map, setting) => {
          map[setting.field] = setting.name
          return map
        },
        {} as Record<string, string>,
      )
      errorMessage.value = Object.entries(err.response._data)
        .map(([field, errors]) => {
          const errorMessages = Array.isArray(errors) ? errors.join(', ') : String(errors)
          return `${fieldNamesMap[field] || field}: ${errorMessages}`
        })
        .join('\n')
    } else if (err?.response._data) {
      errorMessage.value = JSON.stringify(err.response._data)
    } else {
      errorMessage.value = 'Неизвестная ошибка!'
    }
  } finally {
    isSaving.value = false
  }
}

const uploadFile = async () => {
  isSaving.value = true
  errorMessage.value = ''
  try {
    await $mapStore.uploadFile(fileForUpload.value, cleanBeforeImport.value, simplify.value)
    importObjectsModal.value = false
  } catch (err: any) {
    console.error(err?.response._data)
    if (err?.response._data instanceof Object) {
      const fieldNamesMap = geoLayerMainSettings.reduce(
        (map, setting) => {
          map[setting.field] = setting.name
          return map
        },
        {} as Record<string, string>,
      )
      errorMessage.value = Object.entries(err.response._data)
        .map(([field, errors]) => {
          const errorMessages = Array.isArray(errors) ? errors.join(', ') : String(errors)
          return `${fieldNamesMap[field] || field}: ${errorMessages}`
        })
        .join('\n')
    } else if (err?.response._data) {
      errorMessage.value = JSON.stringify(err.response._data)
    } else {
      errorMessage.value = 'Неизвестная ошибка!'
    }
  } finally {
    isSaving.value = false
  }
}

const importObjectsModal = computed({
  get: () => $mapStore.importObjectsModal,
  set: (value) => {
    if (!value) {
      fileForUpload.value = null
    }
    $mapStore.setImportObjectsModal(value)
  },
})
const cleanBeforeImport = ref(false)
const simplify = ref(true)
const styleSettingsModal = computed({
  get: () => $mapStore.styleSettingsModal,
  set: (value) => $mapStore.setStyleSettingsModal(value),
})

const fileForUpload = ref<File | null>(null)

const node = computed(() => $mapStore.geoLayerNode)
const computedHeight = computed(() => $mapStore.mapInstrumentPanelHeight - 65)

const getFile = (file: FileList) => {
  if (file.length) {
    fileForUpload.value = file[0]
  }
}
</script>
