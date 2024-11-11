<template>
  <div class="filters-wrapp d-flex flex-column justify-content-between">
    <div class="filters-list">
      <hr class="pb-0" />
      <CurrentCompareLine @setIsMiniInfoModal="setIsMiniInfoModal" :set-tab-name="setTabName" />
      <FolderList @setIsMiniInfoModal="setIsMiniInfoModal" @isOpenCompare="isOpenCompare" :set-tab-name="setTabName"  />
    </div>
    <div class="filter-block-wrapp text-center">
      <ButtonWithLoader
        buttonClass="mb-2 p-0"
        height="32px"
        value="Перейти к сравнению"
        variant="outline-primary"
        width="80%"
        :disabled="comparisonObjectsLength < 2"
        @click="setIsComparisonModal"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import { computed } from 'vue'
import ButtonWithLoader from '~/components/UI-KIT/Buttons/BaseFormButton.vue'
import FolderList from '~/components/GeoObject/compare/FolderList.vue'
import CurrentCompareLine from '~/components/GeoObject/compare/CurrentCompareLine.vue'

interface Props {
  setTabName: (tab: string) => void
}

const props = defineProps<Props>()

const { $comparison } = useNuxtApp()

const emit = defineEmits(['setIsMiniInfoModal', 'setIsComparisonModal'])

const comparisonObjectsLength = computed(() => $comparison.currentComparisonObjects.length)

const setIsMiniInfoModal = (bool: boolean) => {
  emit('setIsMiniInfoModal', bool)
}

const setIsComparisonModal = () => {
  $comparison.initPricingFactors().then(() => {
    $comparison.getDistancesArr().then(() => {
      emit('setIsComparisonModal', true)
    })
  })
}

const isOpenCompare = () => {
  $comparison.resetActiveComparisonItem()
  $comparison.changeCurrentComparisonObjects()
}
</script>
