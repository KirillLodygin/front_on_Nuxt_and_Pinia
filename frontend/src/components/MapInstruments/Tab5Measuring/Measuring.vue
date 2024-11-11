<template>
  <ButtonGroup
    :buttons-data="[
      { displayName: 'Измерять расстояние', value: measureModeType.distance, iconClass: 'fi_broken_line' },
      { displayName: 'Измерять площадь', value: measureModeType.area, iconClass: 'ksi_polygon-edit' },
    ]"
    v-model="$mapStore.measureMode"
    class="mt-1 w-100"
  />
  <div class="alert alert-light d-flex py-2 px-3">
    <i class="icon fi_info flex-shrink-0 me-1 mt-1"></i>
    <div v-if="$mapStore.measureMode === measureModeType.distance">
      Добавляйте точки линии щёлкая на карте.<br />
      Для удаления точки на линии наведите курсор на нее и нажмите
      <kbd class="text-dark bg-light">Ctrl + <i class="icon icon-lg ksi_mb_left" /></kbd>
    </div>
    <div v-else>
      Добавляйте точки полигона щёлкая на карте.<br />
      Для удаления точки на линии наведите курсор на нее и нажмите
      <kbd class="text-dark bg-light">Ctrl + <i class="icon icon-lg ksi_mb_left" /></kbd>
    </div>
  </div>
  <hr class="m-2" />
  <div v-if="$mapStore.measureMode === measureModeType.distance">
    Общая длина: {{ $mapStore.measureDistanceValue }} км
  </div>
  <div v-else>Площадь: {{ $mapStore.measureAreaValue }} м<sup>2</sup></div>
</template>

<script setup lang="ts">
import ButtonGroup from '~/components/UI-KIT/Buttons/ButtonsGroup/ButtonGroup.vue'
import { measureModeType } from '~/types/mapTypes'
const { $mapStore } = useNuxtApp()
</script>
