<template>
  <div class="ms-2 d-flex">
    <span>
      {{ headersLabels[activeTabIndex].toUpperCase() }}
    </span>
    <span class="ms-auto me-2 d-flex">
      <template v-if="activeTabIndex === 1">
        <i
          class="icon icon-lg fi_repeat me-2 cursor-pointer"
          title="Поменять отображение слоев"
          @click="changeLayersView"
        ></i>
        <i
          class="icon icon-lg fi_eye-off me-2 cursor-pointer"
          title="Включить/отключить отображение слоёв на карте"
          @click="resetLayersView"
        ></i>
        <i
          class="icon icon-lg fi_settings me-2 cursor-pointer"
          title="Настроить слои"
          @click="() => switchLayersSettings()"
        ></i>
      </template>
      <template v-if="activeTabIndex === 5">
        <i
          :class="['icon icon-lg me-2 cursor-pointer', $mapStore.measureVisible ? 'fi_eye' : 'fi_eye-off']"
          title="Включить/отключить отображение линейки на карте"
          @click="toggleMeasuringVisible"
        />
        <BSpinner v-if="$mapStore.measureReset" variant="secondary" :small="true" class="my-auto me-2" />
        <i
          v-else
          class="icon icon-lg fi_repeat me-2 cursor-pointer"
          title="Сбросить измерение (удалить все точки линии)"
          @click="resetMeasuring"
        ></i>
      </template>
      <button type="button" class="btn-close" @click="close" title="Скрыть панель инструмента"></button>
    </span>
  </div>
</template>

<script setup lang="ts">
import { headersLabels } from '~/app_constants/mapInstrumentsData'

defineProps({
  activeTabIndex: { type: Number, required: true },
})

const emit = defineEmits(['close'])
const close = () => emit('close')
const { $mapStore } = useNuxtApp()
const changeLayersView = () => $mapStore.changeLayersView()
const resetLayersView = () => $mapStore.resetLayersView()
const switchLayersSettings = () => $mapStore.switchLayersSettings(!$mapStore.isOpenLayersSettings)
const toggleMeasuringVisible = () => $mapStore.toggleMeasuringVisible()
const resetMeasuring = () => $mapStore.resetMeasuring()
</script>
