<template>
  <div class="user-profile-menu-side-bar cursor-pointer overflow-y-scroll overflow-x-hidden h-100">
    <div v-for="tab in structure" :key="tab.tab" class="user-profile-menu-side-bar">
      <div
        :class="[
          'user-profile-menu-side-bar_tab d-flex align-items-center',
          { 'map-object-properties_body_menu-side-bar_tab__active': currentTabName === tab.tab },
        ]"
        @click="handleTabClick(tab.tab)"
      >
        <div class="tab-indicator"></div>
        {{ tab.tab }}
      </div>

      <div
        v-if="!tab.onlyHead"
        v-for="(section, index) in tab.sections"
        :key="section"
        class="user-profile-menu-side-bar_sections"
      >
        <div
          :class="[
            'user-profile-menu-side-bar_section d-flex align-items-center',
            { 'map-object-properties_body_menu-side-bar_section__active': currentSectionName === section },
          ]"
          @click="handleSectionClick(section, tab.tab)"
        >
          <i
            :id="'menu-sidebar-icon-info_section' + index"
            class="user-profile-menu-side-bar_icon icon form_ready me-2"
          />
          {{ section }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  structure: { [key: string]: any }
  currentSectionName: string
  currentTabName: string
}

const props = defineProps<Props>()
const emit = defineEmits(['setTabName', 'setSectionName'])

const handleTabClick = (tabName: string) => {
  emit('setTabName', tabName)
}

const handleSectionClick = (sectionName: string, tabName: string) => {
  emit('setSectionName', sectionName, tabName)
}
</script>

<style lang="scss" scoped>
.tab-indicator {
  border: 1.5px solid rgb(0, 0, 0);
  width: 12px;
  margin-right: 17px;
}
</style>
