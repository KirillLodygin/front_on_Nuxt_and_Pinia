import { defineStore } from 'pinia'
import { cloneDeep } from 'lodash'
import { openFilter } from '~/composables/Filters/OpenFilter'

import { useFunctionalPurpose } from '~/composables/Filters/useFunctionalPurpose'
import { useFilters } from '~/composables/Filters/UpdateFilter'
import { useSearchParams } from '~/composables/useSearchParams'
import type {
  allFilteredFieldsType,
  allFiltersOptionsType,
  allFiltersType,
  choiceType,
  filterType,
  funcPurposeObjectType,
  functionalPurposeListType,
  functionalPurposeObjectType,
  nextDirectionType,
  objectsRespDataType,
  searchParamsType,
  sortDirectionType,
  sortedFieldType,
  tableColumnsType,
  tableHeaderFiltersType,
  tableParamsDataType,
} from '~/types/objectsFiltersStoreTypes'
import type { aimType } from '~/types/calculationsTypes'
import {
  api_export_general_analogs_excel,
  api_functional_purpose,
  api_search_fields,
  api_unversal_realty,
} from '~/app_constants/api'
import { useNuxtApp } from 'nuxt/app'
import useUserStore from '~/store/userStore'
import useGeoObject from '~/store/geoObject'
import useUserPermissions from '~/composables/useUserPermissions'
import _ from 'lodash'

const tableHeaderFilters: tableHeaderFiltersType = {}
const searchParams: searchParamsType = { limit: '15', object_type_calc: '' }
const sortedField: sortedFieldType = ''

const tableColumns: tableColumnsType = [
  {
    field: 'analog_number',
    label: { OA: '#', OO: '#', NE: '#' },
    isSwitchOn: true,
    doNotSwitchOff: true,
    calcType: ['OA', 'OO', 'NE'],
    columnIndex: true,
  },
  {
    field: 'address_raw',
    label: { OA: 'Адрес', OO: 'Адрес', NE: 'Адрес' },
    isSwitchOn: true,
    isTableMenuShown: false,
    calcType: ['OA', 'OO', 'NE'],
  },
  {
    field: 'object_type',
    label: { OA: 'Тип объекта', OO: 'Тип объекта', NE: 'Тип объекта' },
    isSwitchOn: true,
    isTableMenuShown: false,
    calcType: ['OA', 'OO', 'NE'],
  },
  {
    field: 'ads_type',
    label: { OA: 'Тип объявления', OO: 'Тип объявления', NE: 'Тип объявления НЭИ' },
    isSwitchOn: true,
    isTableMenuShown: false,
    calcType: ['OA', 'OO'],
  },
  {
    field: 'ne_ads_type',
    label: { OA: 'Тип объявления', OO: 'Тип объявления', NE: 'Тип объявления НЭИ' },
    isSwitchOn: true,
    isTableMenuShown: false,
    calcType: ['NE'],
  },
  {
    field: 'func_purpose',
    label: { OA: 'Функциональное назначение', OO: 'Функциональное назначение', NE: 'Функциональное назначение' },
    isSwitchOn: true,
    isTableMenuShown: false,
    calcType: ['OA', 'OO', 'NE'],
  },
  {
    field: 'ads_updated_internal',
    label: { OA: 'Дата изменения карточки', OO: 'Дата изменения карточки', NE: 'Дата изменения карточки' },
    isSwitchOn: false,
    isTableMenuShown: false,
    calcType: ['OA', 'OO', 'NE'],
  },
  {
    field: 'terms_of_sale',
    label: { OA: 'Тип предложения', OO: 'Тип предложения', NE: 'Тип предложения' },
    isSwitchOn: false,
    isTableMenuShown: false,
    calcType: ['OA'],
  },
  {
    field: 'is_checked',
    label: { OA: 'Проверен', OO: 'Проверен', NE: 'Проверен' },
    isSwitchOn: true,
    isTableMenuShown: false,
    calcType: ['OA'],
  },
  {
    field: 'ads_downloaded',
    label: { OA: 'Дата создания', OO: 'Дата создания', NE: 'Дата создания' },
    isSwitchOn: false,
    isTableMenuShown: false,
    calcType: ['OA', 'OO', 'NE'],
  },
  {
    field: 'date_calc',
    label: { OA: 'Дата оценки', OO: 'Дата оценки', NE: 'Дата исследования' },
    isSwitchOn: true,
    isTableMenuShown: false,
    calcType: ['OO', 'NE'],
  },
  {
    field: 'ads_updated',
    label: { OA: 'Дата предложения', OO: 'Дата предложения', NE: 'Дата предложения' },
    isSwitchOn: true,
    isTableMenuShown: false,
    calcType: ['OA'],
  },
  {
    field: 'added_by',
    label: { OA: 'Создал, ФИО', OO: 'Создал, ФИО', NE: 'Создал, ФИО' },
    isSwitchOn: false,
    isTableMenuShown: false,
    calcType: ['OA', 'OO', 'NE'],
  },
  {
    field: 'modified_by',
    label: { OA: 'Обновил, ФИО', OO: 'Обновил, ФИО', NE: 'Обновил, ФИО' },
    isSwitchOn: false,
    isTableMenuShown: false,
    calcType: ['OA', 'OO', 'NE'],
  },
  {
    field: 'object_area',
    label: { OA: 'Площадь, кв. м.', OO: 'Площадь, кв. м.', NE: 'Площадь, кв. м.' },
    isSwitchOn: true,
    isTableMenuShown: false,
    calcType: ['OA', 'OO', 'NE'],
  },
  {
    field: 'tz_number',
    label: { OA: 'Номер ТЗ', OO: 'Номер ТЗ', NE: 'Номер ТЗ' },
    isSwitchOn: false,
    isTableMenuShown: false,
    calcType: ['OO'],
  },
  {
    field: 'name_by_tz',
    label: {
      OA: 'Наименование Объекта оценки по ТЗ',
      OO: 'Наименование Объекта оценки по ТЗ',
      NE: 'Наименование Объекта оценки по ТЗ',
    },
    isSwitchOn: false,
    isTableMenuShown: false,
    calcType: ['OO'],
  },
  {
    field: 'price_rent_per_m',
    label: {
      OA: 'Удельная арендная ставка/цена, руб. кв/м.',
      OO: 'Удельная арендная ставка/цена, руб. кв/м.',
      NE: 'Удельная арендная ставка/цена, руб. кв/м.',
    },
    isSwitchOn: false,
    isTableMenuShown: false,
    calcType: ['OA'],
  },
  {
    field: 'price_sale_per_m',
    label: {
      OA: 'Удельная цена, руб. за кв. м',
      OO: 'Удельная цена, руб. за кв. м',
      NE: 'Удельная цена, руб. за кв. м',
    },
    isSwitchOn: false,
    isTableMenuShown: false,
    calcType: ['OA'],
  },
  {
    field: 'kadast_number',
    label: { OA: 'Кадастровый номер', OO: 'Кадастровый номер', NE: 'Кадастровый номер' },
    isSwitchOn: false,
    isTableMenuShown: false,
    calcType: ['OA', 'OO'],
  },
  {
    field: 'id',
    label: { OA: 'Идентификатор', OO: 'Идентификатор', NE: 'Идентификатор' },
    isSwitchOn: false,
    isTableMenuShown: false,
    calcType: ['OA', 'OO', 'NE'],
  },
  {
    field: 'additional_obj_id',
    label: { OA: 'Номер объекта', OO: 'Номер объекта', NE: 'Номер объекта' },
    isSwitchOn: false,
    isTableMenuShown: false,
    calcType: ['NE'],
  },
]

