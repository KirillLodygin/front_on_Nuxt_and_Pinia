<template>
  <div class="map-object-properties_header">
    <div class="map-object-properties_header_data d-flex flex-column justify-content-center">
      <TooltipOverflow class="map-object-properties_header_data_text map-object-properties_header_data_text__main address-text">
        {{ props.headerStructure.title }}
      </TooltipOverflow>
    </div>
    <div
      v-for="infoItem in props.headerStructure.infoList"
      class="map-object-properties_header_data d-flex flex-column justify-content-center"
      :key="infoItem.title"
    >
      <TooltipOverflow class="map-object-properties_header_data_text">
        {{ infoItem.title }}
      </TooltipOverflow>
      <span
        class="d-flex justify-content-start align-items-center"
        :type="infoItem.clickHandler ? 'button' : ''"
        @click="infoItem.clickHandler"
      >
        <TooltipOverflow
          :id="infoItem.title"
        >
          {{ infoItem.info }}
        </TooltipOverflow>
      </span>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { headerDesignationType } from '~/types/cardTypes'
import TooltipOverflow from '~/layouts/menu/TooltipOverflow.vue'

interface Props {
  headerStructure: headerDesignationType
}
const props = defineProps<Props>()
</script>
