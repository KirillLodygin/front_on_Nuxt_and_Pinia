<template>
  <div class="overflow-y-auto position-relative w-100">
    <div v-if="props.loading" class="table-load-bg">
      <div class="table-load">
        <div class="spinner-border" role="status"></div>
        <div>Загрузка данных...</div>
      </div>
    </div>
    <table class="table table-content w-100 geo-object-nested-objects-table">
      <thead id="_columns">
        <tr>
          <th class="align-middle" scope="col">#</th>
          <th v-for="header in visibleColumns" class="align-middle" scope="col" :key="header.field">
            <SortableHeader
              :sortDirection="header.sortDirection"
              :sorted="header.sorted"
              :title="header.title"
              :field="header.field"
              @click="onColumnClick(header.field)"
            />
          </th>
        </tr>
      </thead>

      <tbody id="_body" class="w-100">
        <tr class="w-100">
          <td class="w-100 border-0" colspan="100%">
            <div class="d-flex geo-object-nested-objects-splitter">
              <span class="text">Вложенные объекты недвижимости</span>
              <hr class="split-line ms-2" />
            </div>
          </td>
        </tr>
        <tr v-if="!linkedObjects.length" class="w-100">
          <td class="w-100 border-0" colspan="100%">
            <AlertEmpty> Объектов не найдено </AlertEmpty>
          </td>
        </tr>
        <tr
          v-for="(dataItem, index) of linkedObjects"
          :class="[{ 'table-active': activeItem && dataItem.index === activeItem.index }, 'table-string']"
          @click="onRowClick(dataItem, 'object')"
          @dblclick="onRowDblClick(dataItem)"
          @contextmenu="onRowCtx($event, dataItem, 'object')"
          :key="index"
        >
          <td>{{ dataItem.index }}</td>
          <td v-for="col in visibleColumns" :key="col.field">
            <!-- {{ dataItem[col.field] }} -->
            {{ dataItem[col.field] }}
          </td>
        </tr>
        <tr class="w-100">
          <td class="w-100 border-0" colspan="100%">
            <div class="d-flex geo-object-nested-objects-splitter">
              <span class="text">Вложенные карточки</span>
              <hr class="split-line ms-2" />
            </div>
          </td>
        </tr>
        <tr v-if="!linkedCards.length" class="w-100">
          <td class="w-100 border-0" colspan="100%">
            <AlertEmpty> Карточек не найдено </AlertEmpty>
          </td>
        </tr>
        <tr
          v-for="(dataItem, index) of linkedCards"
          :class="[{ 'table-active': activeItem && dataItem.index === activeItem.index }, 'table-string']"
          @click="onRowClick(dataItem, 'card')"
          @contextmenu="onRowCtx($event, dataItem, 'card')"
          @dblclick="onRowDblClick(dataItem)"
          :key="index"
        >
          <td>{{ dataItem.index }}</td>
          <td v-for="col in visibleColumns" :key="col.field">
            <!-- {{ dataItem[col.field] }} -->
            {{ dataItem[col.field] }}
          </td>
        </tr>
      </tbody>
    </table>
    <!-- <AlertEmpty v-if="!props.loading && !linkedObjects.length && !linkedCards.length">
      Расчеты для объекта не найдены. Чтобы добавить расчёт, воспользуйтесь кнопкой "Новый расчёт"
    </AlertEmpty> -->
  </div>
</template>

<script lang="ts" setup>
import SortableHeader from '~/components/ObjectsTable/SortableHeader.vue'
import {
  type EATypesInterface,
  type EStatusesInterface,
  EvaluationsApproachesTypes,
  EvaluationsStatuses,
} from '~/app_constants/EvaluationsApproachesTypes'
import _ from 'lodash'
import { getUserNames, reformatDate } from '~/utils/objectUtils'
import AlertEmpty from '~/components/UI-KIT/Alerts/AlertEmpty.vue'

const props = defineProps({
  linkedObjects: { type: Array as PropType<Array<any>>, default: [] },
  linkedCards: { type: Array as PropType<Array<any>>, default: [] },
  activeItem: { type: Object as PropType<any>, default: null },
  loading: { type: Boolean, default: false },
  sortableHeaderData: { type: Object as PropType<Record<string, SortableHeaderInterface>>, default: [] },
})
const emit = defineEmits(['setActiveItem', 'onRowCtx', 'onColumnClick', 'onRowDblClick'])

interface SortableHeaderInterface {
  title: string
  field: string
  sortDirection: 'none' | 'asc' | 'desc'
  sorted: boolean
  type: string
  visible: boolean
}

const visibleColumns = computed(() => {
  return Object.keys(props.sortableHeaderData)
    .filter((item) => props.sortableHeaderData[item].visible)
    .map((item) => props.sortableHeaderData[item])
})
const onColumnClick = (field: string) => {
  let direction = props.sortableHeaderData[field].sortDirection
  switch (props.sortableHeaderData[field].sortDirection) {
    case 'none':
      direction = 'asc'
      break
    case 'asc':
      direction = 'desc'
      break
    case 'desc':
      direction = 'none'
      break
  }
  emit('onColumnClick', field, direction)
}
// обработка нажатия ЛКМ на строку таблицы
const onRowClick = (item: any, type: string) => {
  emit('setActiveItem', item, type)
}
// обработка нажатия ПКМ на строку таблицы
const onRowCtx = (event: Event, item: any, type: string) => {
  emit('onRowCtx', event, item, type)
}

const onRowDblClick = (item: any) => {
  emit('onRowDblClick')
}
</script>
