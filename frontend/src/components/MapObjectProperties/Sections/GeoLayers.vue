<template>
  <div class="geo-layer-tab-content-wrapper d-flex h-100 w-100 overflow-y-scroll">
    <div class="geo-layer-table-container geo-layer-table-container__bordered pe-2">
      <BTableSimple :table-class="'geo-layer-table-content'" responsive sticky-header>
        <BThead head-variant="dark">
          <BTr>
            <BTh
              v-for="header in geoFields"
              :key="header.key"
              :class="header.key === 'number' ? 'd-none' : ''"
              class="col-auto citooltip"
            >
              <div
                v-if="header.key === 'geoinfo_layer_name'"
                :class="['d-flex sortable-column-header', { 'sorted-column': isSorted }]"
                role="button"
                @click.prevent="setSortDirection(sortDirection)"
              >
                <span class="flex-fill">
                  {{ header.label }}
                </span>
                <i
                  :class="[
                    isSorted ? `icon fi_sort-${sortDirection === 'asc' ? 'up' : 'down'}` : 'icon fi_sort-up-down',
                    'ms-1 align-self-center',
                  ]"
                ></i>
              </div>
              <div v-else>{{ header.label }}</div>
            </BTh>
          </BTr>
        </BThead>
        <BTbody>
          <BTr
            v-for="item in geoItems"
            :key="item.number"
            :class="['table-string', item.number === active ? 'geo-layer-table__active' : '']"
          >
            <BTd
              v-for="header in geoFields"
              :key="header.label"
              :class="header.key === 'number' ? 'd-none' : ''"
              @click="
                () => {
                  if (active === item.number) return
                  active = item.number
                  setSortDirectionActive('desc')
                }
              "
              ><i v-if="header.key === 'geoinfo_layer_name'" class="icon icon-dark fi_box me-2" />{{ item[header.key] }}
            </BTd>
          </BTr>
        </BTbody>
      </BTableSimple>
    </div>
    <div class="geo-layer-table-container ps-2">
      <BTableSimple :table-class="'geo-layer-table-content'" responsive sticky-header>
        <BThead head-variant="dark">
          <BTr>
            <BTh v-for="header in objMiscHeader" :key="header.key" class="col-auto citooltip">
              <div
                v-if="header.key === 'objMiscKey'"
                :class="['d-flex sortable-column-header', { 'sorted-column': isSortedActive }]"
                role="button"
                @click.prevent="setSortDirectionActive(sortDirectionActive)"
              >
                <span class="flex-fill">
                  {{ header.label }}
                </span>
                <i
                  :class="[
                    isSortedActive
                      ? `icon fi_sort-${sortDirectionActive === 'asc' ? 'up' : 'down'}`
                      : 'icon fi_sort-up-down',
                    'ms-1 align-self-center',
                  ]"
                ></i>
              </div>
              <div v-else>{{ header.label }}</div>
            </BTh>
          </BTr>
        </BThead>
        <BTbody>
          <BTr v-for="item in objMiscInfo[active]" :key="item.number">
            <BTd v-for="header in objMiscHeader" :key="header.label">{{ item[header.key] }}</BTd>
          </BTr>
        </BTbody>
      </BTableSimple>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { fixNames } from '~/app_constants/geoInfoLists'

interface Props {
  lng: number
  lat: number
}

const props = defineProps<Props>()
const geoItems: Ref<any[]> = ref([])
const notSortedGeoItems: Ref<any[]> = ref([])
const notSortedObjMiscInfo: Ref<any> = ref({})
const geoFields: Ref<any[]> = ref([])
const objMiscInfo: Ref<any> = ref({})
const isSorted: Ref<boolean> = ref(false)
const sortDirection: Ref<string> = ref('none')
const isSortedActive: Ref<boolean> = ref(false)
const sortDirectionActive: Ref<string> = ref('none')
const active: Ref<number> = ref(1)
const objMiscHeader = [
  {
    key: 'objMiscKey',
    label: 'Свойство',
  },
  {
    key: 'objMiscValue',
    label: 'Значение',
  },
]
const nextDirection: { [key: string]: string } = {
  none: 'asc',
  asc: 'desc',
  desc: 'none',
}
const readyToFetch = computed(() => {
  return props.lng > 0 && props.lat > 0
})

