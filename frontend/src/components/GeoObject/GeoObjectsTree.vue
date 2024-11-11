<template>
  <div class="filters-wrapp">
    <h6 class="objects-tree-header">Дерево объектов</h6>
    <div class="filters-list me-2 overflow-hidden">
      <hr class="mb-0 pb-0" />
      <ButtonGroup v-model="activeTabIndex" :buttons-data="tabButtonNames" />
      <Input id="searchByFiltersInput" v-model="searchByObjects" type="search" />
      <hr class="mt-0 pt-0 mb-0 pb-0" />
      <Tree :tree-data="treeData" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { tabButtonNames } from '~/app_constants/geoObject'
import Input from '~/components/UI-KIT/Inputs/Input.vue'
import { treeData } from '~/components/GeoObject/data'
import ButtonGroup from '~/components/UI-KIT/Buttons/ButtonsGroup/ButtonGroup.vue'
import Tree from '~/components/UI-KIT/Tree/Tree.vue'

const { $geoObject } = useNuxtApp()
const activeTabIndex = computed({
  get: () => $geoObject.defaultTab,
  set: (value: number) => $geoObject.setDefaultTab(value),
})
const searchByObjects = ref('')
</script>