const sortDirection: sortDirectionType = 'none'
const nextDirection: nextDirectionType = { none: 'asc', asc: 'desc', desc: 'none' }

const functionalPurposeObject: functionalPurposeObjectType = {
  B: { R: { labels: [], ids: [] }, S: { labels: [], ids: [] } },
  Q: { R: { labels: [], ids: [] }, S: { labels: [], ids: [] } },
  L: { R: { labels: [], ids: [] }, S: { labels: [], ids: [] } },
}

const filters: allFiltersType = []
const additionalFilters: allFiltersType = []
const allFilteredFields: allFilteredFieldsType = {
  base_search_fields: [],
  search_fields_by_type: {
    quater: [],
    building: [],
    landplot: [],
  },
  ignore_search_fields: [],
  OO: [],
  OA: [],
  NE: [],
}

const allOptions: Record<string, any> = {}

const objectForFilterInitialization: filterType = {
  label: '',
  field: '',
  type: '',
  choices: [],
  input: {},
  intervalValues: {},
  value: '',
  isOpen: false,
}

const functionalPurposeList: functionalPurposeListType = []
const allFiltersOptions: allFiltersOptionsType = [
  { label: 'Все параметры', checked: false, value: 'all_fields' },
  { label: 'Основные параметры карточек оценки', checked: false, value: 'OO' },
  { label: 'Основные параметры карточек предложений', checked: false, value: 'OA' },
  { label: 'Основные параметры карточек исследований', checked: false, value: 'NE' },
]

const isCheckedChoices: Array<choiceType> = [
  { display_name: 'Проверено', value: 'Проверено', checked: false, disabled: false },
  { display_name: 'Требует проверки', value: 'Требует проверки', checked: false, disabled: false },
]

const isBooleanChoices: Array<choiceType> = [
  { display_name: 'Да', value: 'Да', checked: false, disabled: false },
  { display_name: 'Нет', value: 'Нет', checked: false, disabled: false },
]

const tableParamsData: tableParamsDataType = {
  limit: 15,
  displayedColumns: [],
  sortField: null,
  sortDirection: 'asc',
}

