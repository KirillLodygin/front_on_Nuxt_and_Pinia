<template>
  <div class="connect-object-row row" v-if="showConnectObjectRow">
    <div class="notific" v-show="!isLoading">
      <i class="icon fi_alert-triangle me-2"></i>
      <span v-if="!objectList.length">
        По заданным координатам не найдены объекты недвижимости. Карточка будет привязана к новому объекту
      </span>
      <span v-else-if="objectList.length === 1">
        По заданным координатам найден один объект недвижимости. Новая карточка автоматически привязана к объекту
      </span>
      <span v-else>
        По заданным координатам найдено несколько объектов недвижимости. Выберите один из объектов в списке
      </span>
    </div>
    <div class="dropdown col-6" :class="{ show: dropdownOpen }">
      <MapObjectPropertiesInputLabel
        :object-data="{ label: 'Объект недвижимости' }"
        :required-computed="true"
        class="col-6"
      />
      <button
        class="btn btn-secondary btn-input"
        :class="{ 'dropdown-toggle': !isLoading }"
        type="button"
        :disabled="!options.length || (options.length === 1 && !options[0]?.children.length)"
        @click="toggleDropdown"
        :aria-expanded="dropdownOpen"
      >
        <i
          class="icon me-2"
          :class="iconMap[mutableData?.has_parent.object_type]"
          v-if="mutableData?.has_parent && !isLoading"
          style="cursor: pointer; min-width: 16px"
        ></i>
        <div v-if="isLoading" class="spinner"></div>
        <span class="w-100 text-hide" v-else>{{ mutableData?.has_parent?.name || 'не заполнено' }}</span>
      </button>

      <ul
        class="dropdown-menu dropdown-menu-nested w-100"
        :class="{ show: dropdownOpen }"
        v-if="(options.length && options.length !== 1) || (options[0]?.children.length && !isLoading)"
      >
        <li v-for="option in options" :key="option.id" class="dropdown-item" style="white-space: wrap">
          <div class="d-flex align-items-center justify-content-between parent-item" @click="selectOption(option)">
            <div class="d-flex align-items-center gap-2">
              <i class="icon" :class="iconMap[option.object_type]" style="cursor: pointer; min-width: 16px"></i>
              <div>
                <span>{{ option.name }}</span>
                <br />
                <span>{{ option.address_raw }}</span>
              </div>
            </div>
            <i
              v-if="option.children.length"
              class="bi bi-chevron-down"
              @click.stop="toggleNested(option.id)"
              style="cursor: pointer"
            ></i>
          </div>

          <ul v-if="option.children && option.open" class="nested-dropdown p-0">
            <li
              v-for="child in option.children"
              :key="child.id"
              class="dropdown-item d-flex align-items-center nested-item ps-5"
              @click="selectNestedOption(option, child)"
            >
              <i class="icon" :class="iconMap[child.object_type]" style="cursor: pointer; min-width: 16px"></i>
              <div>
                <span class="ms-2">{{ child.name }}</span>
                <br />
                <span class="ms-2">{{ child.address_raw }}</span>
              </div>
            </li>
          </ul>
        </li>
      </ul>
      <button
        class="btn btn-lg btn-primary d-flex align-items-center justify-content-center w-100"
        @click="fetchObjectList"
      >
        Показать ещё
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, ref, watch } from 'vue'
const { $objectStore, $http } = useNuxtApp()
import MapObjectPropertiesInputLabel from '~/components/MapObjectProperties/Fields/MapObjectPropertiesInputLabel.vue'

interface Props {
  mutableData: { [key: string]: any }
  mutableOptions: { [key: string]: { [key: string]: any } | any }
}

const props = defineProps<Props>()

const dropdownOpen = ref(false)
const objectList = ref<any[]>([])
const options = ref<any[]>([])
const isLoading = ref(false)
const previousCoordinates = ref<[number, number] | null>(props.mutableData.geo_pos?.coordinates || null)
const showConnectObjectRow = ref(false)
const isUpdatingFromSetHasParent = ref(false)

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const toggleNested = (id: number) => {
  const option = options.value.find((opt) => opt.id === id)
  if (option) option.open = !option.open
}

const selectOption = (option: any) => {
  if (!option.children || option.children.length === 0) {
    setHasParent(option)
    dropdownOpen.value = false
  } else {
    setHasParent(option)
    toggleNested(option.id)
  }
}

const selectNestedOption = (parent: any, child: any) => {
  setHasParent(child)
  dropdownOpen.value = false
}

