<template>
  <div
    id="current_list"
    class="d-flex align-items-center py-1 px-1 compare-node"
    :class="isOpenCurrentCompareVal ? 'selected-compare-node' : ''"
    @click="isOpenCurrentCompare"
  >
    <i class="icon me-2 fi_compare"></i>
    <div>{{ currentComparisonList }}</div>
  </div>
</template>

<script lang="ts" setup>
import {navigateTo, useNuxtApp} from 'nuxt/app'
import { computed } from 'vue'
import { currentComparisonList, COMPARE } from '~/app_constants/comparisonConsts'

interface Props {
  setTabName: (tab: string) => void
}

const props = defineProps<Props>()

const { $comparison, $objectStore } = useNuxtApp()
const isOpenCurrentCompareVal = computed(() => $comparison.compareId === currentComparisonList)
const comparisonObjectsLength = computed(() => $comparison.comparisonObjects.length)

const isOpenCurrentCompare = () => {
  $comparison.isOpenCurrentCompare()
  if (comparisonObjectsLength.value) {
    props.setTabName(currentComparisonList)
    return
  }
  navigateTo(COMPARE)
}
</script>
