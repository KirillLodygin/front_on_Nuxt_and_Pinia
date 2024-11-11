<template>
  <div class="overflow-y-auto">
    <LoadingCover v-if="loading"></LoadingCover>
    <table class="table table-content" id="items-by-object-type-calc">
      <thead id="_columns">
        <tr>
          <th
            v-if="$geoObject.linkExistingCardTable || $geoObject.linkExistingObjectsTable"
            class="col-auto align-middle"
            role="button"
            @click="
              () => {
                $geoObject.linkExistingCardIds = []
                $geoObject.linkExistingObjectsIds = []
              }
            "
          >
            <i class="icon fi_check" />
          </th>
          <th
            v-for="tableColumn of tableColumns"
            :key="`col_${tableColumn.field}`"
            class="col-auto align-middle"
            scope="col"
          >
            <span v-if="tableColumn.doNotSwitchOff" v-html="tableColumn.label[calcType]"></span>
            <SortableHeader
              v-if="!tableColumn.doNotSwitchOff && tableColumn.isSwitchOn"
              :field="tableColumn.field"
              :sortDirection="getSortDirection(tableColumn.field)"
              :sorted="getColumnSorted(tableColumn.field)"
              :title="tableColumn.label[calcType]"
              @click="onColumnClick($event, tableColumn.field)"
            />
          </th>
          <ks-dropdown :target="'_columns'" drop-pos="pointer" mouse-button="right" scrollHolderId="">
            <span class="dropdown-item">Отображение столбцов</span>
            <div class="dropdown-menu dropdown-submenu shadow">
              <a
                v-for="column of allTableColumns"
                :key="`order_${column.field}`"
                class="dropdown-item"
                href="#"
                @click="toggleColVisible($event, column)"
              >
                <i :class="['icon me-1', column.isSwitchOn ? 'fi_checked-theme' : 'fi_unchecked-theme']"></i>
                <span v-html="column.label[calcType]"></span>
              </a>
            </div>
            <span class="dropdown-item">Сортировка по столбцу</span>
            <div class="dropdown-menu dropdown-submenu shadow">
              <a
                v-for="column of allTableColumns"
                :key="`order_${column.field}`"
                class="dropdown-item"
                href="#"
                @click="onColumnClick($event, column.field)"
              >
                <i :class="['icon me-1', sortIcons[$filtersStore.getColumnSortDirection(column.field)]]"></i>
                <span v-html="column.label[calcType]"></span>
              </a>
            </div>
          </ks-dropdown>
        </tr>
      </thead>

      <tbody v-if="items.length && !loading" id="_body">
        <template v-for="(group, groupKey, groupIndex) in groupedItems">
          <tr class="group-row" v-if="group.length && groupKey !== 'Все элементы'">
            <td :colspan="tableColumns.length">
              <div class="d-flex align-items-center h-100" style="gap: 0.625rem">
                <strong>{{ groupKey }}</strong>
                <span class="line"></span>
              </div>
            </td>
          </tr>
          <tr
            v-for="(item, index) in group"
            :class="[
              { 'table-active': item.id === activeItem?.id },
              { 'last-group-row': index === group.length - 1 },
              'table-string',
            ]"
            @contextmenu="onRowCtx($event, item)"
            @dblclick="onRowDblClick($event, item, navigateString)"
          >
            <td
              v-if="$geoObject.linkExistingCardTable || $geoObject.linkExistingObjectsTable"
              class="col-auto align-middle"
              @click="
                () => {
                  if ($geoObject.linkExistingCardTable) {
                    $geoObject.toogleLinkExistingCardIds(item.id)
                  } else $geoObject.toogleLinkExistingObjectsIds(item.id)
                }
              "
            >
              <GeoObjectLinkCheckbox :id="item.id" />
            </td>
            <td
              v-for="tableColumn of tableColumns"
              @click="setComparisonObjectFromTable(tableColumn.field, item)"
              :class="tableColumn.field"
            >
              <a
                :href="navigateString + item.id + '#Базовые поля'"
                @click="onLinkClick($event, item)"
                style="display: block; width: 100%; height: 100%; text-decoration: none; color: inherit"
              >
                <span v-if="tableColumn.columnIndex">{{ computeItemIndex(groupIndex, index) }}</span>
                <template v-else-if="tableColumn.isSwitchOn">
                  <div v-if="typeof item[tableColumn.field] === 'boolean'" class="w-100 text-center">
                    <i
                      :class="[
                        'icon icon-lg icon-secondary',
                        item[tableColumn.field] ? 'fi_checked-theme' : 'fi_minus',
                      ]"
                    ></i>
                  </div>
                  <div
                    v-else-if="
                      tableColumn.field === 'comparison' &&
                      comparisonObjectsIdsArr.length &&
                      comparisonObjectsIdsArr.includes(item.id)
                    "
                  >
                    <i class="icon fi_compare"></i>
                  </div>
                  <template
                    v-else-if="
                      item[tableColumn.field] !== null &&
                      item[tableColumn.field] !== undefined &&
                      item[tableColumn.field] !== ''
                    "
                  >
                    <i
                      class="icon"
                      style="margin-right: 0.5rem"
                      :class="item[`${tableColumn.field}Icon`]"
                      v-if="item[`${tableColumn.field}Icon`]"
                    ></i>
                    <template v-if="Array.isArray(getColumnValue(item[tableColumn.field], tableColumn.field))">
                      <span
                        class="icon-container"
                        v-b-tooltip.hover.html
                        :title="`Объект имеет карточки следующих типов: ${getColumnValue(
                          item[tableColumn.field],
                          tableColumn.field,
                        )
                          .map((i: any) => i.label)
                          .join(', ')}`"
                      >
                        <span
                          v-for="icon in getColumnValue(item[tableColumn.field], tableColumn.field)"
                          :key="icon.icon"
                          v-html="icon.icon"
                        ></span>
                      </span>
                    </template>
                    <template v-else>
                      <span v-html="getColumnValue(item[tableColumn.field], tableColumn.field)"></span>
                    </template>
                  </template>
                  <template v-else>
                    <i class="icon fi_minus"></i>
                  </template>
                </template>
              </a>
            </td>
          </tr>
        </template>
      </tbody>

      <ks-dropdown ref="rowCtxMenu" :target="'_body'" drop-pos="pointer" mouseButton="manually">
        <template v-if="props.itemsCtxMenu.length > 0">
          <a
            v-for="item in props.itemsCtxMenu"
            :key="item.emit"
            class="dropdown-item"
            href="#"
            @click.prevent="
              () => {
                $emit(item.emit, activeItem)
                rowCtxMenu.hide()
              }
            "
          >
            <i :class="['icon fa-fw me-1', item.icon]"></i> {{ item.label }}
          </a>
        </template>
        <template v-else>
          <a class="dropdown-item" href="#" @click.prevent="onOpenItemClick(navigateString)">
            <i class="icon fi_edit-3 fa-fw me-1"></i> Открыть
          </a>
        </template>
      </ks-dropdown>
    </table>
    <AlertEmpty v-if="!props.loading && !items.length">
      Объекты, удовлетворяющие текущим параметрам фильтра, не найдены. Чтобы создать новый объект, воспользуйтесь
      кнопкой “Добавить объект ...”
    </AlertEmpty>
  </div>
</template>

<script lang="ts" name="Table" setup>
import { computed, ref, onMounted } from 'vue'
import { useNuxtApp, useRoute, navigateTo } from 'nuxt/app'
import { cloneDeep } from 'lodash'
import type { PropType } from 'vue'
import type { tableColumnType } from '~/types/objectsFiltersStoreTypes'
import type { comparisonObjectsType } from '~/types/comparisonTypes'

import SortableHeader from '~/components/ObjectsTable/SortableHeader.vue'
import LoadingCover from '~/components/UI-KIT/Loaders/LoadingCover.vue'
import KsDropdown from '~/components/MapComponent/KsDropdown.vue'
import AlertEmpty from '~/components/UI-KIT/Alerts/AlertEmpty.vue'
import GeoObjectLinkCheckbox from '~/components/ObjectsTable/GeoObjectLinkCheckbox.vue'

interface AnalogObject {
  id: number
}

const props = defineProps({
  items: { type: Array as PropType<Array<any>>, default: () => [] },
  firstNo: { type: Number, default: 1 },
  activeItem: { type: Object as PropType<any>, default: null },
  loading: { type: Boolean, default: false },
  navigateString: { type: String, required: true },
  store: Object,
  openTableForProgram: Function,
  itemsCtxMenu: { type: Array as PropType<Array<any>>, default: () => [] },
  groups: { type: Array as PropType<Array<{ title: string; requirement: (item: any) => boolean }>>, default: () => [] },
  actionDblClick: { type: Boolean },
  tableStructure: { type: String, default: 'tableStructure' },
})

const emit = defineEmits(['onItemSelect', 'onColumnClick', 'onRowDblClick'])

const sortIcons: Record<string, string> = {
  asc: 'fi_sort-up',
  desc: 'fi_sort-down',
  none: 'empty',
}

const getSortDirection = (field: string) => {
  return effectiveStore.value.getColumnSortDirection(field)
}

const getColumnSorted = (field: string) => {
  return effectiveStore.value.getColumnSorted(field)
}

const { $filtersStore, $objectStore, $comparison, $geoObject }: any = useNuxtApp()
const allOptions = $filtersStore.allOptions
const rowCtxMenu: any = ref(null)

const effectiveStore = computed(() => props.store || $filtersStore)
const calcType = computed(() => effectiveStore.value.searchParams.object_type_calc || 'REF')
const isClearCompare = computed(() => $comparison.isClearCompare)
const comparisonObjectsIdsArr = computed(() =>
  $comparison.currentComparisonObjects.map((obj: Record<string, any>) => obj.id)
)

onMounted(() => {
  if (isClearCompare.value) {
    $comparison.isClearComparisonObjects()
  }

  $filtersStore.tableColumns = cloneDeep($filtersStore.initialTableColumns)
  if (localStorage.getItem(props.tableStructure)) {
    effectiveStore.value.setTableColumns(JSON.parse(localStorage.getItem(props.tableStructure) ?? ''))
  }

  if (effectiveStore.value.lastSelectedObject)
    setTimeout(() => {
      scrollToItem(effectiveStore.value.lastSelectedObject)
      console.log('scrollToItem', effectiveStore.value.lastSelectedObject.id)
    }, 1000)
})

const allTableColumns = computed(() =>
  effectiveStore.value.tableColumns.filter((col: tableColumnType) => col.calcType?.includes(calcType.value)),
)

const tableColumns = computed(() => allTableColumns.value.filter((column: tableColumnType) => column.isSwitchOn))

const groupedItems = computed(() => {
  if (!props.groups.length) {
    return { 'Все элементы': props.items }
  }

  const grouped = props.groups.reduce((acc: Record<string, any[]>, group) => {
    acc[group.title] = props.items.filter(group.requirement)
    return acc
  }, {})

  const groupedItemIds = new Set<number>()
  for (const groupItems of Object.values(grouped)) {
    for (const item of groupItems as any[]) {
      groupedItemIds.add(item.id)
    }
  }
  const defaultGroupItems = props.items.filter((item: any) => !groupedItemIds.has(item.id))

  return defaultGroupItems.length ? { 'Не сгруппированные': defaultGroupItems, ...grouped } : grouped
})

const getColumnValue = (value: string | number, field: string) => {
  return effectiveStore.value.getColumnValue(value, field)
}

const toggleColVisible = (event: Event, column: tableColumnType) => {
  effectiveStore.value.changeTableStructure(column.field)
}
const onShowTableDropdownMenu = (field: string) => {
  $filtersStore.onShowTableDropdownMenu(field)
}

const onCloseTableDropdownMenu = (field: string) => {
  $filtersStore.onCloseTableDropdownMenu(field)
}

const onColumnClick = (event: Event, field: string) => {
  emit('onColumnClick', event, field)
}

const onRowClick = (event: Event, item: any) => {
  emit('onItemSelect', item)
}

const onLinkClick = (event: MouseEvent, item: any) => {
  if (!event.ctrlKey && !event.metaKey && event.button === 0) {
    event.preventDefault()
    emit('onItemSelect', item)
  }
}

const onRowCtx = (event: Event, item: any) => {
  emit('onItemSelect', item)
  if (rowCtxMenu.value) rowCtxMenu.value.show(event)
}
const route = useRoute()

const onRowDblClick = (event: Event, item: AnalogObject, navigateString: string) => {
  if (route.path.includes('references')) {
    props.openTableForProgram?.(item.id)
  } else if (props.actionDblClick) {
    emit('onRowDblClick', item)
  } else {
    if ($geoObject.linkExistingCardTable || $geoObject.linkExistingObjectsTable) {
      navigateTo(
        { path: navigateString + item.id, hash: '#Базовые поля' },
        {
          external: true,
          open: {
            target: '_blank',
          },
        },
      )
    } else navigateTo({ path: navigateString + item.id, hash: '#Базовые поля' })
    console.log('actionDblClick', props.actionDblClick)
  }
}

const onOpenItemClick = (navigateString: string) => {
  if (props.activeItem) {
    if (route.path.includes('references')) {
      props.openTableForProgram?.(props.activeItem.id)
    } else {
      navigateTo({ path: navigateString + props.activeItem.id, hash: '#Базовые поля' })
    }
  }
}

const scrollToItem = (itemToScroll: AnalogObject) => {
  const index = props.items.findIndex((item: AnalogObject) => itemToScroll.id === item.id)
  if (index !== -1) {
    document
      .getElementById('_body')
      ?.querySelectorAll('tr')
      [index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
  }
}

const computeItemIndex = (groupIndex: number, itemIndex: number) => {
  let index = props.firstNo
  for (let i = 0; i < groupIndex; i++) {
    index += groupedItems.value[Object.keys(groupedItems.value)[i]].length
  }
  return index + itemIndex
}

defineExpose({
  scrollToItem,
})

const setComparisonObject = (obj: comparisonObjectsType) => {
  const comparisonObject: Record<string, any> = {
    id: obj.id,
    object_type: obj.object_type,
    geo_pos: obj.geo_pos,
    address_raw: obj.address_raw,
    name: obj.name,
    object_type_calc: obj.object_type_calc,
    func_purpose: obj.func_purpose,
    added_date: obj.added_date.split('-').reverse().join('.'),
  }

  $comparison.addComparisonObject(comparisonObject)
}

const setComparisonObjectFromTable = (field: string, obj: Record<string, any>) => {
  if (field !== 'comparison') return

  if (comparisonObjectsIdsArr.value && comparisonObjectsIdsArr.value.includes(obj.id)) {
    const index = $comparison.getComparisonObjectIndex(obj.id)
    $comparison.deleteComparisonObject(index)
    return
  }

  setComparisonObject(obj)
}
</script>
