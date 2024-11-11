import { defineStore } from 'pinia'
import { cloneDeep } from 'lodash'
import { useFilterAndSortData } from '~/composables/useFilterAndSortData'
import type {
  allFiltersOptionsType,
  choiceType,
  filterType,
  functionalPurposeListType,
  objectsRespDataType,
  searchParamsType,
  sortDirectionType,
  tableColumnsType,
  tableHeaderFiltersType,
} from '~/types/objectsFiltersStoreTypes'
import { useNuxtApp } from 'nuxt/app'

const tableColumns: tableColumnsType = [
  {
    field: 'model_number',
    label: { OA: '#', OO: '#', NE: '#' },
    isSwitchOn: true,
    doNotSwitchOff: true,
    calcType: ['OA', 'OO', 'NE'],
    columnIndex: true,
  },
  {
    field: 'type',
    label: { OA: 'Тип', OO: 'Тип', NE: 'Тип' },
    isSwitchOn: true,
    isTableMenuShown: false,
    calcType: ['OA', 'OO', 'NE', 'CAT'],
  },
  {
    field: 'name',
    label: { OA: 'Название', OO: 'Название', NE: 'Название' },
    isSwitchOn: true,
    isTableMenuShown: false,
    calcType: ['OA', 'OO', 'NE'],
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
  // {
  //   field: 'ads_type',
  //   label: { OA: 'Тип объявления', OO: 'Тип объявления', NE: 'Тип торгов' },
  //   isSwitchOn: true,
  //   isTableMenuShown: false,
  //   calcType: ['OA', 'OO', 'NE'],
  // },
  {
    field: 'func_purpose',
    label: { OA: 'Функциональное назначение', OO: 'Функциональное назначение', NE: 'Функциональное назначение' },
    isSwitchOn: true,
    isTableMenuShown: false,
    calcType: ['OA', 'OO', 'NE'],
  },
  {
    field: 'modified_date',
    label: { OA: 'Изменён', OO: 'Изменён', NE: 'Изменён' },
    isSwitchOn: true,
    isTableMenuShown: false,
    calcType: ['OA', 'OO', 'NE'],
  },
]

const eventNameIconMap: any = {
  Каталог: 'fi_folder',
  Помещение: 'ksi_premise',
  Здание: 'ksi_building',
  'Земельный участок': 'fi_landplot',
  Предложение: 'ksi_analogs',
  Оценка: 'ksi_scale-left',
  Исследование: 'fi_sign_post',
  'Всё остальное': 'ksi_analogs',
}
const allOptions = {
  address_raw: { label: 'Адрес', type: 'string' },
  title: { label: 'Название', type: 'string' },
  object_type: {
    label: 'Тип объекта',
    type: 'choice',
    choices: [
      { value: 'Q', display_name: 'Помещение' },
      { value: 'B', display_name: 'Здание' },
      { value: 'L', display_name: 'Земельный участок' },
    ],
  },
  func_purpose: {
    label: 'Функциональное назначение',
    type: 'choice',
    choices: [
      { value: 'office', display_name: 'Офисное' },
      { value: 'trade', display_name: 'Торговое' },
      { value: 'production_storage', display_name: 'Производственно-складское' },
      { value: 'psn', display_name: 'ПСН' },
    ],
  },
  ads_type: {
    label: 'Тип объявления',
    type: 'choice',
    choices: [
      { value: 'R', display_name: 'Аренда' },
      { value: 'S', display_name: 'Продажа' },
    ],
  },
  modified_date: {
    label: 'Изменён',
    type: 'datetime',
  },
}

const calcTypeToPath: Record<string, string> = {
  OO: 'Оценка',
  OA: 'Предложение',
  NE: 'Исследование',
}

function processFolder(folder: any, options: any) {
  return {
    ...folder,
    type: 'Каталог',
    name: folder.name || `Каталог ${folder.id}`,
    children: [
      ...folder.children.map((child: any) => processFolder(child, options)),
      ...folder.realty_objects.map((obj: any) => ({
        ...obj,
        parent_id: folder.id,
        type:
          options.object_type.choices.find((item: any) => item.value === obj.object_type)?.display_name ||
          'Неизвестный тип',
      })),
      ...folder.realty_cards.map((card: any) => ({
        ...card,
        parent_id: folder.id,
        type: calcTypeToPath[card.func_purpose.object_type],
        name: `Карточка ${card.id}`,
      })),
    ],
  }
}

export default defineStore('catalogs-table', {
  state: () => ({
    ...useFilterAndSortData(),
    folders: <any[]>[],
    foldersLoading: false,
    tableHeaderFilters: <tableHeaderFiltersType>{},
    searchParams: <searchParamsType>{ limit: '15', object_type_calc: 'OO' },
    tableColumns: <tableColumnsType>tableColumns,
    allOptions: allOptions,
    objectForFilterInitialization: <filterType>{
      label: '',
      field: '',
      type: '',
      choices: [],
      input: {},
      intervalValues: {},
      value: '',
      isOpen: false,
    },
    functionalPurposeList: <functionalPurposeListType>[],
    allFiltersOptions: <allFiltersOptionsType>[],
    usersArr: <Array<choiceType>>[],
    isShowSubmenu1: false,
    isShowSubmenu2: false,
    objectsRespData: <objectsRespDataType>{},
    objectsRespLoading: false,
    navigateString: '',
    isFiltersInitialized: false,
    userId: 0,
    tableData: <any[]>[],
    activeFolder: <any>{},
    activeObject: <any>{},
    prevHash: '',
    previousRoute: '',
  }),

  getters: {
    getColumnValue: (state) => (analogValue: string | number | any, field: string) => {
      if (!analogValue) return ''

      //@ts-ignore
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
        return analogValue ? analogValue.name : null
      }

      if (field === 'object_type' || field === 'ads_type') {
        const objectTypeValue = filterOption.choices.filter((item: any) => item.value === analogValue)[0]
        return objectTypeValue ? objectTypeValue.display_name : null
      }

      return analogValue
    },
  },

  actions: {
    resetState() {
      this.$reset()
    },
    async bindObject(object_ids: any, type: string = 'object') {
      const query = {
        target_id: this.activeFolder.id,
        ...(type === 'object' ? { add_realty_objs: object_ids } : { add_cards: object_ids }),
      }

      try {
        const response = await $http.post(`/api/v1/catalog/catalogs/set_rels/`, { body: query })

        if (response.status === 200) {
          this.updateActiveFolder(this.activeFolder.id)
          this.processFolder()
        } else {
          console.error('Ошибка при добавлении каталога:', response.statusText)
        }
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error)
      }

      await this.updateFolder(this.activeFolder.id)
      this.updateActiveFolder(this.activeFolder.id)
      this.processFolder()
    },

    async addCatalog(data: any) {
      const query = {
        name: data.name,
        description: data.description,
        parent_id: this.activeFolder.id,
        added_by: useAuth().user!.id,
      }
      const response = await $http.post(`/api/v1/catalog/catalogs/`, { body: query })
      if (this.activeFolder.id) {
        await this.updateFolder(this.activeFolder.id)
      } else {
        await this.getFolders()
      }
      this.setActiveFolder(response._data, 2)
    },

    setActiveFolder(folder: any, type: any = 1) {
      const router = useRouter()
      if (Object.keys(folder).length === 0) {
        router.push(`/catalog`)
        this.activeFolder = folder
        this.processFolder()
        this.sortTableData()
        return
      }
      if (!folder.children && type === 1) {
        const parent = this.findFolder(this.folders, folder.parent_id)
        this.setActiveFolder(parent)
        this.activeObject = folder
        return
      }
      const pathString = this.getPathFolder(folder).replace(/ > /g, '>')
      router.push(`/catalog#${pathString}`)
      this.activeFolder = folder
      this.processFolder()
      this.sortTableData()
    },

    findFolder(folders: any, folderId: any) {
      for (const folder of folders) {
        if (folder.id === folderId) {
          return folder
        }
        if (folder.children && folder.children.length > 0) {
          const result: any = this.findFolder(folder.children, folderId)
          if (result) {
            return result
          }
        }
      }
      return null
    },

    updateActiveFolder(folderId: any) {
      this.activeFolder = this.findFolder(this.folders, folderId)
    },

    async deleteFolder(folder: any) {
      if (folder.children) {
        await $http.delete(`/api/v1/catalog/catalogs/${folder.id}/`)
      } else if (folder.realty_cards) {
        const query = {
          target_id: this.activeFolder.id,
          del_realty_objs: [folder.id],
        }
        await $http.post(`/api/v1/catalog/catalogs/set_rels/`, { body: query })
      } else {
        const query = {
          target_id: this.activeFolder.id,
          del_cards: [folder.id],
        }
        await $http.post(`/api/v1/catalog/catalogs/set_rels/`, { body: query })
      }

      await this.getFolders()
      this.updateActiveFolder(this.activeFolder.id)
      this.processFolder()
    },

    addDataIconFolders() {
      const addTypeIcon = (folder: any) => {
        folder.typeIcon = eventNameIconMap[folder.type] || eventNameIconMap['Всё остальное']
      }

      function recurse(folders: any) {
        folders.forEach((folder: any) => {
          if (folder.children) {
            addTypeIcon(folder)
            recurse(folder.children)
          } else {
            addTypeIcon(folder)
          }
        })
      }

      recurse(this.folders)
    },

    processFolder() {
      if (Object.keys(this.activeFolder).length === 0) {
        this.tableData = []
        this.sortTableData()
        this.getObjects()
        return
      }
      if (!this.activeFolder.children) {
        return
      }

      this.tableData = this.activeFolder.children
      this.activeFolder.title = this.activeFolder.name

      this.tableData.forEach((child: any) => {
        if (child.children) {
          child.title = child.name
        }
      })

      this.sortTableData()

      this.getObjects()
    },

    sortTableData() {
      this.tableData.sort((a: any, b: any) => {
        if (a.children && a.children.length > 0 && (!b.children || b.children.length === 0)) {
          return -1
        } else if ((!a.children || a.children.length === 0) && b.children && b.children.length > 0) {
          return 1
        } else {
          return 0
        }
      })
    },

    getPathFolder(targetFolder: any) {
      function findPath(folders: any, targetFolder: any, path = []) {
        for (const folder of folders) {
          const currentPath: any = [...path, folder.name]
          if (folder.id === targetFolder.id) {
            return currentPath
          }
          if (folder.children && folder.children.length > 0) {
            const result: any = findPath(folder.children, targetFolder, currentPath)
            if (result) {
              return result
            }
          }
        }
        return null
      }

      const pathArray = findPath(this.folders, targetFolder)
      return pathArray ? pathArray.join(' > ') : ''
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
      localStorage.setItem('tableStructureCatalogs', JSON.stringify(this.tableColumns))
    },

    onTableColumns(fields: string[], allFields: string[]) {
      allFields.forEach((field: string) => {
        const index = this.tableColumns.findIndex((column) => column.field === field)
        console.log('onTableColumns-fields', fields)
        console.log('onTableColumns-allFields', allFields)
        console.log('onTableColumns-tableColumns', this.tableColumns)
        if (index !== -1) {
          this.tableColumns[index].isSwitchOn = fields.includes(field)
        }
      })
      localStorage.setItem('tableStructureCatalogs', JSON.stringify(this.tableColumns))
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

    setSortDirection(curDirection: sortDirectionType, field: string) {
      this.sortDirection = this.nextDirection[curDirection]
      this.sortedField = field
    },

    async getObjects(page?: Number) {
      try {
        this.setObjectsRespLoading(true)
        this.searchParams.page = page ? page.toString() : '1'

        let filteredData = cloneDeep(this.tableData)
        console.log('searchParams:', this.searchParams)

        // Сортировка
        if (this.sortedField) {
          filteredData.sort((a: any, b: any) => {
            const field = this.sortedField as keyof any
            if (this.sortDirection === 'asc') {
              return a[field] > b[field] ? 1 : -1
            } else if (this.sortDirection === 'desc') {
              return a[field] < b[field] ? 1 : -1
            } else {
              return 0
            }
          })
        }

        // Пагинация
        const limit = parseInt(this.searchParams.limit)
        const pageNumber = parseInt(this.searchParams.page)
        const start = (pageNumber - 1) * limit
        const end = start + limit
        const totalPages = Math.ceil(filteredData.length / limit)
        const paginatedData = filteredData.slice(start, end)

        this.objectsRespData = {
          results: paginatedData,
          page: pageNumber,
          rows: limit,
          total_pages: totalPages,
          rows_filtered: filteredData.length,
        }
        this.setObjectsRespLoading(false)
      } catch (e) {
        console.log(e)
        this.setObjectsRespLoading(false)
      }
    },

    async getFolders() {
      this.foldersLoading = true
      try {
        const response = await $http.get('/api/v1/catalog/catalogs/')
        const data = response._data
        this.folders = data.map((parent: any) => processFolder(parent, this.allOptions))
        this.addDataIconFolders()
      } catch (error) {
        console.error('Ошибка при загрузке папок:', error)
      } finally {
        this.foldersLoading = false
      }
    },

    removeFolder(folderId: number) {
      function findAndRemove(folders: any[], folderId: number): any[] {
        return folders.filter((folder) => {
          if (folder.id === folderId) {
            return false
          }
          if (folder.children && folder.children.length > 0) {
            folder.children = findAndRemove(folder.children, folderId)
          }
          return true
        })
      }

      this.folders = findAndRemove(this.folders, folderId)
    },

    async updateFolder(folderId: number) {
      this.foldersLoading = true
      function findFolder(folders: any[], folderId: number): any {
        for (const folder of folders) {
          if (folder.id === folderId) {
            return folder
          }
          if (folder.children && folder.children.length > 0) {
            const result = findFolder(folder.children, folderId)
            if (result) {
              return result
            }
          }
        }
        return null
      }

      function replaceFolder(folders: any[], updatedFolder: any): any[] {
        return folders.map((folder) => {
          if (folder.id === updatedFolder.id) {
            return updatedFolder
          }
          if (folder.children && folder.children.length > 0) {
            return { ...folder, children: replaceFolder(folder.children, updatedFolder) }
          }
          return folder
        })
      }

      try {
        const response: any = await $http.get(`/api/v1/catalog/catalogs/${folderId}`)
        let updatedFolder = response._data

        updatedFolder = processFolder(updatedFolder, this.allOptions)

        const existingFolder = findFolder(this.folders, folderId)
        if (existingFolder) {
          this.folders = replaceFolder(this.folders, updatedFolder)
          if (this.activeFolder.id === folderId) {
            this.activeFolder = updatedFolder
          }
        }
      } catch (error) {
        console.error('Ошибка при обновлении папки:', error)
      }
      this.foldersLoading = false
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
      const { $userStore }: any = useNuxtApp()
      const users = await $userStore.getAllUsers()
      this.usersArr = users.map((item: any) => {
        return {
          value: item.id.toString(),
          display_name: `${item.first_name} ${item.last_name}${item.org_short_name ? ` (${item.org_short_name})` : ''}`,
        }
      })

      await this.getFolders()
      this.isFiltersInitialized = true
    },
  },
})
