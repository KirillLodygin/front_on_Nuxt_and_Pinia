<template>
  <div class="map-object-properties_footer d-flex justify-content-between">
    <template v-if="toShowNavigate">
      <div class="btn-group">
        <button
          id="prev-nav"
          :disabled="!previousAvailable"
          class="btn btn-outline-secondary btn-lg"
          @click="emit('previous')"
        >
          <i class="map-object-properties_footer_navigation_icon icon fi_arrow-left" />
        </button>
        <button id="next-nav" :disabled="!nextAvailable" class="btn btn-outline-secondary btn-lg" @click="emit('next')">
          <i class="map-object-properties_footer_navigation_icon icon fi_arrow-right" />
        </button>
      </div>
      <div v-if="previousAvailable" class="custom-tooltip-wrapper">
        <BTooltip
          :delay="{ show: 600, hide: 100 }"
          :no-fade="true"
          :placement="'top'"
          :target="'prev-nav'"
          custom-class="custom-tooltip"
          triggers="hover blur"
        >
          <div class="navigation-button-tooltip">Нажмите для перехода к предыдущей вкладке карточки объекта</div>
        </BTooltip>
      </div>
      <div v-if="nextAvailable" class="custom-tooltip-wrapper">
        <BTooltip
          :delay="{ show: 600, hide: 100 }"
          :no-fade="true"
          :placement="'top'"
          :target="'next-nav'"
          custom-class="custom-tooltip"
          triggers="hover"
        >
          <div class="navigation-button-tooltip">Нажмите для перехода к следующей вкладке карточки объекта</div>
        </BTooltip>
      </div>
    </template>
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  nextAvailable: boolean
  previousAvailable: boolean
  toShowNavigate: boolean
}
const { nextAvailable, previousAvailable } = defineProps<Props>()
const emit = defineEmits(['previous', 'next'])
</script>

<style scoped></style>
