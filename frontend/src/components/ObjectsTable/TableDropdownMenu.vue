<template>
  <div class="drop-down-wrap">
    <div class="menu-level" @mouseover="isShowSubmenu1 = true" @mouseout="isShowSubmenu1 = false">
      <span class="menu-label">Отображение столбцов</span>
      <div v-if="isShowSubmenu1" class="submenu" @mouseover="isShowSubmenu1 = true" @mouseout="isShowSubmenu1 = false">
        <SortTableCheckbox
          v-for="column of tableColumns"
          :key="`sorted_${column.field}`"
          :is-switch-on="column.isSwitchOn"
          :label="column.label"
          :field="column.field"
          name="sortedColumns"
        />
      </div>
    </div>
    <div class="menu-level" @mouseover="isShowSubmenu2 = true" @mouseout="isShowSubmenu2 = false">
      <span class="menu-label">Сортировка по столбцу</span>
      <div v-if="isShowSubmenu2" class="submenu" @mouseover="isShowSubmenu2 = true" @mouseout="isShowSubmenu2 = false">
        <div v-for="column of tableColumns" :key="`order_${column.field}`">{{ column.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup name="TableDropdownMenu" lang="ts">
import { computed } from 'vue'
import { useNuxtApp } from 'nuxt/app'

import SortTableCheckbox from './SortTableCheckbox.vue'

const { $filtersStore }: any = useNuxtApp()

const isShowSubmenu1 = computed({
  get() {
    return $filtersStore.isShowSubmenu1
  },
  set(val) {
    $filtersStore.setIsShowSubmenu1(val)
  },
})

const isShowSubmenu2 = computed({
  get() {
    return $filtersStore.isShowSubmenu2
  },
  set(val) {
    $filtersStore.setIsShowSubmenu2(val)
  },
})

const tableColumns = $filtersStore.tableColumns.slice(1)
</script>
