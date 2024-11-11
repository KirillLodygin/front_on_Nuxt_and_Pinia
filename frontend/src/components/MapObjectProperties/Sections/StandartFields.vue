<template>
  <div class="h-100 overflow-y-scroll p-2" @scroll="onScroll" @scrollend="onScrollEnd">
    <div v-for="(section, i) in props.scenario" class="loop-panel mb-3" :id="'to-scroll-id_' + section.title">
      <div
        class="card-title mt-2 mb-3"
        :ref="
          (el) => {
            titles[i] = el
          }
        "
        :id="section.title + '_id'"
      >
        {{ section.title }}
      </div>
      <div class="scenario-wrapper row align-items-start">
        <div v-for="pair in section.fields" :key="pair[0] + pair[1]" class="row card-panel-row mb-4">
          <template
            v-for="(varietyInput, index) in pair"
            :key="varietyInput"
            :class="pair.length === 2 ? 'col-6 mb-3' : 'col-12 mb-3'"
          >
            <CoordinatesComponent
              v-if="varietyInput === 'coordinates_component'"
              :mutable-data="props.mutableData"
              :disabled-modifier="$objectStore.readOnly"
              @update-mutable-data="(field, value) => emit('updateMutableData', field, value, section.title)"
            />
            <PriceAndAreaInput
              v-else-if="props.mutableData && props.mutableOptions && varietyInput === 'price_and_area_component'"
              :area-data="props.mutableData.object_area"
              :currency-data="props.mutableData.price_sale_source"
              :initial-currency="props.mutableData.price_sale_source_currency"
              :date="props.mutableData.offer_date"
              :price-type-options-data="props.mutableOptions.price_sale_source_type.objectData.choices"
              :price-type-data="props.mutableData.price_sale_source_type"
              :period-options="props.mutableOptions.price_rent_period.objectData.choices"
              :period-data="props.mutableData.price_rent_period"
              :ads-type="props.mutableData.ads_type"
              :exchange-type="props.mutableData.exchangeType"
              :mutable-data="props.mutableData"
              :mutable-options="props.mutableOptions"
              @update-mutable-data="(field: any, value: any) => emit('updateMutableData', field, value, section.title)"
            ></PriceAndAreaInput>

            <BuildingsShareArea
              v-else-if="
                props.mutableData &&
                props.mutableOptions &&
                props.mutableOptions.object_offices_area &&
                props.mutableData.object_type === 'B' &&
                varietyInput === 'evaluation_building_area_component'
              "
              :area-data="props.mutableData.object_area"
              :currency-data="props.mutableData.price_sale_source"
              :office-data="props.mutableData.object_offices_area"
              :sale-data="props.mutableData.object_trade_area"
              :prod-data="props.mutableData.object_storage_area"
              :common-data="props.mutableData.object_common_area"
              :mutable-data="props.mutableData"
              :mutable-options="props.mutableOptions"
              @update-mutable-data="(field: any, value: any) => emit('updateMutableData', field, value, section.title)"
            ></BuildingsShareArea>
            <RentResultComponent
              v-else-if="
                props.mutableData &&
                props.mutableOptions &&
                varietyInput === 'rent_result_component' &&
                props.mutableOptions.rent_result_json
              "
              :mutable-data="props.mutableData"
              :mutable-options="props.mutableOptions"
              @add-rent-result="(obj) => emit('addRentResult', obj)"
              @delete-rent-result="(item) => emit('deleteRentResult', item)"
              @update-mutable-data="(field, value) => emit('updateMutableData', field, value, section.title)"
            />
            <PeriodComponent
              v-else-if="
                props.mutableData &&
                props.mutableOptions &&
                props.mutableOptions.enrichment_begin &&
                varietyInput === 'enchriment_period_component'
              "
              :start-data="props.mutableData.enrichment_begin"
              :end-data="props.mutableData.enrichment_end"
              :mutable-options="props.mutableOptions"
              :mutable-data="props.mutableData"
              :required="props.mutableOptions.enrichment_begin?.flags.requiredField"
              :disabled="props.mutableOptions.enrichment_begin?.flags.disabled"
              @update-mutable-data="(field, value) => emit('updateMutableData', field, value, section.title)"
            />
            <MapObjectPropertiesInput
              v-else-if="
                Object.keys(props.mutableOptions[varietyInput]).length && props.mutableOptions[varietyInput]?.objectData
              "
              :coordinates="props.mutableData.geo_pos.coordinates"
              :data="props.mutableData[varietyInput]"
              :disabled="
                props.mutableOptions[varietyInput]?.flags.disabled ||
                (props.sectionId === 'КУ-и-ЭР' && props.mutableData.ads_type === 'S')
              "
              :field="varietyInput"
              :find-map="props.mutableOptions[varietyInput]?.flags.findMap"
              :info="props.mutableOptions[varietyInput]?.flags.info"
              :is-new="props.isNew"
              :is-pre-written="false"
              :is-share="varietyInput.includes('share')"
              :object-area="props.mutableData.object_area"
              :object-data="varietyInput === 'floor_number' ? floorProp : props.mutableOptions[varietyInput].objectData"
              :options="varietyInput === 'func_purpose' ? props.funcPurposesByTypeComputed : null"
              :required="props.mutableOptions[varietyInput]?.flags.requiredField || false"
              :specify-map="props.mutableOptions[varietyInput]?.flags.specifyOnMap"
              :unavailable="props.mutableOptions[varietyInput]?.flags.unavailable"
              :is-cube="props.mutableOptions[varietyInput]?.flags.isCube"
              :mutable-data="props.mutableData"
              :index="index + 1"
              :single="pair.length === 1"
              :disabled-modifier="$objectStore.readOnly"
              @update-mutable-data="(field, value) => emit('updateMutableData', field, value, section.title)"
            ></MapObjectPropertiesInput>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CoordinatesComponent from '../Fields/CoordinatesComponent.vue'
import MapObjectPropertiesInput from '~/components/MapObjectProperties/Fields/MapObjectPropertiesInput.vue'
import PriceAndAreaInput from '../Fields/PriceAndAreaInput.vue'

import RentResultComponent from '../RentResultComponent.vue'
import PeriodComponent from '../Fields/PeriodComponent.vue'
import BuildingsShareArea from '../BuildingsShareArea.vue'
interface Props {
  scenario: Record<string, any>[]
  mutableData: { [key: string]: any }
  mutableOptions: { [key: string]: { [key: string]: any } | any }
  funcPurposesByTypeComputed: Array<any>
  sectionId: string
  tab: string
  isNew: boolean
}
const { $objectStore } = useNuxtApp()
const props = defineProps<Props>()
const emit = defineEmits(['updateMutableData', 'addRentResult', 'deleteRentResult', 'setSection'])

const floorProp = computed(() => {
  return $objectStore.floorProp
})
const allSections = props.scenario.map((item) => item.title)
const titles: Ref<Element[] | ComponentPublicInstance[] | null[]> = ref([])
const { scrollToSection, onScroll, onScrollEnd } = useMergedSections(titles, () => props.sectionId, allSections, emit)
</script>

<style scoped></style>
