import {defineStore} from 'pinia'
import {cloneDeep, isEmpty} from 'lodash'
import type {
  allAdditionalFiltersType,
  allFilteredFieldsType,
  allFiltersOptionsType,
  allFiltersType,
  choiceType,
  filterType,
  initReferenceType,
  nextDirectionType,
  objectsRespDataType,
  searchParamsType,
  sortDirectionType,
  sortedFieldType,
  tableColumnsType,
  tableHeaderFiltersType,
} from '~/types/referencesFiltersStoreTypes'
import {api_reference_book_groups, api_search_fields} from '~/app_constants/api'
import {useNuxtApp} from 'nuxt/app'
import useConstants from '~/store/constants'

export default defineStore('referencesFilters', {
  state: () => ({
    // Фильтры для заголовка таблицы
    tableHeaderFilters: {} as tableHeaderFiltersType,

    // Параметры поиска
    searchParams: { limit: '15', object_type_calc: '' } as searchParamsType,

    // Поле сортировки и направление
    sortedField: '' as sortedFieldType,
    sortDirection: 'none' as sortDirectionType,

    // Колонки таблицы
    tableColumns: [
      {
        field: 'reference_number',
        label: { REF: '#' },
        isSwitchOn: true,
        doNotSwitchOff: true,
        calcType: ['REF'],
        columnIndex: true,
      },
      {
        field: 'name_unique',
        label: { REF: 'Название таблицы' },
        isSwitchOn: true,
        isTableMenuShown: false,
        calcType: ['REF'],
      },
      {
        field: 'type',
        label: { REF: 'Тип недвижимости' },
        isSwitchOn: true,
        isTableMenuShown: false,
        calcType: ['REF'],
      },
      {
        field: 'source',
        label: { REF: 'Источник информации' },
        isSwitchOn: true,
        isTableMenuShown: false,
        calcType: ['REF'],
      },
      {
        field: 'type_calc',
        label: { REF: 'Тип сделки' },
        isSwitchOn: true,
        isTableMenuShown: false,
        calcType: ['REF'],
      },
      {
        field: 'param_name',
        label: { REF: 'Ценообразующий параметр' },
        isSwitchOn: true,
        isTableMenuShown: false,
        calcType: ['REF'],
      },
    ] as tableColumnsType,

    // Следующее направление сортировки
    nextDirection: {
      none: 'asc',
      asc: 'desc',
      desc: 'none',
    } as nextDirectionType,

    // Фильтры
    allFilters: [] as allFiltersType,
    additionalFilters: {
      base_search_fields: [],
      quater: [],
      building: [],
      landplot: [],
    } as allAdditionalFiltersType,

    // Фильтруемые поля
    allFilteredFields: {
      base_search_fields: [],
      search_fields_by_type: {
        quater: [],
        building: [],
        landplot: [],
      },
      ignore_search_fields: [],
    } as allFilteredFieldsType,

    // Опции для всех полей
    allOptions: {} as Record<string, any>,

    // Объект для инициализации фильтра
    objectForFilterInitialization: {
      label: '',
      field: '',
      type: '',
      choices: [],
      input: {},
      intervalValues: {},
      value: [],
      isOpen: false,
    } as filterType,

    // Опции фильтров
    allFiltersOptions: [
      {
        label: 'Все параметры',
        checked: false,
        value: 'all_fields',
      },
      {
        label: 'Основные параметры',
        checked: true,
        value: 'base_search_fields',
      },
      {
        label: 'Параметры помещений',
        checked: false,
        value: 'quater',
      },
      {
        label: 'Параметры зданий',
        checked: false,
        value: 'building',
      },
      {
        label: 'Параметры земельных участков',
        checked: false,
        value: 'landplot',
      },
    ] as allFiltersOptionsType,

    // Пользователи для фильтрации
    usersArr: [] as Array<choiceType>,

    // Состояния отображения меню
    isShowSubmenu1: false,
    isShowSubmenu2: false,

    // Данные объектов
    objectsRespData: {} as objectsRespDataType,
    initData: {} as objectsRespDataType,
    objectsRespLoading: false,

    // Прочие состояния
    navigateString: '',
    isFiltersInitialized: false,
    pageNumber: 1,
    activeItem: null as initReferenceType | null,
    pricingParams: [] as Array<string>,
    lastUpdatedFilter: '',
    loading: false,
  }),

  getters: {
    getColumnValue: (state) => (itemValue: string | number, field: string) => {
      if (!itemValue) return ''

      const fieldOptions = state.allOptions[field]
      if (!fieldOptions) return String(itemValue)

      const filterType = fieldOptions.type

      if (filterType === 'choice' || filterType === 'nested object') {
        const choice = fieldOptions.choices.find((c: any) => c.value === itemValue)
        return choice ? choice.display_name : ''
      }

      if (filterType === 'datetime') {
        return String(itemValue).split('T')[0]
      }

      return String(itemValue)
    },

    getFilteredItems: (state) => () => {
      return state.initData
        .filter((item: any) => {
          const filter = state.allFilters.find((f: filterType) => f.field === 'type')
          return filter?.value.length ? filter.value.includes(item.type) : true
        })
        .filter((item: any) => {
          const filter = state.allFilters.find((f: filterType) => f.field === 'source')
          return filter?.value.length ? filter.value.includes(item.source) : true
        })
        .filter((item: any) => {
          const filter = state.allFilters.find((f: filterType) => f.field === 'type_calc')
          return filter?.value.length ? filter.value.includes(item.type_calc) : true
        })
    },
  },

  actions: {
    resetState() {
      this.$reset()
    },

    setActiveItem(item: initReferenceType | null) {
      this.activeItem = item
    },

    setObjectsRespLoading(isLoading: boolean) {
      this.objectsRespLoading = isLoading
    },

    setTableColumns(columns: tableColumnsType) {
      this.tableColumns = columns
    },

    changeTableStructure(field: string) {
      const column = this.tableColumns.find((col) => col.field === field)
      if (column) {
        column.isSwitchOn = !column.isSwitchOn
        localStorage.setItem('tableStructureReferences', JSON.stringify(this.tableColumns))
      }
    },

    onTableColumns(fields: string[], allFields: string[]) {
      allFields.forEach((field: string) => {
        const column = this.tableColumns.find((col) => col.field === field)
        if (column) {
          column.isSwitchOn = fields.includes(field)
        }
      })
      localStorage.setItem('tableStructureReferences', JSON.stringify(this.tableColumns))
    },
    onShowTableDropdownMenu(field: string) {
      this.tableColumns.forEach((column) => {
        column.isTableMenuShown = column.field === field
      })
    },

    onCloseTableDropdownMenu(field: string) {
      const column = this.tableColumns.find((col) => col.field === field)
      if (column) {
        column.isTableMenuShown = false
      }
    },

    setIsShowSubmenu1(value: boolean) {
      this.isShowSubmenu1 = value
    },

    setIsShowSubmenu2(value: boolean) {
      this.isShowSubmenu2 = value
    },

    initAllFilters() {
      this.allFilters = []
    },

    setSortDirection(curDirection: sortDirectionType, field: string, isModal = false) {
      this.sortDirection = isModal ? curDirection : this.nextDirection[curDirection]
      this.sortedField = field
    },

    openFilter(field: string, isAllFilters: boolean) {
      const filters = isAllFilters ? this.allFilters : this.additionalFilters.base_search_fields
      const filter = filters.find((f) => f.field === field)

      if (filter) {
        if ((filter.type === 'choice' || filter.type === 'nested object') && isEmpty(filter.choices)) {
          return
        }
        filter.isOpen = !filter.isOpen
      } else {
        // Проверяем в дополнительных фильтрах
        const option = Object.keys(this.allFilteredFields.search_fields_by_type).find((key) =>
          this.allFilteredFields.search_fields_by_type[key].includes(field),
        )
        if (option) {
          const filter = this.additionalFilters[option]?.find((f) => f.field === field)
          if (filter) {
            filter.isOpen = !filter.isOpen
          }
        }
      }
    },

    initAllFilteredFields(filteredFields: allFilteredFieldsType) {
      this.allFilteredFields = filteredFields
    },

    setOptions(options: any) {
      this.allOptions = cloneDeep(options)

      const labelReplacements: { [key: string]: string } = {
        Проверено: 'Статус',
        ID: 'Идентификатор',
      }

      Object.keys(this.allOptions).forEach((key) => {
        if (labelReplacements[this.allOptions[key].label]) {
          this.allOptions[key].label = labelReplacements[this.allOptions[key].label]
        }
      })
    },

    updateFilter(field: string, newValue: string | null, isAllFilters: boolean, inputNum?: 'first' | 'second') {
      const filters = isAllFilters ? this.allFilters : this.additionalFilters.base_search_fields
      const filter = filters.find((f) => f.field === field)

      if (filter) {
        if (!inputNum) {
          filter.value = newValue ? [newValue] : []
        } else {
          filter.intervalValues[inputNum].value = newValue || ''
          const firstValue = filter.intervalValues.first.value
          const secondValue = filter.intervalValues.second.value
          filter.value = firstValue && secondValue ? [`${firstValue}-${secondValue}`] : []
        }

        if (isAllFilters) {
          this.applyFilters()
        }
      }
    },

    updateCheckedFilter(field: string, newValue: string, isAllFilters: boolean) {
      this.lastUpdatedFilter = field
      const filters = isAllFilters
        ? this.allFilters
        : [...this.allFilters, ...Object.values(this.additionalFilters).flat()]

      const filter = filters.find((f) => f.field === field)
      if (filter && filter.choices) {
        const choice = filter.choices.find((c) => c.value === newValue)
        if (choice) {
          choice.checked = !choice.checked
        }
        filter.value = filter.choices.filter((c) => c.checked).map((c) => c.value)

        if (isAllFilters) {
          this.applyFilters()
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
        value: [],
        isOpen: false,
      }
    },

    setObjectForFilterInitializationForCheckbox(
      filterName: string,
      filterObject: any,
      index: number,
      initValue: string,
    ) {
      this.objectForFilterInitialization = {
        field: filterName,
        label: filterObject.label,
        type: filterObject.type,
        choices: [],
        input: {},
        intervalValues: {},
        value: [],
        isOpen: !!initValue,
      }

      if (this.objectForFilterInitialization.type === 'choice') {
        this.objectForFilterInitialization.choices = filterObject.choices?.map((choice: choiceType) => ({
          ...choice,
          checked: choice.value === initValue,
        }))
        if (initValue) {
          this.objectForFilterInitialization.value = [initValue]
        }
      }

      if (this.objectForFilterInitialization.type === 'boolean' && filterName === 'is_checked') {
        this.objectForFilterInitialization.choices = [
          {
            display_name: 'Проверено',
            value: 'Проверено',
            checked: initValue === 'Проверено',
            disabled: false,
          },
          {
            display_name: 'Требует проверки',
            value: 'Требует проверки',
            checked: initValue === 'Требует проверки',
            disabled: false,
          },
        ]
        if (initValue) {
          this.objectForFilterInitialization.value = [initValue]
        }
      }

      if (this.objectForFilterInitialization.type === 'string' || this.objectForFilterInitialization.type === 'field') {
        this.objectForFilterInitialization.input = {
          placeholder: filterObject.label,
          value: '',
        }

        if (this.objectForFilterInitialization.field === 'modified_by') {
          this.objectForFilterInitialization.choices = this.usersArr
          this.objectForFilterInitialization.value = initValue ? [initValue] : []
        }
      }
    },

    async initFilters() {
      const filters: allFiltersType = [
        {
          label: 'Тип недвижимости',
          field: 'type',
          type: 'choice',
          choices: [
            { value: 'Q', display_name: 'Помещение', checked: false },
            { value: 'B', display_name: 'Здание', checked: false },
            { value: 'L', display_name: 'Земельный участок', checked: false },
          ],
          input: {},
          intervalValues: {},
          isOpen: true,
          value: [],
        },
        {
          label: 'Источник информации',
          field: 'source',
          type: 'choice',
          choices: [],
          input: {},
          intervalValues: {},
          isOpen: true,
          value: [],
        },
        {
          label: 'Тип сделки',
          field: 'type_calc',
          type: 'choice',
          choices: [
            { value: 'R', display_name: 'Аренда', checked: false },
            { value: 'S', display_name: 'Продажа', checked: false },
          ],
          input: {},
          intervalValues: {},
          isOpen: true,
          value: [],
        },
        {
          label: 'Ценообразующий параметр',
          field: 'param_name',
          type: 'choice',
          choices: [],
          input: {},
          intervalValues: {},
          isOpen: true,
          value: [],
        },
      ]

      const data: initReferenceType[] = cloneDeep(useConstants().referenceBookGroups)

      const sources = Array.from(new Set(data.map((item) => item.source)))
      const pricingParams = Array.from(new Set(data.map((item) => item.param_name)))

      filters.forEach((filter) => {
        if (filter.field === 'source') {
          filter.choices = sources.map((source) => ({
            value: source,
            display_name: source,
            checked: false,
          }))
        }
        if (filter.field === 'param_name') {
          filter.choices = pricingParams.map((param) => ({
            value: param,
            display_name: param,
            checked: false,
          }))
          this.pricingParams = pricingParams
        }
      })

      this.allFilters = cloneDeep(filters)
    },

    cleanFilter() {
      this.initFilters()
      this.tableHeaderFilters = {}
    },

    applyFilters() {
      this.allFilters.forEach((filter) => {
        this.updateTableHeaderFilters(filter)
      })
    },

    updateTableHeaderFilters(filter: filterType) {
      if (filter.value) {
        if (filter.type !== 'choice' && filter.type !== 'nested object' && filter.type !== 'boolean') {
          this.tableHeaderFilters[filter.label] = filter.value.join()
        } else {
          const valueArr = filter.choices
            .filter((choice: choiceType) => choice.checked)
            .map((choice: choiceType) => choice.display_name)
          this.tableHeaderFilters[filter.label] = valueArr.join(', ')
        }
      } else {
        this.tableHeaderFilters[filter.label] = ''
      }
    },

    deleteFilter(key: string) {
      this.tableHeaderFilters[key] = ''
      const filter = this.allFilters.find((f) => f.label === key)
      if (filter) {
        filter.value = []
        filter.isOpen = false
        if (filter.choices) {
          filter.choices.forEach((choice) => (choice.checked = false))
        }
      }
    },

    updateAllFiltersOptions(value: string) {
      this.allFiltersOptions.forEach((filter) => {
        filter.checked = filter.value === value
      })
    },

    saveFilters() {
      const filters = Object.values(this.additionalFilters)
        .flat()
        .filter((filter) => filter.value.length || this.allFilteredFields.base_search_fields.includes(filter.field))
      this.allFilters = cloneDeep(filters)
      this.applyFilters()
    },

    sortObjects() {
      if (this.sortDirection === 'none') {
        this.filterData()
        return
      }

      if (!Array.isArray(this.objectsRespData)) {
        console.error('objectsRespData не является массивом')
        return
      }

      const directionMultiplier = this.sortDirection === 'asc' ? 1 : -1

      this.objectsRespData = [...this.objectsRespData].sort((a, b) => {
        const nameA = a[this.sortedField]?.toUpperCase() || ''
        const nameB = b[this.sortedField]?.toUpperCase() || ''
        return (nameA > nameB ? 1 : nameA < nameB ? -1 : 0) * directionMultiplier
      })
    },


    async getObjects() {
      this.initData = cloneDeep(useConstants().referenceBookGroups)
      this.objectsRespData = cloneDeep(useConstants().referenceBookGroups)
    },

    updateFilterChoicesList(field: string) {
      const uniqueValues = new Set(this.getFilteredItems().map((item: any) => item[field]))

      const existingSelections = this.allFilters.find((f) => f.field === field)?.choices || []

      existingSelections.forEach((choice) => {
        if (choice.checked) uniqueValues.add(choice.value)
      })

      const updatedChoices = Array.from(uniqueValues).map((value) => ({
        checked: existingSelections.some((choice) => choice.value === value && choice.checked),
        display_name: value as string,
        value: value as string,
      }))

      const filter = this.allFilters.find((f) => f.field === field)
      if (filter) {
        filter.choices = updatedChoices
      }
    },

    filterData() {
      this.objectsRespData = this.initData
        .filter((item: any) => {
          const filter = this.allFilters.find((f) => f.field === 'type')
          return filter?.value.length ? filter.value.includes(item.type) : true
        })
        .filter((item: any) => {
          const filter = this.allFilters.find((f) => f.field === 'source')
          return filter?.value.length ? filter.value.includes(item.source) : true
        })
        .filter((item: any) => {
          const filter = this.allFilters.find((f) => f.field === 'type_calc')
          return filter?.value.length ? filter.value.includes(item.type_calc) : true
        })
        .filter((item: any) => {
          const filter = this.allFilters.find((f) => f.field === 'param_name')
          return filter?.value.length ? filter.value.includes(item.param_name) : true
        })
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

    setNavigateString(str: string) {
      this.navigateString = str
    },

    async appStartingFilterFunctions() {
      const { $http } = useNuxtApp()

      const [allFilteredFieldsResponse, optionsResponse] = await Promise.all([
        $http.get(api_search_fields),
        $http.options(api_reference_book_groups),
      ])

      this.initAllFilteredFields(allFilteredFieldsResponse._data)
      this.setOptions(optionsResponse._data.actions.POST)

      await this.initFilters()
      this.isFiltersInitialized = true
    },
  },
})