const objectsRespData: objectsRespDataType = {}
export default defineStore('filters', {
  state: () => ({
    // @ts-ignore
    // В объекте содержится описание фильтров для таблицы аналогов. Ключ - название фильтра, значение - значение фильтра
    tableHeaderFilters: <tableHeaderFiltersType>tableHeaderFilters,
    // параметры запроса аналогов
    searchParams: <searchParamsType>searchParams,
    // Константа, содержащая название поля, по которому производится сортировка в таблице
    sortedField: <sortedFieldType>sortedField,
    // Константа, задающая направление сортировки
    sortDirection: <sortDirectionType>sortDirection,
    // Объект для управления показом колонок таблицы. Ключ true - соответствующая колонка показывается, false - скрывается.
    tableColumns: <tableColumnsType>tableColumns,
    initialTableColumns: cloneDeep(tableColumns),
    // Массив объектов фильтров для управления фильтрацией таблицы.
    allFilters: <allFiltersType>filters,
    // Массив пустых объектов фильтров для управления фильтрацией таблицы.
    emptyFilters: <allFiltersType>[],
    // Объект с массивами дополнительных фильтров
    additionalFilters: <allFiltersType>additionalFilters,
    // Объект, содержащий массивы функциональных назначений для всех типов собственности
    functionalPurposeObject: <functionalPurposeObjectType>functionalPurposeObject,
    functionalPurposes: <functionalPurposeObjectType>functionalPurposeObject,
    // Объект, содержащий списки фильтруемых полей
    allFilteredFields: <allFilteredFieldsType>allFilteredFields,
    // Полный набор полей в проекте
    allOptions: <Record<string, any>>allOptions,
    // Объект для инициализации фильтра
    objectForFilterInitialization: <filterType>objectForFilterInitialization,
    // В объекте будет храниться functionalPurposeList, полученный с бэка.
    // Объект используется для сортировки чейсов поля realty_class и, возможно, где-то еще
    functionalPurposeList: <functionalPurposeListType>functionalPurposeList,
    // Объект меню фильтров в модальном окне Параметры фильтрации
    allFiltersOptions: <allFiltersOptionsType>allFiltersOptions,
    // Массив чейсов для фильтра 'modified_by'
    usersArr: <Array<choiceType>>[],
    // Переменные, контролирующие демонстрацию/скрытие меню управления таблицей
    isShowSubmenu1: false,
    isShowSubmenu2: false,
    objectsRespData: <objectsRespDataType>objectsRespData,
    objectsRespLoading: false,
    navigateString: <string>'',
    isFiltersInitialized: false,
    userId: 0,
    page: 1,
    lastSelectedObject: null,
    // Объект для модального окна Параметры таблицы
    tableParamsData: <tableParamsDataType>tableParamsData,
  }),

  getters: {
    getColumnValue: (state) => (analogValue: string | number | any, field: string) => {
      if (!analogValue) return ''

      const filterType = state.allOptions[field].type

      if (filterType !== 'choice' && filterType !== 'nested object') {
        if (['datetime', 'date'].includes(filterType)) {
          const date = new Date(analogValue)
          const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
          return date.toLocaleDateString('ru-RU', options)
        }
        if (['modified_by', 'added_by'].includes(field)) {
          return state.usersArr.find((obj) => obj.value === analogValue.toString())?.display_name
        }
        return String(analogValue)
      }

      if (field === 'func_purpose') {
        const functionalPurpose = state.functionalPurposeList.filter(
          (item: funcPurposeObjectType) => item.id === analogValue.id,
        )[0]
        return functionalPurpose ? functionalPurpose.name : null
      }

      const actualValue = state.allOptions[field].choices.filter((choice: any) => choice.value === analogValue)[0]
        .display_name

      return actualValue ? actualValue : ''
    },
  },

  actions: {
    resetState() {
      this.$reset()
    },
    setPage(value: number) {
      this.page = value
    },

    setObjectsRespLoading(bool: boolean) {
      this.objectsRespLoading = bool
    },

    setTableColumns(tableColumns: tableColumnsType) {
      this.tableColumns = tableColumns
    },

    changeTableStructure(field: string) {
      const index = this.tableColumns.findIndex((column) => column.field === field)
      this.tableColumns[index].isSwitchOn = !this.tableColumns[index].isSwitchOn
      const objectTypeKey = this.searchParams.object_type_calc || 'OA'
      localStorage.setItem(`tableStructure_${objectTypeKey}`, JSON.stringify(this.tableColumns))
    },

    onTableColumns(fields: string[], allFields: string[]) {
      allFields.forEach((field: string) => {
        const index = this.tableColumns.findIndex((column) => column.field === field)
        if (this.tableColumns[index]) {
          this.tableColumns[index].isSwitchOn = fields.includes(field)
        }
      })
      const objectTypeKey = this.searchParams.object_type_calc || 'OA'
      localStorage.setItem(`tableStructure_${objectTypeKey}`, JSON.stringify(this.tableColumns))
    },

    onShowTableDropdownMenu(field: string) {
      const shownIndex = this.tableColumns.findIndex((column) => column.field === field)
      this.tableColumns.forEach((column, index) => {
        column.isTableMenuShown = index === shownIndex
      })
    },

    onCloseTableDropdownMenu(field: string) {
      const shownIndex = this.tableColumns.findIndex((column) => column.field === field)
      this.tableColumns[shownIndex].isTableMenuShown = false
    },

    setIsShowSubmenu1(val: boolean) {
      this.isShowSubmenu1 = val
    },

    setIsShowSubmenu2(val: boolean) {
      this.isShowSubmenu2 = val
    },

    setUserId(id: number) {
      this.userId = id
    },

    initAllFilters() {
      this.allFilters = []
    },

    setSortDirection(curDirection: sortDirectionType, field: string, exact = false) {
      if (exact) {
        this.sortDirection = curDirection
      } else this.sortDirection = nextDirection[curDirection]
      this.sortedField = field
    },

    openFilter(field: string, isAllFilters: boolean) {
      const applyFilter = openFilter()
      const { allFilters, additionalFilters } = applyFilter(
        this.allFilters,
        this.additionalFilters,
        field,
        isAllFilters,
      )

      this.allFilters = allFilters
      this.additionalFilters = additionalFilters
    },

    initFunctionalPurposeObject(functionalPurposeList: functionalPurposeListType) {
      const { initFunctionalPurposeObject } = useFunctionalPurpose()

      this.functionalPurposeList = initFunctionalPurposeObject(this.functionalPurposeObject, functionalPurposeList)
    },

    initAllFilteredFields(filteredFields: allFilteredFieldsType) {
      this.allFilteredFields = filteredFields
    },

    setOptions(options: any) {
      this.allOptions = cloneDeep(options)
      const route = useRoute()
      const objectCalcType = route.path.startsWith('/evaluation')
        ? 'OO'
        : route.path.startsWith('/analog')
          ? 'OA'
          : route.path.startsWith('/research')
            ? 'NE'
            : ''
      Object.keys(this.allOptions).forEach((key) => {
        if (this.allOptions[key].label === 'Проверено') {
          this.allOptions[key].label = 'Статус'
        }
        if (this.allOptions[key].label === 'ID') {
          this.allOptions[key].label = 'Идентификатор'
        }
        if (this.allOptions[key].label === 'Дата обновления в системе') {
          this.allOptions[key].label = 'Дата изменения карточки'
        }
        if (this.allOptions[key].label === 'Дата скачивания/внесения') {
          this.allOptions[key].label = 'Дата создания карточки'
        }
        if (this.allOptions[key].label === 'Добавил (ФИО)') {
          this.allOptions[key].label = 'Создал, ФИО'
        }
        if (this.allOptions[key].label === 'Обновил (ФИО)') {
          this.allOptions[key].label = 'Обновил, ФИО'
        }
        if (this.allOptions[key].label === 'Дата оценки' && objectCalcType === 'NE') {
          this.allOptions[key].label = 'Дата исследования'
        }
        if (this.allOptions[key].label === 'Тип объявления' && objectCalcType === 'NE') {
          this.allOptions[key].label = 'Тип торгов'
        }
      })
    },

    updateFilter(field: string, newValue: any, inputNum: string, isAllFilters: boolean) {
      const { updateFilter } = useFilters()

      const { allFilters, additionalFilters } = updateFilter(
        this.allFilters,
        this.additionalFilters,
        field,
        newValue,
        inputNum,
        isAllFilters,
        this.applyFilters,
      )

      this.allFilters = allFilters
      this.additionalFilters = additionalFilters

      this.applyFilters()
    },

    updateCheckedFilter(field: string, newValue: string, isAllFilters: boolean, objectType: string) {
      if (newValue) {
        const filterIndex = this.allFilters.findIndex((filter) => filter.field === field)
        if (filterIndex !== -1) {
          const filter = isAllFilters
            ? cloneDeep(this.allFilters[filterIndex])
            : cloneDeep(this.additionalFilters[filterIndex])

          filter.choices?.forEach((choice) => {
            if (choice.value === newValue) {
              choice.checked = !choice.checked
            }
          })

          const filterValueArr = filter.value.split(',')
          if (!filterValueArr.includes(newValue)) {
            filterValueArr.push(newValue)
          } else {
            const index = filterValueArr.indexOf(newValue)
            filterValueArr.splice(index, 1)
          }
          filter.value = filterValueArr.join(',')

          if (filter.field === 'is_checked' && this.userId !== 1) {
            const modifiedByIndex = this.allFilters.findIndex((filter) => filter.field === 'modified_by')
            if (filter.value.includes('Требует проверки')) {
              const modifiedByFilter = cloneDeep(this.allFilters[modifiedByIndex])
              modifiedByFilter.choices = modifiedByFilter.choices.filter((user) =>
                [1, this.userId].includes(Number(user.value)),
              )
              this.allFilters[modifiedByIndex] = cloneDeep(modifiedByFilter)
            } else {
              this.allFilters[modifiedByIndex].choices = cloneDeep(this.usersArr)
            }
          }
          if (isAllFilters) {
            this.allFilters[filterIndex] = cloneDeep(filter)
          } else {
            this.additionalFilters[filterIndex] = cloneDeep(filter)
          }

          const filters = isAllFilters ? cloneDeep(this.allFilters) : cloneDeep(this.additionalFilters)

          if (field === 'object_type' || field === 'ads_type') {
            const objectTypeFilterIndex = filters.findIndex((filter) => filter.field === 'object_type')
            const adsTypeFilterIndex = filters.findIndex((filter) => filter.field === 'ads_type')
            const funcPurposeFilterIndex = filters.findIndex((filter) => filter.field === 'func_purpose')

            if (filters[objectTypeFilterIndex].value || filters[adsTypeFilterIndex].value) {
              const objectTypeFilterValuesArr = filters[objectTypeFilterIndex].value.split(',')
              const adsTypeFilterValuesArr = filters[adsTypeFilterIndex].value.split(',')
              filters[funcPurposeFilterIndex].choices.map((fp: any) => {
                const funcPurp = this.functionalPurposeList
                  .filter((item: funcPurposeObjectType) => item.object_type === objectType)
                  .filter(
                    (item: funcPurposeObjectType) =>
                      (item.type && objectTypeFilterValuesArr.includes(item.type)) ||
                      (item.calc_type && adsTypeFilterValuesArr.includes(item.calc_type)),
                  )
                const funcPurpNames = funcPurp.map((item: funcPurposeObjectType) => item.name)
                if (funcPurpNames.includes(fp.display_name.replace(';', ','))) {
                  fp.disabled = false
                  // fp.checked = false
                } else {
                  fp.disabled = true
                  fp.checked = false
                }
              })
              filters[funcPurposeFilterIndex].value = filters[funcPurposeFilterIndex].choices
                .map((item) => {
                  if (item.checked) {
                    return item.display_name
                  }
                })
                .join(',')
            } else {
              filters[funcPurposeFilterIndex].choices.map((fp) => {
                fp.disabled = false
                // fp.checked = false
              })
              filters[funcPurposeFilterIndex].value = filters[funcPurposeFilterIndex].choices
                .map((item) => {
                  if (item.checked) {
                    return item.display_name
                  }
                })
                .join(',')
            }
          }

          if (isAllFilters) {
            this.allFilters = cloneDeep(filters)
          } else {
            this.additionalFilters = cloneDeep(filters)
          }

          this.applyFilters()
          return
        }
      }
    },

    cleanObjectForFilterInitialization() {
      this.objectForFilterInitialization = {
        label: '',
        field: '',
        type: '',
        choices: [],
        input: {},
        intervalValues: {},
        value: '',
        isOpen: false,
      }
    },

    setObjectForFilterInitializationForCheckbox(
      filterName: string,
      filterObject: any,
      index: number,
      initValue: string,
    ) {
      this.objectForFilterInitialization.field = filterName
      this.objectForFilterInitialization.label = filterObject.label
      this.objectForFilterInitialization.type = filterObject.type
      this.objectForFilterInitialization.isOpen = !!initValue

      if (this.objectForFilterInitialization.type === 'choice') {
        if (['added_by', 'modified_by'].includes(this.objectForFilterInitialization.field)) {
          const { $auth } = useNuxtApp()
          const userPermissions: string[] = useUserPermissions($auth.user?.permissions)
          if (this.userId !== 1 && !userPermissions.includes('OOAO')) {
            this.objectForFilterInitialization.choices = this.usersArr.filter((item: any) =>
              [1, this.userId].includes(+item.value),
            )
          } else {
            this.objectForFilterInitialization.choices = this.usersArr
          }
          this.objectForFilterInitialization.value = initValue || ''
        } else {
          this.objectForFilterInitialization.choices = filterObject.choices?.map((choice: choiceType) => {
            choice.checked = false
            return choice
          })
        }

        if (initValue) {
          this.objectForFilterInitialization.choices?.forEach((choice: choiceType) => {
            choice.checked = choice.value === initValue
          })
          this.objectForFilterInitialization.value = initValue
        }
      }

      if (this.objectForFilterInitialization.type === 'boolean') {
        if (filterName === 'is_checked') {
          this.objectForFilterInitialization.choices = cloneDeep(isCheckedChoices)
        } else {
          this.objectForFilterInitialization.choices = cloneDeep(isBooleanChoices)
        }
        if (initValue) {
          this.objectForFilterInitialization.choices?.forEach((choice: choiceType) => {
            choice.checked = choice.value === initValue
          })
          this.objectForFilterInitialization.value = initValue
        }
      }

      if (this.objectForFilterInitialization.type === 'decimal') {
        this.objectForFilterInitialization.intervalValues = {
          first: {
            placeholder: 'от',
            value: '',
          },
          second: {
            placeholder: 'до',
            value: '',
          },
        }
      }

      if (['datetime', 'date'].includes(this.objectForFilterInitialization.type)) {
        this.objectForFilterInitialization.intervalValues = {
          first: {
            placeholder: 'с дд.мм.гггг',
            value: '',
          },
          second: {
            placeholder: 'по дд.мм.гггг',
            value: '',
          },
        }
      }

      if (this.objectForFilterInitialization.type === 'string' || this.objectForFilterInitialization.type === 'field') {
        this.objectForFilterInitialization.input = {
          placeholder: filterObject.label,
          value: '',
        }
      }
    },

    async initFilters(objectTypeCalcValue: string, isCheckedValue: string = 'all', modifiedByValue: string = 'all') {
      const filters: allFiltersType = []
      Object.keys(this.allOptions).forEach((key, i) => {
        const newFilterName = key
        const newFilterObject = cloneDeep(this.allOptions[newFilterName])

        let initValue = ''
        if (newFilterName === 'object_type_calc') {
          initValue = objectTypeCalcValue
        }
        if (newFilterName === 'is_checked' && isCheckedValue !== 'all') {
          initValue = isCheckedValue
        }
        if (['added_by', 'modified_by'].includes(newFilterName) && modifiedByValue !== 'all') {
          initValue = modifiedByValue
        }
        if (['added_by', 'modified_by'].includes(newFilterName)) {
          newFilterObject.type = 'choice'
        }
        if (newFilterName === 'object_type' && useGeoObject().linkExistingCardTable) {
          initValue = useGeoObject().objectData.object_type
        }
        if (newFilterName === 'cards_link' && useGeoObject().linkExistingCardTable) {
          initValue = 'Нет'
        }
        this.setObjectForFilterInitializationForCheckbox(newFilterName, newFilterObject, i, initValue)
        filters.push(this.objectForFilterInitialization)
        this.cleanObjectForFilterInitialization()
      })

      this.allFilters = cloneDeep(filters)
      this.additionalFilters = cloneDeep(filters)
      this.emptyFilters = cloneDeep(filters)

      this.collectFuncPurposes().then(() => {
        this.applyFilters()
      })
      console.log(this.searchParams, this.allFilters)
    },

    async collectFuncPurposes() {
      const funcPurposeFilterIndex = this.allFilters.findIndex((filter) => filter.field === 'func_purpose')
      let functionalPurposes: any[] = []
      Object.keys(this.functionalPurposeObject).forEach((objectType) => {
        Object.keys(this.functionalPurposeObject[objectType]).forEach((adsType) => {
          this.functionalPurposeObject[objectType][adsType].labels.forEach((label) => {
            const data: any = {
              display_name: label.replace(',', ';'),
              value: label.replace(',', ';'),
              checked: false,
              disabled: false,
            }
            if (!functionalPurposes?.map((fp) => fp.value).includes(data.value)) {
              functionalPurposes.push(data)
            }
          })
        })
      })
      if (this.allFilters.length) {
        this.allFilters[funcPurposeFilterIndex].choices = cloneDeep(
          functionalPurposes.sort((a, b) => a.value.localeCompare(b.value, 'ru')),
        )
        this.additionalFilters[funcPurposeFilterIndex].choices = cloneDeep(
          functionalPurposes.sort((a, b) => a.value.localeCompare(b.value, 'ru')),
        )
      }
      return true
    },

    cleanFilter() {
      this.allFilters = [...this.emptyFilters]
      this.collectFuncPurposes().then(() => {
        this.applyFilters()
      })
    },

    applyFilters() {
      this.allFilters.forEach((filter) => {
        this.updateTableHeaderFilters(filter)
        this.collectSearchParams(filter)
      })
    },

    // Выполняет сброс фильтра. Метод для кнопки "Сбросить фильтр"
    cleanFilterFn() {
      this.cleanFilter()
      this.applyFilterFn()
    },

    // Применяет установленный фильтр. Метод для кнопки "Применить фильтр"
    async applyFilterFn() {
      const { $calculations }: any = useNuxtApp()

      if ($calculations.isAnalogsTable && !$calculations.isAllAnalogsInSelection) {
        $calculations.setIsAnalogsTableDataLoading(true)
        try {
          const deletedAnalogs = $calculations.allDeletedAnalogs
            ? $calculations.allDeletedAnalogs.map((item: aimType) => item.id)
            : []
          const data = await $calculations.getAnalogs()
          $calculations.setAnalogsCount(data.rows_filtered)
          const filtredAnalogs = data.results.filter((item: aimType) => !deletedAnalogs.includes(item.id))
          $calculations.setAllAnalogs(filtredAnalogs)
        } catch (err) {
          console.log(err)
        }
        $calculations.setIsAnalogsTableDataLoading(false)
        $calculations.offIsShowStub()
      } else {
        this.getObjects()
      }
    },

    updateTableHeaderFilters(filter: filterType) {
      const { $userStore }: any = useNuxtApp()
      if (filter.value) {
        if (filter.type !== 'choice' && filter.type !== 'nested object' && filter.type !== 'boolean') {
          this.tableHeaderFilters[filter.label] = filter.value
          if (filter.label === 'Обновил (ФИО)') {
            const names: string[] = []
            $userStore.getAllUsers().forEach((itemUser: any) => {
              filter.value.split(',').forEach((item: any) => {
                if (itemUser.id.toString() === item) {
                  names.push(
                    `${itemUser.first_name} ${itemUser.last_name}${itemUser.org_short_name ? ` (${itemUser.org_short_name})` : ''}`,
                  )
                }
              })
            })
            this.tableHeaderFilters[filter.label] = names.join(', ')
          }
        } else {
          const valueArr = filter.choices
            .filter((choice: choiceType) => choice.checked)
            .map((choice: choiceType) => choice.display_name)

          this.tableHeaderFilters[filter.label] = valueArr.join(', ')
        }
      } else if (filter.intervalValues?.first?.value || filter.intervalValues?.second?.value) {
        if (filter.intervalValues?.first?.value && filter.intervalValues?.second?.value) {
          this.tableHeaderFilters[filter.label] =
            `${filter.intervalValues.first.value}-${filter.intervalValues.second.value}`
        } else if (filter.intervalValues?.first?.value) {
          this.tableHeaderFilters[filter.label] = `${filter.intervalValues.first.value}-...`
        } else {
          this.tableHeaderFilters[filter.label] = `...-${filter.intervalValues.second.value}`
        }
      } else {
        this.tableHeaderFilters[filter.label] = ''
      }
    },

    updateSearchParams(valueListLength: number, field: string, value: any, _in: string, _out: string) {
      const { updateSearchParams } = useSearchParams()
      updateSearchParams(this.searchParams, valueListLength, field, value, _in, _out)
    },

    collectSearchParams(filter: filterType) {
      if (Object.keys(filter.intervalValues).length) {
        if (filter.intervalValues.first.value) {
          if (['datetime', 'date'].includes(filter.type)) {
            const [day, month, year] = filter.intervalValues.first.value.split('.')
            this.searchParams[`${filter.field}__gte`] = `${year}-${month}-${day}`
          } else this.searchParams[`${filter.field}__gte`] = filter.intervalValues.first.value
        } else {
          delete this.searchParams[`${filter.field}__gte`]
        }
        if (filter.intervalValues.second.value) {
          if (['datetime', 'date'].includes(filter.type)) {
            const [day, month, year] = filter.intervalValues.second.value.split('.')
            this.searchParams[`${filter.field}__lte`] = `${year}-${month}-${day}`
          } else this.searchParams[`${filter.field}__lte`] = filter.intervalValues.second.value
        } else {
          delete this.searchParams[`${filter.field}__lte`]
        }
      } else if (filter.value) {
        let valueList = filter.value.split(',')
        let value: string = ''
        if (filter.choices.length) {
          valueList = valueList.filter((el) => el !== '')
          valueList = valueList.map((item) => {
            if (filter.type === 'boolean') {
              if (item.includes('Не ') || item.includes('Требует проверки') || item.includes('Нет')) {
                return 'false'
              } else {
                return 'true'
              }
            } else {
              return item
            }
          })
          value = valueList.join(',')
        } else {
          value = filter.value
        }
        if (filter.field === 'floor_number') {
          const floorNumbersMatching: Record<string, string> = { '-1': 'U', '0': 'G', '1': 'O', '2': 'T' }
          let valueStringForMatching: string
          if (Number(value) > 2) {
            valueStringForMatching = 'TR' + String(Number(value) - 2)
          } else {
            valueStringForMatching = floorNumbersMatching[value]
          }
          this.searchParams[`${filter.field}`] = valueStringForMatching
        } else if (['string', 'url'].includes(filter.type)) {
          const isDigitsOnly = /^\d+$/.test(value)
          this.searchParams[isDigitsOnly ? `${filter.field}` : `${filter.field}__icontains`] = value
        } else if (filter.type === 'field' && !['added_by', 'modified_by'].includes(filter.field)) {
        } else if (filter.field === 'func_purpose') {
          this.updateSearchParams(valueList.length, filter.field, value, '__name__in', '__name')
        } else if (['added_by', 'modified_by'].includes(filter.field)) {
          this.updateSearchParams(valueList.length, filter.field, value, '_id__in', '_id')
        } else {
          this.updateSearchParams(valueList.length, filter.field, value, '__in', '')
        }
      } else {
        delete this.searchParams[filter.field]
        delete this.searchParams[`${filter.field}_id`]
        delete this.searchParams[`${filter.field}__gte`]
        delete this.searchParams[`${filter.field}__lte`]
        delete this.searchParams[`${filter.field}__in`]
        delete this.searchParams[`${filter.field}__name`]
        delete this.searchParams[`${filter.field}__name__in`]
        delete this.searchParams[`${filter.field}__icontains`]
        delete this.searchParams[`${filter.field}__first_name__icontains`]
        delete this.searchParams[`${filter.field}__last_name__icontains`]
      }
    },

    deleteFilter(key: string) {
      this.tableHeaderFilters[key] = ''

      const deletedFilterIndex = this.allFilters.findIndex((filter) => filter.label === key)
      if (
        this.allFilters[deletedFilterIndex].type !== 'choice' &&
        this.allFilters[deletedFilterIndex].type !== 'nested object' &&
        this.allFilters[deletedFilterIndex].type !== 'boolean'
      ) {
        if (
          this.allFilters[deletedFilterIndex].type === 'decimal' ||
          this.allFilters[deletedFilterIndex].type === 'datetime' ||
          this.allFilters[deletedFilterIndex].type === 'date'
        ) {
          this.allFilters[deletedFilterIndex].intervalValues.first.value = ''
          this.allFilters[deletedFilterIndex].intervalValues.second.value = ''
        }
        this.allFilters[deletedFilterIndex].value = ''
        this.allFilters[deletedFilterIndex].isOpen = false
      } else {
        this.allFilters[deletedFilterIndex].choices.forEach((choice) => {
          choice.checked = false
        })
        this.allFilters[deletedFilterIndex].value = ''

        if (
          this.allFilters[deletedFilterIndex].field === 'object_type' ||
          this.allFilters[deletedFilterIndex].field === 'ads_type'
        ) {
          const funcPurposeFilterIndex = this.allFilters.findIndex((filter) => filter.field === 'func_purpose')
          this.allFilters[funcPurposeFilterIndex].choices = []
          this.allFilters[funcPurposeFilterIndex].value = ''

          const realtyClassFilterIndex = this.allFilters.findIndex((filter) => filter.field === 'realty_class')
          this.allFilters[realtyClassFilterIndex].choices = []
          this.allFilters[realtyClassFilterIndex].value = ''

          this.tableHeaderFilters[this.allFilters[funcPurposeFilterIndex].label] = ''
          this.tableHeaderFilters[this.allFilters[realtyClassFilterIndex].label] = ''
        }

        if (this.allFilters[deletedFilterIndex].field === 'func_purpose') {
          const realtyClassFilterIndex = this.allFilters.findIndex((filter) => filter.field === 'realty_class')
          this.allFilters[realtyClassFilterIndex].choices = []
          this.allFilters[realtyClassFilterIndex].value = ''

          this.tableHeaderFilters[this.allFilters[realtyClassFilterIndex].label] = ''
        }
      }

      const filter = this.allFilters.find((item: filterType) => item.label === key)
      if (filter) {
        this.collectSearchParams(filter)
      }
    },

    updateAllFiltersOptions(value: string) {
      this.allFiltersOptions.forEach((filter) => {
        filter.checked = filter.value === value
      })
    },

    saveFilters() {
      this.applyFilters()
    },

    restoreFilters() {
      this.applyFilters()
    },

    async getObjects(page?: Number) {
      if (!page) {
        useGeoObject().linkExistingCardIds = []
      }

      try {
        this.setObjectsRespLoading(true)
        this.searchParams.page = page ? page.toString() : this.page.toString()

        this.searchParams['sort_data'] = ''
        if (this.sortedField && this.sortDirection == 'desc') {
          this.searchParams['sort_data'] = '-' + this.sortedField
        } else if (this.sortedField && this.sortDirection == 'asc') {
          this.searchParams['sort_data'] = this.sortedField
        }

        const paramsData = toRaw(this.searchParams)

        if (useGeoObject().linkExistingCardTable) {
          paramsData.realty_object_id = useGeoObject().objectData.id
        }

        const { _data } = await $http.get(api_unversal_realty, {
          params: paramsData,
        })
        this.objectsRespData = _data
        this.setObjectsRespLoading(false)
        return true
      } catch (e) {
        console.log(e)
        this.setObjectsRespLoading(false)
        return false
      }
    },

    // Возвращает статус сортировки колонки по её названию
    getColumnSorted(field: string): boolean {
      return this.sortedField === field
    },

    // Возвращает направление сортировки колонки по её названию.
    // Если сортировка отключена, то всегда возвращает 'none'
    getColumnSortDirection(field: string): sortDirectionType {
      return this.getColumnSorted(field) ? this.sortDirection : 'none'
    },

    updateSearchObjectTypeCalc(objectTypeCalc: string) {
      this.searchParams.object_type_calc = objectTypeCalc
    },

    updateSearchObjectLimit(limit: number) {
      this.searchParams.limit = limit.toString()
    },

    setNavigateString(str: string) {
      this.navigateString = str
    },

    async appStartingFilterFunctions() {
      const { $userStore, $constData }: any = useNuxtApp()
      const funcPurposes = await $constData.getFuncPurposes()
      const allFilteredFields = await $constData.getSearchFields()
      const optionsResponse = await $constData.getFieldsOptions()
      const users = await $userStore.getAllUsers()
      this.usersArr = users.map((item: any) => {
        return {
          value: item.id.toString(),
          display_name: `${item.first_name} ${item.last_name}${item.org_short_name ? ` (${item.org_short_name})` : ''}`,
        }
      })

      this.initFunctionalPurposeObject(funcPurposes)
      this.initAllFilteredFields(allFilteredFields)
      this.setOptions(optionsResponse)
      this.initAllFilters()
      this.isFiltersInitialized = true
    },

    async exportAnalogs(ids: string, resource: 'xlsx' | 'docx') {
      let api = ''
      let respType = ''
      let docName = ''
      if (resource === 'xlsx') {
        api = api_export_general_analogs_excel
        respType = 'application/xlsx'
        docName = `Аналоги.xlsx`
      } else {
        api = api_export_general_analogs_excel
        respType = 'application/xlsx'
        docName = `Аналоги.docx`
      }
      try {
        const response = await $http.get(api, {
          params: { ids_list: ids },
          responseType: 'blob',
        })
        const resType = response.headers.get('content-type')
        const blob = new Blob([response._data], { type: resType ? resType : respType })

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', docName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        useUserStore().setErrorModal(true)
        console.error(error)
      }
    },

    updateTableParamsData(object: tableParamsDataType) {
      this.tableParamsData = cloneDeep(object)
    },
  },
})
