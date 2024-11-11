<template>
  <div v-if="!access" class="row justify-content-center align-items-center h-100">
    <div class="text-center fs-2 m-3">В РАЗРАБОТКЕ</div>
    <div class="row m-3">
      <div class="col-2 text-end">
        <i class="icon icon-3x fi_alert-triangle modal-icon"></i>
      </div>
      <div class="col-10">
        <div class="">
          Этот инструмент находится на стадии разработки. Если у Вас возникли вопросы, обратитесь к администратору
          системы help@gisanda.ru
        </div>
      </div>
    </div>
  </div>
  <!--  ===========================================================-->
  <div
    v-else
    ref="dataVisualizationContainer"
    class="overflow-y-auto overflow-x-hidden ps-2 pe-3"
    :style="{ height: `${computedHeight}px` }"
  >
    <GeoLayerSettingsFields type="visualization" :settings="dataVisualizationData" @scrollToSelect="scrollToSelect" />
  </div>
</template>

<script setup lang="ts">
import { dataVisualizationData } from '~/app_constants/mapInstrumentsData'
import GeoLayerSettingsFields from '~/components/MapInstruments/GeoLayerSettingsFields.vue'
import { computed } from 'vue'

const { $mapStore, $auth } = useNuxtApp()
const computedHeight = computed(() => $mapStore.mapInstrumentPanelHeight - 65)

const dataVisualizationContainer = ref<HTMLElement | null>(null)
const scrollToSelect = (customSelectContainer: HTMLElement) => {
  const container = dataVisualizationContainer.value as HTMLElement
  const selContainer = customSelectContainer as HTMLElement
  if (container && selContainer) {
    const containerRect = container.getBoundingClientRect()
    const selContainerRect = selContainer.getBoundingClientRect()
    if (containerRect.bottom < selContainerRect.bottom) {
      container.scrollTop = selContainerRect.bottom
    }
  }
}

// TODO временно блокирует показ страницы, если не админ. Потом надо будет убрать
const userPermissions: string[] = useUserPermissions($auth.user?.permissions)
const access = computed(() => userPermissions.includes('ADMIN'))
// =====================================
</script>
