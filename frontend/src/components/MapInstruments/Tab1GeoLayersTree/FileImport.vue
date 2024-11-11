<template>
  <div class="modal-body-description"><i class="icon fi_layers-plus-up me-2" />Выбран слой "{{ node?.name }}"</div>
  <div class="form-label">Файл с данными для импорта <i class="icon form_required-star" /></div>
  <div class="mb-3">
    <FileInput @get-files="(files) => emit('getFile', files)" v-model:fileLabelTextReset="fileLabelTextReset" />
  </div>
  <div class="form-check">
    <input class="form-check-input me-2" type="checkbox" v-model="computedSimplify" id="simplify" />
    <label class="form-check-label" for="simplify"> Упростить полигоны из файла </label>
  </div>
  <div class="form-check">
    <input class="form-check-input me-2" type="checkbox" v-model="computedCleanBeforeImport" id="cleanBeforeImport" />
    <label class="form-check-label" for="cleanBeforeImport"> Очистить слой перед импортом </label>
  </div>
</template>

<script setup lang="ts">
import FileInput from '~/components/UI-KIT/Inputs/FileInput.vue'
import { computed } from 'vue'
const props = defineProps({
  cleanBeforeImport: { type: Boolean, required: true },
  simplify: { type: Boolean, required: true },
})
const emit = defineEmits(['update:cleanBeforeImport', 'update:simplify', 'getFile'])
const fileLabelTextReset = computed({
  get: () => $mapStore.fileLabelTextReset,
  set: (value) => {
    $mapStore.setFileLabelTextReset(value)
  },
})
const { $mapStore } = useNuxtApp()
const computedCleanBeforeImport = computed({
  get: () => props.cleanBeforeImport,
  set: (val) => emit('update:cleanBeforeImport', val),
})
const computedSimplify = computed({
  get: () => props.simplify,
  set: (val) => emit('update:simplify', val),
})
const node = computed(() => $mapStore.geoLayerNode)
</script>
