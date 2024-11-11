<template>
  <div class="map-object-properties_body_menu-side-bar overflow-x-hidden">
    <div v-for="tab in structureComputed" :key="tab.tab" class="cursor-pointer">
      <div
        v-if="tab.toShow"
        :class="tab.tabClassName"
        class="map-object-properties_body_menu-side-bar_tab d-flex justify-conetnt-center align-items-center"
        @click="() => tab.handleTabClick(tab.tab)"
      >
        <i :id="tab.tabId" :class="tab.tabIcon" />
        <div v-if="designation" class="custom-tooltip-wrapper">
          <BTooltip
            :no-fade="true"
            :placement="'right'"
            :target="tab.tabId"
            custom-class="custom-tooltip"
            triggers="hover"
          >
            <div class="menu-sidebar-icon-info">
              Обозначения пунктов меню:
              <ul class="list-unstyled">
                <li v-for="item in designation"><i :class="item.icon"></i>{{ item.name }}</li>
              </ul>
            </div>
          </BTooltip>
        </div>
        {{ tab.tab }}
      </div>
      <div
        v-for="section in tab.sections"
        v-if="tab.toShowSections"
        :key="section.name"
        class="map-object-properties_body_menu-side-bar_sections"
      >
        <div
          :class="section.sectionClass"
          class="map-object-properties_body_menu-side-bar_section d-flex justify-conetnt-center align-items-center"
          @click.stop="() => section.handleSectionClick(section.name, tab.tab)"
        >
          <i :id="section.sectionId" :class="section.sectionIcon" />

          <div v-if="designation" class="custom-tooltip-wrapper">
            <BTooltip
              :no-fade="true"
              :placement="'right'"
              :target="section.sectionId"
              custom-class="menu-sidebar-icon-info_wrapper"
              triggers="hover"
            >
              <div class="menu-sidebar-icon-info">
                Обозначения пунктов меню:
                <ul class="list-unstyled">
                  <li v-for="item in designation"><i :class="item.icon"></i>{{ item.name }}</li>
                </ul>
              </div>
            </BTooltip>
          </div>
          {{ section.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { menuSideBarDesignationType, menuSideBarStructureType } from '~/types/cardTypes'

interface Props {
  structureComputed: menuSideBarStructureType
  designation?: menuSideBarDesignationType
}

const props = defineProps<Props>()
</script>

<style scoped></style>
