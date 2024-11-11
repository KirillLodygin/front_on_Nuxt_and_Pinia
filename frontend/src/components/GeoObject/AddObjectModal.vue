<template>
  <BModal
    v-model="value"
    :cancel-title="'Отмена'"
    :ok-title="'Сохранить'"
    :title="$geoObject.objectData.object_type === 'L' ? 'ДОБАВИТЬ ЗДАНИЕ' : 'ДОБАВИТЬ ПОМЕЩЕНИЕ'"
    :body-class="'px-5 overflow-y'"
    :size="'lg'"
  >
    <div
      v-for="(pair, pairIndex) in scenarioCreateObjectFromModal"
      :key="pair[0] + pair[1]"
      :class="['row card-panel-row', { 'mb-3': pairIndex + 1 !== scenarioCreateObjectFromModal.length }]"
    >
      <template v-for="(varietyInput, index) in pair" :key="varietyInput">
        <CoordinatesComponent
          v-if="varietyInput === 'coordinates_component'"
          :mutable-data="$geoObject.objectData"
          :disabled-modifier="!$geoObject.isNew || $geoObject.readOnly"
          :hide-search-address="true"
          :info="
            $geoObject.objectData.object_type === 'L' ? 'Унаследовано от земельного участка' : 'Унаследовано от здания'
          "
          @update-mutable-data="(field, value) => onUpdateData(field, value)"
        />

        <MapObjectPropertiesInput
          v-else
          :coordinates="$geoObject.createAndLinkObjectData.geo_pos.coordinates"
          :data="$geoObject.createAndLinkObjectData[varietyInput]"
          :disabled="getDisabled(varietyInput)"
          :field="varietyInput"
          :find-map="customObjectData[varietyInput]?.flags.findMap"
          :info="customObjectData[varietyInput]?.flags.info"
          :is-new="false"
          :is-pre-written="false"
          :is-share="varietyInput.includes('share')"
          :object-area="$geoObject.createAndLinkObjectData.object_area"
          :object-data="
            $geoObject.objectData.object_type === 'L' && varietyInput === 'parent'
              ? customObjectData.parent_landplot.objectData
              : customObjectData[varietyInput].objectData
          "
          :options="null"
          :required="getRequired(varietyInput)"
          :specify-map="customObjectData[varietyInput]?.flags.specifyOnMap"
          :unavailable="customObjectData[varietyInput]?.flags.unavailable"
          :is-cube="customObjectData[varietyInput]?.flags.isCube"
          :mutable-data="$geoObject.createAndLinkObjectData"
          :disabled-modifier="$geoObject.readOnly"
          :index="index + 1"
          :single="pair.length === 1"
          @update-mutable-data="(field, value) => onUpdateData(field, value)"
        ></MapObjectPropertiesInput>
        <div
          v-if="$geoObject.inheritFromBuilding.includes(pair[0]) || $geoObject.inheritFromBuilding.includes(pair[1])"
          :style="{ order: index! + 5 }"
          :class="`col-${pair.length === 1 ? '12' : '6'}`"
          class="inherit-from-text py-2 d-flex align-items-center"
        >
          <template v-if="$geoObject.inheritFromBuilding.includes(varietyInput)">
            <i class="icon fi_inner-link-alt me-2" />
            <!-- {{ inheritFrom[varietyInput].name }}
              <span class="underlined mx-1">#{{ inheritFrom[varietyInput].id }}</span>
              от {{ inheritFrom[varietyInput].date }} -->
            {{
              $geoObject.objectData.object_type === 'L'
                ? 'Унаследовано от земельного участка'
                : 'Унаследовано от здания'
            }}
          </template>
        </div>
      </template>
    </div>
    <template #footer="{ ok, cancel }">
      <div>
        <button :class="'btn btn-md btn-outline-secondary'" type="button" @click="cancel()">
          {{ 'Отмена' }}
        </button>
        <button
          :class="'btn btn-md btn-primary ms-2'"
          type="button"
          :disabled="!$geoObject.isBaseFieldsReadyCreateAndLinkObject"
          @click="
            async () => {
              ok()
              await $geoObject.createObjectAndLink()
            }
          "
        >
          {{ 'Сохранить' }}
        </button>
      </div>
    </template>
  </BModal>
</template>

<script setup lang="ts">
import CoordinatesComponent from '../MapObjectProperties/Fields/CoordinatesComponent.vue'
import MapObjectPropertiesInput from '~/components/MapObjectProperties/Fields/MapObjectPropertiesInput.vue'
import {
  scenarioCreateObject,
  writableFieldsCreateObject,
  customObjectData,
  requiredFieldsCreateObject,
  scenarioCreateObjectFromModal,
} from '~/app_constants/mergedFieldsConst'
interface Props {
  modelValue: boolean
}
const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])
const { $geoObject } = useNuxtApp()
const value = computed({
  get: () => {
    return props.modelValue
  },
  set: (value) => {
    emit('update:modelValue', value)
  },
})

function onUpdateData(field: string, value: any) {
  console.log(field, value)
  switch (field) {
    case 'address_and_coord':
      $geoObject.createAndLinkObjectData.address_raw = value.address
      $geoObject.createAndLinkObjectData.geo_pos.coordinates[0] = value.lngLat.lng
      $geoObject.createAndLinkObjectData.geo_pos.coordinates[1] = value.lngLat.lat
      $geoObject.createAndLinkObjectData.osm_id = value.osm_id
      $geoObject.createAndLinkObjectData.geo_obj = value.geo_json
      // $objectStore.rerenderField('coord_lng')
      // $objectStore.rerenderField('coord_lat')
      break
    case 'coord_lng':
    case 'coord_lat':
      const coordinateIndex = field === 'coord_lng' ? 0 : 1
      $geoObject.createAndLinkObjectData.geo_pos.coordinates[coordinateIndex] =
        typeof value === 'string' ? +value.replace(',', '.') : value
      break
    default:
      $geoObject.createAndLinkObjectData[field] = value
  }
  console.log($geoObject.createAndLinkObjectData)
}

function getDisabled(field: string) {
  return !writableFieldsCreateObject.includes(field)
}
function getRequired(field: string) {
  return requiredFieldsCreateObject.includes(field)
}
</script>

<style scoped></style>
