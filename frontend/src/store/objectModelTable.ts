import { defineStore } from 'pinia'
import { cloneDeep } from 'lodash'
import { useFilterAndSortData } from '~/composables/useFilterAndSortData'
import { useSearchParams } from '~/composables/useSearchParams'
import { openFilter } from '~/composables/Filters/OpenFilter'
import { useFunctionalPurpose } from '~/composables/Filters/useFunctionalPurpose'

import type {
  allFilteredFieldsType,
  allFiltersOptionsType,
  allFiltersType,
  choiceType,
  filterType,
  functionalPurposeListType,
  objectsRespDataType,
  searchParamsType,
  sortDirectionType,
  tableColumnsType,
  tableHeaderFiltersType,
} from '~/types/objectsFiltersStoreTypes'
import { api_realty_objects, api_search_fields } from '~/app_constants/api'
import { useNuxtApp } from 'nuxt/app'
import useGeoObject from '~/store/geoObject'
import { useFilters } from '~/composables/Filters/UpdateFilter'

const tableColumns: tableColumnsType = [
  {
    field: 'model_number',
    label: { OA: '#', OO: '#', NE: '#', REF: '#' },
    isSwitchOn: true,
    doNotSwitchOff: true,
    calcType: ['OA', 'OO', 'NE', 'REF'],
    columnIndex: true,
  },
  {
    field: 'comparison',
    label: {
      OA: '<i class="icon fi_compare"></i>',
      OO: '<i class="icon fi_compare"></i>',
      NE: '<i class="icon fi_compare"></i>',
      REF: '<i class="icon fi_compare"></i>',
    },
    isSwitchOn: true,
    doNotSwitchOff: true,
    calcType: ['OA', 'OO', 'NE', 'REF'],
  },
  {
    field: 'object_type',
    label: { OA: 'Тип объекта', OO: 'Тип объекта', NE: 'Тип объекта', REF: 'Тип объекта' },
    isSwitchOn: true,
    isTableMenuShown: false,
    calcType: ['OA', 'OO', 'NE', 'REF'],
  },
  {
    field: 'address_raw',
    label: { OA: 'Адрес', OO: 'Адрес', NE: 'Адрес', REF: 'Адрес' },
    isSwitchOn: true,
    isTableMenuShown: false,
    calcType: ['OA', 'OO', 'NE', 'REF'],
  },
  {
    field: 'name',
    label: { OA: 'Название', OO: 'Название', NE: 'Название', REF: 'Название' },
    isSwitchOn: true,
    isTableMenuShown: false,
    calcType: ['OA', 'OO', 'NE', 'REF'],
  },
  {
    field: 'object_type_calc',
    label: { OA: 'Статус', OO: 'Статус', NE: 'Статус', REF: 'Статус' },
    isSwitchOn: true,
    isTableMenuShown: false,
    calcType: ['OA', 'OO', 'NE', 'REF'],
  },
  {
    field: 'func_purpose',
    label: {
      OA: 'Функциональное назначение',
      OO: 'Функциональное назначение',
      NE: 'Функциональное назначение',
      REF: 'Функциональное назначение',
    },
    isSwitchOn: true,
    isTableMenuShown: false,
    calcType: ['OA', 'OO', 'NE', 'REF'],
  },
  {
    field: 'modified_date',
    label: { OA: 'Изменён', OO: 'Изменён', NE: 'Изменён', REF: 'Изменён' },
    isSwitchOn: true,
    isTableMenuShown: false,
    calcType: ['OA', 'OO', 'NE', 'REF'],
  },
]

const tableHeaderFilters: tableHeaderFiltersType = {}
const searchParams: searchParamsType = { limit: '15', object_type_calc: '' }
const allOptions: Record<string, any> = {}
const filtersMenu: allFiltersType = []

const objectForFilterInitialization: filterType = {
  label: '',
  field: '',
  type: '',
  choices: [],
  input: {},
  intervalValues: {},
  value: '',
  isOpen: true,
}

