<template>
  <div v-if="currentTabName && currentSectionName" class="map-object-properties page-card">
    <slot v-if="$slots.customHeader" name="customHeader" />
    <CardHeader v-else :header-structure="props.headerStructure">
      <slot name="headerFunctionality" :section="currentSectionName" />
    </CardHeader>
    <div class="map-object-properties_body">
      <CardMenuSideBar
        v-if="props.toDisplayMenusSideBar"
        :key="props.keyMenu"
        :structureComputed="props.structureComputed"
        :designation="props.designation"
      />
      <div class="map-object-properties_body_content">
        <CardTab
          v-slot="{ isConst, fromVFor, tab, section }"
          v-model="currentTab"
          :current-section="currentSection"
          :tabs-structure="props.tabsStructure"
        >
          <slot name="body" :section="section" :tab="tab" :isConst="isConst" :fromVFor="fromVFor" />
        </CardTab>
        <slot v-if="$slots.customFooter" name="customFooter" />
        <CardFooter
          v-else-if="props.tabsToDisplayFooter.includes(currentTabName)"
          :next-available="nextAvailable && props.nextAvailableModificator"
          :previous-available="previousAvailable && props.previousAvailableModificator"
          :to-show-navigate="props.navigatebleTabsArr.includes(currentTabName)"
          @next="moveToNext"
          @previous="moveToPrevious"
        >
          <slot name="footerFunctionality" />
        </CardFooter>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CardTab from './CardTab.vue'
import CardHeader from './CardHeader.vue'
import CardFooter from './CardFooter.vue'
import CardMenuSideBar from './CardMenuSideBar.vue'
import type {
  headerDesignationType,
  menuSideBarDesignationType,
  menuSideBarStructureType,
  tabsStructureType,
} from '~/types/cardTypes'

interface Props {
  tabsStructure: tabsStructureType
  headerStructure: headerDesignationType
  toDisplayMenusSideBar?: boolean
  keyMenu?: number
  structureComputed: menuSideBarStructureType
  designation?: menuSideBarDesignationType
  previousAvailableModificator?: boolean
  nextAvailableModificator?: boolean
  tabsToDisplayFooter?: string[]
  navigatebleTabsArr?: string[]
}
const props = withDefaults(defineProps<Props>(), {
  toDisplayMenusSideBar: true,
  keyMenu: 1,
  previousAvailableModificator: true,
  nextAvailableModificator: true,
  tabsToDisplayFooter: () => [],
  navigatebleTabsArr: () => [],
})

const tabsStructureToRef = toRef(props.tabsStructure)
const {
  currentSection,
  currentSectionName,
  currentTab,
  currentTabName,
  tabsList,
  nextAvailable,
  previousAvailable,
  moveToNext,
  moveToPrevious,
  setTabName,
  setSectionName,
} = useTabs(tabsStructureToRef, props.navigatebleTabsArr)

defineExpose({
  currentSection,
  currentSectionName,
  currentTab,
  currentTabName,
  tabsList,
  nextAvailable,
  previousAvailable,
  moveToNext,
  moveToPrevious,
  setTabName,
  setSectionName,
})
</script>

<style scoped></style>
