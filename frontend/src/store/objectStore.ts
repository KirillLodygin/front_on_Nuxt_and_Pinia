import { defineStore } from 'pinia'
import { filesGroupCard } from '~/app_constants/filesGroup'
import useConstants from '~/store/constants'
import { cloneDeep, isEmpty } from 'lodash'
import {
  type FileType,
  type choiceOption,
  type objectTypeCalcType,
  type objectTypeType,
  type tabsType,
  type FileGroup,
} from '~/types/mapObjectPropertiesTypes'
import {
  api_constant,
  api_layer_id,
  api_unversal_realty,
  api_unversal_realty_check,
  api_unversal_realty_clone,
} from '~/app_constants/api'
import {
  allTypesConstTabs,
  evaluationConstTabs,
  researchConstTabs,
  analogsConstTabs,
  photo,
  childSections,
  deal,
  documents,
} from '~/app_constants/mapObjectConsts'
import constants from '~/store/constants'
import type { funcPurposeObjectType } from '~/types/objectsFiltersStoreTypes'
import { calcTypeToPath } from '~/app_constants/routes'

type State = {
  realtyFields: { [key: string]: any }
  mutableData: { [key: string]: any }
  metaScenario: { [key: string]: any }
  metaFields: object[]
  tabsList: string[]

  evoluationMutableOptions: { [key: string]: any }
  mutableOptions: object
  defaultValues: object
  isChanged: boolean
  preWrittenFields: string[]
  objectType: objectTypeType
  objectTypeCalc: objectTypeCalcType
  exchangeType: string
  adsType: string
  funcPurpose: { [key: string]: any }
  requiredFilters: { [key: string]: any }
  floorProp: { [key: string]: any }
  scenarioByTabs: { [key: string]: any }
  readOnly: boolean
  keysByObj: { [key: string]: number }
  tabsNames: string[]
  id: number | null
  isRequiredFieldsReady: boolean
  is_checked: boolean
  initialRealtyClassForNE: choiceOption[]
  objectDealScenario: any[]
  objectDealFields: string[]
}

