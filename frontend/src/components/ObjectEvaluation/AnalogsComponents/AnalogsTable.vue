<template>
  <div class="overflow-y-auto">
    <div v-if="props.loading" class="table-load-bg">
      <div class="table-load">
        <div class="spinner-border" role="status"></div>
        <div>Загрузка данных...</div>
      </div>
    </div>
    <table class="table table-content" id="analogs-list-inside-calc">
      <thead id="_columns">
        <tr>
          <th class="col-auto align-middle" scope="col"><i class="icon fi_scale-left" /></th>
          <th class="col-auto align-middle" scope="col">#</th>
          <th v-for="header in sortableHeaderData" class="col-auto align-middle" scope="col">
            <SortableHeader
              :sortDirection="header.sortDirection"
              :sorted="header.sorted"
              :title="header.title"
              field=""
              @click="onColumnClick(header.title)"
            />
          </th>
        </tr>
      </thead>

      <tbody id="_body">
        <tr
          v-for="(analog, index) of computedAnalogs"
          :id="`row_${analog.id}`"
          :class="[
            {
              'table-active': analog === activeAnalog,
              'table-row-text-danger': 'is_deleted_error' in analog && analog['is_deleted_error'],
            },
            'table-string',
          ]"
          @click="onRowClick(analog)"
          @contextmenu="onRowCtx($event, analog)"
          @dblclick="onRowDblClick(analog)"
        >
          <td @click="emit('selectAnalog', analog)">
            <i
              :class="[
                { 'icon fi_scale-left': getSelectedStatus(analog.id) },
                { 'icon fi_minus': !getSelectedStatus(analog.id) },
              ]"
            />
          </td>
          <td>{{ index + 1 + (page - 1) * itemsPerPage }}</td>
          <td>{{ analog.id }}</td>
          <td>{{ analog.address_raw }}</td>
          <td>
            <div v-if="getSimilarity(analog.similarity) === -1">
              <i class="icon fi_minus" />
            </div>
            <div v-else>
              {{ getSimilarity(analog.similarity) }}
            </div>
          </td>
          <td>
            <div v-if="getPriority(analog.similarity) === '-'">
              <i class="icon fi_minus" />
            </div>
            <div v-else>
              {{ getPriority(analog.similarity) }}
            </div>
          </td>
          <td>
            <i :class="'icon' + (analog.is_checked ? ' fi_check' : ' fi_minus')" />&nbsp;{{
              getCheckedStatus(analog.is_checked)
            }}
          </td>
          <td>{{ analog.object_area }}</td>
          <td>{{ numberWithSpaces(analog.price_sale_per_m) }}</td>
          <td>{{ getFPName(analog.func_purpose) }}</td>
          <td>{{ getNormalDate(analog.ads_updated) }}</td>
          <BTooltip
            v-if="'is_deleted_error' in analog && analog['is_deleted_error']"
            :target="`row_${analog.id}`"
            custom-class="tooltip-xl"
            placement="left"
            triggers="hover"
          >
            <div class="text-start w-100">{{ analog_error_text }}</div>
          </BTooltip>
        </tr>
      </tbody>
    </table>
    <AlertEmpty v-if="!props.loading && !analogs.length">Предложения не найдены</AlertEmpty>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import SortableHeader from '~/components/ObjectsTable/SortableHeader.vue'
import AlertEmpty from '~/components/UI-KIT/Alerts/AlertEmpty.vue'
import type { SortableHeaderType } from '~/types/objectEvaluationType'
import { type aimType } from '~/types/calculationsTypes'
import { analog_error_text } from '~/app_constants/wordAbbreviations'

const { $constData, $calculations } = useNuxtApp()

const props = defineProps({
  analogs: { type: Array as PropType<Array<any>>, default: [] },
  selectedAnalogs: { type: Array as PropType<Array<any>>, default: [] },
  activeAnalog: { type: Object as PropType<any>, default: null },
  loading: { type: Boolean, default: false },
  page: { type: Number, default: 1 },
  itemsPerPage: { type: Number, default: 30 },
})

const emit = defineEmits(['setActiveAnalog', 'onRowCtx', 'selectAnalog', 'navTo'])

const isAllAnalogsInSelection = computed(() => $calculations.isAllAnalogsInSelection)