watch(
  () => readyToFetch.value,
  async (newVal) => {
    if (!newVal) return
    let _geoinfo = []
    let _geocoords = {}

    _geoinfo = await $http
      .get('api/v1/layers/geo_layes_by_coord/?lon=' + props.lng + '&lat=' + props.lat)
      .then((res: Record<string, any>) => res._data)
    // _geocoords = _data.geo_pos

    geoItems.value = []
    geoFields.value = []

    const excludedFields = ['id', 'num', 'is_deleted', 'obj_misc', 'modified_by']
    for (const key in _geoinfo[0]) {
      if (!excludedFields.includes(key)) {
        if (key === 'name') {
          geoFields.value.push({
            key: 'geoinfo_object_name',
            label: 'Объект',
          })
        } else if (key === 'geo_layer') {
          geoFields.value.push({
            key: 'geoinfo_layer_name',
            label: 'Слой',
          })
        } else {
          geoFields.value.push({
            key: 'geoinfo_' + key,
            label: key,
          })
        }
      }
    }

    let number = 0
    let item: any = {}
    _geoinfo.forEach((objLayerInfo: any) => {
      item = {}
      number++
      item.number = number
      for (const key in objLayerInfo) {
        if (!excludedFields.includes(key)) {
          if (key === 'name') {
            const objMiscFields = ['Кадастр_номер', 'Кадастр_квартал', 'Адрес']
            let name = ''
            objMiscFields.forEach((itemName) => {
              if (Object.keys(objLayerInfo.obj_misc).includes(itemName)) {
                name = name + `${itemName}: ${objLayerInfo.obj_misc[itemName]}, `
              }
            })
            if (name) {
              item.geoinfo_object_name = name.slice(0, -2)
            } else {
              item.geoinfo_object_name = objLayerInfo.name
            }
          } else if (key === 'geo_layer') {
            item.geoinfo_layer_name = objLayerInfo.geo_layer.name
            Object.keys(fixNames).forEach((layerName: any) => {
              if (fixNames[layerName].includes(objLayerInfo.geo_layer.name)) {
                item.geoinfo_layer_name = layerName
              }
            })
          } else {
            item['geoinfo_' + key] = objLayerInfo[key]
          }
        }
      }
      const objMiscArr = []
      for (const key in objLayerInfo.obj_misc) {
        objMiscArr.push({ objMiscKey: key, objMiscValue: objLayerInfo.obj_misc[key] })
      }
      objMiscInfo.value[number] = [...objMiscArr]
      notSortedObjMiscInfo.value[number] = [...objMiscArr]
      //   item.obj_misc = objLayerInfo
      notSortedGeoItems.value.push(item)
      geoItems.value.push(item)
    })
  },
  { immediate: true },
)

function log(...args: any[]) {
  console.log(...args)
}

function setSortDirection(sortDirectionData: string) {
  sortDirection.value = nextDirection[sortDirectionData]
  if (sortDirection.value !== 'none') isSorted.value = true
  else {
    isSorted.value = false
    geoItems.value = [...notSortedGeoItems.value]
    return
  }
  const field = 'geoinfo_layer_name'

  geoItems.value.sort((a, b) => {
    return sortDirection.value === 'asc' ? a[field].localeCompare(b[field]) : b[field].localeCompare(a[field])
  })
}

function setSortDirectionActive(sortDirectionData: string) {
  sortDirectionActive.value = nextDirection[sortDirectionData]
  if (sortDirectionActive.value !== 'none') isSortedActive.value = true
  else {
    isSortedActive.value = false

    objMiscInfo.value[active.value] = [...notSortedObjMiscInfo.value[active.value]]
    return
  }
  const field = 'objMiscKey'

  objMiscInfo.value[active.value].sort((a: any, b: any) => {
    return sortDirectionActive.value === 'asc' ? a[field].localeCompare(b[field]) : b[field].localeCompare(a[field])
  })
}
</script>

<style scoped></style>