const setHasParent = (value: any) => {
  props.mutableData.has_parent = value
}

const iconMap: any = {
  Q: 'ksi_premise',
  B: 'ksi_building',
  L: 'fi_landplot',
}

const filteredObjectList = (list: any) => {
  if (list.length) {
    const filterMap: any = {
      Q: (item: any) => item.object_type !== 'L',
      B: (item: any) => item.object_type !== 'Q',
      L: (item: any) => item.object_type === 'L',
    }
    return list.filter(filterMap[props.mutableData.object_type] || (() => true))
  }
  return list
}

const fetchObjectList = () => {
  const [lon, lat] = props.mutableData.geo_pos.coordinates
  getObjectList(lat, lon, 100)
}

const getObjectList = async (lat: number, lon: number, radius: number = 5) => {
  if (
    previousCoordinates.value &&
    previousCoordinates.value[0] === lat &&
    previousCoordinates.value[1] === lon &&
    radius === 5
  ) {
    console.log('Координаты не изменились, запрос не требуется')
    handleObjectListResponse()
    return
  }

  previousCoordinates.value = [lat, lon]
  isLoading.value = true

  try {
    const response = await $http.get(`api/v1/osm_obj/get_by_coords/?lat=${lat}&lon=${lon}&radius=${radius}`)
    objectList.value = Array.isArray(response._data) ? response._data : [response._data]
    handleObjectListResponse()
  } catch (error: any) {
    console.error('Ошибка при загрузке объектов:', error)
    objectList.value = []
    props.mutableData.has_parent = null
  } finally {
    isLoading.value = false
  }
}

const handleObjectListResponse = () => {
  options.value = transformObjectList(filteredObjectList(objectList.value), props.mutableData.object_type)
  props.mutableData.has_parent = options.value.length > 0 ? options.value[0] : null
  props.mutableData.not_found_has_parent = options.value.length === 0
}

const transformObjectList = (list: any[], objectType: string): any[] => {
  const buildings: any[] = []
  const roomsMap: Record<number, any[]> = {}

  const addBuilding = (item: any) => {
    buildings.push({
      id: item.id,
      name: item.name,
      address_raw: item.address_raw,
      object_type: item.object_type,
      open: false,
      children: [],
    })
  }

  const addRoom = (item: any) => {
    if (!roomsMap[item.parent.id]) roomsMap[item.parent.id] = []
    roomsMap[item.parent.id].push(item)
  }

  list.forEach((item) => {
    if (['L', 'B'].includes(objectType)) {
      if (item.object_type === 'L' || (item.object_type === 'B' && !item.parent)) addBuilding(item)
      if (item.object_type === 'B' && item.parent) addRoom(item)
    } else if (objectType === 'Q') {
      if (item.object_type === 'B' || (item.object_type === 'Q' && !item.parent)) addBuilding(item)
      if (item.object_type === 'Q' && item.parent) addRoom(item)
    }
  })

  buildings.forEach((building) => (building.children = roomsMap[building.id] || []))
  return buildings
}

watch(
  [() => props.mutableData.geo_pos, () => props.mutableData.object_type],
  ([newGeoPos]) => {
    if (!isUpdatingFromSetHasParent.value) {
      showConnectObjectRow.value = !props.mutableData.isDataSynchronization
      if (newGeoPos) getObjectList(newGeoPos.coordinates[1], newGeoPos.coordinates[0])
    }
  },
  { deep: true },
)
</script>

<style lang="scss" scoped>
.notific {
  padding: 10px 12px;
  margin: 0 0 6px 12px;
  background: #f1f2f3;
  border-radius: 10px;
  font-size: 13px;
  width: max-content;
}
.dropdown-submenu {
  margin-left: 10px;
}

.dropdown-item i {
  font-size: 1.2em;
}

.btn-input {
  background: #fff;
  color: #212529;
  border: 1px solid #a2a7aa;
  min-height: 56px;
  padding: 8px 16px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:disabled {
    background: #f1f2f3;
    pointer-events: none;
  }
}

.dropdown-container {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: relative;
  border: 1px solid #ccc;
  max-height: 300px;
  overflow-y: auto;
  background-color: #fff;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  li {
    padding: 0;
    background: none !important;
  }

  .parent-item,
  .nested-item {
    padding: 0.3rem 1rem;
    &:hover {
      background: #7ac9ff !important;
      cursor: pointer;
    }
  }
}

.text-hide {
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.spinner {
  border: 3px solid #f3f3f3; /* Light grey */
  border-top: 3px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Для отображения иконок Bootstrap */
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css');
</style>
