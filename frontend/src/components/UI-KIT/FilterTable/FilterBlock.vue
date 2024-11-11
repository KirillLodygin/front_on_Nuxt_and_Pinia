<template>
  <div class="filter-block-wrapp">
    <div class="filter-label">
      <span role="button" @click.prevent="openFilter()">
        <i :class="['icon me-1', filter.isOpen ? 'fi_chevron-down' : 'fi_chevron-right']"></i>
        {{ getFieldLabel(filter) }}
      </span>
      <i v-if="isFilterSelect" class="icon icon-emphasis fi_filter-select ms-2"></i>
      <template v-if="filterHint(filter)">
        <i
          :id="filter.field + '_hint'"
          v-b-tooltip.hover.right="filterHint(filter)"
          class="icon icon-secondary fi_info ms-2"
        ></i>
      </template>
    </div>

    <Transition name="slide-y-fade">
      <div v-if="filter.isOpen" class="filter-body">
        <template
          v-if="
            filter.type === 'choice' ||
            filter.type === 'nested object' ||
            filter.type === 'boolean' ||
            filter.field === 'modified_by'
          "
          :key="filter.field"
          class="line line-block"
        >
          <div class="form-inputs">
            <FilterCheckbox
              v-for="choice in filter.choices"
              :key="choice.value"
              v-model:checkedValue="selectedCheck"
              :choice="choice"
              :disabled="computedCheckboxDisable(filter.field, choice)"
              :field="filter.field"
              :is-all-filters="isAllFilters"
              :name="filter.label"
              :store="effectiveStore"
              @changeFilter="emit('changeFilter')"
            />
          </div>
        </template>

        <template
          v-if="filter.type === 'decimal' || ['datetime', 'date'].includes(filter.type)"
          class="line line-block"
        >
          <div class="interval-block">
            <FilterInterval
              :key="`${filter.field}`"
              :field="filter.field"
              :input-type="filter.type"
              :interval-values="filter.intervalValues"
              :is-all-filters="isAllFilters"
              :store="effectiveStore"
              @changeFilter="emit('changeFilter')"
            />
          </div>
        </template>

        <template
          v-if="['string', 'field', 'integer', 'float', 'url'].includes(filter.type) && filter.field !== 'modified_by'"
          class="line line-block"
        >
          <div>
            <FilterInput
              v-model:value="filter.value"
              :field="filter.field"
              :input-type="filter.type"
              :is-all-filters="isAllFilters"
              :placeholder="filter.input.placeholder"
              :store="effectiveStore"
              @changeFilter="emit('changeFilter')"
            />
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import { type filterType } from '~/types/objectsFiltersStoreTypes'
import FilterCheckbox from '~/components/UI-KIT/FilterTable/components/FilterСheckbox.vue'
import FilterInterval from '~/components/UI-KIT/FilterTable/components/FilterInterval.vue'
import FilterInput from '~/components/UI-KIT/FilterTable/components/FilterInput.vue'

const { $filtersStore, $auth, $userStore, $geoObject }: any = useNuxtApp()

const props = defineProps({
  filter: { type: Object as PropType<filterType>, required: true },
  isAllFilters: { type: Boolean, required: true },
  isChecked: { type: Boolean, required: false },
  isLastFilter: { type: Boolean, required: false },
  store: { type: [String, Object] },
})
const emit = defineEmits(['changeFilter'])
const effectiveStore = computed(() => props.store || $filtersStore)

const isFilterSelect = computed(() => {
  return !!props.filter?.value
})

const selectedCheck = ref('')
const filterValue = ref('')
const hint = ref(null)

const route = useRoute()
const objectTypeCalc = route.path.startsWith('/evaluation')
  ? 'OO'
  : route.path.startsWith('/analog')
    ? 'OA'
    : route.path.startsWith('/research')
      ? 'NE'
      : ''

const computedCheckboxDisable = (field: string, choice: any) => {
  const disabled =
    (field === 'object_type_calc' && (objectTypeCalc.length || $geoObject.linkExistingCardTable)) ||
    (field === 'func_purpose' && choice['disabled']) ||
    ((field === 'object_type' || field === 'cards_link') && $geoObject.linkExistingCardTable) ||
    ((field === 'object_type' || field === 'has_parent') &&
      $geoObject.linkExistingObjectsTable &&
      !route.path.startsWith('/catalog'))
  return disabled ? disabled : false
}

const getFieldLabel = (filter: filterType) => {
  console.log($filtersStore.searchParams.object_type_calc)
  if ($filtersStore.searchParams.object_type_calc === 'NE' && filter.field === 'ads_type') return 'Тип торгов'
  if ($filtersStore.searchParams.object_type_calc === 'NE' && filter.field === 'date_calc') return 'Дата исследования'
  return filter.label
}

const openFilter = () => {
  effectiveStore.value.openFilter(props.filter.field, props.isAllFilters)
  if (props.isLastFilter) {
    scrollToBottom()
  }
  emit('changeFilter')
}

watch(
  () => props.filter.isOpen,
  (newVal) => {
    if (newVal && props.isLastFilter) {
      scrollToBottom()
    }
  },
)

const scrollToBottom = () => {
  nextTick(() => {
    document.querySelector('.filters-list')?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  })
}

const users = ref([])

watch(
  () => props.filter.value,
  () => {
    if (props.filter?.field === 'modified_by') {
      effectiveStore.value.updateFilter(props.filter.field, props.filter.value.toString(), '', props.isAllFilters)
    }
  },
)

// Возвращает подсказку для фильтра
// В будущем, если перечень фильтров с подсказками увеличится, то подсказки нужно перенести в API
const filterHint = (filter: filterType): string => {
  const hints: Record<string, string> = {
    address_raw:
      '<div class="mb-2">Для правильной работы поиска по адресу нужно ввести город и улицу.</div><div><em>Например: Москва, Тверская, ...</em></div>',
    modified_by:
      'Набор значений этого параметра зависит от выбранного <strong>Статуса объявления</strong> и позволяет отобрать черновики, добавленные системой (значение “Администратор”), Ваши черновики и/или опубликованные объекты (значение с Вашим именем), объекты опубликованные  другими пользователями (значения с именами пользователей)',
    func_purpose:
      'Набор значений этого параметра зависит от выбранного <strong>Типа объявления</strong> и <strong>Типа объекта</strong>',
  }
  return hints[filter.field]
}
</script>
