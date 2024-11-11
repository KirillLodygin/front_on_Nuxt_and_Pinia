<template>
  <div class="overflow-y-scroll card-panel">
    <div class="scenario-wrapper row align-items-start">
      <div v-for="pair in fields" :key="pair[0] + pair[1]" class="row card-panel-row mb-4">
        <template
          v-for="(varietyInput, index) in pair"
          :key="varietyInput"
          :class="pair.length === 2 ? 'col-6 mb-3' : 'col-12 mb-3'"
        >
          <CoordinatesComponent
            v-if="varietyInput === 'coordinates_component'"
            :mutable-data="mutableData"
            :disabled-modifier="$objectStore.readOnly || !!disableCoords"
            @update-mutable-data="(field, value) => emit('updateMutableData', field, value)"
          />
          <PriceAndAreaInput
            v-else-if="mutableData && mutableOptions && varietyInput === 'price_and_area_component'"
            :area-data="mutableData.object_area"
            :currency-data="mutableData.price_sale_source"
            :initial-currency="mutableData.price_sale_source_currency"
            :date="mutableData.offer_date"
            :price-type-options-data="mutableOptions.price_sale_source_type.objectData.choices"
            :price-type-data="mutableData.price_sale_source_type"
            :period-options="mutableOptions.price_rent_period.objectData.choices"
            :period-data="mutableData.price_rent_period"
            :ads-type="mutableData.ads_type"
            :exchange-type="mutableData.exchangeType"
            :mutable-data="mutableData"
            :mutable-options="mutableOptions"
            @update-mutable-data="(field: any, value: any) => emit('updateMutableData', field, value)"
          ></PriceAndAreaInput>

          <BuildingsShareArea
            v-else-if="
              mutableData &&
              mutableOptions &&
              mutableOptions.object_offices_area &&
              mutableData.object_type === 'B' &&
              varietyInput === 'evaluation_building_area_component'
            "
            :area-data="mutableData.object_area"
            :currency-data="mutableData.price_sale_source"
            :office-data="mutableData.object_offices_area"
            :sale-data="mutableData.object_trade_area"
            :prod-data="mutableData.object_storage_area"
            :common-data="mutableData.object_common_area"
            :mutable-data="mutableData"
            :mutable-options="mutableOptions"
            @update-mutable-data="(field: any, value: any) => emit('updateMutableData', field, value)"
          ></BuildingsShareArea>
          <RentResultComponent
            v-else-if="
              mutableData &&
              mutableOptions &&
              varietyInput === 'rent_result_component' &&
              mutableOptions.rent_result_json
            "
            :mutable-data="mutableData"
            :mutable-options="mutableOptions"
            @add-rent-result="(obj) => emit('addRentResult', obj)"
            @delete-rent-result="(item) => emit('deleteRentResult', item)"
            @update-mutable-data="(field, value) => emit('updateMutableData', field, value)"
          />
          <PeriodComponent
            v-else-if="
              mutableData &&
              mutableOptions &&
              mutableOptions.enrichment_begin &&
              varietyInput === 'enchriment_period_component'
            "
            :start-data="mutableData.enrichment_begin"
            :end-data="mutableData.enrichment_end"
            :mutable-options="mutableOptions"
            :mutable-data="mutableData"
            :required="mutableOptions.enrichment_begin?.flags.requiredField"
            :disabled="mutableOptions.enrichment_begin?.flags.disabled"
            @update-mutable-data="(field, value) => emit('updateMutableData', field, value)"
          />
          <MapObjectPropertiesInput
            v-else-if="mutableOptions[varietyInput]?.objectData"
            :coordinates="mutableData.geo_pos.coordinates"
            :data="mutableData[varietyInput]"
            :disabled="
              mutableOptions[varietyInput]?.flags.disabled || (sectionId === 'КУ-и-ЭР' && mutableData.ads_type === 'S')
            "
            :field="varietyInput"
            :find-map="mutableOptions[varietyInput]?.flags.findMap"
            :info="mutableOptions[varietyInput]?.flags.info"
            :is-new="isNew"
            :is-pre-written="false"
            :is-share="varietyInput.includes('share')"
            :object-area="mutableData.object_area"
            :object-data="varietyInput === 'floor_number' ? floorProp : mutableOptions[varietyInput].objectData"
            :options="varietyInput === 'func_purpose' ? funcPurposesByTypeComputed : null"
            :required="mutableOptions[varietyInput]?.flags.requiredField || false"
            :specify-map="mutableOptions[varietyInput]?.flags.specifyOnMap"
            :unavailable="mutableOptions[varietyInput]?.flags.unavailable"
            :is-cube="mutableOptions[varietyInput]?.flags.isCube"
            :mutable-data="mutableData"
            :index="index + 1"
            :single="pair.length === 1"
            :disabled-modifier="$objectStore.readOnly"
            @update-mutable-data="
              (field, value) => {
                console.log('@update-mutable-data DataSection')
                emit('updateMutableData', field, value)
              }
            "
          ></MapObjectPropertiesInput>
        </template>
      </div>
      <ConnectObject :mutable-data="mutableData" :mutable-options="mutableOptions" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, computed } from 'vue'
import CoordinatesComponent from '../Fields/CoordinatesComponent.vue'
import MapObjectPropertiesInput from '~/components/MapObjectProperties/Fields/MapObjectPropertiesInput.vue'
import PriceAndAreaInput from '../Fields/PriceAndAreaInput.vue'

import RentResultComponent from '../RentResultComponent.vue'
import PeriodComponent from '../Fields/PeriodComponent.vue'
import BuildingsShareArea from '../BuildingsShareArea.vue'
import ConnectObject from '../Fields/ConnectObject.vue'

interface Props {
  fields: Array<any>
  mutableData: { [key: string]: any }
  mutableOptions: { [key: string]: { [key: string]: any } | any }
  funcPurposesByTypeComputed: Array<any>
  isNew: boolean
  sectionId: string
  tab: string
  disableCoords?: boolean
}

const props = defineProps<Props>()
const { $objectStore, $http } = useNuxtApp()

const emit = defineEmits(['updateMutableData', 'addRentResult', 'deleteRentResult'])
const floorProp = computed(() => $objectStore.floorProp)
</script>
<style lang="scss"></style>
