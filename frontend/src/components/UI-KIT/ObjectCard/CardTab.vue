<template>
  <BTabs
    ref="btabsRef"
    v-model="currentTab"
    active-tab-class="active-tab"
    class="map-object-properties_body_tab"
    content-class="tab-content-style"
    nav-class="tabs-list"
    nav-wrapper-class="tabs-list-wrapper"
    id="CardTabs"
    pills
    vertical
  >
    <BTab v-for="tab in props.tabsStructure" :key="tab.tab" :title="tab.tab">
      <BTabs
        :model-value="tab.customSectionBehavior ? 0 : props.currentSection"
        :nav-wrapper-class="['tabs-list-wrapper']"
        content-class="tab-content-style"
        id="CardSections"
        vertical
      >
        <template v-if="tab.customSectionBehavior">
          <BTab>
            <div class="h-100">
              <slot :isConst="tab.isConst" :fromVFor="false" :section="tab.sections[0].name" :tab="tab.tab" />
            </div>
          </BTab>
        </template>
        <template v-else>
          <BTab v-for="(section, index) in tab.sections" :key="section.name" :title="section.name">
            <div class="h-100">
              <slot :isConst="tab.isConst" :fromVFor="true" :section="section.name" :tab="tab.tab" />
            </div>
          </BTab>
        </template>

        <BTab />
      </BTabs>
    </BTab>
  </BTabs>
</template>

<script setup lang="ts">
import type { tabsStructureType } from '~/types/cardTypes'

interface Props {
  tabsStructure: tabsStructureType
  modelValue: number
  currentSection: number
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])
const currentTab = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})
</script>

<style scoped></style>