export default defineStore('objectStore', {
  state: (): State => ({
    realtyFields: {},
    mutableData: {},
    metaScenario: [],
    metaFields: [],
    tabsList: [],

    evoluationMutableOptions: {},
    mutableOptions: {},
    defaultValues: {
      allFunctionalPurposes: [],
      allRegionsFromAds: [],
      functionalPurpose: {},
      regionFromAds: {},
      objType: 'quaters',
      prevObjectData: null,
    },
    isChanged: true,
    preWrittenFields: [],
    objectTypeCalc: 'OA',
    objectType: 'Q',
    exchangeType: '',
    adsType: '',
    funcPurpose: {},
    requiredFilters: {
      OA: ['object_type', 'ads_type', 'exchange_type'],
      OO: ['object_type', 'ads_type', 'exchange_type'],
      NE: ['object_type', 'ads_type', 'exchange_type'],
    },
    floorProp: {
      label: 'Этаж расположения',
      choices: [
        {
          value: 'U',
          display_name: 'Подвал',
          display_floor: -1,
        },
        {
          value: 'G',
          display_name: 'Цоколь',
          display_floor: 0,
        },
        {
          value: 'O',
          display_name: '1 этаж',
          display_floor: 1,
        },
        {
          value: 'T',
          display_name: '2 этаж',
          display_floor: 2,
        },
        {
          value: 'TR',
          display_name: '3 и выше',
          display_floor: 3,
        },
      ],
    },
    scenarioByTabs: {},

    readOnly: true,
    keysByObj: {},
    tabsNames: [],
    id: null,
    isRequiredFieldsReady: false,
    is_checked: false,
    initialRealtyClassForNE: [],
    objectDealScenario: [
      [
        {
          field: 'deal_date',
          class: 'col-6',
        },
      ],
      [
        {
          field: 'start_owner',
          class: 'col-12',
        },
      ],
      [
        {
          field: 'end_owner',
          class: 'col-12',
        },
      ],
      [
        {
          field: 'trade_place',
          class: 'col-12',
        },
      ],
      [
        {
          field: 'price_sale_start',
          class: 'col-6',
        },
        {
          field: 'price_sale_start_per_m',
          class: 'col-6',
        },
      ],
      [
        {
          field: 'price_sale_end',
          class: 'col-6',
        },
        {
          field: 'price_sale_end_per_m',
          class: 'col-6',
        },
      ],
    ],
    objectDealFields: [],
  }),

  actions: {
    resetState() {
      this.$reset()
    },
    toggleReadOnly() {
      this.readOnly = !this.readOnly
    },
    setObjectType(value: objectTypeType) {
      this.objectType = value
    },
    setObjectTypeCalc(value: objectTypeCalcType) {
      this.objectTypeCalc = value
    },
    setAdsType(value: string) {
      this.adsType = value
    },
    setExchangeType(value: string) {
      this.exchangeType = value
    },
    setFuncPurpose(value: { [key: string]: any }) {
      this.funcPurpose = value
    },
    setMutableData(value: { [key: string]: any }) {
      this.mutableData = { ...value }
    },
    setTabNames(value: string[]) {
      this.tabsNames = value
    },
    setId(value: number) {
      this.id = value
    },
    setNewRequiredFieldsForTab(tab: string, section: string, fields: string[]) {
      this.scenarioByTabs[tab][section].requiredFields = fields
      console.log(this.scenarioByTabs[tab][section].requiredFields, fields)
    },
    setIsChecked(value: boolean) {
      this.is_checked = value
    },
    getIsRequiredFieldsReady() {
      let isReady = null
      for (const tab in this.scenarioByTabs) {
        for (const section in this.scenarioByTabs[tab]) {
          if (this.scenarioByTabs[tab][section].requiredFields.length && !this.scenarioByTabs[tab][section].completed) {
            isReady = false
            break
          }
        }
        if (isReady === false) break
      }
      if (isReady === null) {
        if (!Object.keys(this.scenarioByTabs).length) {
          isReady = false
        } else {
          isReady = true
        }
      }

      this.isRequiredFieldsReady = isReady
    },
    async getScenario(funcPurpose: number, exchangeType: string) {
      const scenario: object[] = await $http
        .get(`api/v1/meta/fields_groups/?functional_purpose=${funcPurpose}&exchange_type=${exchangeType}&stage=0`)
        .then((res: Record<string, any>) => res._data)
      this.tabsList = []

      const currentBaseFields = this.metaScenario['Базовые поля']
      this.metaScenario = {}
      if (currentBaseFields) {
        this.metaScenario['Базовые поля'] = currentBaseFields
      }
      for (const key in scenario) {
        // Добавить в это условие табы, которые хотим отображать в виде основного (т.е. если лейбл и набор полей по массивам, т.к.
        // такой формат выводится через EvaluationLandplots)

        if (key === 'Стандартные поля' || key === 'ПЗЗ' || key === 'Базовые поля') {
          this.tabsList.push(key)
        }
      }
      const weights: { [key: string]: number } = {
        'Базовые поля': 0,
        'Стандартные поля': 1,
        ПЗЗ: 2,
      }
      this.tabsList = this.tabsList.sort((a, b) => weights[a] - weights[b])

      this.tabsList.forEach((item: string) => {
        //@ts-ignore
        this.metaScenario[item] = scenario[item]
        //@ts-ignore
        this.metaScenario[item] = this.metaScenario[item].sort((a, b) => {
          if (a.position < b.position) return -1
          else return 1
        })
      })

      this.metaFields = await $http
        .get(`api/v1/meta/fields/?functional_purpose=${funcPurpose}&exchange_type=${exchangeType}&stage=0`)
        .then((res: Record<string, any>) => res._data)
      // добавить в мета ссылки на заполняемые поля
    },

    setObjectData(mutableData: Record<string, any>) {
      let displayedFields: string[] = []
      this.tabsList.forEach((item) => {
        displayedFields.push(...this.metaScenario[item].map((item: any) => item.fields).flat(Infinity))
      })
      let evoluationMutableData: Record<string, any>[] = []
      this.metaFields.forEach((item: any) => {
        const mutableOptions = this.mutableOptions as Record<string, any>

        if (mutableOptions[item.name] || item.field_type) {
          evoluationMutableData.push({
            ...item,
            type: item.field_type && item.field_type !== 'None' ? item.field_type : mutableOptions[item.name]?.type,
            objectData: {
              ...mutableOptions[item.name],
              label: item.label ? item.label : mutableOptions[item.name]?.label,
              type: item.field_type && item.field_type !== 'None' ? item.field_type : mutableOptions[item.name]?.type,
              choices: mutableOptions[item.name]?.type === 'choice' ? item.choices : [],
            },
          })
        } else {
          evoluationMutableData.push({
            ...item,
          })
        }
      })

      const exclude = [
        'object_type',
        'func_purpose',
        'ads_type',
        'ne_ads_type',
        'exchange_type',
        'offer_date',
        'object_area',
        'object_area_source',
        'object_area_source_dim',
        'price_sale',
        'price_sale_per_m',
        'price_sale_source',
        'price_sale_source_type',
        'object_offices_area',
        'object_common_area',
        'object_trade_area',
        'object_storage_area',
        'object_offices_area_share',
        'object_common_area_share',
        'object_trade_area_share',
        'object_storage_area_share',
        'rent_result_json',
        'enrichment_begin',
        'enrichment_end',
      ]
      evoluationMutableData = evoluationMutableData.filter((item) => {
        const mutableOptions = this.mutableOptions as Record<string, any>

        return !(
          item.flags.requiredField &&
          !displayedFields.includes(item.name) &&
          !exclude.includes(item.name) &&
          mutableOptions[item.name]
        )
      })

      this.evoluationMutableOptions = this.createMutableOptionsObject(evoluationMutableData)
      ;(this as any).initialRealtyClassChoices = this.evoluationMutableOptions?.realty_class?.objectData.choices

      evoluationMutableData.forEach((item) => {
        // const option = this.mutableOptions as Record<string, any>
        if (this.evoluationMutableOptions[item.name].flags.prewrittenValue) {
          mutableData[item.name] =
            mutableData[item.name] && !this.evoluationMutableOptions[item.name].flags.disabled
              ? mutableData[item.name]
              : this.evoluationMutableOptions[item.name].flags.prewrittenValue
        }
        // if (
        //   option &&
        //   option.type === 'choice' &&
        //   !(this.evoluationMutableOptions[item.name] as { choices: { value: string }[] }).choices
        //     .map((choiceItem) => choiceItem.value)
        //     .includes(mutableData[item.name])
        // ) {
        //   mutableData[item.name] = null
        // }
      })

      if (mutableData.engineering_electricity === 'A' && this.objectTypeCalc === 'NE') {
        mutableData.lectricity_power = null

        this.evoluationMutableOptions.lectricity_power.flags.disabled = true
      }
      if (mutableData.object_type === 'Q' && this.objectTypeCalc === 'NE') {
        this.initialRealtyClassForNE = this.evoluationMutableOptions.realty_class.objectData.choices
      }

      const fields: string[] = []
      this.objectDealScenario.forEach((row) => {
        row.forEach((field: any) => {
          fields.push(field.field)
        })
      })

      this.objectDealFields = [...fields]
      console.log('here', fields, this.objectDealFields)

      mutableData.ads_downloaded = this.id ? mutableData.ads_downloaded : new Date().toISOString()
      mutableData.added_by = mutableData.added_by ? mutableData.added_by : useAuth().user!.id
      const sectionsIds: { [key: string]: any } = {}

      this.tabsList.forEach((item: any) => {
        sectionsIds[item] = {}
        const ids = this.metaScenario[item]
          .map((item: any) => {
            return { fields: item.fields.flat(Infinity), label: item.title }
          })
          .filter((item: any) => item.label !== 'Статусы')
        ids.forEach((itemId: any) => {
          sectionsIds[item][itemId.label] = {
            completed: false,
            requiredFields: itemId.fields.filter(
              (item: any) =>
                this.evoluationMutableOptions[item] && this.evoluationMutableOptions[item].flags.requiredField,
            ),
            label: itemId.label,
          }

          const components = itemId.fields.filter((item: any) => item.includes('component'))
          if (components.length) {
            components.forEach((itemComponent: any) => {
              if (
                this.evoluationMutableOptions[itemComponent] &&
                this.evoluationMutableOptions[itemComponent].flags &&
                this.evoluationMutableOptions[itemComponent].flags.requiredFields
              ) {
                sectionsIds[item][itemId.label].requiredFields.push(
                  ...this.evoluationMutableOptions[itemComponent].flags.requiredFields,
                )
              }
            })
          }
          sectionsIds[item][itemId.label].requiredFields.forEach((itemField: string) => {
            this.evoluationMutableOptions[itemField].tab = item
            this.evoluationMutableOptions[itemField].section = itemId.label
          })
        })

        this.createConstSections(sectionsIds)
      })
      this.scenarioByTabs = sectionsIds
    },
    createConstSections(sectionsIds: Record<string, any>) {
      const requiredFields = {
        [photo as tabsType]: filesGroupCard[this.objectTypeCalc].flags[this.objectType].required[photo],
        [documents as tabsType]: filesGroupCard[this.objectTypeCalc].flags[this.objectType].required[documents],
      }
      allTypesConstTabs.forEach((tab) => {
        this.setSectionObject(sectionsIds, tab, requiredFields)
      })
      if (this.objectTypeCalc === 'OO') {
        evaluationConstTabs.forEach((tab) => {
          this.setSectionObject(sectionsIds, tab, requiredFields)
        })
      }
      if (this.objectTypeCalc === 'NE') {
        researchConstTabs.forEach((tab) => {
          this.setSectionObject(sectionsIds, tab, requiredFields)
        })
      }
      if (this.objectTypeCalc === 'OA') {
        analogsConstTabs.forEach((tab) => {
          this.setSectionObject(sectionsIds, tab, requiredFields)
        })
      }
      console.log(sectionsIds)
    },
    setSectionObject(sectionsIds: Record<string, any>, tab: string, requiredFields: Record<string, string[]>) {
      sectionsIds[tab] = {}
      if (childSections[tab]) {
        childSections[tab].forEach((tabItem) => {
          sectionsIds[tab][tabItem] = {
            completed: false,
            requiredFields: requiredFields[tabItem] ? requiredFields[tabItem] : [],
            label: tabItem,
          }
        })
      } else {
        sectionsIds[tab][tab] = {
          completed: false,
          requiredFields: requiredFields[tab] ? requiredFields[tab] : [],
          label: tab,
        }
      }
    },
    realtyFieldsByType(filter: any): { [key: string]: any } {
      const res: Record<string, any> = {}
      for (const fieldName in this.realtyFields) {
        let add = true
        if ('ignore' in filter) {
          if (
            (filter.ignore && !this.realtyFields[fieldName].ignore) ||
            (!filter.ignore && this.realtyFields[fieldName].ignore)
          )
            add = false
        }

        if ('base' in filter && this.realtyFields[fieldName].base !== filter.base) add = false
        if ('search' in filter && this.realtyFields[fieldName].search !== filter.search) add = false

        if (
          'objectType' in filter &&
          !this.realtyFields[fieldName][filter.objectType] &&
          !this.realtyFields[fieldName].all
        )
          add = false
        if (add) {
          res[fieldName] = this.realtyFields[fieldName]
        }
      }
      return res
    },

    async loadRealtyFields() {
      // Загружаем перечень типов объектов недвижимости [{name: 'landplots', value: 'L'}, ...]

      let objectTypes = [
        { name: 'quaters', display_name: 'Помещение', value: 'Q' },
        { name: 'buildings', display_name: 'Здание', value: 'B' },
        { name: 'landplots', display_name: 'Земельный участок', value: 'L' },
      ]
      const realtyFields: any = {}
      const fields = cloneDeep(await useConstants().getFieldsOptions())
      for (const objectType of objectTypes) {
        for (const fieldName in fields) {
          if (!realtyFields[fieldName]) {
            realtyFields[fieldName] = fields[fieldName]
          }
          // Отмечаем, что поле используется в таком типе недвижимости
          // console.log(realtyFields, fieldName, realtyFields[fieldName], objectType)

          realtyFields[fieldName][objectType.name] = true

          realtyFields[fieldName].search = false
        }
      }

      // Заполняем список с типами объектов названиями на русском
      if (realtyFields.object_type) {
        for (const objTypeData of realtyFields.object_type.choices) {
          const foundObjectType = objectTypes.find((objectType) => objectType.value === objTypeData.value)
          if (foundObjectType !== undefined) {
            foundObjectType.display_name = objTypeData.display_name
          } else {
            // Обработка ситуации, когда элемент не найден, если необходимо
            console.warn(`ObjectType с value=${objTypeData.value} не найден.`)
          }
        }
      }

      // Загружаем перечень основных полей base, которые по умолчанию отображаются на панели поиска
      // и перечень игнорируемых полей ignore, которые не участвуют в поиске

      this.realtyFields = realtyFields
    },

    async init(object: { object_type: objectTypeType }, returnEmptyObject: boolean) {
      const objNames = {
        Q: 'quaters',
        L: 'landplots',
        B: 'buildings',
      }
      await this.loadRealtyFields()

      const optionsDefault = this.realtyFieldsByType({ objectType: objNames[object.object_type] })

      this.mutableOptions = optionsDefault
      if (returnEmptyObject) {
        const dataDefault = this.setDefaultValues(optionsDefault)

        dataDefault.object_type_calc = this.objectTypeCalc

        this.requiredFilters[this.objectTypeCalc].forEach((item: string) => {
          if (item === 'object_type') {
            dataDefault.object_type = this.objectType
          }
          if (item === 'ads_type') {
            dataDefault.ads_type = this.adsType
          }
          if (item === 'exchange_type') {
            dataDefault.exchange_type = this.exchangeType
          }
        })
        // this.mutableData = dataDefault

        return { ...dataDefault }
      }
    },

    setDefaultValues(options: { [key: string]: any }): { [key: string]: any } {
      const defaultValues: { [key: string]: any } = {}
      // const currentDateTime = new Date().toJSON()
      // const currentDate = new Date().toJSON().slice(0, 10)

      const excludedFields = [
        'ads_misc',
        'region',
        'func_purpose',
        'geo_pos',
        'geo_layer',
        'address',
        'images_links',
        'files',
        'exchange_type',
      ]
      const nonNullFields = ['object_area', 'object_area_source', 'price_sale', 'price_sale_source']
      Object.keys(options).forEach((field) => {
        if (!excludedFields.includes(field)) {
          switch (options[field].type) {
            case 'nested object':
            case 'date':
            case 'datetime':
            case 'boolean':
              defaultValues[field] = null
              break

            case 'pk':
            case 'id':
            case 'integer':
            case 'decimal':
            case 'float':
              defaultValues[field] = !nonNullFields.includes(field) ? null : 0
              break

            case 'string':
            case 'url':
              defaultValues[field] = ''
              break

            case 'list':
              let listDefaultValue = ''
              if (options[field].child && options[field].child.choices && options[field].child.choices.length > 0) {
                const index = options[field].child.choices.findIndex(
                  (choice: any) => choice.display_name === 'Нет' || choice.display_name === '-',
                )
                listDefaultValue = options[field].child.choices[index >= 0 ? index : 0].value
              }
              defaultValues[field] = listDefaultValue
              break

            case 'choice':
              defaultValues[field] = null

              break
          }
        } else if (field === 'ads_misc') {
          defaultValues[field] = {}
        } else if (field === 'region') {
          defaultValues[field] = null
        } else if (field === 'func_purpose') {
          defaultValues[field] = null
        } else if (field === 'geo_pos') {
          defaultValues[field] = {
            coordinates: [null, null],
            type: 'Point',
          }
        } else if (field === 'geo_layer') {
          if ((this as any).advLayers && (this as any).advLayers.length > 0) {
            defaultValues[field] = (this as any).advLayers[0].id
          } else defaultValues[field] = 0
        } else if (field === 'address') {
          defaultValues[field] = {
            raw: '-',
          }
        } else if (field === 'images_links') {
          defaultValues[field] = []
        } else if (field === 'files') {
          defaultValues[field] = []
        } else {
          defaultValues[field] = ''
        }
      })
      return defaultValues
    },
    createMutableOptionsObject(mutableOptionsArr: object[]) {
      const obj: Record<string, any> = {}
      mutableOptionsArr.forEach((item: any) => {
        obj[item.name] = {
          ...item,
        }
      })

      return obj
    },
    checkBySection(tab: string, section: string, object: { [key: string]: any }, fieldToChange: string | string[]) {
      if (!this.scenarioByTabs[tab][section]) return

      let isFormCompleted = true
      let fields = !Array.isArray(fieldToChange) ? (fieldToChange ? [fieldToChange] : []) : fieldToChange
      const fieldsToCheckAsObject = ['rent_result_json', 'floor_number']
      if (tab === photo || tab === documents) {
        const uploadedFiles = object.files.map((item: FileType) => item.description)
        const requiredFiles = this.scenarioByTabs[tab][section].requiredFields
        if (requiredFiles.length && object.pk) {
          let findedArr = []
          requiredFiles.forEach((item: string) => {
            if (uploadedFiles.includes(item)) {
              findedArr.push(item)
            }
          })
          if (findedArr.length !== requiredFiles.length && !object.ads_screenshot) isFormCompleted = false
          this.scenarioByTabs[tab][section].completed = isFormCompleted

          this.getIsRequiredFieldsReady()
          return
        }
      }
      if (
        (section === 'Базовые поля' || section === 'Местоположение') &&
        !(object.geo_pos.coordinates[0] && object.geo_pos.coordinates[1])
      ) {
        isFormCompleted = false
        fields.push('geo_pos')
      }
      for (const key of this.scenarioByTabs[tab][section].requiredFields) {
        if (
          this.evoluationMutableOptions[key] &&
          this.evoluationMutableOptions[key].type &&
          (this.evoluationMutableOptions[key].type === 'decimal' ||
            this.evoluationMutableOptions[key].type === 'integer') &&
          !fieldsToCheckAsObject.includes(key)
        ) {
          if (!+object[key]) {
            isFormCompleted = false
            fields.push(key)
            // this.scenarioByTabs[tab][section].completed = isFormCompleted
          }
        } else if (!fieldsToCheckAsObject.includes(key)) {
          if (!object[key]) {
            isFormCompleted = false
            fields.push(key)
            // this.scenarioByTabs[tab][section].completed = isFormCompleted
          }
          // this.scenarioByTabs[tab][section].completed = isFormCompleted
        } else if (object[key] === null || isEmpty(object[key])) {
          isFormCompleted = false
          fields.push(key)
          // this.scenarioByTabs[tab][section].completed = isFormCompleted
        }
      }

      this.scenarioByTabs[tab][section].completed = isFormCompleted

      // console.log('checkBySection fields', tab, section, fields, this.scenarioByTabs[tab][section].completed)

      if (object.pk) {
        fields.forEach((field) => {
          let sectionAdd = ''
          let tabAdd = ''
          if (field === 'geo_pos' || field === 'coord_lng' || field === 'coord_lat') {
            sectionAdd = section === 'Базовые поля' ? 'Местоположение' : 'Базовые поля'
            tabAdd = tab === 'Базовые поля' ? 'Стандартные поля' : 'Базовые поля'
          } else {
            for (const tabKey in this.scenarioByTabs) {
              for (const sectionKey in this.scenarioByTabs[tabKey]) {
                if (this.scenarioByTabs[tabKey][sectionKey].requiredFields.includes(field)) {
                  sectionAdd = sectionKey
                  tabAdd = tabKey
                }
              }
            }
          }
          // console.log(tabAdd, sectionAdd)
          if (tabAdd && sectionAdd) {
            let isFormCompletedAdd = true
            // console.log(field)
            if (
              (field === 'geo_pos' || field === 'coord_lng' || field === 'coord_lat') &&
              !(object.geo_pos.coordinates[0] && object.geo_pos.coordinates[1])
            ) {
              isFormCompletedAdd = false
            } else if (
              this.evoluationMutableOptions[field] &&
              this.evoluationMutableOptions[field].type &&
              (this.evoluationMutableOptions[field].type === 'decimal' ||
                this.evoluationMutableOptions[field].type === 'integer') &&
              !fieldsToCheckAsObject.includes(field) &&
              !+object[field]
            ) {
              isFormCompletedAdd = false
            } else if (!fieldsToCheckAsObject.includes(field)) {
              if (!object[field]) {
                isFormCompletedAdd = false

                // this.scenarioByTabs[tab][section].completed = isFormCompleted
              }
              // this.scenarioByTabs[tab][section].completed = isFormCompleted
            } else if (object[field] === null || isEmpty(object[field])) {
              isFormCompletedAdd = false
            }
            this.scenarioByTabs[tabAdd][sectionAdd].completed = isFormCompletedAdd
            // console.log(this.scenarioByTabs[tabAdd][sectionAdd].completed, tabAdd, sectionAdd, 'add')
          }
        })
      }

      this.getIsRequiredFieldsReady()
    },
    async updateIsCheckedByFiles() {
      if (!this.scenarioByTabs[photo][photo].requiredFields.length) return
      const res = await $http.get(api_unversal_realty_check + this.id)
      this.is_checked = res._data.is_checked
      console.log(this.is_checked, res._data)
    },
    checkChoices(object: Record<string, any>, options: Record<string, any>) {
      if (object.object_type === 'Q' && object.object_type_calc === 'NE') {
        this.checkRealtyClassNE(object, options)
      }
      for (const key in options) {
        if (options[key].type === 'choice') {
          const choices = options[key].choices.map((item: choiceOption) => item.value)
          if (!choices.includes(object[key])) object[key] = null
        }
      }

      return object
    },
    checkRealtyClassNE(object: Record<string, any>, options: Record<string, any>) {
      const mappingObject: Record<string, string[]> = {}
      options.realty_class.flags.mappingArr.forEach((item: string) => {
        const funcPurposeValue = item.split(':')[0]
        mappingObject[funcPurposeValue] = item.split(':')[1].split(',')
      })

      options.realty_class.objectData.choices = this.initialRealtyClassForNE
        .filter((item) =>
          mappingObject[object.funct_purp_building_nei]
            ? mappingObject[object.funct_purp_building_nei].includes(item.value)
            : false,
        )
        .map((item) => {
          return { ...item }
        })

      options.realty_class.flags.disabled =
        !options.realty_class.objectData.choices.length || !object.funct_purp_building_nei

      if (
        !options.realty_class.objectData.choices
          .map((item: Record<string, any>) => item.value)
          .includes(object.realty_class)
      ) {
        object.realty_class = null
      }
    },
    async createNewObjectFromEvaluation(result: any, aim: Record<string, any>) {
      console.log(result, aim)
      const objectToUpload: Record<string, any> = {}

      objectToUpload.object_type_calc = 'OA'
      objectToUpload.terms_of_sale = 'D'
      objectToUpload.price_sale_start = +result.replace(/[^0-9.,]+/g, '')
      objectToUpload.price_sale_end = +result.replace(/[^0-9.,]+/g, '')
      objectToUpload.exchange_type = 'M'
      const funcPurposes = await useConstants().getFuncPurposes()
      const aimFuncPurpose: funcPurposeObjectType = aim.func_purpose
      const filtredFuncPurpose = funcPurposes.filter((item: funcPurposeObjectType) => {
        return (
          item.type === aimFuncPurpose.type &&
          item.name === aimFuncPurpose.name &&
          item.calc_type === aimFuncPurpose.calc_type &&
          item.object_type === 'OA'
        )
      })
      if (filtredFuncPurpose.length === 1) {
        objectToUpload.func_purpose_id = filtredFuncPurpose[0].id
      } else {
        return
      }
      const layerConstant: any = await $http.get(api_constant + api_layer_id + objectToUpload.object_type_calc)

      const layerId = layerConstant._data[0].value
      if (layerId) {
        // objectToUpload.geo_layer = layerId
      } else {
        return
      }
      const response = await $http
        .get(api_unversal_realty_clone + aim.id, { params: objectToUpload })
        .then((res: Record<string, any>) => res._data)
      const res = await $http.patch(api_unversal_realty + response.pk + '/', {
        body: {
          geo_layer: layerId,
          func_purpose: response.func_purpose,
          address_district: null,
          address_region: response.address_region,
        },
      })
      if (response.pk) {
        navigateTo(`/analog/${response.pk}#${deal}`, {
          external: true,
          open: {
            target: '_blank',
          },
        })
      }
    },
  },
})