const functionalPurposeList: functionalPurposeListType = []
const allFiltersOptions: allFiltersOptionsType = [
  { label: 'Все параметры', checked: true, value: 'all_fields' },
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

const objectsRespData: objectsRespDataType = {}

export default defineStore('object-model-filters', {
  state: () => ({
    ...useFilterAndSortData(),
    tableHeaderFilters: <tableHeaderFiltersType>tableHeaderFilters,
    searchParams: <searchParamsType>searchParams,
    tableColumns: <tableColumnsType>tableColumns,
    allFilters: <allFiltersType>[],
    filtersMenu: <allFiltersType>filtersMenu,
    emptyFilters: <allFiltersType>[],
    objectForFilterInitialization: <filterType>objectForFilterInitialization,
    functionalPurposeList: <functionalPurposeListType>functionalPurposeList,
    allFiltersOptions: <allFiltersOptionsType>allFiltersOptions,
    usersArr: <Array<choiceType>>[],
    isShowSubmenu1: false,
    isShowSubmenu2: false,
    objectsRespData: <objectsRespDataType>objectsRespData,
    objectsRespLoading: false,
    navigateString: <string>'',
    isFiltersInitialized: false,
    userId: 0,
    page: 1,
    lastSelectedObject: null,
  }),

  getters: {
    getColumnValue: (state) => (analogValue: string | number | any, field: string) => {
      if (!analogValue) return ''

      const filterOption = state.allOptions[field]

      if (!filterOption) return String(analogValue)

      const filterType = filterOption.type

      if (filterType !== 'choice' && filterType !== 'nested object') {
        if (filterType === 'datetime') {
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
        return analogValue.name
      }

      if (field === 'object_type' || field === 'estimation_type_bidding' || field === 'status') {
        const objectTypeValue = filterOption.choices.filter((item: any) => item.value === analogValue)[0]
        return objectTypeValue ? objectTypeValue.display_name : null
      }
      if (field === 'object_type_calc') {
        if (typeof analogValue === 'object') {
          const order = ['OA', 'NE', 'OO']
          const icons: any = {
            OA: '<i class="icon ksi_analogs"></i>',
            NE: '<i class="icon fi_sign_post"></i>',
            OO: '<i class="icon ksi_scale-left"></i>',
          }
          const labels: any = {
            OA: 'Предложение',
            NE: 'Исследование',
            OO: 'Оценка',
          }

          const formattedValue = order
            .map((key) => (analogValue[key] ? { icon: icons[key], label: labels[key] } : null))
            .filter(Boolean)

          return formattedValue.length
            ? formattedValue
            : [{ icon: '<i class="icon fi_minus"></i>', label: 'Нет данных' }]
        }
        return String(analogValue)
      }
      if (field === 'comparison') {
        return null
      }

      return analogValue
    },
  },

  actions: {
    resetState() {
      this.$reset()
    },
    allOptions: {},
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
      localStorage.setItem('tableStructureRealEstate', JSON.stringify(this.tableColumns))
    },

    onTableColumns(fields: string[], allFields: string[]) {
      allFields.forEach((field: string) => {
        const index = this.tableColumns.findIndex((column) => column.field === field)
        if (index !== -1) {
          this.tableColumns[index].isSwitchOn = fields.includes(field)
        }
      })
      localStorage.setItem('tableStructureRealEstate', JSON.stringify(this.tableColumns))
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

    setSortDirection(curDirection: sortDirectionType, field: string) {
      this.sortDirection = this.nextDirection[curDirection]
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
      Object.keys(this.allOptions).forEach((key) => {
        if (this.allOptions[key].label === 'Проверено') {
          this.allOptions[key].label = 'Статус'
        }
        if (this.allOptions[key].label === 'ID') {
          this.allOptions[key].label = 'Идентификатор'
        }
        if (this.allOptions[key].label === 'Вид объекта') {
          this.allOptions[key].label = 'Тип объекта'
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
      if (!newValue) return

      const filters = isAllFilters ? this.allFilters : this.additionalFilters
      const filterIndex = filters.findIndex((filter) => filter.field === field)

      if (filterIndex === -1) return

      const filter = filters[filterIndex]

      // Обновление состояния выбора (checked) для соответствующего значения
      filter.choices?.forEach((choice) => {
        if (choice.value === newValue) {
          choice.checked = !choice.checked
        }
      })

      // Обновление значения фильтра
      const filterValueArr = filter.value ? filter.value.split(',') : []
      const valueIndex = filterValueArr.indexOf(newValue)

      if (valueIndex === -1) {
        filterValueArr.push(newValue)
      } else {
        filterValueArr.splice(valueIndex, 1)
      }

      filter.value = filterValueArr.join(',')

      // Обработка специального случая для поля 'is_checked'
      if (filter.field === 'is_checked' && this.userId !== 1) {
        const modifiedByIndex = this.allFilters.findIndex((filter) => filter.field === 'modified_by')

        if (modifiedByIndex !== -1) {
          const modifiedByFilter = this.allFilters[modifiedByIndex]

          if (filter.value.includes('Требует проверки') || !filter.value) {
            modifiedByFilter.choices = modifiedByFilter.choices.filter((user) =>
              [1, this.userId].includes(Number(user.value)),
            )
          } else {
            modifiedByFilter.choices = [...this.usersArr]
          }
        }
      }

      // Обновление массива фильтров
      if (isAllFilters) {
        this.allFilters = [...this.allFilters]
      } else {
        this.additionalFilters = [...this.additionalFilters]
      }

      this.applyFilters()
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
        isOpen: true,
      }
    },

    setObjectForFilterInitializationForCheckbox(
      filterName: string,
      filterObject: any,
      index: number,
      initValue: string,
    ) {
      const filterInit = this.objectForFilterInitialization

      const setChoices = (choices: choiceType[], initValue: string) => {
        return choices.map((choice) => ({
          ...choice,
          checked: choice.value === initValue,
        }))
      }

      filterInit.field = filterName
      filterInit.label = filterObject.label
      filterInit.type = filterObject.type

      switch (filterInit.type) {
        case 'choice':
          if (['added_by', 'modified_by'].includes(filterInit.field)) {
            filterInit.choices =
              this.userId !== 1
                ? this.usersArr.filter((item: any) => [1, this.userId].includes(+item.value))
                : this.usersArr
            filterInit.value = initValue || ''
          } else {
            filterInit.choices = setChoices(filterObject.choices || [], '')
            if (initValue) {
              filterInit.choices = setChoices(filterInit.choices, initValue)
              filterInit.value = initValue
            }
          }
          break

        case 'boolean':
          filterInit.choices = cloneDeep(filterName === 'is_checked' ? isCheckedChoices : isBooleanChoices)
          if (initValue) {
            filterInit.choices = setChoices(filterInit.choices, initValue)
            filterInit.value = initValue
          }
          break

        case 'decimal':
          filterInit.intervalValues = {
            first: { placeholder: 'от', value: '' },
            second: { placeholder: 'до', value: '' },
          }
          break

        case 'datetime':
          filterInit.intervalValues = {
            first: { placeholder: 'с дд.мм.гггг', value: '' },
            second: { placeholder: 'по дд.мм.гггг', value: '' },
          }
          break

        case 'string':
        case 'field':
          filterInit.input = { placeholder: filterObject.label, value: '' }
          break

        default:
          break
      }
    },

    initFilters(objectTypeCalcValue: string, isCheckedValue: string = 'all', modifiedByValue: string = 'all') {
      const filters: allFiltersType = []
      Object.keys(this.allOptions).forEach((key, i) => {
        const newFilterName = key
        const newFilterObject = cloneDeep(this.allOptions[newFilterName])

        let initValue = ''
        if (newFilterName === 'object_type') {
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
        if (newFilterName === 'object_type' && useGeoObject().linkExistingObjectsTable) {
          initValue = useGeoObject().objectData.object_type === 'L' ? 'B' : 'Q'
        }
        if (newFilterName === 'has_parent' && useGeoObject().linkExistingObjectsTable) {
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
      this.allFilters = cloneDeep(this.emptyFilters)
      // Сброс заголовочных фильтров таблицы
      this.collectFuncPurposes().then(() => {
        this.applyFilters()
      })
      this.searchParams = { limit: '15', object_type_calc: '' }
    },

    applyFilters() {
      this.allFilters.forEach((filter) => {
        this.updateTableHeaderFilters(filter)
        if (filter.type === 'datetime') {
          console.log(filter)
        }

        this.collectSearchParams(filter)
      })
    },

    cleanFilterFn() {
      this.cleanFilter()
      this.applyFilterFn()
    },

    async applyFilterFn() {
      this.getObjects()
    },

    updateTableHeaderFilters(filter: filterType) {
      const { $userStore }: any = useNuxtApp()

      if (filter.value) {
        if (!['choice', 'nested object', 'boolean'].includes(filter.type)) {
          this.tableHeaderFilters[filter.label] =
            filter.label === 'Обновил (ФИО)' ? this.formatUserNames(filter.value, $userStore.allUsers) : filter.value
        } else {
          this.tableHeaderFilters[filter.label] = this.getCheckedChoices(filter.choices)
        }
      } else if (filter.intervalValues?.first?.value || filter.intervalValues?.second?.value) {
        this.tableHeaderFilters[filter.label] = this.formatIntervalValues(filter.intervalValues)
      } else {
        this.tableHeaderFilters[filter.label] = ''
      }
    },

    formatUserNames(value: string, users: any[]) {
      const names = value.split(',').reduce((acc: string[], item: string) => {
        const user = users.find((u) => u.id.toString() === item)
        if (user)
          acc.push(`${user.first_name} ${user.last_name}${user.org_short_name ? ` (${user.org_short_name})` : ''}`)
        return acc
      }, [])
      return names.join(', ')
    },

    getCheckedChoices(choices: choiceType[]) {
      return choices
        .filter((choice) => choice.checked)
        .map((choice) => choice.display_name)
        .join(', ')
    },

    formatIntervalValues(intervalValues: any) {
      const { first, second } = intervalValues
      if (first?.value && second?.value) return `${first.value}-${second.value}`
      if (first?.value) return `${first.value}-...`
      if (second?.value) return `...-${second.value}`
      return ''
    },

    updateSearchParams(valueListLength: number, field: string, value: any, _in: string, _out: string) {
      const { updateSearchParams } = useSearchParams()
      updateSearchParams(this.searchParams, valueListLength, field, value, _in, _out)
    },

    collectSearchParams(filter: filterType) {
      const { field, type, value, intervalValues, choices } = filter

      const setParam = (key: string, val: string) => {
        if (val) {
          this.searchParams[key] = val
        } else {
          delete this.searchParams[key]
        }
      }

      const formatValue = (val: string, type: string) => {
        if (type === 'datetime') {
          const [day, month, year] = val.split('.')
          return `${year}-${month}-${day}`
        }
        return val
      }

      const deleteSearchParamsKeys = (field: string) => {
        const keysToDelete = [
          `${field}`,
          `${field}_id`,
          `${field}__gte`,
          `${field}__lte`,
          `${field}__in`,
          `${field}__name`,
          `${field}__name__in`,
          `${field}__icontains`,
          `${field}__first_name__icontains`,
          `${field}__last_name__icontains`,
        ]
        keysToDelete.forEach((key) => delete this.searchParams[key])
      }

      if (intervalValues && Object.keys(intervalValues).length > 0) {
        const gteValue = intervalValues.first?.value ? formatValue(intervalValues.first.value, type) : ''
        const lteValue = intervalValues.second?.value ? formatValue(intervalValues.second.value, type) : ''

        setParam(`${field}__gte`, gteValue)
        setParam(`${field}__lte`, lteValue)
      } else if (value) {
        // Process value
        let valueList = value.split(',')

        if (choices && choices.length > 0) {
          valueList = valueList.filter(Boolean).map((item) => {
            if (type === 'boolean') {
              return item.includes('Не ') || item.includes('Требует проверки') || item.includes('Нет')
                ? 'false'
                : 'true'
            }
            return item
          })
        }

        const valueString = valueList.join(',')

        if (field === 'name') {
          setParam(`${field}__icontains`, valueString)
        } else if (field === 'floor_number') {
          const floorNumbersMatching: Record<string, string> = { '-1': 'U', '0': 'G', '1': 'O', '2': 'T' }
          let valueStringForMatching: string
          if (Number(valueString) > 2) {
            valueStringForMatching = 'TR' + String(Number(valueString) - 2)
          } else {
            valueStringForMatching = floorNumbersMatching[valueString]
          }
          setParam(`${field}`, valueStringForMatching)
        } else if (['string', 'url'].includes(type)) {
          const isDigitsOnly = /^\d+$/.test(valueString)
          const paramKey = isDigitsOnly ? `${field}` : `${field}__icontains`
          setParam(paramKey, valueString)
        } else if (type === 'field' && field !== 'modified_by') {
          setParam(`${field}_id`, valueString)
        } else if (field === 'func_purpose') {
          this.updateSearchParams(valueList.length, field, valueString, '__name__in', '__name')
        } else if (field === 'modified_by') {
          this.updateSearchParams(valueList.length, field, valueString, '_id__in', '_id')
        } else {
          this.updateSearchParams(valueList.length, field, valueString, '__in', '')
        }
      } else {
        deleteSearchParamsKeys(field)
      }
    },

    deleteFilter(key: string) {
      this.tableHeaderFilters[key] = ''

      const deletedFilterIndex = this.allFilters.findIndex((filter) => filter.label === key)
      if (deletedFilterIndex === -1) return

      const deletedFilter = this.allFilters[deletedFilterIndex]

      if (!['choice', 'nested object'].includes(deletedFilter.type)) {
        this.clearNonChoiceFilter(deletedFilter)
      } else {
        this.clearChoiceFilter(deletedFilter)

        if (['object_type', 'ads_type'].includes(deletedFilter.field)) {
          this.clearFilters(['func_purpose', 'realty_class'])
        }

        if (deletedFilter.field === 'func_purpose') {
          this.clearFilters(['realty_class'])
        }
      }

      const filter = this.allFilters.find((item: filterType) => item.label === key)
      this.getObjects()
      if (filter) {
        this.collectSearchParams(filter)
      }
    },

    clearNonChoiceFilter(filter: filterType) {
      if (['decimal', 'datetime'].includes(filter.type)) {
        filter.intervalValues.first.value = ''
        filter.intervalValues.second.value = ''
      }
      filter.value = ''
      filter.isOpen = false
    },

    clearChoiceFilter(filter: filterType) {
      filter.choices.forEach((choice) => {
        choice.checked = false
      })
      filter.value = ''
    },

    clearFilters(fields: string[]) {
      fields.forEach((field) => {
        const filterIndex = this.allFilters.findIndex((filter) => filter.field === field)
        if (filterIndex !== -1) {
          this.allFilters[filterIndex].choices = []
          this.allFilters[filterIndex].value = ''
          this.tableHeaderFilters[this.allFilters[filterIndex].label] = ''
        }
      })
    },

    updateAllFiltersOptions(value: string) {
      this.allFiltersOptions.forEach((filter) => {
        filter.checked = filter.value === value
      })
    },

    saveFilters() {
      this.applyFilters()
      this.applyFilterFn()
    },

    restoreFilters() {
      this.applyFilters()
    },

    async getObjects(page?: Number) {
      const { $userStore }: any = useNuxtApp()
      if (!page) {
        useGeoObject().linkExistingObjectsIds = []
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

        const { _data } = await $http.get(api_realty_objects, { params: this.searchParams })
        this.objectsRespData = _data

        this.setObjectsRespLoading(false)
      } catch (e) {
        console.log('error', e)
        $userStore.setToast('Произошла ошибка запроса, обратитесь к разработчику!', 'error', 4)
        this.setObjectsRespLoading(false)
      }
    },

    getColumnSorted(field: string): boolean {
      return this.sortedField === field
    },
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
      const { $userStore, $constData, $auth }: any = useNuxtApp()
      const funcPurpose = await $constData.getFuncPurposes()
      const allFilteredFields = await $http.get(api_search_fields).then((res: Record<string, any>) => res._data)
      const optionsResponse = await $constData.getRealtyObjectOptions()
      const filterOptions = await $http
        .get('/api/v1/osm_obj/search_fields/')
        .then((res: Record<string, any>) => res._data)
      const users = await $userStore.getAllUsers()
      this.usersArr = users.map((item: any) => {
        return {
          value: item.id.toString(),
          display_name: `${item.first_name} ${item.last_name}${item.org_short_name ? ` (${item.org_short_name})` : ''}`,
        }
      })
      // Проходим по массиву и заменяем `ads_updated_internal` на `modified_date`
      this.filtersMenu = filterOptions.base_search_fields.map((field: string) =>
        field === 'ads_updated_internal' ? 'modified_date' : field,
      )

      this.initFunctionalPurposeObject(funcPurpose)
      this.initAllFilteredFields(allFilteredFields)
      this.setOptions(optionsResponse)
      this.initAllFilters()
      this.isFiltersInitialized = true
      if ($userStore.modeOfPage === 'self') {
        const userId = $auth.user ? $auth.user.id : ''
        this.initFilters('', 'Требует проверки', userId.toString())
      } else {
        this.initFilters('')
      }
    },
  },
})