const getSelectedStatus = (id: number) => {
  return !!props.selectedAnalogs.some((item: any) => item.id === id)
}
// возвращает текст колонки Приоритет
const getPriority = (similarity: number) => {
  return parseFloat(similarity?.toFixed(0)) > 75 ? 'Рекомендовано' : '-'
}
// возвращает текст колонки Статус верификации
const getCheckedStatus = (status: boolean) => {
  return status ? 'Проверено' : 'Требует проверки'
}
// возвращает текст колонки Функциональное назначение
const getFPName = (fp: number | Record<string, any>) => {
  if (typeof fp === 'number') {
    return $constData.funcPurposes.find((item: any) => item.id === fp)?.name
  } else {
    return $constData.funcPurposes.find((item: any) => item.id === fp.id)?.name
  }
}
// возвращает дату в виде ДД.ММ.ГГГГ
const getNormalDate = (dateValue: string) => {
  const date = new Date(dateValue)
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
  const normalDate = date.toLocaleDateString('ru-RU', options)
  return normalDate === '01.01.1970' ? 'Не указана' : normalDate
}

const getSimilarity = (sim: number) => {
  const similarity = sim?.toFixed(0)
  if (similarity) {
    return parseFloat(similarity)
  } else {
    return -1
  }
}

const computedAnalogs = computed(() =>
  props.analogs.sort((a: any, b: any): any => {
    const sortData = sortableHeaderData.value.find((obj: SortableHeaderType) => obj.sorted)
    if (sortData) {
      if (sortData.sortDirection === 'asc') {
        if (sortData.type === 'string') {
          if (sortData.field === 'func_purpose') {
            return a[sortData.field].name.localeCompare(b[sortData.field].name)
          } else {
            return a[sortData.field].localeCompare(b[sortData.field])
          }
        } else if (sortData.type === 'boolean') {
          return String(a[sortData.field]).localeCompare(String(b[sortData.field]))
        } else {
          return a[sortData.field] - b[sortData.field]
        }
      } else if (sortData.sortDirection === 'desc') {
        if (sortData.type === 'string') {
          if (sortData.field === 'func_purpose') {
            return b[sortData.field].name.localeCompare(a[sortData.field].name)
          } else {
            return b[sortData.field].localeCompare(a[sortData.field])
          }
        } else if (sortData.type === 'boolean') {
          return String(b[sortData.field]).localeCompare(String(a[sortData.field]))
        } else {
          return b[sortData.field] - a[sortData.field]
        }
      }
    } else {
      return a.similarity - b.similarity
    }
  }),
)
// данные заголовка таблицы аналогов
const sortableHeaderData: Ref<SortableHeaderType[]> = ref([
  { title: 'ID', sortDirection: 'none', sorted: false, field: 'pk', type: 'number' },
  { title: 'Адрес', sortDirection: 'none', sorted: false, field: 'address_raw', type: 'string' },
  { title: 'Схожесть, %', sortDirection: 'none', sorted: false, field: 'similarity', type: 'number' },
  { title: 'Приоритет', sortDirection: 'none', sorted: false, field: 'similarity', type: 'number' },
  { title: 'Статус верификации', sortDirection: 'desc', sorted: true, field: 'is_checked', type: 'boolean' },
  { title: 'Площадь, кв.м.', sortDirection: 'none', sorted: false, field: 'object_area', type: 'number' },
  {
    title: 'Удельная цена, руб. за кв.м.',
    sortDirection: 'none',
    sorted: false,
    field: 'price_sale_per_m',
    type: 'number',
  },
  { title: 'Функциональное назначение', sortDirection: 'none', sorted: false, field: 'func_purpose', type: 'string' },
  { title: 'Дата обновления в источнике', sortDirection: 'none', sorted: false, field: 'ads_updated', type: 'string' },
])
// переключение интерфейса сортировки по нажатию на заголовок колонок (пока сортировки данных нет)
const onColumnClick = (title: string) => {
  sortableHeaderData.value.forEach((header: SortableHeaderType) => {
    if (header.title === title) {
      switch (header.sortDirection) {
        case 'none':
          header.sortDirection = 'asc'
          break
        case 'asc':
          header.sortDirection = 'desc'
          break
        case 'desc':
          header.sortDirection = 'none'
          break
      }
      header.sorted = header.sortDirection !== 'none'
    } else {
      header.sortDirection = 'none'
      header.sorted = false
    }
  })
}
// обработка нажатия ЛКМ на строку таблицы
const onRowClick = (item: any) => {
  emit('setActiveAnalog', item)
}
// обработка нажатия ПКМ на строку таблицы
const onRowCtx = (event: Event, item: any) => {
  emit('onRowCtx', event, item)
}
// обработка двойного нажатия ПКМ на строку таблицы (пока ничего нет)
const onRowDblClick = (item: any) => {
  emit('navTo', item)
}
const scrollToItem = (itemToScroll: aimType) => {
  let index: number | null = null
  for (let i = 0; i < props.analogs.length; i++) {
    if (itemToScroll.id === props.analogs[i].id) {
      index = i
      break
    }
  }

  if (index !== null) {
    setTimeout(() => {
      document
        .getElementById('_body')
        ?.querySelectorAll('tr')
        [index!]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }
}

defineExpose({
  scrollToItem,
})
</script>
