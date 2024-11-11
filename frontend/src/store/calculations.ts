import { defineStore } from 'pinia'
import { isProxy, toRaw } from 'vue'
import { erf, mean, quantileSeq, std } from 'mathjs'
import { utils, writeFileXLSX } from 'xlsx'
import useConstants from '~/store/constants'
import { cloneDeep, isEmpty, isEqual } from 'lodash'
import type { adsTypeType } from '~/types/mapObjectPropertiesTypes'
import type { searchParamsType } from '~/types/objectsFiltersStoreTypes'
import type {
  aimModalFieldsType,
  aimPathType,
  aimType,
  finalTableArrType,
  floorNumberType,
  floorOptionType,
  objectEvolutionTableStageArrayType,
  referenceBookSelectedType,
  referenceBookSourceListsType,
  referenceBooksSelectedType,
  referenceBooksType,
  referenceBookType,
  expressResultType,
  expressResultBlockType,
} from '~/types/calculationsTypes'
import {
  api_all_analogs,
  api_export_analogs_excel,
  api_export_analogs_word,
  api_export_word,
  api_orders,
  getSelectedAnalogsUrl,
} from '~/app_constants/api'
import {
  absoluteValuesSumCorrectionTitle,
  ACCORDING_GUIDE,
  adjustedCostTitleObject,
  ADJUSTMENTS_TAKING_INTO_ACCOUNT_THE_LAND_PLOT,
  ADJUSTMENTS_WITHOUT_TAKING_INTO_ACCOUNT_THE_LAND_PLOT,
  AllEvaluationsStagesTabs,
  analogueObjectWeightLabel,
  baseFloorOptions,
  complianceWithObjectEvaluationCoefficient,
  COMPOSITION_ELEMENTS_FIRST_GROUP,
  COMPOSITION_ELEMENTS_SECOND_GROUP,
  controlValueForAbsoluteSumCorrection,
  engineeringCommunicationObjects,
  finalAdjustment,
  finalAdjustmentForCorrectionIntoAccountLandPlot,
  finalAdjustmentForCorrectionWithoutAccountLandPlot,
  finalResultsTitles,
  fp_ids,
  functional_purpose_analog,
  GENERAL_INFORMATION,
  isCorrectionBlockMenuListOpen,
  ISOLATING_THE_COST_OF_LAND_PLOTS,
  isolatingCostOfLandPlotsFieldsObject,
  locationFloorInitArray,
  operatingCostsFields,
  PRICE_SALE,
  PRICE_SALE_PER_M,
  FUNC_PURPOSE,
  DATE_CALC,
  FLOOR_NUMBER,
  UTILITIES,
  rentCalculationArray,
  TERMS_OF_SALE,
  THIRD_FLOOR_AND_ABOVE_LOCATION_COEFFICIENT,
  totalRentLabelComponents,
  utilitiesAndOperatingCostsNotIncluded,
  utilitiesAndOperatingCostsTitle,
  utilitiesFields,
  VATConst,
  WALLS_MATERIAL_ACCORDING_GUIDE,
  analogsFieldsValuesForExpress,
  ADS_UPDATED,
  OBJECT_AREA,
  OBJECT_TYPE,
  ADDRESS_RAW,
  PRICE_RENT_PER_M,
  ID,
} from '~/app_constants/calculationsConsts'

import {
  calculateString,
  convertStringToNumber,
  dateFormatting,
  diffDates,
  getFormulaString,
  getNewDisplayName,
  isDesiredRange,
  numberWithSpaces,
  splitIntoOrdersWithComma,
} from '~/utils/calculationsUtils'
import { reformatDate } from '~/utils/objectUtils'
import { type EATypesInterface, EvaluationsApproachesTypes } from '~/app_constants/EvaluationsApproachesTypes'
import { useAimModalFields } from '~/composables/useAimModalFields'
import { useAim } from '~/composables/useAim'
import { useObjectEvolutionStageOneTable } from '~/composables/Calculations/useObjectEvolutionStageOneTable'
import { useReferenceBooks } from '~/composables/Calculations/useReferenceBooks'
import { useCorrection } from '~/composables/Calculations/useCorrection'
import { useReferenceBooksSelectedObjects } from '~/composables/Calculations/useReferenceBooksSelectedObjects'
import { useNotesObject } from '~/composables/Calculations/useNotesObject'
import { useApplyReferenceBook } from '~/composables/Calculations/useApplyReferenceBook'
import { useReferenceBookGroupListFormula } from '~/composables/Calculations/useReferenceBookGroupListFormula'
import { useAimValue } from '~/composables/Calculations/useAimValue'
import { useAnalogValue } from '~/composables/Calculations/useAnalogValue'
import { useValueOptions } from '~/composables/Calculations/useValueOptions'
import { useDateOptions } from '~/composables/Calculations/useDateOptions'
import { useRegionOptions } from '~/composables/Calculations/useRegionOptions'
import { useGroupsBySource } from '~/composables/Calculations/useGroupsBySource'
import { useBookBySource } from '~/composables/Calculations/useBookBySource'
import { useSourceOptions } from '~/composables/Calculations/useSourceOptions'
import { useEngineeringCommunicationGroupCoefficients } from '~/composables/Calculations/useEngineeringCommunicationGroupCoefficients'
import { useCorrectionCalculatedValue } from '~/composables/Calculations/useCorrectionCalculatedValue'
import { useIsBlockRunCalculations } from '~/composables/Calculations/useIsBlockRunCalculations'
import { useUtilitiesAndOperatingCostsList } from '~/composables/Calculations/useUtilitiesAndOperatingCostsList'
import { useCorrectionValue } from '~/composables/Calculations/useCorrectionValue'
import { useFinalTotalRentOptions } from '~/composables/Calculations/useFinalTotalRentOptions'
import { useMarketTypeOptions } from '~/composables/Calculations/useMarketTypeOptions'
import { useFinalAdjustment } from '~/composables/Calculations/useFinalAdjustment'
import { useFinalCorrections } from '~/composables/Calculations/useFinalCorrections'
import { useFloorNumberGroupCoefficients } from '~/composables/Calculations/useFloorNumberGroupCoefficients'
import { useFloorNumberGroupCorrection } from '~/composables/Calculations/useFloorNumberGroupCorrection'
import { useAimEngineeringCommunicationList } from '~/composables/Calculations/useAimEngineeringCommunicationList'
import { useAnalogEngineeringCommunicationList } from '~/composables/Calculations/useAnalogEngineeringCommunicationList'
import { useEngineeringCommunicationGroupCorrection } from '~/composables/Calculations/useEngineeringCommunicationGroupCorrection'
import { useAbsoluteSumCorrection } from '~/composables/Calculations/useAbsoluteSumCorrection'
import { useAbsoluteSumCorrectionsForBuildingForSale } from '~/composables/Calculations/useAbsoluteSumCorrectionsForBuildingForSale'
import { useCoefficientOfConformity } from '~/composables/Calculations/useCoefficientOfConformity'
import { useCoefficientSum } from '~/composables/Calculations/useCoefficientSum'
import { useIsShowMarketTypeSelect } from '~/composables/Calculations/useIsShowMarketTypeSelect'
import { useNewPrice } from '~/composables/Calculations/useNewPrice'
import { useFinalPrice } from '~/composables/Calculations/useFinalPrice'
import { useAdjustedCost } from '~/composables/Calculations/useAdjustedCost'
import { useAnalogueObjectWeight } from '~/composables/Calculations/useAnalogueObjectWeight'
import { useRentCalculation } from '~/composables/Calculations/useRentCalculation'
import { useIsOutliersIncludesAdjustedCost } from '~/composables/Calculations/useIsOutliersIncludesAdjustedCost'
import { useAddFactorsArray } from '~/composables/Calculations/useAddFactorsArray'
import { useCorrectionButtonStyle } from '~/composables/Calculations/useCorrectionButtonStyle'
import { useDefaultAimValueForFieldWithValuesAccordingGuide } from '~/composables/Calculations/useDefaultAimValueForFieldWithValuesAccordingGuide'
import { useDefaultAnalogValueForFieldWithValuesAccordingGuide } from '~/composables/Calculations/useDefaultAnalogValueForFieldWithValuesAccordingGuide'
import { useInitFieldsWithValuesAccordingGuideValues } from '~/composables/Calculations/useInitFieldsWithValuesAccordingGuideValues'
import { useInitIsFieldWithValuesAccordingGuideListOpen } from '~/composables/Calculations/useInitIsFieldWithValuesAccordingGuideListOpen'
import { useObjectEvolutionTableStageTwoArray } from '~/composables/Calculations/useObjectEvolutionTableStageTwoArray'
import { useStageTwoTableAllFieldsArr } from '~/composables/Calculations/useStageTwoTableAllFieldsArr'
import { useRebuiltStageTwoTableAllFieldsArr } from '~/composables/Calculations/useRebuiltStageTwoTableAllFieldsArr'
import { useRebuiltObjectEvolutionTableStageTwoArray } from '~/composables/Calculations/useRebuiltObjectEvolutionTableStageTwoArray'
import { useUpdateNewPrices } from '~/composables/Calculations/useUpdateNewPrices'
import { useExpressResults } from '~/composables/Calculations/useExpressResults'
import useUserStore from '~/store/userStore'

type StateType = {
  activeTabIndex: number
  aim: aimType
  aimModalFields: aimModalFieldsType
  aimTzNumber: string
  adsType: adsTypeType
  isCity: boolean
  searchRadius: number
  maxRadius: number
  requestParams: searchParamsType
  isRequiredFieldsReady: boolean
  isFormChanged: boolean
  isLoading: boolean
  allDeletedAnalogs: Array<aimType>
  stageTwoTableAllFieldsArr: Array<string>
  isMarketAnalysis: boolean
  isExpress: boolean
  isShowStub: boolean
  analogs: Array<aimType>
  allAnalogs: Array<aimType>
  analogsCount: number
  selectedAnalogs: Array<aimType>
  analogsTemp: Array<aimType>
  currentAnalogs: Array<aimType>
  stageTwoTable: objectEvolutionTableStageArrayType
  stageOneTable: objectEvolutionTableStageArrayType
  funcAppointment: string
  analogRegion: string
  hasCorrectionsFields: Array<string>
  newPrices: Array<Array<number | string>>
  analogueObjectWeightArray: Array<number | string>
  adjustedCostValueArray: Array<number | string>
  fieldsForStageTwo: aimModalFieldsType
  iterationCounter: number
  analogsThreshold: number
  adjustmentRangeForExpress: [number, number]
  secondGroupFields: Array<string>
  fieldsForCorrectionIntoAccountLandPlot: Array<string>
  fieldsForCorrectionWithoutAccountLandPlot: Array<string>
  fieldsForLandPlotCorrection: Array<string>
  corrections: Record<string, Array<number>>
  referenceBooks: referenceBooksType
  referenceBooksSelected: referenceBooksSelectedType
  objectEvolutionTableStageTwoArray: objectEvolutionTableStageArrayType
  referenceBookSourceLists: referenceBookSourceListsType
  fieldsWithValuesAccordingGuideArray: Array<string>
  utilitiesArray: Array<string>
  operatingCostsArray: Array<string>
  locationFloorArray: Array<string>
  floorOptions: Array<floorOptionType>
  engineeringCommunicationArray: Array<string>
  engineeringCommunicationObject: Record<string, string>
  funcPurposeNamesArray: Array<string>
  fieldsWithValuesAccordingGuideValues: Record<string, Array<string>>
  adjustableFields: Array<string>
  rentCalculationObject: Record<string, Array<number | string>>
  engineeringCommunicationCorrectionsSource: string
  objects: Array<aimType>
  options: Record<string, any>
  defaultMarketType: string
  isStageTwoAvailable: boolean
  order: Record<string, any> | undefined
  orders: Record<string, any>[]
  qs: number | null
  outliers: Array<number>
  firstGroup: Array<string>
  aimPath: aimPathType
  fieldForCorrection: string
  isAnalogsTable: boolean
  isAnalogsTableDataLoading: boolean
  notesObject: Record<string, string>
  evaluationStatus: string
  isFieldWithValuesAccordingGuideListOpen: Record<string, Array<boolean>>
  isCorrectionBlockMenuListOpen: Record<string, boolean>
  evaluationType: keyof EATypesInterface
  savedOrderId: number | string | null
  orderName: string | null
  orderFiles: Array<File>
  notSavedOrderFiles: Array<File>
  finalTableArr: finalTableArrType
  expressResultsTableArr: finalTableArrType
  evaluationsStagesTabs: Array<string>
  tabNameAttentionObject: Record<string, boolean>
  summary_result: string
  TRGroup: Array<string>
  isBuildingForSale: boolean
  isolatingCostOfLandPlotsFieldsObject: Record<string, { label: string; value: Array<number | null> }>
  finalAdjustmentForCorrectionIntoAccountLandPlot: { label: string; value: Array<string> }
  finalAdjustmentForCorrectionWithoutAccountLandPlot: { label: string; value: Array<number | null> }
  intoAccountLandPlotCorrections: Array<number>
  arrayToMergeCells: Array<''>
  stopRequests: boolean
  penultimateRequest: boolean
  finalAdjustmentsArray: Array<number | string>
  absoluteSumCorrectionArray: Array<string>
  finalComplianceWithObjectEvaluationCoefficientsArray: Array<string | number>
  finalAnalogueObjectWeightsArray: Array<string>
  weightedAverageCost: number | 'Ошибка!' | ''
  isShowEngineeringCommunicationCorrections: boolean
  isShowLocationFloorCorrections: boolean
  isOnRunCalculations: boolean
  isAllAnalogsInSelection: boolean
  currentTabName: string
  expressResults: expressResultType
  analogsTablePageRegulator: number
  activedIndexList: Array<number>
}

export default defineStore('calculations', {
  state: () =>
    <StateType>{
      // Счетчик экранов расчетной таблицы
      activeTabIndex: 0,
      aim: {},
      aimModalFields: [],
      aimTzNumber: '',
      adsType: '',
      isCity: false,
      searchRadius: 5,
      maxRadius: 100,
      requestParams: {},
      isLoading: false,
      isRequiredFieldsReady: false,
      isFormChanged: false,
      allDeletedAnalogs: [],
      stageTwoTableAllFieldsArr: [],
      // Флаг проведения автоматических расчетов
      isMarketAnalysis: false,
      // Флаг проведения экспресс-расчетов
      isExpress: false,
      // Флаг демонстрации лоудера
      isShowStub: false,
      // Массив аналогов для сравнения с целевым объектом
      analogs: [],
      allAnalogs: [],
      //количество подобранных аналогов по запросу.
      analogsCount: 0,
      // Массив аналогов для сравнения с целевым объектом при проведении расчетов
      selectedAnalogs: [],
      // Копия массива аналогов для предварительных расчетов в анализе рынка и экспрессах
      analogsTemp: [],
      currentAnalogs: [],
      // Массив, содержащий описание полей второго шага расчетной таблицы
      stageTwoTable: [],
      // Массив, содержащий описание полей первого шага расчетной таблицы
      stageOneTable: [],
      // Функциональное назначение для работы со справочниками
      funcAppointment: '',
      // Переменная для выбора справочника по региону
      analogRegion: '',
      // Массив полей, которые влияют на изменение стоимости на первом шаге оценки
      hasCorrectionsFields: [],
      // Массив, содержащий изменения по шагам стоимости ОО и ОА в процессе расчетов
      newPrices: [],
      // Отфильтрованный aimModalFields для работы со справочниками
      fieldsForStageTwo: [],
      // Счетчик итерационных циклов
      iterationCounter: 1,
      // Переменная, которая используется в расчетах Экспрессов и при Анализе рынка для проверки соответствия
      // длины массива analogs заданным параметрам. Если длина analogs меньше analogsThreshold,
      // запускается новая итерация вычислений. analogsThreshold должна рассчитываться под конкретный сценарий.
      // Пока поставим условное конкретное значение
      analogsThreshold: 15,
      // Диапозон, в который должно укладываться количество аналогов для экспресс-оценки в первых итерациях
      adjustmentRangeForExpress: [30, 50],
      // Массив полей второй группы элементов сравнения
      secondGroupFields: [],

      // Массивы полей второй группы элементов сравнения для продажи зданий
      fieldsForCorrectionIntoAccountLandPlot: [],
      fieldsForCorrectionWithoutAccountLandPlot: [],
      fieldsForLandPlotCorrection: [],

      // Объект коррекций для обсчетов ObjectEvaluation
      corrections: {},
      // Объект с полным набором справочников, которые могут быть использованы в расчетах в ObjectEvaluation
      referenceBooks: {},
      // Объект с информацией о справочниках, которые используются в расчетах в ObjectEvaluation в настоящий момент
      referenceBooksSelected: {},

      // Группа вспомогательных массивов и объектов, которая используется во множестве расчетов, и потому их удобнее хранить в стейте
      objectEvolutionTableStageTwoArray: [],
      referenceBookSourceLists: {},
      fieldsWithValuesAccordingGuideArray: [],
      utilitiesArray: [],
      operatingCostsArray: [],
      locationFloorArray: [],
      floorOptions: baseFloorOptions,
      engineeringCommunicationArray: [],
      engineeringCommunicationObject: {},
      funcPurposeNamesArray: [],
      fieldsWithValuesAccordingGuideValues: {},
      // Массив включаемых/выключаемых полей для расчетной таблицы ObjectEvaluation
      adjustableFields: [],
      // Вспомогательный объект для хранения расчетов по аренде для ObjectEvaluation
      rentCalculationObject: {},

      engineeringCommunicationCorrectionsSource: '',
      // aim + analogs
      objects: [],
      options: {},
      // Тип рынка
      defaultMarketType: 'Активный рынок',
      isStageTwoAvailable: false,
      // Сохраненное состояние вычислений
      order: {},
      orders: [],
      // Межквартильный диапазон
      qs: null,
      // Выбросы
      outliers: [],
      firstGroup: [],
      aimPath: {
        path: '',
        hash: '',
      },
      fieldForCorrection: '',
      isAnalogsTable: false,
      isAnalogsTableDataLoading: false,
      // Объект текстовых примечаний для ручных корректировок
      notesObject: {},
      evaluationStatus: 'P',
      evaluationType: 'ST',
      savedOrderId: null,
      orderName: null,
      orderFiles: [],
      notSavedOrderFiles: [],
      isFieldWithValuesAccordingGuideListOpen: {},
      isCorrectionBlockMenuListOpen: isCorrectionBlockMenuListOpen,
      finalTableArr: [],
      expressResultsTableArr: [],
      evaluationsStagesTabs: [],
      tabNameAttentionObject: {},
      summary_result: '',
      TRGroup: [],
      isBuildingForSale: false,
      // Объекты для хранения расчетных данных для продажи Зданий
      isolatingCostOfLandPlotsFieldsObject: isolatingCostOfLandPlotsFieldsObject,
      finalAdjustmentForCorrectionIntoAccountLandPlot: finalAdjustmentForCorrectionIntoAccountLandPlot,
      finalAdjustmentForCorrectionWithoutAccountLandPlot: finalAdjustmentForCorrectionWithoutAccountLandPlot,
      intoAccountLandPlotCorrections: [],
      arrayToMergeCells: [],
      stopRequests: false,
      penultimateRequest: false,
      // Данные финальных вычислений
      finalAdjustmentsArray: [],
      absoluteSumCorrectionArray: [],
      finalComplianceWithObjectEvaluationCoefficientsArray: [],
      finalAnalogueObjectWeightsArray: [],
      // Массив весов объектов-аналогов
      analogueObjectWeightArray: [],
      // Массив абсолютных валовых корректировок
      adjustedCostValueArray: [],
      weightedAverageCost: '',
      isShowEngineeringCommunicationCorrections: false,
      isShowLocationFloorCorrections: false,
      // Флаг работы функции предварительных расчетов
      isOnRunCalculations: false,
      // Флаг для подбора аналогов по кнопке "Добавить предложения из общего списка"
      isAllAnalogsInSelection: false,
      currentTabName: '',
      expressResults: {},
      analogsTablePageRegulator: 1,
      activedIndexList: [0]
    },

  getters: {
    // Возвращает аналог по id
    getAnalog: (state: StateType) => (id: number) => {
      return state.analogs.find((item) => item.id === id)
    },
    // Возвращает индекс аналога в списке аналогов по id
    getAnalogIndex: (state: StateType) => (id: number) => {
      return state.currentAnalogs.findIndex((item) => item.id === id)
    },

    getSourceOptions: (state: any) => (fieldName?: string) => {
      const field = fieldName ? fieldName : state.fieldForCorrection
      return useSourceOptions(field)
    },

    getDateOptions: (state: any) => (fieldName?: string) => {
      const field = fieldName ? fieldName : state.fieldForCorrection
      return useDateOptions(field)
    },

    getRegionOptions: (state: StateType) => (field?: string) => {
      const fieldName = field ? field : state.fieldForCorrection
      return useRegionOptions(fieldName)
    },

    getMarketTypeOptions: (state: any) => (field?: string) => {
      const fieldName = field ? field : state.fieldForCorrection
      return useMarketTypeOptions(fieldName)
    },

    getValueOptions: (state: any) => (field?: string) => {
      const fieldName = field ? field : state.fieldForCorrection
      return useValueOptions(fieldName)
    },

    getTypeDataForReferenceBookForFieldForCorrection: (state: StateType) => () => {
      if (!state.fieldForCorrection) return ''
      const { group } = state.referenceBooksSelected[state.fieldForCorrection]
      return state.referenceBooks[state.fieldForCorrection][group ?? 0].type_data
    },

    getIsCorrectionLine: (state: StateType) => (field: string) => {
      if (state.stageTwoTable.filter((group) => group.group === GENERAL_INFORMATION)[0].fields.includes(field))
        return false

      const actualField = field.includes(THIRD_FLOOR_AND_ABOVE_LOCATION_COEFFICIENT)
        ? 'third_floor_and_above_location_coefficient'
        : field

      const fieldObject = state.fieldsForStageTwo.filter((item) => item.field === actualField)[0]
      return fieldObject.hasCorrection ? fieldObject.hasCorrection : false
    },

    getIsBlockRunCalculations: (state: StateType) => () => {
      return useIsBlockRunCalculations()
    },

    getFinalResults: (state: any) => () => {
      const results: Record<string, number | string> = {}
      const weightedAverageOfMarketValueTitle = finalResultsTitles[state.aim.ads_type]
      results[weightedAverageOfMarketValueTitle] =
        state.weightedAverageCost !== 'Ошибка!'
          ? `${numberWithSpaces(Number(state.weightedAverageCost).toFixed(0))}  ₽`
          : 'Ошибка!'

      state.summary_result =
        state.weightedAverageCost !== 'Ошибка!'
          ? `${numberWithSpaces(Number(state.weightedAverageCost).toFixed(0))}  ₽`
          : 'Ошибка!'

      if (state.aim.ads_type === 'S') {
        results['Площадь, кв.м.'] = state.aim.object_area
        results['Рыночная стоимость объекта недвижимости, определенная в рамках сравнительного подхода, руб.'] =
          state.weightedAverageCost === 'Ошибка!'
            ? state.weightedAverageCost
            : `${numberWithSpaces((Number(state.weightedAverageCost) * Number(state.aim.object_area)).toFixed(0))}  ₽`
      }

      if (state.aim.ads_type === 'R') {
        if (state.adjustableFields.includes('operating_costs') && state.adjustableFields.includes(UTILITIES)) {
          for (const obj of state.aim.rent_result_json) {
            results[state.getTotalRentLabelString(obj)] =
              state.getFinalTotalRentOptions(obj) + (state.getFinalTotalRentOptions(obj) === 'Ошибка!' ? '' : ' ₽')
          }

          if (state.aim.enrichment_begin && state.aim.enrichment_end) {
            results['Количество лет необоснованного обогащения'] = (
              diffDates(state.aim.enrichment_end, state.aim.enrichment_begin) / 365
            ).toFixed(1)
            results['Количество дней необоснованного обогащения'] = diffDates(
              state.aim.enrichment_end,
              state.aim.enrichment_begin,
            )

            results[
              `Платеж за право пользования Объектом оценки в период с ${dateFormatting(
                state.aim.enrichment_begin,
              )} по ${dateFormatting(state.aim.enrichment_end)}, без учета НДС, без учета КУ, без учета ЭР`
            ] = state.getPaymentForTheRightToUse() + (state.weightedAverageCost === 'Ошибка!' ? '' : ' ₽')
            state.summary_result =
              state.getPaymentForTheRightToUse() + (state.weightedAverageCost === 'Ошибка!' ? '' : ' ₽')
          }
        }
      }

      return results
    },

    getCurrentReferenceBook: (state: StateType) => () => {
      if (!state.fieldForCorrection) return []

      const {
        group: groupNum,
        book: bookNum,
        valueCol: valueType,
        source,
      } = state.referenceBooksSelected[state.fieldForCorrection]

      if (groupNum === null || bookNum === null || source === 'Ручное' || source === null || valueType === null) {
        return []
      }

      return state.referenceBooks[state.fieldForCorrection][groupNum].books
    },

    getAddFactorsArray: (state: StateType) => () => {
      return useAddFactorsArray()
    },

    getFirstGroupFields: (state: StateType) => () => {
      return state.stageTwoTable.filter((group) => group.group === COMPOSITION_ELEMENTS_FIRST_GROUP)[0].fields
    },

    getCorrectionButtonStyle: (state: StateType) => (field: string, key: string) => {
      return useCorrectionButtonStyle(field, key)
    },

    getOrderName: (state: StateType) => () => {
      const orderName = `${EvaluationsApproachesTypes[state.evaluationType][0]} ${reformatDate(new Date().toISOString())} ТЗ ${state.aimTzNumber}`
      state.orderName = orderName
      return orderName
    },

    getIsOpenMenuList: (state: StateType) => (field: string, index: number | undefined) => {
      if (index === undefined) {
        return state.isCorrectionBlockMenuListOpen[field]
      }

      return state.isFieldWithValuesAccordingGuideListOpen[field][index]
    },
  },

  actions: {
    resetState() {
      this.$reset()
    },
    initArraysOfAnalogs() {
      this.analogs = []
      this.allAnalogs = []
      this.selectedAnalogs = []
      this.analogsTemp = []
      this.currentAnalogs = []
    },
    onIsShowStub() {
      this.isShowStub = true
    },
    offIsShowStub() {
      this.isShowStub = false
    },
    setOrderName(name: string) {
      this.orderName = name
    },
    resetOrder() {
      this.order = {}
    },
    async getOrderFiles() {
      const order = await $http.get(api_orders + this.savedOrderId)
      this.orderFiles = order._data.files
      return
    },
    async loadOrderFiles(files: any) {
      let result: any[] = []
      for (const file of files) {
        const formData = new FormData()
        formData.append('files', file)
        formData.append('description', file.description)
        const res = await $http.post(api_orders + this.savedOrderId + '/upload_file/', { body: formData })
        result.push(res._data)
      }
      return result
    },
    orderFilesUpload(files: File[]) {
      if (this.savedOrderId) {
        this.loadOrderFiles(files).then(() => {
          this.getOrderFiles()
        })
      } else {
        this.notSavedOrderFiles.push(...files)
      }
      return
    },
    async orderFilesDelete(file: any) {
      if (this.savedOrderId) {
        await $http.delete(`${api_orders + this.savedOrderId}/delete_file/?file_id=${file.pk}`)
        await this.getOrderFiles()
      } else {
        this.notSavedOrderFiles = this.notSavedOrderFiles.filter(
          (item: any) =>
            !(
              item.description === file.description &&
              item.lastModified === file.lastModified &&
              item.name === file.name &&
              item.size === file.size &&
              item.type === file.type
            ),
        )
      }
      return
    },
    setSavedOrderId(id: number | string | null) {
      this.savedOrderId = id
    },
    setEvaluationType(type: keyof EATypesInterface) {
      this.evaluationType = type
    },
    async setEvaluationStatus(status: string) {
      this.evaluationStatus = status
      return
    },
    checkAnalogs(analog: aimType) {
      const analogFromAnalogs = this.analogs.filter((item: aimType) => analog.id === item.id)
      if (!analogFromAnalogs.length) {
        this.analogs.push(analog)
      }
    },
    setIsAnalogsTable(bool: boolean) {
      this.isAnalogsTable = bool
    },
    setIsAnalogsTableDataLoading(bool: boolean) {
      this.isAnalogsTableDataLoading = bool
    },
    setCurrentPrice(analogCounter: number, field: string) {
      let index = this.hasCorrectionsFields.indexOf(field)

      const isCorrectionInFirstGroup = index !== -1

      if (isCorrectionInFirstGroup) {
        while (index < this.hasCorrectionsFields.length) {
          let correction = this.corrections[this.hasCorrectionsFields[index]][analogCounter + 1]

          correction =
            this.corrections[this.hasCorrectionsFields[index]][0] !== 0
              ? this.corrections[this.hasCorrectionsFields[index]][0] /
                  this.corrections[this.hasCorrectionsFields[index]][analogCounter + 1] -
                1
              : correction / 100

          const counter = this.aim.ads_type === 'R' && !this.isExpress ? index + 1 : index
          let newPrice = this.newPrices[analogCounter][counter]

          if (correction) {
            newPrice = Number(newPrice) * (1 + correction)
          }

          for (let i = counter + 1; i < this.newPrices[analogCounter].length; i++) {
            this.newPrices[analogCounter][i] = newPrice
          }

          index += 1
        }
      }

      if (this.fieldsForCorrectionIntoAccountLandPlot.includes(field)) {
        this.setFieldsForCorrectionIntoAccountLandPlotCorrections(analogCounter)
      }
    },

    setIsFormChanged(value: boolean) {
      this.isFormChanged = value
    },

    async getAnalogRegion(lon: number, lat: number) {
      const params: any = {
        lat,
        lon,
        addressdetails: 1,
        format: 'jsonv2',
        'accept-language': 'ru',
        limit: 1,
        polygon_geojson: 1,
      }
      const runtimeConfig = useRuntimeConfig()
      const searchServer = runtimeConfig.public.searchServer
      const { _data } = await $http.get(searchServer + 'reverse.php', { params })
      return _data.address.state
    },

    setStageOneTable(value: objectEvolutionTableStageArrayType) {
      this.stageOneTable = cloneDeep(value)
    },

    setAim(value: { [key: string]: any }) {
      if (!value.rent_result_json) {
        value.rent_result_json = [
          {
            rent_vat: 'W',
            rent_pu: 'W',
            rent_co: 'W',
            rent_dimension: 'SM',
          },
        ]
      }
      this.aim = { ...value }
      const lon = this.aim.geo_pos.coordinates[0]
      const lat = this.aim.geo_pos.coordinates[1]
      this.getAnalogRegion(lon, lat).then((region) => {
        if (['Москва', 'Санкт-Петербург'].includes(region)) {
          this.setAnalogRegion(region)
        } else {
          this.setAnalogRegion('Россия')
        }
      })
      if (this.aim.ads_type) {
        this.adsType = this.aim.ads_type
      }
      this.evaluationsStagesTabs = this.adsType
        ? AllEvaluationsStagesTabs[this.aim.object_type][this.adsType]
        : AllEvaluationsStagesTabs[this.aim.object_type]['R']
      this.evaluationsStagesTabs.forEach((field) => {
        this.tabNameAttentionObject[field] = false
      })
      this.summary_result = ''

      console.log('this.aim ', cloneDeep(this.aim))
    },

    setAimTzNumber(value: string) {
      this.aimTzNumber = value
    },

    setAimModalFields(value: Record<string, any>[]) {
      this.aimModalFields = [...value]
      console.log('this.aimModalFields ', cloneDeep(this.aimModalFields))
    },

    setNewAimFieldValue(value: string, field: string) {
      this.aim[field] = value
      if (this.fieldsWithValuesAccordingGuideArray.includes(field)) {
        this.fieldsWithValuesAccordingGuideValues[field][0] = value
        const { group: groupNum } = this.referenceBooksSelected[field]
        const objects = groupNum && this.referenceBooks[field][groupNum].type_data === 'M' ? this.objects : [this.aim]
        for (let i = 0; i < objects.length; i++) {
          this.applyReferenceBookToFieldsWithValuesAccordingGuide(
            this.fieldsWithValuesAccordingGuideValues[field][i],
            field,
            i,
          )
        }
      }
    },

    setNewAnalogFieldValue(value: string, field: string, index: number) {
      this.selectedAnalogs[index][field] = value
      if (this.fieldsWithValuesAccordingGuideArray.includes(field)) {
        this.applyReferenceBookToFieldsWithValuesAccordingGuide(value, field, index + 1)
      }
    },

    setIsExpress(value: boolean) {
      this.analogsThreshold = 5
      this.isExpress = value
    },

    setComparativeApproach(value: boolean) {
      this.analogsThreshold = 15
      this.isExpress = !value
    },

    setIsCity(value: boolean) {
      this.isCity = value
    },

    setSearchRadius(value: number) {
      this.searchRadius = value
    },

    setMaxRadius(value: number) {
      this.maxRadius = value
    },

    setAnalogs(value: Array<aimType>) {
      this.analogs = cloneDeep(value)
    },

    async addAnalog(analog: aimType) {
      this.analogs.push(analog)
      this.allAnalogs.push(analog)
    },

    setAllAnalogs(value: Array<aimType>) {
      this.allAnalogs = cloneDeep(value)
    },

    setAllAnalogsAfterRequestToUniverse() {
      this.allAnalogs = cloneDeep(this.selectedAnalogs)
      this.analogsCount = this.allAnalogs.length
    },

    setAnalogsCount(num: number) {
      this.analogsCount = num
    },

    setAnalogNewValue(index: number, key: string, value: any) {
      this.analogs[index][key] = value
    },

    setAnalogsTemp(value: Array<aimType>) {
      this.analogsTemp = cloneDeep(value)
    },

    initFinalTableArr() {
      this.finalTableArr = []
      this.expressResultsTableArr = []
    },

    initAnalogsTemp() {
      this.analogsTemp = this.analogs.filter((analog: aimType) => analog.object_area)
      const valuesSet = analogsFieldsValuesForExpress[this.aim.func_purpose.id]

      for (let i = 0; i < this.analogsTemp.length; i++) {
        const analog = this.analogsTemp[i]
        for (const key in analog) {
          if (analog.hasOwnProperty(key)) {
            const value = analog[key]
            if (!value || value === '{}' || value === '[]') {
              if (key in valuesSet) {
                analog[key] = !valuesSet[key] && key !== 'realty_class' ? this.aim[key] : valuesSet[key]
              }
            }
          }
        }
      }
    },

    setSelectedAnalogs(array: Array<aimType>) {
      console.log(array)
      this.selectedAnalogs = cloneDeep(array)
    },

    initSelectedAnalogs() {
      this.selectedAnalogs = []
    },

    setAnalogRegion(value: string) {
      this.analogRegion = value
    },

    initAdjustableFields() {
      if (!isEmpty(this.order) && this.adjustableFields.length) {
        if (this.fieldsWithValuesAccordingGuideArray.length) {
          this.fieldsWithValuesAccordingGuideArray.forEach((field) => {
            if (!this.adjustableFields.includes(field.replace(ACCORDING_GUIDE, ''))) {
              this.adjustableFields.push(field.replace(ACCORDING_GUIDE, ''))
            }
          })
        }
        return
      }

      this.adjustableFields = this.stageOneTable
        .map((group) => group.fields)
        .reduce((arr, current) => arr.concat(current), [])
        .filter((field) => !!this.aim[field] && field !== 'kadast_number')
    },

    initNewPrices() {
      this.newPrices = []
    },

    initAnalogueObjectWeightArray() {
      console.log('initAnalogueObjectWeightArray')
      this.analogueObjectWeightArray = []

      for (let i = 0; i < this.currentAnalogs.length; i++) {
        this.analogueObjectWeightArray.push(0)
      }
    },

    async initObjectEvolutionStageTwoTable() {
      this.objectEvolutionTableStageTwoArray = await useObjectEvolutionTableStageTwoArray()

      if ((this.isExpress || this.isMarketAnalysis) && !this.adjustableFields.length) {
        Object.keys(this.aim).forEach((item: string) => {
          this.adjustableFields.push(item)
        })
      }

      this.isBuildingForSale = this.adsType === 'S' && this.aim.object_type === 'B'
      this.funcAppointment = this.aim.func_purpose.name.includes(':')
        ? this.aim.func_purpose.name.slice(0, this.aim.func_purpose.name.indexOf(':'))
        : this.aim.func_purpose.name
      this.engineeringCommunicationObject = engineeringCommunicationObjects[this.aim.object_type]
      this.engineeringCommunicationArray = Object.keys(this.engineeringCommunicationObject)
      this.floorOptions = baseFloorOptions

      this.locationFloorArray = locationFloorInitArray
      const floors = Object.keys(this.aim.floor_number).filter((item) => item.includes('TR'))
      this.addFloorsToCalculationTable(floors)

      if (this.aim.ads_type === 'R') {
        rentCalculationArray.forEach((item) => {
          const arr = []
          for (let i = 0; i < this.currentAnalogs.length; i++) {
            arr.push(0)
          }
          this.createRentCalculationObjectKey(item, arr)
        })
      }

      this.utilitiesArray = Object.keys(utilitiesFields)
      this.operatingCostsArray = Object.keys(operatingCostsFields)

      this.stageTwoTableAllFieldsArr = cloneDeep(useStageTwoTableAllFieldsArr())
      console.log('this.stageTwoTableAllFieldsArr_1 ', cloneDeep(this.stageTwoTableAllFieldsArr))

      if (this.TRGroup.length) {
        this.stageTwoTableAllFieldsArr = cloneDeep(useRebuiltStageTwoTableAllFieldsArr())
        this.objectEvolutionTableStageTwoArray = cloneDeep(useRebuiltObjectEvolutionTableStageTwoArray())
      }
      console.log('this.stageTwoTableAllFieldsArr_2 ', cloneDeep(this.stageTwoTableAllFieldsArr))

      this.setFieldsWithValuesAccordingGuideArray(
        this.stageTwoTableAllFieldsArr.filter((field: string) => field.includes(ACCORDING_GUIDE)),
      )

      this.stageTwoTable = this.objectEvolutionTableStageTwoArray.map((item) => {
        item.fields = item.fields.filter((el: string) => this.stageTwoTableAllFieldsArr.includes(el))
        return item
      })
      console.log('this.stageTwoTable ', cloneDeep(this.stageTwoTable))

      this.fieldsForStageTwo = this.aimModalFields.filter((item) => this.stageTwoTableAllFieldsArr.includes(item.field))
      console.log('this.fieldsForStageTwo ', cloneDeep(this.fieldsForStageTwo))

      this.isBuildingForSale ? this.initSecondGroupFieldsForBuildingForSale() : this.initSecondGroupFields()

      this.initAnalogueObjectWeightArray()
      this.updateNewPrices()
      this.adjustableFields = []
    },

    initSecondGroupFields() {
      this.secondGroupFields = this.stageTwoTable
        .filter((item) => item.group === COMPOSITION_ELEMENTS_SECOND_GROUP)[0]
        .fields.filter((item: string) => this.stageTwoTableAllFieldsArr.includes(item))

      if (useAddFactorsArray() && useAddFactorsArray().length) {
        this.secondGroupFields = this.secondGroupFields.concat(useAddFactorsArray())
      }
    },

    initSecondGroupFieldsForBuildingForSale() {
      this.fieldsForCorrectionIntoAccountLandPlot = this.stageTwoTable
        .filter((item) => item.group === ADJUSTMENTS_TAKING_INTO_ACCOUNT_THE_LAND_PLOT)[0]
        .fields.filter((item: string) => this.stageTwoTableAllFieldsArr.includes(item))

      this.fieldsForLandPlotCorrection = this.stageTwoTable
        .filter((item) => item.group === ISOLATING_THE_COST_OF_LAND_PLOTS)[0]
        .fields.filter((item: string) => this.stageTwoTableAllFieldsArr.includes(item))

      this.fieldsForCorrectionWithoutAccountLandPlot = this.stageTwoTable
        .filter((item) => item.group === ADJUSTMENTS_WITHOUT_TAKING_INTO_ACCOUNT_THE_LAND_PLOT)[0]
        .fields.filter((item: string) => this.stageTwoTableAllFieldsArr.includes(item))
      if (useAddFactorsArray() && useAddFactorsArray().length) {
        this.fieldsForCorrectionWithoutAccountLandPlot =
          this.fieldsForCorrectionWithoutAccountLandPlot.concat(useAddFactorsArray())
      }

      this.isolatingCostOfLandPlotsFieldsObject = cloneDeep(isolatingCostOfLandPlotsFieldsObject)
      Object.keys(this.isolatingCostOfLandPlotsFieldsObject).forEach((key) => {
        for (let i = 0; i < this.selectedAnalogs.length; i++) {
          this.isolatingCostOfLandPlotsFieldsObject[key].value.push(null)
        }
      })

      for (let i = 0; i < this.selectedAnalogs.length; i++) {
        this.finalAdjustmentForCorrectionIntoAccountLandPlot.value.push('')
        this.finalAdjustmentForCorrectionWithoutAccountLandPlot.value.push(null)
      }
    },

    updateNewPrices() {
      this.initNewPrices()
      this.firstGroup = this.stageTwoTable.filter((item) => item.group === COMPOSITION_ELEMENTS_FIRST_GROUP)[0].fields
      this.hasCorrectionsFields = this.firstGroup.filter((field) => {
        const obj = this.aimModalFields.find((obj) => obj.field === field)
        if (obj && obj.hasCorrection) return field
      })

      this.newPrices = useUpdateNewPrices()
      console.log('this.newPrices ', cloneDeep(this.newPrices))
    },

    async getAnalogs() {
      console.log('getAnalogs()')
      this.setAnalogs([])
      this.isShowStub = true
      try {
        this.requestParams.object_type_calc = 'OA'
        if (!('iteration' in this.requestParams) && !this.isExpress) {
          this.requestParams.radius = String(this.searchRadius)
        }
        const { _data } = await $http.get(api_all_analogs, { params: this.requestParams })
        // TODO сортировка по схожести и по статусу проверенного проходит во фронте, а надо провести на бэке
        if (_data && Array.isArray(_data.results)) {
          _data.results = _data.results
            .sort((a: Record<string, any>, b: Record<string, any>) => {
              if (a.similarity !== b.similarity) {
                return b.similarity - a.similarity
              }
              return 0
            })
            .sort((a: Record<string, any>, b: Record<string, any>) => {
              if (a.is_checked !== b.is_checked) {
                return a.is_checked ? -1 : 1
              }
              return 0
            })
            .slice(0, 100)
        }

        return _data
      } catch (e) {
        console.log(e)
      }
    },

    setRequestParams(data: searchParamsType) {
      this.requestParams = { ...data }
    },

    getYearAgo(isoDate: Date) {
      return new Date(new Date(isoDate).setFullYear(new Date(isoDate).getFullYear() - 1)).toISOString().split('T')[0]
    },

    async getNewAnalogsSearchParams() {
      let analogs = []

      const aimObject = this.aim
      let searchParams: searchParamsType = {}
      searchParams = {
        ads_updated__range: [this.getYearAgo(aimObject.date_calc), aimObject.date_calc].join(','),
        object_type: aimObject.object_type,
        ads_type: aimObject.ads_type,
        // market_type: 'S',
        // func_purpose__in:
        //   fp_ids[aimObject.object_type][aimObject.ads_type] &&
        //   functional_purpose_analog[aimObject.func_purpose.id] in fp_ids[aimObject.object_type][aimObject.ads_type]
        //     ? fp_ids[aimObject.object_type][aimObject.ads_type][
        //         functional_purpose_analog[aimObject.func_purpose.id]
        //       ].join(',')
        //     : functional_purpose_analog[aimObject.func_purpose.id],
        // financing: 'T', // Условия финансирования – Типичные
        // terms_of_sale__in: ['D', 'O'], // Условия продажи/аренды – сделка или предложение
        // ads_type: aimObject.ads_type, // Тип объявления – «Аренда»
        // land_rights: aimObject.ads_type === 'R' ? 'TR' : 'O', // Состав передаваемых прав на объект недвижимости: «Право аренды»
        // market_type: 'S',
        date_calc: aimObject.date_calc, // Дата обновления: в пределах года до даты анализа / даты оценки

        // object_area__range: ['0', '999999'].join(','), // Было, пока оставил

        // Следующий обязателен для запроса, т.к. используются для сортировки по площади.
        source_area: aimObject.object_area,

        // Следующие обязательны для запроса, т.к. используются для механизма выбора радиуса.
        lat: aimObject.geo_pos.coordinates[1],
        lon: aimObject.geo_pos.coordinates[0],
        // address_region: aimObject.address_region.id,

        // limit: this.initialLimitIssueAnalogs,
        // page: this.page
        iteration: this.iterationCounter.toString(),
      }
      if (this.isExpress && this.iterationCounter > 4) {
        if (this.maxRadius > this.searchRadius + 5) {
          this.searchRadius += 5
          searchParams.radius = String(this.searchRadius)
        } else {
          this.searchRadius += 5
          searchParams.radius = String(this.maxRadius)
          this.penultimateRequest = true
        }
      }
      if (
        (!this.isExpress || (this.isExpress && this.searchRadius - 5 >= this.maxRadius)) &&
        fp_ids[aimObject.object_type][aimObject.ads_type] &&
        functional_purpose_analog[aimObject.func_purpose.id] in fp_ids[aimObject.object_type][aimObject.ads_type] &&
        this.iterationCounter > 3
      ) {
        this.stopRequests = true
        searchParams.func_purpose__in =
          fp_ids[aimObject.object_type][aimObject.ads_type][functional_purpose_analog[aimObject.func_purpose.id]].join(
            ',',
          )
      } else {
        searchParams.func_purpose = String(functional_purpose_analog[aimObject.func_purpose.id])
      }

      if (aimObject.ads_type === 'R') {
        searchParams.land_rights = 'TR'
      } else if (aimObject.ads_type === 'S') {
        searchParams.land_rights = 'O'
      }

      if (this.iterationCounter === 4) {
        delete searchParams.address_region
      }
      if (this.iterationCounter > 4) {
        delete searchParams.iteration
      }

      this.setRequestParams(searchParams)

      const deletedAnalogs = this.allDeletedAnalogs ? this.allDeletedAnalogs.map((item: aimType) => item.id) : []

      if (this.requestParams) {
        const data = await this.getAnalogs()
        if (this.searchRadius < this.maxRadius) {
          this.setSearchRadius(data.radius)
        }
        this.setAnalogsCount(data.rows_filtered)
        analogs = data.results
        const filtredAnalogs = analogs.filter((item: aimType) => !deletedAnalogs.includes(item.id))
        this.setAllAnalogs(analogs)
        this.setAnalogs(filtredAnalogs.slice(0, 50))
        await this.onRunCalculations()
      }
    },

    setFieldsWithValuesAccordingGuideArray(value: Array<string>) {
      this.fieldsWithValuesAccordingGuideArray = value
    },

    addFloorsToCalculationTable(floors: Array<string>) {
      if (floors.length > 0) {
        this.TRGroup = []
        this.TRGroup = floors.filter((item) => item.includes('TR') && item.length > 2)
        for (let i = 1; i < this.TRGroup.length + 1; i++) {
          if (!this.locationFloorArray.includes(`${THIRD_FLOOR_AND_ABOVE_LOCATION_COEFFICIENT}${i}`)) {
            this.locationFloorArray.push(`${THIRD_FLOOR_AND_ABOVE_LOCATION_COEFFICIENT}${i}`)
            this.addFloorOptions({
              value: `TR${i}`,
              display_name: '3 и выше',
              field: `${THIRD_FLOOR_AND_ABOVE_LOCATION_COEFFICIENT}${i}`,
            })
          }
        }
        console.log('addFloorsToCalculationTable this.locationFloorArray ', this.locationFloorArray)
      }
    },

    addFloorOptions(obj: floorOptionType) {
      this.floorOptions.push(cloneDeep(obj))
    },

    createRentCalculationObjectKey(field: string, arr: Array<number>) {
      this.rentCalculationObject[field] = arr
    },

    async setReferenceBooks() {
      this.referenceBooks = {}
      this.referenceBooksSelected = {}
      this.referenceBookSourceLists = {}
      const { referenceBooks, referenceBooksSelected, referenceBookSourceLists } = await useReferenceBooks()
      this.referenceBooks = cloneDeep(referenceBooks)
      this.referenceBooksSelected = cloneDeep(referenceBooksSelected)
      this.referenceBookSourceLists = cloneDeep(referenceBookSourceLists)

      console.log('this.referenceBooks ', this.referenceBooks)
    },

    setDefaultReferenceBooks() {
      Object.keys(this.referenceBooksSelected).forEach((fieldName) => {
        this.setDefaultReferenceBook(fieldName)
      })

      if (useAddFactorsArray() && useAddFactorsArray().length) {
        useAddFactorsArray().forEach((field: string) => {
          const referenceBooksSelectedObject: referenceBookSelectedType = {
            group: 0,
            book: 0,
            valueCol: 0,
            source: 'Ручное',
          }
          this.referenceBooksSelected[field] = cloneDeep(referenceBooksSelectedObject)
        })
      }
    },

    setHandDefaultReferenceBook(fieldName: string) {
      if (!this.adjustableFields.includes(fieldName)) return

      this.referenceBooksSelected[fieldName]['source'] = 'Ручное'
      this.referenceBooksSelected[fieldName]['valueCol'] = 0
      this.referenceBooksSelected[fieldName]['book'] = 0
      this.referenceBooksSelected[fieldName]['group'] = 0
    },

    setDefaultReferenceBook(fieldName: string) {
      const analogDate = new Date(this.aim.offer_date)
      let defaultSource = ''

      if (this.referenceBooks[fieldName]) {
        const currentField = this.aimModalFields.filter((item) => item.field === fieldName)[0]
        const sourceOptions = Array.from(useSourceOptions(fieldName))
        const sourcesSet = new Set(
          this.referenceBooks[fieldName].map((referenceBook: referenceBookType) => referenceBook.source),
        )
        const sourcesArray = [...sourcesSet]

        if (
          currentField.ref_book &&
          sourcesArray.includes(currentField.ref_book) &&
          fieldName !== WALLS_MATERIAL_ACCORDING_GUIDE
        ) {
          if (sourceOptions.length) {
            const option = sourceOptions.filter((item) => item.value === currentField.ref_book)[0]
            this.referenceBooksSelected[fieldName]['source'] = option ? option.value : sourceOptions[0].value
            this.referenceBooksSelected[fieldName]['group'] = useGroupsBySource(fieldName)[0][0]
            this.referenceBooksSelected[fieldName]['book'] = useBookBySource(fieldName)[0][0]
            this.referenceBooksSelected[fieldName]['valueCol'] = 0

            return
          }
          this.setHandDefaultReferenceBook(fieldName)
          return
        }

        if (
          currentField.ref_book &&
          !sourcesArray.includes(currentField.ref_book) &&
          fieldName !== WALLS_MATERIAL_ACCORDING_GUIDE
        ) {
          this.setHandDefaultReferenceBook(fieldName)
          return
        }

        if (fieldName === WALLS_MATERIAL_ACCORDING_GUIDE) {
          if (this.aim.walls_material === 'W' && sourcesArray.includes('Статриелт')) {
            this.referenceBooksSelected[fieldName]['source'] = 'Статриелт'
            this.referenceBooksSelected[fieldName]['group'] = useGroupsBySource(fieldName)[0][0]
            this.referenceBooksSelected[fieldName]['book'] = useBookBySource(fieldName)[0][0]
            this.referenceBooksSelected[fieldName]['valueCol'] = 0

            return
          }

          if (sourcesArray.includes('Лейфер')) {
            this.referenceBooksSelected[fieldName]['source'] = 'Лейфер'
            this.referenceBooksSelected[fieldName]['group'] = useGroupsBySource(fieldName)[0][0]
            this.referenceBooksSelected[fieldName]['book'] = useBookBySource(fieldName)[0][0]
            this.referenceBooksSelected[fieldName]['valueCol'] = 0

            return
          }

          this.setHandDefaultReferenceBook(fieldName)
          return
        }

        const filteredByDateGroups = []
        let nearestDate = new Date()
        let nearestDateGroupEntry: [number, referenceBookType] | [] = []

        for (const groupEntry of this.referenceBooks[fieldName].entries()) {
          const group = groupEntry[1]
          const dateBegin = new Date(group.date_begin)
          const dateEnd = new Date(group.date_end)
          if (dateBegin < analogDate && dateEnd > analogDate) {
            filteredByDateGroups.push(groupEntry)
            defaultSource = group.source
          }
          if (dateEnd < analogDate) {
            if (!nearestDate || nearestDate < dateEnd) {
              nearestDate = dateEnd
              nearestDateGroupEntry = groupEntry
              defaultSource = group.source
            }
          }
        }
        if (nearestDateGroupEntry.length) {
          filteredByDateGroups.push(nearestDateGroupEntry)
        }

        const filteredBySourceGroups = filteredByDateGroups.filter((groupEntry) => {
          const group = groupEntry[1]
          return group.source === defaultSource
        })
        let selectedGroup
        if (filteredBySourceGroups.length !== 0) {
          selectedGroup = filteredBySourceGroups[0][0]
        } else if (filteredByDateGroups.length !== 0) {
          selectedGroup = filteredByDateGroups[0][0]
        } else {
          selectedGroup = 0
        }
        this.referenceBooksSelected[fieldName]['group'] = selectedGroup

        const filteredByRegionBooks = []

        for (const bookEntry of this.referenceBooks[fieldName][selectedGroup].books.entries()) {
          const book = bookEntry[1]
          if (book.region === this.analogRegion) {
            filteredByRegionBooks.push(bookEntry)
          }
        }
        let selectedBook
        if (filteredByRegionBooks.length !== 0) {
          selectedBook = filteredByRegionBooks[0][0]
        } else {
          selectedBook = 0
        }
        this.referenceBooksSelected[fieldName]['book'] = selectedBook
        this.referenceBooksSelected[fieldName]['source'] = this.referenceBooks[fieldName][selectedGroup].source
        this.referenceBooksSelected[fieldName]['valueCol'] = 0

        const controlObj = useRegionOptions(fieldName).filter(
          (option) => option.display_name === this.aim.address_region?.name,
        )[0]
        if (controlObj) {
          this.referenceBooksSelected[fieldName]['book'] = controlObj.value
        }

        if (
          this.referenceBooks[fieldName][this.referenceBooksSelected[fieldName]['group'] ?? 0].books[
            this.referenceBooksSelected[fieldName]['book'] ?? 0
          ].region !== this.analogRegion &&
          this.referenceBooks[fieldName][this.referenceBooksSelected[fieldName]['group'] ?? 0].books[
            this.referenceBooksSelected[fieldName]['book'] ?? 0
          ].region !== 'Россия'
        ) {
          this.setHandDefaultReferenceBook(fieldName)
        }
      } else {
        this.setHandDefaultReferenceBook(fieldName)
      }
    },

    setObjects(value: Array<aimType>) {
      this.objects = value
      console.log('this.objects ', cloneDeep(this.objects))
    },

    initCorrections() {
      this.corrections = cloneDeep(useCorrection())
      const addFactorsArray = useAddFactorsArray()
      this.stageTwoTable
        .map((item) => item.fields)
        .forEach((fields) => {
          fields.forEach((field) => {
            if (!addFactorsArray?.includes(field) && Object.keys(this.referenceBooksSelected).includes(field)) {
              this.applyReferenceBook(field)
            }
          })
        })

      const filteredCorrectionsReferenceBooksSelected = useReferenceBooksSelectedObjects()
      Object.keys(filteredCorrectionsReferenceBooksSelected).forEach((field) => {
        this.referenceBooksSelected[field] = cloneDeep(filteredCorrectionsReferenceBooksSelected[field])
      })

      if (addFactorsArray && addFactorsArray.length) {
        addFactorsArray.forEach((field: string) => {
          this.corrections[field] = []
          this.adjustableFields.push(field)
          for (let i = 0; i < this.objects.length; i++) {
            this.corrections[field][i] = 0
          }
        })
      }
      this.notesObject = useNotesObject()
      this.notSavedOrderFiles = []
    },

    setCorrectionValue(field: string, index: number, value: number) {
      this.corrections[field][index] = value

      if (index > 0 && this.fieldsForCorrectionIntoAccountLandPlot.includes(field)) {
        this.setFieldsForCorrectionIntoAccountLandPlotCorrections(index - 1)
      }
      this.getResults()
    },

    applyReferenceBook(fieldName: string) {
      useApplyReferenceBook(fieldName)
    },

    setNewCorrections(fieldName: string) {
      const { group: groupNum, book: bookNum, valueCol: valueType, source } = this.referenceBooksSelected[fieldName]

      if (groupNum === null || bookNum === null || source === 'Ручное' || source === null || valueType === null) {
        return
      }

      const book = this.referenceBooks[fieldName][groupNum].books[bookNum].json_data

      const formula = useReferenceBookGroupListFormula(source, groupNum, fieldName).trim()
      let apprRow

      if (formula && formula !== 'None') {
        apprRow = book.find((row) => {
          return row[0] === this.funcAppointment
        })

        if (apprRow) {
          for (let index = 0; index < this.objects.length; index++) {
            const targetField =
              index > 0 ? useAnalogValue(this.currentAnalogs[index - 1], fieldName) : useAimValue(fieldName)
            const formulaString = getFormulaString(
              formula,
              book[book.length === 2 ? 0 : 1],
              apprRow,
              targetField,
              valueType,
            )

            if (formulaString) {
              this.corrections[fieldName][index] = Number(convertStringToNumber(targetField)) ? calculateString(formulaString) : 0
            }
          }
        }

        if ((!this.isMarketAnalysis || this.isExpress) && this.hasCorrectionsFields.includes(fieldName)) {
          this.updateCurrentPrices(fieldName)
        }

        return
      }

      if (this.aim.object_type !== 'L' && fieldName === TERMS_OF_SALE && source === 'Лейфер') {
        const realtyClassObj = this.aimModalFields.filter((item) => item.field === 'realty_class')[0]
        for (let index = 0; index < this.objects.length; index++) {
          const targetField =
            index > 0 ? useAnalogValue(this.currentAnalogs[index - 1], fieldName) : useAimValue(fieldName)
          const realtyClass = getNewDisplayName(
            realtyClassObj.choices.filter((item: Record<string, any>) => item.value === this.aim.realty_class)[0]
              ?.display_name,
          )

          const isThreeSelectionCriteria =
            this.aim.func_purpose.name === 'Офисное' || this.aim.func_purpose.name === 'Торговое'

          apprRow = book.find((row) => {
            return isThreeSelectionCriteria
              ? row[0] === this.funcAppointment &&
                  row[1] === targetField &&
                  row[2] === realtyClass &&
                  row[3] === this.defaultMarketType
              : row[0] === this.funcAppointment && row[1] === targetField && row[2] === this.defaultMarketType
          })

          if (apprRow && apprRow[0 + valueType]) {
            if (index === 0) continue
            this.corrections[fieldName][index] = isThreeSelectionCriteria
              ? Number(apprRow[4 + valueType]) * 100
              : Number(apprRow[3 + valueType]) * 100
          } else {
            if (index === 0) continue
            this.corrections[fieldName][index] = 0
          }
        }

        if (!this.isMarketAnalysis || this.isExpress) {
          this.updateCurrentPrices(fieldName)
        }

        return
      }

      for (let index = 0; index < this.objects.length; index++) {
        const targetField =
          index > 0 ? useAnalogValue(this.currentAnalogs[index - 1], fieldName) : useAimValue(fieldName)
        apprRow = book.find((row) => {
          if (this.isIntervalUsedForCalculations(source, groupNum, fieldName)) {
            return (
              row[0] === this.funcAppointment && isDesiredRange(row[1].toString(), convertStringToNumber(targetField))
            )
          }
          return row[0] === this.funcAppointment && row[1] === targetField
        })

        if (apprRow && apprRow[0 + valueType]) {
          if (fieldName === TERMS_OF_SALE && index === 0) continue
          const valueTypeIndex = fieldName === TERMS_OF_SALE && source === 'Лейфер' ? valueType + 1 : valueType
          this.corrections[fieldName][index] =
            fieldName === TERMS_OF_SALE ? Number(apprRow[2 + valueTypeIndex]) * 100 : Number(apprRow[2 + valueType])
        } else {
          if (fieldName === TERMS_OF_SALE && index === 0) continue
          this.corrections[fieldName][index] = 0
        }
      }
      if ((!this.isMarketAnalysis || this.isExpress) && this.hasCorrectionsFields.includes(fieldName)) {
        this.updateCurrentPrices(fieldName)
      }
    },

    updateCurrentPrices(fieldName: string) {
      for (let i = 0; i < this.currentAnalogs.length; i++) {
        this.setCurrentPrice(i, fieldName)
      }
    },

    setNewLocationFloorCorrections() {
      const { group: groupNum, book: bookNum, valueCol: valueType, source } = this.referenceBooksSelected.floor_number
      if (groupNum === null || bookNum === null || source === 'Ручное' || source === null || valueType === null) {
        return
      }

      const book = this.referenceBooks.floor_number[groupNum].books[bookNum].json_data
      const formula = useReferenceBookGroupListFormula(source, groupNum, this.locationFloorArray[0]).trim()
      const formulaCache = new Map()

      this.floorOptions.forEach((item) => {
        let displayName = item.display_name.replace(' этаж', '')

        let formulaString = formulaCache.get(displayName)

        if (!formulaString && formula && formula !== 'None') {
          const apprRow = book.find((row) => row[0] === this.funcAppointment)
          if (apprRow) {
            formulaString = getFormulaString(
              formula,
              book[book.length === 2 ? 1 : 2],
              apprRow,
              item.display_name,
              valueType,
            )
            formulaCache.set(displayName, formulaString)
          }
        }

        if (!formulaString) {
          const apprRow = book.find(
            (row) =>
              row[0] === this.funcAppointment &&
              row[1].toString().toLowerCase().replace(/\s+/g, ' ') === displayName.toLowerCase().replace(/\s+/g, ' '),
          )

          if (apprRow && apprRow[2 + valueType]) {
            for (let index = 0; index < this.objects.length; index++) {
              this.corrections[item.field][index] = Number(apprRow[2 + valueType])
            }
          }
        } else {
          for (let index = 0; index < this.objects.length; index++) {
            this.corrections[item.field][index] = calculateString(formulaString)
          }
        }
      })
    },

    setNewPublicUtilitiesAndOperatingCostsCorrections(fieldName: string) {
      const { group: groupNum, book: bookNum, valueCol: valueType, source } = this.referenceBooksSelected[fieldName]
      if (groupNum === null || bookNum === null || source === 'Ручное' || source === null || valueType === null) {
        this.sortThroughRentCalculationArray()
        return
      }

      const book = this.referenceBooks[fieldName][groupNum].books[bookNum].json_data
      const formula = useReferenceBookGroupListFormula(source, groupNum, fieldName).trim()

      const calculatedArray = [...this.utilitiesArray.slice(1), ...this.operatingCostsArray.slice(1)]
      const calculatedObject: Record<string, string> = { ...utilitiesFields, ...operatingCostsFields }

      const apprRowCache: Record<string, any> = {}

      calculatedArray.forEach((item) => {
        if (!formula || formula === 'None') {
          apprRowCache[item] = book.find((row) => row[0] === this.funcAppointment && row[1] === calculatedObject[item])
        } else {
          apprRowCache[item] = book.find((row) => row[0] === this.funcAppointment)
        }
      })

      calculatedArray.forEach((item) => {
        const apprRow = apprRowCache[item]

        for (let index = 0; index < this.objects.length; index++) {
          if (formula && formula !== 'None') {
            if (apprRow) {
              this.corrections[item][index] = calculateString(
                getFormulaString(formula, book[book.length === 2 ? 1 : 2], apprRow, item, valueType),
              )
            } else {
              this.corrections[item][index] = 1
            }
          } else {
            if (apprRow && apprRow[0 + valueType]) {
              this.corrections[item][index] = Number(apprRow[2 + valueType])
            } else {
              this.corrections[item][index] = 0
            }
          }
        }
      })

      this.objects.forEach((_, index) => {
        this.corrections.operating_costs[index] = +this.operatingCostsArray
          .slice(1)
          .reduce((sum, item) => {
            return sum + this.corrections[item][index]
          }, 0)
          .toFixed(3)

        this.corrections.utilities[index] = +this.utilitiesArray
          .slice(1)
          .reduce((sum, item) => {
            return sum + this.corrections[item][index]
          }, 0)
          .toFixed(3)
      })

      this.sortThroughRentCalculationArray()
    },

    sortThroughRentCalculationArray() {
      if (!this.isMarketAnalysis && !this.isExpress) {
        for (let i = 0; i < this.selectedAnalogs.length; i++) {
          rentCalculationArray.forEach((field) => {
            this.setRentCalculation(field, i)
          })
        }
      }
    },

    setEngineeringCommunicationCorrections(fieldName: string) {
      const { group: groupNum, book: bookNum, valueCol: valueType, source } = this.referenceBooksSelected[fieldName]
      if (groupNum === null || bookNum === null || source === 'Ручное' || source === null || valueType === null) {
        return
      }

      const book = this.referenceBooks[fieldName][groupNum].books[bookNum].json_data
      const formula = useReferenceBookGroupListFormula(source, groupNum, fieldName).trim()

      const calculatedArray = this.engineeringCommunicationArray.slice(1)
      const calculatedObject = cloneDeep(this.engineeringCommunicationObject)

      let apprRowCache = new Map()

      for (let item of calculatedArray) {
        let apprRow: any = null

        if (formula && formula !== 'None') {
          if (!apprRowCache.has(this.funcAppointment)) {
            apprRow = book.find((row) => row[0] === this.funcAppointment)
            apprRowCache.set(this.funcAppointment, apprRow)
          } else {
            apprRow = apprRowCache.get(this.funcAppointment)
          }

          if (apprRow) {
            const formulaString = getFormulaString(formula, book[book.length === 2 ? 1 : 2], apprRow, item, valueType)
            for (let index = 0; index < this.objects.length; index++) {
              this.corrections[item][index] = calculateString(formulaString)
            }
          } else {
            for (let index = 0; index < this.objects.length; index++) {
              this.corrections[item][index] = 1
            }
          }
        } else {
          for (let index = 0; index < this.objects.length; index++) {
            const controlArray =
              index === 0
                ? useAimEngineeringCommunicationList()
                : useAnalogEngineeringCommunicationList(this.currentAnalogs[index - 1])

            const isAvailable = controlArray.includes(calculatedObject[item]) ? 'Есть' : 'Нет'

            const cacheKey = `${this.funcAppointment}-${calculatedObject[item]}-${isAvailable}`
            if (!apprRowCache.has(cacheKey)) {
              apprRow = book.find(
                (row) => row[0] === this.funcAppointment && row[1] === calculatedObject[item] && row[2] === isAvailable,
              )
              apprRowCache.set(cacheKey, apprRow)
            } else {
              apprRow = apprRowCache.get(cacheKey)
            }

            if (apprRow && apprRow[3 + valueType]) {
              this.corrections[item][index] = Number(apprRow[3 + valueType])
            } else {
              this.corrections[item][index] = 0
            }
          }
        }
      }
    },

    applyReferenceBookToFieldsWithValuesAccordingGuide(value: string, field: string, counter: number) {
      const { group: groupNum, book: bookNum, valueCol: valueType, source } = this.referenceBooksSelected[field]
      if (source !== 'Лейфер') {
        if (counter === 0 && !this.aim[field]) {
          this.corrections[field][counter] = 0
          return
        }
        if (counter > 0 && !this.selectedAnalogs[counter - 1][field.replace(ACCORDING_GUIDE, '')]) {
          this.corrections[field][counter] = 0
          return
        }
      }

      if (
        groupNum === null ||
        bookNum === null ||
        source === 'Ручное' ||
        !this.referenceBooks[field].length ||
        source === null ||
        valueType === null
      ) {
        return
      }

      const book = this.referenceBooks[field][groupNum].books[bookNum].json_data
      const controlValue =
        this.referenceBooks[field][groupNum].type_data === 'M'
          ? this.fieldsWithValuesAccordingGuideValues[field][0]
          : value

      const apprRow = book.find((row) => {
        return row[0] === this.funcAppointment && row[1] === controlValue
      })

      if (this.referenceBooks[field][groupNum].type_data === 'M' && apprRow) {
        const index = book[1].findIndex((item) => item === value)
        if (index === -1) {
          this.corrections[field][counter] = 0
          if (!this.isOnRunCalculations) {
            this.getResults()
          }
          return
        }
        this.corrections[field][counter] = Number(apprRow[index])
        this.fieldsWithValuesAccordingGuideValues[field][counter] = value
        if (!this.isOnRunCalculations) {
          this.getResults()
        }
        return
      }

      if (apprRow && apprRow[0 + valueType]) {
        this.corrections[field][counter] = Number(apprRow[2 + valueType])
        this.fieldsWithValuesAccordingGuideValues[field][counter] = value
        if (!this.isOnRunCalculations) {
          this.getResults()
        }
        return
      }
      this.corrections[field][counter] = 0
      if (!this.isOnRunCalculations) {
        this.getResults()
      }
    },

    setDefaultMarketType(value: string | number) {
      this.defaultMarketType = value.toString()
    },

    isIntervalUsedForCalculations(source: string, group: number, field: string) {
      if (
        source === 'Ручное' ||
        (this.locationFloorArray.includes(field) && field !== FLOOR_NUMBER) ||
        (this.utilitiesArray.includes(field) && field !== UTILITIES) ||
        this.operatingCostsArray.includes(field) ||
        !useDateOptions(field).filter((item: Record<string, any>) => item.value === group)[0]
      )
        return false
      const dateBook = useDateOptions(field).filter((item: Record<string, any>) => item.value === group)[0].display_name
      const obj = this.referenceBooks[field]
        .filter((item) => item.source === source)
        .filter((item) => item.date_book.slice(0, 10).split('-').reverse().join('.') === dateBook)[0]

      return obj.type_data === 'P'
    },

    updateFieldsWithValuesAccordingGuideValuesField(field: string, value: string | number | null, index: number) {
      if (value && typeof value === 'string') {
        this.fieldsWithValuesAccordingGuideValues[field][index] = value
      }
    },

    updateAdjustedCostValueArray(index: number, value: number | string) {
      this.adjustedCostValueArray[index] = value
    },

    setAimFieldNewValue(field: string, value: any) {
      this.aim[field] = value
    },

    updateAnalogueObjectWeightArray(index: number, value: number | string) {
      this.analogueObjectWeightArray[index] = value
    },

    setDeletedAnalogs(value: Array<aimType>) {
      this.allDeletedAnalogs = value
    },

    // deleteAnalog(index: number) {
    //   this.currentAnalogs.splice(index, 1)
    //   Object.keys(this.corrections).forEach((field) => this.corrections[field].splice(index + 1, 1))
    // },

    deletePrice(index: number) {
      this.newPrices.splice(index, 1)
    },

    deleteAnalogs(indexesArr: Array<number>) {
      if (indexesArr.length) {
        indexesArr.sort((a, b) => b - a)
        const deletedAnalogs = []
        for (const i of indexesArr) {
          const deletedAnalog = this.currentAnalogs[i]
          deletedAnalogs.push({ ...deletedAnalog })

          this.currentAnalogs.splice(i, 1)
          if (this.isExpress) {
            for (const field in this.corrections) {
              this.corrections[field].splice(i + 1, 1)
            }
            this.deletePrice(i)
          }
        }

        this.allDeletedAnalogs.push(...deletedAnalogs)
      }
    },

    updateRentCalculationObjectField(field: string, counter: number, value: number | string) {
      this.rentCalculationObject[field][counter] = value
    },

    quantileSeqEvaluation(data: Array<number>) {
      const getStandardDeviation = (dataArr: Array<number>) => std(dataArr)
      //Заданная вероятность
      const specifiedProbability = 0.8

      // Уровень значимости
      // const significanceLevel = 1 - specifiedProbability

      // t-критерий
      const inverseErrorFunction = (p: number) => {
        return Math.sqrt(2) * erf(2 * p - 1)
      }
      const tCriterion = -inverseErrorFunction((1 - specifiedProbability) / 2)

      // Функция для определения выбросов через распределение Стьюдента
      const detectOutliers = (dataArr: Array<number>) => {
        const meanValue = mean(dataArr)
        const sd = getStandardDeviation(dataArr)

        // Нижняя граница
        const bottomLine = meanValue - Number(sd) * tCriterion
        // Верхняя граница
        const topLine = meanValue + Number(sd) * tCriterion

        const q1 = quantileSeq(data, 0.25)
        const q3 = quantileSeq(data, 0.75)
        this.qs = Number(q3) - Number(q1)

        // Определение границ для определения выбросов
        const lowerBound = Number(q1) - 1.5 * this.qs
        const upperBound = Number(q3) + 1.5 * this.qs

        const minLimit = bottomLine > lowerBound ? bottomLine : lowerBound
        const maxLimit = topLine < upperBound ? topLine : upperBound

        const outliers = []

        for (let i = 0; i < dataArr.length; i++) {
          if (dataArr[i] < minLimit || dataArr[i] > maxLimit) {
            outliers.push(dataArr[i])
          }
        }
        return outliers
      }
      this.outliers = detectOutliers(data)
    },

    async getOrders(realty_id: string | string[]) {
      await $http
        .get(api_orders, { params: { realty_id } })
        .then((res: any) => {
          this.orders = res._data
          this.orderFiles = res._data.files
          return
        })
        .catch((err: any) => console.log(err))
    },

    async getNewAnalogs() {
      console.log('getNewAnalogs()')
      this.aim.date_calc = this.aim.date_calc.split('T')[0]
      this.iterationCounter = this.iterationCounter + 1

      if (
        (this.iterationCounter <= 4 && this.isMarketAnalysis) ||
        (this.isExpress && this.searchRadius < this.maxRadius + 5 && !this.stopRequests && !this.penultimateRequest) ||
        (this.isExpress &&
          this.penultimateRequest &&
          !this.stopRequests &&
          fp_ids[this.aim.object_type][this.aim.ads_type] &&
          functional_purpose_analog[this.aim.func_purpose.id] in fp_ids[this.aim.object_type][this.aim.ads_type])
      ) {
        await this.getNewAnalogsSearchParams()
      } else {
        // await this.getFullAnalogs()
        this.offIsShowStub()
        this.iterationCounter = 1
        if (isEmpty(this.analogs)) {
          this.setAnalogsCount(0)
        }
        this.stopRequests = false
        console.log('final analogs ', this.analogs)
      }
    },

    updateIsMarketAnalysis(bool: boolean) {
      this.isMarketAnalysis = bool
    },

    setRentCalculation(field: string, counter: number) {
      const allRentFields: Array<string> = this.utilitiesArray
        .concat(this.operatingCostsArray)
        .filter((item: string) => item !== UTILITIES && item !== 'operating_costs')
      const sumArr: Array<number> = []

      switch (field) {
        case 'gross_rent_per_m':
          if (!this.adjustableFields.includes(UTILITIES)) {
            this.updateRentCalculationObjectField(field, counter, this.newPrices[counter][0])

            break
          }

          allRentFields.forEach((item) => {
            if (this.currentAnalogs[counter][item] === 'NI') {
              sumArr.push(this.corrections[item][counter + 1])
            }
          })

          this.updateRentCalculationObjectField(
            field,
            counter,
            Number(this.newPrices[counter][0]) / (1 - sumArr.reduce((sum, current) => sum + current, 0)),
          )

          break

        case 'utilities_and_operating_costs_in_rent':
          if (!this.adjustableFields.includes(UTILITIES)) {
            this.updateRentCalculationObjectField(field, counter, this.rentCalculationObject.gross_rent_per_m[counter])
            break
          }

          allRentFields.forEach((item) => {
            if (this.currentAnalogs[counter][item] === 'I') {
              sumArr.push(this.corrections[item][counter + 1])
            }
          })

          this.updateRentCalculationObjectField(
            field,
            counter,
            Number(this.rentCalculationObject.gross_rent_per_m[counter]) *
              sumArr.reduce((sum, current) => sum + current, 0),
          )
          break

        default:
          if ((this.isExpress && isEmpty(this.order)) || !this.adjustableFields.includes(UTILITIES)) {
            break
          }

          this.rentCalculationObject[field][counter] =
            Number(this.currentAnalogs[counter].price_sale_per_m) -
            Number(this.rentCalculationObject.utilities_and_operating_costs_in_rent[counter])
          for (let i = 1; i < this.newPrices[counter].length; i++) {
            this.newPrices[counter][i] = this.rentCalculationObject[field][counter]
          }
      }
    },

    setAimPath(route: aimPathType) {
      this.aimPath = route
    },

    parseFloorResult(obj: floorNumberType, index?: undefined | number) {
      const opt = []

      let objectArea = typeof index === 'undefined' ? this.aim.object_area : this.currentAnalogs[index].object_area

      if (this.isExpress && isEqual(cloneDeep(this.aim.floor_number), cloneDeep(obj))) {
        objectArea = this.aim.object_area
      }

      let TRcumulative = 0
      for (const key in obj) {
        if (key.includes('TR')) {
          TRcumulative = TRcumulative + obj[key].area
        }

        if (!key.includes('TR')) {
          opt.push({
            display_name: this.floorOptions.filter((item) => item.value === key)[0].display_name,
            value: obj[key].area,
          })
        }
      }

      if (TRcumulative) {
        opt.push({ display_name: '3 и выше', value: TRcumulative })
      }

      const result: Array<string> = []

      opt.forEach((item) => {
        return result.push(item.display_name + ' (' + ((item.value / objectArea) * 100).toFixed(2) + '%' + ')')
      })

      return result.join(', ')
    },

    setNewSelectedAnalog(index: number, value: aimType) {
      this.selectedAnalogs[index] = cloneDeep(value)
    },

    async getSelectedAnalogs() {
      for (let i = 0; i < this.selectedAnalogs.length; i++) {
        if (Object.keys(this.selectedAnalogs[i]).length < Object.keys(this.aim).length) {
          const data = await $http
            .get(getSelectedAnalogsUrl(this.selectedAnalogs[i].id))
            .then((res: Record<string, any>) => res._data)
          this.setNewSelectedAnalog(i, data)
        }
      }
    },

    getFieldName(field: string) {
      const fieldObject = this.aimModalFields.find((item: any) => item.field === field)
      return fieldObject ? fieldObject.label : field
    },

    getObjectFieldName(object: any, field: string, index?: undefined | number) {
      const fieldOptions = this.aimModalFields.find((item: any) => item.name === field)
      let result = ''
      if (field === FLOOR_NUMBER) {
        if (!!object[field]) {
          result = this.parseFloorResult(object[field], index)
        }
        return result
      }

      if (fieldOptions?.field_type === 'choice') {
        result = fieldOptions.choices.find((item: any) => item.value === object[field])?.display_name
      } else if (field === FUNC_PURPOSE) {
        result = object[field].name
      } else if ([PRICE_SALE, PRICE_SALE_PER_M].includes(field)) {
        if (typeof index !== 'number') {
          result = '—'
        } else {
          result = numberWithSpaces(object[field])
        }
      } else {
        result = object[field]
      }

      return result
    },

    setFieldForCorrection(field: string) {
      this.fieldForCorrection = field
    },

    setReferenceBooksSelectedFieldValue(
      fieldName: string,
      property: 'book' | 'group' | 'source' | 'valueCol',
      value: any,
    ) {
      this.referenceBooksSelected[fieldName][property] = value
    },

    callApplyReferenceBookToFieldsWithValuesAccordingGuide(field: string) {
      if (!this.adjustableFields.includes(field)) return

      this.applyReferenceBookToFieldsWithValuesAccordingGuide(
        useDefaultAimValueForFieldWithValuesAccordingGuide(field),
        field,
        0,
      )
      this.currentAnalogs.forEach((item, index) => {
        this.applyReferenceBookToFieldsWithValuesAccordingGuide(
          useDefaultAnalogValueForFieldWithValuesAccordingGuide(item, field),
          field,
          index + 1,
        )
      })
    },

    updatePricesArray() {
      if (this.getFirstGroupFields().includes(this.fieldForCorrection)) {
        for (let i = 0; i < this.currentAnalogs.length; i++) {
          this.setCurrentPrice(i, this.fieldForCorrection)
        }
      }
    },

    inputSource(event: string) {
      if (
        !this.locationFloorArray.includes(this.fieldForCorrection) ||
        !this.utilitiesArray.includes(this.fieldForCorrection) ||
        !this.operatingCostsArray.includes(this.fieldForCorrection) ||
        this.fieldForCorrection === FLOOR_NUMBER ||
        this.fieldForCorrection === UTILITIES
      ) {
        this.setReferenceBooksSelectedFieldValue(this.fieldForCorrection, 'source', event)

        if (this.fieldsWithValuesAccordingGuideArray.includes(this.fieldForCorrection)) {
          this.setAimFieldNewValue(this.fieldForCorrection, '')
          this.setAimFieldNewValue(
            this.fieldForCorrection,
            useDefaultAimValueForFieldWithValuesAccordingGuide(this.fieldForCorrection),
          )
          for (let i = 0; i < this.currentAnalogs.length; i++) {
            this.setAnalogNewValue(i, this.fieldForCorrection, '')
            this.setAnalogNewValue(
              i,
              this.fieldForCorrection,
              useDefaultAnalogValueForFieldWithValuesAccordingGuide(this.currentAnalogs[i], this.fieldForCorrection),
            )
          }
        }

        const groupBySource = useGroupsBySource(this.fieldForCorrection).length
          ? useGroupsBySource(this.fieldForCorrection)[0][0]
          : 0

        this.setReferenceBooksSelectedFieldValue(this.fieldForCorrection, 'group', groupBySource)

        const bookBySource = useGroupsBySource(this.fieldForCorrection).length
          ? useBookBySource(this.fieldForCorrection)[0][0]
          : 0
        this.setReferenceBooksSelectedFieldValue(this.fieldForCorrection, 'book', bookBySource)

        this.fieldsWithValuesAccordingGuideArray.includes(this.fieldForCorrection)
          ? this.callApplyReferenceBookToFieldsWithValuesAccordingGuide(this.fieldForCorrection)
          : this.applyReferenceBook(this.fieldForCorrection)
      }
      this.updateCurrentPrices(this.fieldForCorrection)
    },

    inputDate(event: string) {
      if (
        !this.locationFloorArray.includes(this.fieldForCorrection) ||
        !this.utilitiesArray.includes(this.fieldForCorrection) ||
        !this.operatingCostsArray.includes(this.fieldForCorrection) ||
        this.fieldForCorrection === FLOOR_NUMBER ||
        this.fieldForCorrection === UTILITIES
      ) {
        this.setReferenceBooksSelectedFieldValue(this.fieldForCorrection, 'group', event)
        const bookBySource = useGroupsBySource(this.fieldForCorrection).length
          ? useBookBySource(this.fieldForCorrection)[0][0]
          : 0
        this.setReferenceBooksSelectedFieldValue(this.fieldForCorrection, 'book', bookBySource)

        if (this.fieldForCorrection === TERMS_OF_SALE && useIsShowMarketTypeSelect()) {
          const options = useMarketTypeOptions(this.fieldForCorrection)
          if (!Object.keys(options).includes(this.defaultMarketType)) {
            this.setDefaultMarketType(options[0].value)
          }
        }

        // if (this.fieldForCorrection === 'land_permitted_use') {
        //   this.clearLandPermittedGroups()
        // } else {
        //   this.fieldsWithValuesAccordingGuideArray.includes(this.fieldForCorrection)
        //     ? this.callApplyReferenceBookToFieldsWithValuesAccordingGuide(this.fieldForCorrection)
        //     : this.applyReferenceBook(this.fieldForCorrection)
        // }
        this.fieldsWithValuesAccordingGuideArray.includes(this.fieldForCorrection)
          ? this.callApplyReferenceBookToFieldsWithValuesAccordingGuide(this.fieldForCorrection)
          : this.applyReferenceBook(this.fieldForCorrection)

        this.updatePricesArray()
      }
    },

    inputRegion(event: string) {
      if (
        !this.locationFloorArray.includes(this.fieldForCorrection) ||
        !this.utilitiesArray.includes(this.fieldForCorrection) ||
        !this.operatingCostsArray.includes(this.fieldForCorrection) ||
        this.fieldForCorrection === FLOOR_NUMBER ||
        this.fieldForCorrection === UTILITIES
      ) {
        const groupBySource = useGroupsBySource(this.fieldForCorrection).length
          ? this.referenceBooksSelected[this.fieldForCorrection].group
          : 0
        this.setReferenceBooksSelectedFieldValue(this.fieldForCorrection, 'group', groupBySource)
        this.setReferenceBooksSelectedFieldValue(this.fieldForCorrection, 'book', event)

        if (this.fieldForCorrection === TERMS_OF_SALE && useIsShowMarketTypeSelect()) {
          const options = useMarketTypeOptions(this.fieldForCorrection)
          if (!Object.keys(options).includes(this.defaultMarketType)) {
            this.setDefaultMarketType(options[0].value)
          }
        }

        // if (this.fieldForCorrection === 'land_permitted_use') {
        //   this.clearLandPermittedGroups()
        // } else {
        //   this.fieldsWithValuesAccordingGuideArray.includes(this.fieldForCorrection)
        //     ? this.callApplyReferenceBookToFieldsWithValuesAccordingGuide(this.fieldForCorrection)
        //     : this.applyReferenceBook(this.fieldForCorrection)
        // }
        this.fieldsWithValuesAccordingGuideArray.includes(this.fieldForCorrection)
          ? this.callApplyReferenceBookToFieldsWithValuesAccordingGuide(this.fieldForCorrection)
          : this.applyReferenceBook(this.fieldForCorrection)

        this.updatePricesArray()
      }
    },

    inputValueCol(event: string) {
      if (
        !this.locationFloorArray.includes(this.fieldForCorrection) ||
        !this.utilitiesArray.includes(this.fieldForCorrection) ||
        !this.operatingCostsArray.includes(this.fieldForCorrection) ||
        this.fieldForCorrection === FLOOR_NUMBER ||
        this.fieldForCorrection === UTILITIES
      ) {
        const groupBySource = useGroupsBySource(this.fieldForCorrection).length
          ? useGroupsBySource(this.fieldForCorrection)[0][0]
          : 0
        this.setReferenceBooksSelectedFieldValue(this.fieldForCorrection, 'group', groupBySource)

        const bookBySource = useGroupsBySource(this.fieldForCorrection).length
          ? this.referenceBooksSelected[this.fieldForCorrection].book
          : 0
        this.setReferenceBooksSelectedFieldValue(this.fieldForCorrection, 'book', bookBySource)
        this.setReferenceBooksSelectedFieldValue(this.fieldForCorrection, 'valueCol', event)

        this.fieldsWithValuesAccordingGuideArray.includes(this.fieldForCorrection)
          ? this.callApplyReferenceBookToFieldsWithValuesAccordingGuide(this.fieldForCorrection)
          : this.applyReferenceBook(this.fieldForCorrection)

        this.updatePricesArray()
      }
    },

    inputMarketType(event: string) {
      if (this.fieldForCorrection !== TERMS_OF_SALE) {
        return
      }
      this.setDefaultMarketType(event)
      this.applyReferenceBook(this.fieldForCorrection)
      this.updatePricesArray()
    },

    getTotalRentLabelString(obj: Record<string, any>) {
      let resultString = totalRentLabelComponents.label

      Object.keys(obj).forEach((item) => {
        resultString += ', ' + `${totalRentLabelComponents[item][obj[item]]}`
      })

      return resultString
    },

    getFinalTotalRentOptions(obj: Record<string, string>) {
      return useFinalTotalRentOptions(obj)
    },

    getPaymentForTheRightToUse() {
      return this.weightedAverageCost !== 'Ошибка!'
        ? numberWithSpaces(
            (
              ((+this.weightedAverageCost * 12 * useAimValue(OBJECT_AREA)) / (1 + VATConst) / 365) *
              diffDates(this.aim.enrichment_end, this.aim.enrichment_begin)
            ).toFixed(2),
          )
        : this.weightedAverageCost
    },

    updateAdjustableFields(field: string) {
      if (
        this.activeTabIndex !== 0 &&
        this.fieldsWithValuesAccordingGuideArray.includes(`${field}${ACCORDING_GUIDE}`) &&
        this.adjustableFields.includes(`${field}${ACCORDING_GUIDE}`)
      ) {
        const index = this.adjustableFields.indexOf(`${field}${ACCORDING_GUIDE}`)
        this.adjustableFields.splice(index, 1)
        for (let i = 0; i < this.corrections[`${field}${ACCORDING_GUIDE}`].length; i++) {
          this.corrections[`${field}${ACCORDING_GUIDE}`][i] = 0
        }
        return
      }

      if (
        this.activeTabIndex !== 0 &&
        this.fieldsWithValuesAccordingGuideArray.includes(`${field}${ACCORDING_GUIDE}`) &&
        !this.adjustableFields.includes(`${field}${ACCORDING_GUIDE}`)
      ) {
        this.adjustableFields.push(`${field}${ACCORDING_GUIDE}`)
        if (!isEmpty(this.order)) {
          this.referenceBooksSelected[`${field}${ACCORDING_GUIDE}`] = cloneDeep(
            this.order.calc_source.referenceBooksSelected[`${field}${ACCORDING_GUIDE}`],
          )
          this.corrections[`${field}${ACCORDING_GUIDE}`] = cloneDeep(
            this.order.calc_source.corrections[`${field}${ACCORDING_GUIDE}`],
          )
          this.fieldsWithValuesAccordingGuideValues[`${field}${ACCORDING_GUIDE}`] = cloneDeep(
            this.order.calc_source.fieldsWithValuesAccordingGuideValues[`${field}${ACCORDING_GUIDE}`],
          )
          return
        }

        this.setDefaultReferenceBook(`${field}${ACCORDING_GUIDE}`)
        this.callApplyReferenceBookToFieldsWithValuesAccordingGuide(`${field}${ACCORDING_GUIDE}`)
        return
      }

      if (this.adjustableFields.includes(field)) {
        const index = this.adjustableFields.indexOf(field)
        this.adjustableFields.splice(index, 1)

        if (this.activeTabIndex !== 0) {
          this.applyReferenceBook(field)
        }

        return
      }

      this.adjustableFields.push(field)
      if (this.activeTabIndex !== 0) {
        if (!isEmpty(this.order) && this.order?.source.activeTabIndex !== 0) {
          this.referenceBooksSelected[field] = cloneDeep(this.order.calc_source.referenceBooksSelected[field])
          this.corrections[field] = cloneDeep(this.order.calc_source.corrections[field])
          return
        }
        this.applyReferenceBook(field)
      }
    },

    setNoteObjectField(text: string) {
      if (!this.fieldForCorrection) return

      this.notesObject[this.fieldForCorrection] = text
    },

    increaseActiveTabindex() {
      this.activeTabIndex += 1
    },

    decreaseActiveTabindex() {
      this.activeTabIndex -= 1
      if (this.activeTabIndex === 0) {
        this.initAdjustableFields()
      }
    },

    setActiveTabIndex(num: number) {
      this.activeTabIndex = num
      if (this.activeTabIndex === 0) {
        this.initAdjustableFields()
      }
    },

    async collectOrderForSave() {
      const referenceBookSourceLists: Record<string, string[]> = {}
      for (let key in this.referenceBookSourceLists) {
        referenceBookSourceLists[key] = Array.from(this.referenceBookSourceLists[key])
      }
      const auth = useAuth()
      if (!this.finalTableArr.length) {
        this.getFinalTableArr()
      }
      if (this.orderName) {
        this.getOrderName()
      }
      this.aim.tz_number = this.aimTzNumber
      return {
        source: {
          aim: cloneDeep(this.aim),
          aimModalFields: cloneDeep(this.aimModalFields),
          adsType: this.adsType,
          analogs: this.isAllAnalogsInSelection
            ? cloneDeep(this.analogs.concat(this.selectedAnalogs))
            : cloneDeep(this.analogs),
          selectedAnalogs: cloneDeep(this.selectedAnalogs),
          currentAnalogs: cloneDeep(this.currentAnalogs),
          objects: this.objects,
          defaultMarketType: this.defaultMarketType,
          activeTabIndex: this.activeTabIndex,
          orderUpdated: new Date().toISOString(),
          updatedBy: auth.user,
          funcAppointment: this.funcAppointment,
          evaluationsStagesTabs: this.evaluationsStagesTabs,
        },
        calc_source: {
          notesObject: this.notesObject,
          corrections: this.corrections,
          referenceBooks: cloneDeep(this.referenceBooks),
          referenceBooksSelected: cloneDeep(this.referenceBooksSelected),
          referenceBookSourceLists: referenceBookSourceLists,
          hasCorrectionsFields: this.hasCorrectionsFields,
          newPrices: cloneDeep(this.newPrices),
          floorOptions: cloneDeep(this.floorOptions),
          rentCalculationObject: cloneDeep(this.rentCalculationObject),
          engineeringCommunicationObject: cloneDeep(this.engineeringCommunicationObject),
          isFieldWithValuesAccordingGuideListOpen: cloneDeep(this.isFieldWithValuesAccordingGuideListOpen),
          isCorrectionBlockMenuListOpen: cloneDeep(this.isCorrectionBlockMenuListOpen),
          engineeringCommunicationArray: this.engineeringCommunicationArray,
          locationFloorArray: this.locationFloorArray,
          adjustableFields: this.adjustableFields,
          utilitiesArray: this.utilitiesArray,
          operatingCostsArray: this.operatingCostsArray,
          fieldsWithValuesAccordingGuideArray: this.fieldsWithValuesAccordingGuideArray,
          stageTwoTableAllFieldsArr: this.stageTwoTableAllFieldsArr,
          stageTwoTable: this.stageTwoTable,
          stageOneTable: this.stageOneTable,
          fieldsForStageTwo: this.fieldsForStageTwo,
          secondGroupFields: this.secondGroupFields,
          fieldsForCorrectionWithoutAccountLandPlot: this.fieldsForCorrectionWithoutAccountLandPlot,
          fieldsWithValuesAccordingGuideValues: this.fieldsWithValuesAccordingGuideValues,
          adjustedCostValueArray: this.adjustedCostValueArray,
          report: this.finalTableArr,
          isBuildingForSale: this.isBuildingForSale,
          finalAdjustmentsArray: this.finalAdjustmentsArray,
          absoluteSumCorrectionArray: this.absoluteSumCorrectionArray,
          finalComplianceWithObjectEvaluationCoefficientsArray:
            this.finalComplianceWithObjectEvaluationCoefficientsArray,
          finalAnalogueObjectWeightsArray: this.finalAnalogueObjectWeightsArray,
          analogueObjectWeightArray: this.analogueObjectWeightArray,
          weightedAverageCost: this.weightedAverageCost,
          intoAccountLandPlotCorrections: this.intoAccountLandPlotCorrections,
          firstGroup: this.firstGroup,
          isolatingCostOfLandPlotsFieldsObject: this.isolatingCostOfLandPlotsFieldsObject,
          isAllAnalogsInSelection: this.isAllAnalogsInSelection,
          isExpress: this.isExpress,
          expressResults: this.expressResults,
        },
        summary_result: this.summary_result,
        realty_id: this.aim.id,
        evaluation_type: this.evaluationType,
        evaluation_status: this.evaluationStatus,
        name: this.orderName,
      }
    },

    createSummaryResult() {
      if (this.finalTableArr.length && this.finalTableArr[this.finalTableArr.length - 1].length > 5) {
        if (this.aim.ads_type === 'S') {
          this.setSummaryResult(
            `${this.expressResults.rub[0][0]['Минимальная рыночная стоимость, руб.']} ₽ - ${this.expressResults.rub[0][2]['Максимальная рыночная стоимость, руб.']} ₽`,
          )
        }
        if (this.aim.ads_type === 'R') {
          this.setSummaryResult(
            `${this.expressResults.results[0][0][Object.keys(this.expressResults.results[0][0])[0]]} ₽/кв. м - ${this.expressResults.results[0][2][Object.keys(this.expressResults.results[0][2])[0]]} ₽/кв. м`,
          )
        }
      }
    },

    setSummaryResult(value: string) {
      this.summary_result = value
    },

    async evaluationSave() {
      try {
        if (this.savedOrderId) {
          this.order = await this.collectOrderForSave()
          await $http.patch(api_orders + this.savedOrderId + '/', { body: this.order })
        } else {
          this.order = await this.collectOrderForSave()
          const order = await $http.post(api_orders, { body: this.order })
          this.setSavedOrderId(order._data.id)
          this.loadOrderFiles(this.notSavedOrderFiles).then(() => {
            this.getOrderFiles()
          })
        }
      } catch (err) {
        console.log(err)
      }
      return
    },

    async removeOrder(id: number) {
      try {
        await $http.delete(api_orders + id + '/')
      } catch (err) {
        console.log(err)
      }
      return
    },

    async updateOrder(id: number, data: Record<string, any>) {
      try {
        await $http.patch(api_orders + id + '/', { body: data })
      } catch (err) {
        console.log(err)
      }
      return
    },

    async duplicateOrder(id: number) {
      try {
        const order = await $http.get(api_orders + id)
        const data: Record<string, any> = Object.keys(order._data).reduce((acc: Record<string, any>, key: string) => {
          if (!['id', 'owner', 'order_created', 'files'].includes(key)) {
            acc[key === 'realty' ? 'realty_id' : key] = key === 'name' ? `Копия: ${order._data[key]}` : order._data[key]
          }
          return acc
        }, {})
        await $http.post(api_orders, { body: data })
      } catch (err) {
        console.log(err)
      }
      return
    },

    async openOrder(id: number) {
      try {
        const order: Record<string, any> = await $http.get(api_orders + id)
        if (order._data.evaluation_type === 'EX') {
          this.setIsExpress(true)
        }
        const data: Record<string, any> = Object.keys(order._data).reduce((acc: Record<string, any>, key: string) => {
          if (['evaluation_type', 'evaluation_status', 'name', 'files'].includes(key)) {
            acc[
              key === 'evaluation_type'
                ? 'evaluationType'
                : key === 'evaluation_status'
                  ? 'evaluationStatus'
                  : key === 'name'
                    ? 'orderName'
                    : 'orderFiles'
            ] = order._data[key]
          }
          return acc
        }, {})

        const source: Record<string, any> = Object.keys(order._data['source']).reduce(
          (acc: Record<string, any>, key: string) => {
            if (!['orderUpdated', 'updatedBy'].includes(key)) {
              acc[key] = order._data['source'][key]
            }
            return acc
          },
          {},
        )

        if (!source.aim.rent_result_json) {
          source.aim.rent_result_json = [
            {
              rent_vat: 'W',
              rent_pu: 'W',
              rent_co: 'W',
              rent_dimension: 'SM',
            },
          ]
        }

        const calc_source: Record<string, any> = Object.keys(order._data['calc_source']).reduce(
          (acc: Record<string, any>, key: string) => {
            acc[key === 'report' ? 'finalTableArr' : key] = order._data['calc_source'][key]
            return acc
          },
          {},
        )

        interface ThisInterface {
          [key: string]: any
        }

        Object.keys(data).forEach((key: string) => {
          ;(this as ThisInterface)[key] = data[key]
        })
        Object.keys(source).forEach((key: string) => {
          ;(this as ThisInterface)[key] = source[key]
        })
        Object.keys(calc_source).forEach((key: string) => {
          ;(this as ThisInterface)[key] = calc_source[key]
        })
        this.order = cloneDeep(order._data)
        console.log('this.order ', cloneDeep(this.order))
        // if (this.order && this.order.evaluation_status === 'P') {
        //   await this.navigateToResults()
        // }

        return order._data
      } catch (err) {
        console.log(err)
        return
      }
    },

    resetIsListOpenLists() {
      Object.keys(this.isFieldWithValuesAccordingGuideListOpen).forEach((key) => {
        for (let i = 0; i < this.objects.length; i++) {
          this.isFieldWithValuesAccordingGuideListOpen[key][i] = false
        }
      })
      Object.keys(this.isCorrectionBlockMenuListOpen).forEach((key) => {
        this.isCorrectionBlockMenuListOpen[key] = false
      })
    },

    updateIsListOpenLists(field: string, index: number | undefined) {
      if (index === undefined) {
        if (!this.isCorrectionBlockMenuListOpen[field]) {
          this.resetIsListOpenLists()
          this.isCorrectionBlockMenuListOpen[field] = true
          return
        }
        this.isCorrectionBlockMenuListOpen[field] = false
        return
      }

      if (this.isFieldWithValuesAccordingGuideListOpen[field][index]) {
        this.isFieldWithValuesAccordingGuideListOpen[field][index] =
          !this.isFieldWithValuesAccordingGuideListOpen[field][index]
        return
      }

      this.resetIsListOpenLists()
      this.isFieldWithValuesAccordingGuideListOpen[field][index] = true
    },

    setFieldsForCorrectionIntoAccountLandPlotCorrections(analogCounter: number) {
      let result: number | string = 0

      this.fieldsForCorrectionIntoAccountLandPlot
        .filter((item: string) => Object.keys(this.corrections).includes(item) && this.adjustableFields.includes(item))
        .forEach((key: string) => {
          result =
            useFinalCorrections(key, analogCounter + 1) === 'Ошибка!' || result === 'Ошибка!'
              ? 'Ошибка!'
              : Number(result) + Number(useFinalCorrections(key, analogCounter + 1))
        })

      this.finalAdjustmentForCorrectionIntoAccountLandPlot.value[analogCounter] =
        String(result) === 'Ошибка!' ? `${result}` : `${result} %`

      for (let i = this.newPrices[analogCounter].length - 2; i < this.newPrices[analogCounter].length; i++) {
        this.newPrices[analogCounter][i] =
          String(result) === 'Ошибка!'
            ? result
            : Number(this.newPrices[analogCounter][this.newPrices[analogCounter].length - 3]) *
              (1 + Number(result) / 100)
      }

      this.intoAccountLandPlotCorrections[analogCounter] = result
    },

    async onRunCalculations() {
      console.log('onRunCalculations ')
      this.arrayToMergeCells = []
      this.finalTableArr = []
      this.isShowStub = true
      this.isOnRunCalculations = true

      if (this.isMarketAnalysis && this.iterationCounter === 1) {
        this.initSelectedAnalogs()
      }
      if (this.isExpress || this.isMarketAnalysis) {
        this.initAnalogsTemp()
        // this.analogs = this.analogsTemp
      }

      this.currentAnalogs = []
      this.objects = []
      this.currentAnalogs = this.isExpress || this.isMarketAnalysis ? this.analogsTemp : this.selectedAnalogs
      console.log('this.currentAnalogs ', this.currentAnalogs)

      if (this.isExpress) {
        if (this.currentAnalogs.length < this.adjustmentRangeForExpress[0] && !this.stopRequests) {
          await this.getNewAnalogs()
          return
        }
        if (this.currentAnalogs.length > this.adjustmentRangeForExpress[1]) {
          this.currentAnalogs = this.currentAnalogs.slice(0, this.adjustmentRangeForExpress[1])
        }
      }

      if ((this.isMarketAnalysis || this.isExpress) && this.currentAnalogs.length) {
        let indexesArr: Array<number> = []

        let adjustedCosts = []

        for (let i = 0; i < this.currentAnalogs.length; i++) {
          adjustedCosts.push(this.getAdjustedCostForQuantileSeq(i))
        }
        indexesArr = []
        const idsArrOfAnalogsForDelete: number[] = []
        adjustedCosts = adjustedCosts.sort((a, b) => a.cost - b.cost)
        this.quantileSeqEvaluation(adjustedCosts.map((item) => item.cost))
        adjustedCosts.forEach((adjustedCost, index) => {
          if (useIsOutliersIncludesAdjustedCost(adjustedCost.cost)) {
            idsArrOfAnalogsForDelete.push(adjustedCost.id)
          }
        })
        this.currentAnalogs.forEach((analog, index) => {
          if (idsArrOfAnalogsForDelete.includes(analog.id)) {
            indexesArr.push(index)
          }
        })
        this.deleteAnalogs(indexesArr)

        if (this.currentAnalogs.length < this.analogsThreshold) {
          await this.getNewAnalogs()
          return
        }

        const idsArr = this.currentAnalogs.map((analog) => analog.id)
        const analogs = this.analogs.filter((analog) => idsArr.includes(analog.id))
        if (
          ((analogs.length < this.adjustmentRangeForExpress[0] && !this.penultimateRequest) ||
            (analogs.length < 3 && this.penultimateRequest)) &&
          !this.stopRequests
        ) {
          await this.getNewAnalogs()
          return
        }
      }

      await this.initObjectEvolutionStageTwoTable()
      console.log('this.secondGroupFields ', this.secondGroupFields)

      if (this.order?.evaluation_status !== 'E') {
        if (!this.isMarketAnalysis || !Object.keys(this.referenceBooks).length) {
          await this.setReferenceBooks()
          this.setDefaultReferenceBooks()
        }
        this.offIsShowStub()
        console.log('this.referenceBooksSelected ', cloneDeep(this.referenceBooksSelected))
      }

      if (Object.keys(this.referenceBooks).length && this.order?.evaluation_status !== 'E') {
        this.setObjects([this.aim].concat(this.currentAnalogs))
        this.initCorrections()

        if (this.fieldsWithValuesAccordingGuideArray.length) {
          this.fieldsWithValuesAccordingGuideValues = cloneDeep(useInitFieldsWithValuesAccordingGuideValues())
          this.isFieldWithValuesAccordingGuideListOpen = cloneDeep(useInitIsFieldWithValuesAccordingGuideListOpen())
        }
        console.log('this.fieldsWithValuesAccordingGuideValues ', cloneDeep(this.fieldsWithValuesAccordingGuideValues))

        this.fieldsWithValuesAccordingGuideArray.forEach((field) => {
          for (let i = 0; i < this.fieldsWithValuesAccordingGuideValues[field].length; i++) {
            this.applyReferenceBookToFieldsWithValuesAccordingGuide(
              this.fieldsWithValuesAccordingGuideValues[field][i],
              field,
              i,
            )
          }
        })
        this.getResults()

        console.log('this.corrections ', cloneDeep(this.corrections))
        console.log('this.notesObject ', cloneDeep(this.notesObject))

        this.intoAccountLandPlotCorrections = []
        for (let i = 0; i < this.currentAnalogs.length; i++) {
          if (this.isBuildingForSale && !this.isMarketAnalysis) {
            this.setFieldsForCorrectionIntoAccountLandPlotCorrections(i)
          }

          const currentAdjustedCost = useAdjustedCost(i + 1)
          this.updateAdjustedCostValueArray(i, currentAdjustedCost)

          const currentAnalogueObjectWeight = useAnalogueObjectWeight(i + 1)
          this.updateAnalogueObjectWeightArray(i, currentAnalogueObjectWeight)
        }

        if (this.isMarketAnalysis) {
          const absoluteSumCorrections = []
          this.setDeletedAnalogs([])

          const controlValue: number = controlValueForAbsoluteSumCorrection[this.iterationCounter.toString()]

          for (let i = 0; i < this.currentAnalogs.length; i++) {
            absoluteSumCorrections.push(
              this.isBuildingForSale
                ? useAbsoluteSumCorrectionsForBuildingForSale(i + 1)
                : useAbsoluteSumCorrection(i + 1),
            )
          }
          const absoluteSumCorrectionsIndexesArr: number[] = absoluteSumCorrections
            .map((value, index) => {
              if (typeof value !== 'number' || Number(value) > controlValue) {
                return index
              }
              return -1
            })
            .filter((index) => index !== -1)
          this.deleteAnalogs(absoluteSumCorrectionsIndexesArr)
          if (this.currentAnalogs.length < this.analogsThreshold) {
            await this.getNewAnalogs()
            return
          }

          const idsArr = this.currentAnalogs.map((analog) => analog.id)
          const analogs = this.analogs.filter((analog) => idsArr.includes(analog.id))
          if (
            ((analogs.length < this.adjustmentRangeForExpress[0] && !this.penultimateRequest) ||
              (analogs.length < 3 && this.penultimateRequest)) &&
            !this.stopRequests
          ) {
            await this.getNewAnalogs()
            return
          }
        }

        console.log('final analogs ', cloneDeep(this.currentAnalogs))

        if (this.isExpress) {
          this.getFinalTableArr()
        }
        this.isOnRunCalculations = false
        this.offIsShowStub()
      } else {
        // this.isShowStub = false
      }
    },

    getAdjustedCostForQuantileSeq(i: number) {
      const item = this.analogsTemp[i]
      return {
        id: item.id,
        cost: +item.price_sale_per_m || +item.price_rent_per_m || +item.price_sale / +item.object_area,
      }
    },

    getFinalTableArr() {
      const finalTableSubHeaderFields = [
        ID,
        ADDRESS_RAW,
        OBJECT_AREA,
        OBJECT_TYPE,
        FUNC_PURPOSE,
        PRICE_SALE_PER_M,
        PRICE_RENT_PER_M,
      ]
      const finalTableHeader = ['Наименование показателя', 'Объект оценки']
      if (!this.isExpress) {
        for (let i = 0; i < this.currentAnalogs.length; i++) {
          this.arrayToMergeCells.push('')
          finalTableHeader.push(`Аналог ${i + 1}`)
        }
        this.finalTableArr.push(finalTableHeader)
      } else {
        finalTableSubHeaderFields.forEach((field: string) => {
          if (Object.keys(this.aim).includes(field)) {
            this.setFieldSubHeaderLine(field)
          }
        })
      }

      this.stageTwoTable.forEach((item) => {
        if (item.title && !this.isExpress) {
          this.finalTableArr.push(this.returnSubtitleLine(item.title))
        }

        for (const field of item.fields) {
          if (
            !this.engineeringCommunicationArray.includes(field) &&
            !this.utilitiesArray.includes(field) &&
            !this.operatingCostsArray.includes(field) &&
            !rentCalculationArray.includes(field) &&
            !this.locationFloorArray.includes(field) &&
            !finalTableSubHeaderFields.includes(field)
          ) {
            this.setFieldLine(field)
          }

          if (
            !this.isExpress ||
            (this.isExpress && (Object.keys(this.aim).includes(field) || this.locationFloorArray.includes(field)))
          ) {
            if (this.utilitiesArray.indexOf(field) === 0) {
              this.finalTableArr.push(this.returnUtilitiesAndOperatingCostsTitleString())
            }

            if (
              this.utilitiesArray.concat(this.operatingCostsArray).includes(field) &&
              this.adjustableFields.includes(field)
            ) {
              this.finalTableArr.push(this.returnUtilitiesAndOperatingCostsString(field))
            }

            if (rentCalculationArray.includes(field)) {
              this.finalTableArr.push(this.returnRentCalculationString(field))
            }

            if (this.locationFloorArray.indexOf(field) === 0) {
              this.finalTableArr.push(this.returnLocationFloorTitleString(field))
            }

            if (
              this.locationFloorArray.indexOf(field) > 0 &&
              this.locationFloorArray.indexOf(field) < this.locationFloorArray.length
            ) {
              this.finalTableArr.push(this.returnCoefficientLine(field))
            }

            if (
              this.locationFloorArray.length &&
              this.locationFloorArray.indexOf(field) === this.locationFloorArray.length - 1
            ) {
              this.finalTableArr = this.finalTableArr.concat(this.returnLocationFloorCorrections(field))
            }

            if (this.engineeringCommunicationArray.indexOf(field) === 0) {
              this.finalTableArr.push(this.returnEngineeringCommunicationTitleString(field))
            }

            if (
              this.engineeringCommunicationArray.indexOf(field) > 0 &&
              this.engineeringCommunicationArray.indexOf(field) < this.engineeringCommunicationArray.length
            ) {
              this.finalTableArr.push(this.returnCoefficientLine(field))
            }

            if (
              this.engineeringCommunicationArray.length &&
              this.engineeringCommunicationArray.indexOf(field) === this.engineeringCommunicationArray.length - 1
            ) {
              this.finalTableArr = this.finalTableArr.concat(this.returnEngineeringCommunicationCorrectionString())
            }

            if (this.isBuildingForSale && !this.isExpress) {
              if (
                this.fieldsForCorrectionIntoAccountLandPlot.includes(field) &&
                this.fieldsForCorrectionIntoAccountLandPlot.indexOf(field) ===
                  this.fieldsForCorrectionIntoAccountLandPlot.length - 1
              ) {
                const correctionLine: Array<string | null> = [
                  finalAdjustmentForCorrectionIntoAccountLandPlot.label,
                  '—',
                ]
                const adjustedCostLine: Array<string> = [
                  this.adsType ? adjustedCostTitleObject[this.adsType] : adjustedCostTitleObject['R'],
                  '—',
                ]
                for (let i = 0; i < this.currentAnalogs.length; i++) {
                  correctionLine.push(this.finalAdjustmentForCorrectionIntoAccountLandPlot.value[i])
                  adjustedCostLine.push(`${this.newPrices[i][this.newPrices[i].length - 3]} ₽`)
                }
                this.finalTableArr.push(correctionLine)
                this.finalTableArr.push(adjustedCostLine)
              }

              if (
                this.fieldsForLandPlotCorrection.includes(field) &&
                this.fieldsForLandPlotCorrection.indexOf(field) === this.fieldsForLandPlotCorrection.length - 1
              ) {
                Object.keys(this.isolatingCostOfLandPlotsFieldsObject).forEach((key) => {
                  const lineForPush: Array<string | null> = [this.isolatingCostOfLandPlotsFieldsObject[key].label, '—']
                  for (let i = 0; i < this.currentAnalogs.length; i++) {
                    lineForPush.push(`${this.isolatingCostOfLandPlotsFieldsObject[key].value[i]} ₽`)
                  }
                  this.finalTableArr.push(lineForPush)
                })
              }
            }
          }
        }
      })

      if (!this.isExpress) {
        const finalAdjustmentTitle = this.isBuildingForSale
          ? this.finalAdjustmentForCorrectionWithoutAccountLandPlot.label
          : finalAdjustment[this.aim.ads_type]

        const finalAdjustmentString: Array<number | string | null> = [finalAdjustmentTitle, '—']
        for (let i = 0; i < this.currentAnalogs.length; i++) {
          const finalAdjustment = useFinalAdjustment(i + 1) !== 'Ошибка!' ? `${useFinalAdjustment(i + 1)} %` : 'Ошибка!'
          finalAdjustmentString.push(finalAdjustment)
        }
        this.finalTableArr.push(finalAdjustmentString)
      }
      // выводит последнюю строку Скорректированная арендная плата, руб./кв. м в месяц, без учета КУ, без учета ЭР для ЭО
      const adjustedCostString: Array<number | string | null> = [adjustedCostTitleObject[this.aim.ads_type], '—']
      for (let i = 0; i < this.currentAnalogs.length; i++) {
        const adjustedCost =
          this.adjustedCostValueArray[i] === 'Ошибка!'
            ? 'Ошибка!'
            : `${Number(this.adjustedCostValueArray[i]).toFixed(0)} ₽`
        adjustedCostString.push(adjustedCost)
      }
      this.finalTableArr.push(adjustedCostString)

      if (!this.isExpress) {
        const absoluteValuesSumCorrectionString: Array<number | string | null> = [absoluteValuesSumCorrectionTitle, '—']
        for (let i = 0; i < this.currentAnalogs.length; i++) {
          const absoluteCorrection = useAbsoluteSumCorrection(i + 1)
          absoluteValuesSumCorrectionString.push(absoluteCorrection)
        }
        this.finalTableArr.push(absoluteValuesSumCorrectionString)

        const conformityCoefficientString: Array<number | string | null> = [
          complianceWithObjectEvaluationCoefficient,
          '—',
        ]
        for (let i = 0; i < this.currentAnalogs.length; i++) {
          const conformityCoefficient =
            useAbsoluteSumCorrection(i + 1) === 0 ? 'Ошибка!' : Number(useCoefficientOfConformity(i + 1)).toFixed(2)
          conformityCoefficientString.push(conformityCoefficient)
        }
        this.finalTableArr.push(conformityCoefficientString)

        const analogueObjectWeightString: Array<number | string | null> = [analogueObjectWeightLabel, '—']
        for (let i = 0; i < this.currentAnalogs.length; i++) {
          const analogueObjectWeight: number | string | null =
            useAbsoluteSumCorrection(i + 1) === 0 ||
            useCoefficientSum() === 0 ||
            useCoefficientOfConformity(i + 1) === 'Ошибка!' ||
            useCoefficientSum() === 'Ошибка!'
              ? 'Ошибка!'
              : this.analogueObjectWeightArray[i + 1]
          analogueObjectWeightString.push(analogueObjectWeight)
        }
        this.finalTableArr.push(analogueObjectWeightString)

        const weightedAverageOfMarketValueTitle = finalResultsTitles[this.aim.ads_type]
        this.finalTableArr.push(
          [weightedAverageOfMarketValueTitle]
            .concat(this.arrayToMergeCells)
            .concat([this.weightedAverageCost.toString()]),
        )

        // if (this.aim.object_type === 'L') {
        //   this.finalTableArr.push(
        //     [this.landMarketValue].concat(arrayToMergeCells).concat([splitIntoOrdersWithComma(this.weightedAverageCost)]),
        //   )
        //   this.finalTableArr.push(
        //     [this.totalLandArea].concat(arrayToMergeCells).concat([splitIntoOrdersWithComma(this.aim.object_area)]),
        //   )
        //   this.finalTableArr.push([this.finalMarketValue].concat(arrayToMergeCells).concat([this.weightedPrice]))
        // }

        if (this.aim.object_type === 'Q' && this.aim.ads_type === 'R') {
          if (this.adjustableFields.includes('operating_costs') && this.adjustableFields.includes(UTILITIES)) {
            for (const obj of this.aim.rent_result_json) {
              this.finalTableArr.push(
                [this.getTotalRentLabelString(obj)]
                  .concat(this.arrayToMergeCells)
                  .concat([`${this.getFinalTotalRentOptions(obj).toString().replace(' ', '')} ₽`]),
              )
            }

            if (this.aim.enrichment_end && this.aim.enrichment_begin) {
              this.finalTableArr.push(
                ['Количество лет необоснованного обогащения']
                  .concat(this.arrayToMergeCells)
                  .concat([(diffDates(this.aim.enrichment_end, this.aim.enrichment_begin) / 365).toFixed(1)]),
              )
              this.finalTableArr.push(
                ['Количество дней необоснованного обогащения']
                  .concat(this.arrayToMergeCells)
                  .concat([diffDates(this.aim.enrichment_end, this.aim.enrichment_begin).toFixed(1)]),
              )
              this.finalTableArr.push(
                [
                  ` Платеж за право пользования Объектом оценки в период с ${dateFormatting(
                    this.aim.enrichment_begin,
                  )} по ${dateFormatting(this.aim.enrichment_end)}, без учета НДС, без учета КУ, без учета ЭР`,
                ]
                  .concat(this.arrayToMergeCells)
                  .concat([splitIntoOrdersWithComma(this.getPaymentForTheRightToUse())]),
              )
            }
          }
        }
      }

      this.finalTableArr = this.finalTableArr.map((string) => {
        if (isProxy(string)) return toRaw(string)
        return string
      })
      console.log('finalTableArr ', cloneDeep(this.finalTableArr))
      if (this.isExpress) {
        this.expressResults = cloneDeep(useExpressResults())
        console.log('this.expressResults ', cloneDeep(this.expressResults))
        if (this.aim.ads_type === 'S') {
          this.expressResultsTableArr.push(this.returnSubtitleLine('Результаты экспресс-оценки'))
          this.expressResultsTableArr.push(this.returnSubtitleLine('Удельные показатели'))
          this.pushExpressResults(this.expressResults.rub_sq_m[0])
          this.expressResultsTableArr.push(this.returnSubtitleLine('Итого, за объект'))
          this.pushExpressResults(this.expressResults.rub[0])
        }
        if (this.aim.ads_type === 'R') {
          this.expressResultsTableArr.push(this.returnSubtitleLine('Результаты экспресс-оценки'))
          this.expressResults.results.forEach((result: expressResultBlockType) => {
            this.pushExpressResults(result)
          })
        }
      }
    },

    pushExpressResults(expressResults: expressResultBlockType) {
      expressResults.forEach((obj) => {
        const fieldLine: Array<any> = [Object.keys(obj)[0], Object.values(obj)[0]]
        for (let i = 0; i < this.currentAnalogs.length - 1; i++) {
          fieldLine.push(this.getEmptyCells())
        }
        this.expressResultsTableArr.push(fieldLine)
      })
    },

    exportExcel() {
      console.log('exportExcel()')
      this.getFinalTableArr()

      const merge: Array<{
        s: {
          r: number
          c: number
        }
        e: {
          r: number
          c: number
        }
      }> = []

      const finalTableArr = this.finalTableArr.concat(this.expressResultsTableArr)
      const subTitlesArray: Array<string | null> = []
      this.stageTwoTable.forEach((item) => {
        if (item.title) {
          subTitlesArray.push(this.returnSubtitleLine(item.title)[0])
        }
      })
      if (this.isExpress) {
        if (this.aim.ads_type === 'S') {
          ;['Результаты экспресс-оценки', 'Удельные показатели', 'Итого, за объект'].forEach((item) => {
            subTitlesArray.push(this.returnSubtitleLine(item)[0])
          })
        }
        if (this.aim.ads_type === 'R') {
          subTitlesArray.push(this.returnSubtitleLine('Результаты экспресс-оценки')[0])
        }
      }

      const finalLinesArray = []
      finalLinesArray.push(finalResultsTitles[this.aim.ads_type])
      for (const obj of this.aim.rent_result_json) {
        finalLinesArray.push(this.getTotalRentLabelString(obj))
      }
      finalLinesArray.forEach((item) => {
        const rIndex = finalTableArr.findIndex((el) => el[0] === item)
        merge.push({ s: { r: rIndex, c: 0 }, e: { r: rIndex, c: this.arrayToMergeCells.length } })
      })
      subTitlesArray.forEach((item) => {
        const rIndex = finalTableArr.findIndex((el) => el[0] === item)
        merge.push({ s: { r: rIndex, c: 0 }, e: { r: rIndex, c: this.objects.length + 1 } })
      })

      const ws = utils.aoa_to_sheet(finalTableArr, { sheetStubs: true })
      ws['!merges'] = merge

      for (const cell in ws) {
        // console.log(`ws[${cell}] `, ws[cell])
        if (Object.prototype.hasOwnProperty.call(ws, cell)) {
          if (!isNaN(Number(ws[cell].v))) {
            ws[cell].t = 'n'
            // console.log(`ws[${cell}] `, ws[cell])
          }
          if (
            ws[cell].v?.toString().includes('%') &&
            !ws[cell].v?.toString().includes(', ') &&
            !ws[cell].v?.toString().includes(')') &&
            !ws[cell].v?.toString().includes('(')
          ) {
            // console.log(`% ws[${cell}]`, ws[cell].v)
            ws[cell].v = Number(ws[cell].v.replace(' %', '')) / 100
            ws[cell].t = 'n'
            ws[cell].z = '0.00%'
          }
          if (ws[cell].v?.toString().includes(' ₽') && ws[cell].v?.toString().split(' ').length === 2) {
            ws[cell].v = Number(ws[cell].v.replace(' ₽', ''))
            ws[cell].t = 'n'
            ws[cell].z = '0₽'
          }
        }

        if (ws[cell].v?.toString().length > 0) {
          const cellArr = ws[cell].v?.toString().split(' ')
          if (
            cellArr.length > 1 &&
            !ws[cell].v?.toString().includes('\n') &&
            !ws[cell].v?.toString().includes('Корректировки по')
          ) {
            let cellString = ''
            for (let i = 0; i < cellArr.length - 1; i++) {
              cellString = cellString + cellArr[i] + ' '
              if (cellString.length > 30) {
                cellString = cellArr[i] + ' '
                cellArr[i - 1] = cellArr[i - 1] + '\n'
              }
            }
            ws[cell].v = cellArr.join(' ')
          }
        }
      }

      ws['!cols'] = [{ wch: 40 }]
      for (let i = 0; i < this.objects.length; i++) {
        ws['!cols'].push({ wch: 32 })
      }

      const wb = utils.book_new()
      utils.book_append_sheet(wb, ws, 'Sheet1', true)

      writeFileXLSX(wb, 'SheetJSTableExport.xlsx')
    },

    async exportDocs(type: 'order' | 'analogs', resource: 'xlsx' | 'docx') {
      let api = ''
      let respType = ''
      let docName = ''
      if (type === 'order') {
        if (resource === 'xlsx') {
        } else {
          api = api_export_word
          respType = 'application/docx'
          docName = `Отчёт ${this.orderName}.docx`
        }
      } else {
        if (resource === 'xlsx') {
          api = api_export_analogs_excel
          respType = 'application/xlsx'
          docName = `Аналоги ${this.orderName}.xlsx`
        } else {
          api = api_export_analogs_word
          respType = 'application/docx'
          docName = `Аналоги ${this.orderName}.docx`
        }
      }
      try {
        const response = await $http.get(api, {
          params: { id: this.savedOrderId },
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

    setFieldLine(field: string) {
      let excludedFields = [DATE_CALC, 'tech_status', 'condition_finish', 'walls_material']

      if (this.isExpress && !Object.keys(this.aim).includes(field)) return

      let aimValue = useAimValue(field) || null
      if (field === FUNC_PURPOSE && aimValue) {
        aimValue = aimValue.name
      }
      aimValue =
        this.stageTwoTable[0].fields.includes(field) ||
        this.adjustableFields.includes(field) ||
        this.adjustableFields.includes(`${field}${ACCORDING_GUIDE}`)
          ? aimValue
          : ''
      if (!aimValue && this.fieldsWithValuesAccordingGuideArray.includes(field)) {
        aimValue = this.fieldsWithValuesAccordingGuideValues[field][0]
      }
      if (field === DATE_CALC) {
        aimValue = dateFormatting(aimValue)
      }

      const fieldLine = [this.getFieldName(field), aimValue]

      for (let i = 0; i < this.currentAnalogs.length; i++) {
        let analogValue =
          field === DATE_CALC
            ? dateFormatting(useAnalogValue(this.currentAnalogs[i], ADS_UPDATED))
            : useAnalogValue(this.currentAnalogs[i], field)

        if (field === FUNC_PURPOSE && analogValue) {
          if (this.isExpress) {
            analogValue = useConstants().funcPurposes.find((fp: any) => fp.id === Math.floor(analogValue))?.name || ''
          } else {
            analogValue = analogValue.name
          }
        }
        analogValue =
          this.stageTwoTable[0].fields.includes(field) ||
          this.adjustableFields.includes(field) ||
          this.adjustableFields.includes(`${field}${ACCORDING_GUIDE}`)
            ? analogValue
            : ''
        if (!analogValue && this.fieldsWithValuesAccordingGuideArray.includes(field)) {
          analogValue = this.fieldsWithValuesAccordingGuideValues[field][i + 1]
        }

        fieldLine.push(analogValue)
      }
      this.finalTableArr.push(fieldLine)

      if (
        this.getIsCorrectionLine(field) ||
        this.fieldsWithValuesAccordingGuideArray.includes(field) ||
        !excludedFields.includes(field)
      ) {
        this.setCorrectionLines(field)
      }

      if (this.isExpress && excludedFields.includes(field) && field !== DATE_CALC) {
        this.setCorrectionLines(`${field}${ACCORDING_GUIDE}`)
      }
    },

    setFieldSubHeaderLine(field: string) {
      let aimValue = useAimValue(field) || null
      if (field === FUNC_PURPOSE && aimValue) {
        aimValue = aimValue.name
      }

      const fieldLine = [this.getFieldName(field), aimValue]

      for (let i = 0; i < this.currentAnalogs.length; i++) {
        let analogValue = useAnalogValue(this.currentAnalogs[i], field)
        if (field === FUNC_PURPOSE && analogValue) {
          if (this.isExpress) {
            analogValue = useConstants().funcPurposes.find((fp: any) => fp.id === Math.floor(analogValue))?.name || ''
          } else {
            analogValue = analogValue.name
          }
        }
        fieldLine.push(analogValue)
      }
      this.finalTableArr.push(fieldLine)
    },

    returnSubtitleLine(title: string) {
      return [title, null].concat(this.getEmptyCells())
    },

    getEmptyCells() {
      const emptyCellsLine = []
      for (let i = 0; i < this.currentAnalogs.length; i++) {
        emptyCellsLine.push(null)
      }
      return emptyCellsLine
    },

    setCorrectionLines(field: string) {
      const correctionLine: Array<string | number> = ['Корректировка, %']

      if (
        !this.getFirstGroupFields().includes(field) &&
        !this.locationFloorArray.includes(field) &&
        !this.engineeringCommunicationArray.includes(field)
      ) {
        const correctionFactorLine: Array<string | number> = ['Корректирующий коэффицент']
        correctionLine.push('—')
        for (let i = 0; i < this.objects.length; i++) {
          correctionFactorLine.push(this.corrections[field][i])
          if (i > 0) {
            correctionLine.push(
              `${useCorrectionCalculatedValue(field, useCorrectionValue(field, 0), useCorrectionValue(field, i))}  %`,
            )
          }
        }
        this.finalTableArr.push(correctionFactorLine)
        this.finalTableArr.push(correctionLine)
      }

      if (this.getFirstGroupFields().includes(field)) {
        const adjustedCostLabel = this.adsType ? adjustedCostTitleObject[this.adsType] : adjustedCostTitleObject['R']
        const index = this.hasCorrectionsFields.indexOf(field)
        const adjustedCostLine: Array<string | number> = [adjustedCostLabel, '—']
        correctionLine.push(this.corrections[field][0])
        for (let i = 0; i < this.currentAnalogs.length; i++) {
          correctionLine.push(`${this.corrections[field][i + 1]} %`)
          adjustedCostLine.push(`${useNewPrice(i, index)} ₽`)
        }
        this.finalTableArr.push(correctionLine)
        this.finalTableArr.push(adjustedCostLine)
      }
    },

    returnUtilitiesAndOperatingCostsTitleString() {
      const fieldLine = [
        // convertStringToExcel(this.utilitiesAndOperatingCostsTitle),
        utilitiesAndOperatingCostsTitle,
        this.adjustableFields.includes(UTILITIES) ? utilitiesAndOperatingCostsNotIncluded : null,
      ]
      this.selectedAnalogs.forEach((analog) => {
        if (!useUtilitiesAndOperatingCostsList(analog).length) {
          fieldLine.push(this.adjustableFields.includes(UTILITIES) ? utilitiesAndOperatingCostsNotIncluded : null)
        } else {
          fieldLine.push(
            this.adjustableFields.includes(UTILITIES) ? useUtilitiesAndOperatingCostsList(analog).join(',\n') : null,
          )
        }
      })

      return fieldLine
    },

    returnUtilitiesAndOperatingCostsString(field: string) {
      const fieldLine: Array<string | number | null> = [this.getFieldName(field)]
      this.corrections[field].forEach((item) => {
        fieldLine.push((+item * 100).toFixed(2))
      })
      return fieldLine
    },

    returnRentCalculationString(field: string) {
      const fieldLine: Array<string | number | null> = [this.getFieldName(field), '—']
      for (let i = 0; i < this.currentAnalogs.length; i++) {
        fieldLine.push(
          String(useRentCalculation(field, i)) === 'Ошибка!'
            ? useRentCalculation(field, i)
            : Number(useRentCalculation(field, i)).toFixed(0),
        )
      }
      return fieldLine
    },

    returnLocationFloorTitleString(field: string) {
      console.log('returnLocationFloorTitleString')
      const fieldLine: Array<string | number | null> = [
        this.getFieldName(field),
        this.adjustableFields.includes(field) ? this.parseFloorResult(useAimValue(field)) : null,
      ]
      this.currentAnalogs.forEach((analog, index) => {
        fieldLine.push(
          this.adjustableFields.includes(field) ? this.parseFloorResult(useAnalogValue(analog, field), index) : null,
        )
      })
      return fieldLine
    },

    returnCoefficientLine(field: string) {
      const fieldLine: Array<string | number | null> = [this.getFieldName(field)]
      for (let i = 0; i < this.objects.length; i++) {
        fieldLine.push(this.corrections[field][i])
      }
      return fieldLine
    },

    returnLocationFloorCorrections(field: string) {
      const correctionFactorLine: Array<string | number | null> = [
        'Корректирующий коэффицент ',
        this.adjustableFields.includes(field) ? Number(useFloorNumberGroupCoefficients(0)).toFixed(2) : null,
      ]
      const correctionLine: (string | null)[] = ['Корректировка, %', '—']

      for (let i = 0; i < this.currentAnalogs.length; i++) {
        correctionFactorLine.push(this.adjustableFields.includes(field) ? useFloorNumberGroupCoefficients(i + 1) : null)
        let correction: string | number | null = this.adjustableFields.includes(field)
          ? useFloorNumberGroupCorrection(i + 1)
          : null

        if (correction !== 'Ошибка!' && typeof correction === 'number') {
          correction = `${(correction * 100).toFixed(2)} %`
        }
        correctionLine.push(correction)
      }
      return [correctionFactorLine, correctionLine]
    },

    returnEngineeringCommunicationTitleString(field: string) {
      const fieldLine: Array<string | number | null> = [
        this.getFieldName(field),
        this.adjustableFields.includes(field) ? useAimEngineeringCommunicationList().join(', \n ') : null,
      ]
      this.currentAnalogs.forEach((analog) => {
        fieldLine.push(
          this.adjustableFields.includes(field) ? useAnalogEngineeringCommunicationList(analog).join(', \n') : null,
        )
      })
      return fieldLine
    },

    returnEngineeringCommunicationCorrectionString() {
      const correctionFactorLine: Array<string | number | null> = [
        'Корректирующий коэффицент ',
        this.adjustableFields.includes(this.engineeringCommunicationArray[0])
          ? useEngineeringCommunicationGroupCoefficients(0).toFixed(2)
          : null,
      ]
      const correctionLine: (string | null)[] = ['Корректировка, %', '—']
      for (let i = 0; i < this.currentAnalogs.length; i++) {
        correctionFactorLine.push(
          this.adjustableFields.includes(this.engineeringCommunicationArray[0])
            ? useEngineeringCommunicationGroupCoefficients(i + 1)
            : null,
        )
        correctionLine.push(
          this.adjustableFields.includes(this.engineeringCommunicationArray[0]) &&
            useEngineeringCommunicationGroupCorrection(i + 1) !== 'Ошибка!'
            ? `${(Number(useEngineeringCommunicationGroupCorrection(i + 1)) * 100).toFixed(2)} %`
            : null,
        )
      }

      return [correctionFactorLine, correctionLine]
    },

    resetActiveTabIndex() {
      this.activeTabIndex = 0
    },

    setBaseLandPlotCost(cost: number, index: number) {
      if (!this.fieldsForLandPlotCorrection.length) return
      this.isolatingCostOfLandPlotsFieldsObject.baseLandPlotCost.value[index] = cost
      this.setIsolatingCostOfLandPlotsFieldsObject(index)
    },

    setIsolatingCostOfLandPlotsFieldsObject(index: number) {
      const cost = Number(this.isolatingCostOfLandPlotsFieldsObject.baseLandPlotCost.value[index])
      let coefficient = 1
      for (let i = 0; i < this.fieldsForLandPlotCorrection.length; i++) {
        let corr1 = useCorrectionValue(this.fieldsForLandPlotCorrection[i], 0)
        let corr2 = useCorrectionValue(this.fieldsForLandPlotCorrection[i], index + 1)
        let correctionFactor = useCorrectionCalculatedValue(this.fieldsForLandPlotCorrection[i], corr1, corr2)
        if (correctionFactor === 'Ошибка!') {
          coefficient = 0
          break
        }
        coefficient = coefficient * (1 + Number(correctionFactor) / 100)
      }

      this.isolatingCostOfLandPlotsFieldsObject.adjustedSqmCostOfLandPlot.value[index] = cost * coefficient

      this.isolatingCostOfLandPlotsFieldsObject.adjustedCostOfLandPlot.value[index] =
        cost * coefficient * this.selectedAnalogs[index].land_area

      this.isolatingCostOfLandPlotsFieldsObject.adjustedCostOfAnalogueObjectsWithLandPlot.value[index] =
        coefficient !== 0
          ? +this.newPrices[index][this.newPrices[index].length - 2] * this.selectedAnalogs[index].object_area
          : coefficient

      this.isolatingCostOfLandPlotsFieldsObject.costOfAnalogueObjectsWithoutLandPlot.value[index] =
        coefficient !== 0
          ? +this.newPrices[index][this.newPrices[index].length - 2] * this.selectedAnalogs[index].object_area -
            cost * coefficient * this.selectedAnalogs[index].land_area
          : coefficient

      this.isolatingCostOfLandPlotsFieldsObject.adjustedCostWithoutLandPlot.value[index] =
        coefficient !== 0
          ? (+this.newPrices[index][this.newPrices[index].length - 2] * this.selectedAnalogs[index].object_area -
              cost * coefficient * this.selectedAnalogs[index].land_area) /
            this.selectedAnalogs[index].object_area
          : coefficient

      if (coefficient !== 0) {
        this.newPrices[index][this.newPrices[index].length - 1] =
          (+this.newPrices[index][this.newPrices[index].length - 2] * this.selectedAnalogs[index].object_area -
            cost * coefficient * this.selectedAnalogs[index].land_area) /
          this.selectedAnalogs[index].object_area
      }
    },

    setIsolatingCostOfLandPlotsFieldsAllObjects(index: number) {
      if (index === 0) {
        for (let i = 0; i < this.selectedAnalogs.length; i++) {
          this.setIsolatingCostOfLandPlotsFieldsObject(i)
        }
        return
      }
      this.setIsolatingCostOfLandPlotsFieldsObject(index - 1)
    },

    resetCorrectionField() {
      for (let i = 0; i < this.corrections[this.fieldForCorrection].length; i++) {
        this.corrections[this.fieldForCorrection][i] = 0
      }
    },

    async navigateToResults() {
      this.resetActiveTabIndex()
      this.resetActivedIndexList()
      this.updateIsMarketAnalysis(false)
      this.onIsShowStub()
      this.resetOrder()
      useAim(this.aim.id).then((res: any) => {
        this.setAim(res)
        useAimModalFields(this.aim).then((res: any) => {
          this.setAimModalFields(res)
          useObjectEvolutionStageOneTable(this.aim.func_purpose.id.toString()).then((res: any) => {
            this.setStageOneTable(res)
            this.getSelectedAnalogs().then(() => {
              this.initAdjustableFields()
              this.currentAnalogs = this.selectedAnalogs
              this.offIsShowStub()
            })
          })
        })
      })
    },

    getFinalAdjustmentsArray() {
      this.finalAdjustmentsArray = []
      for (let i = 0; i < this.selectedAnalogs.length; i++) {
        this.finalAdjustmentsArray.push(
          useFinalAdjustment(i + 1) === 'Ошибка!'
            ? useFinalAdjustment(i + 1)
            : Number(useFinalAdjustment(i + 1)).toFixed(2),
        )
      }
    },

    getAdjustedCostsValueArray() {
      this.adjustedCostValueArray = []
      for (let i = 0; i < this.selectedAnalogs.length; i++) {
        this.adjustedCostValueArray.push(
          useAdjustedCost(i + 1) !== 'Ошибка!' ? Number(useAdjustedCost(i + 1)).toFixed(0) : useAdjustedCost(i + 1),
        )
      }
    },

    getAbsoluteSumCorrectionArray() {
      this.absoluteSumCorrectionArray = []
      for (let i = 0; i < this.selectedAnalogs.length; i++) {
        const absoluteSumCorrection: number | 'Ошибка!' = this.isBuildingForSale
          ? useAbsoluteSumCorrectionsForBuildingForSale(i + 1)
          : useAbsoluteSumCorrection(i + 1)

        this.absoluteSumCorrectionArray.push(
          absoluteSumCorrection !== 'Ошибка!' ? numberWithSpaces(absoluteSumCorrection.toFixed(2)) : 'Ошибка!',
        )
      }
    },

    getFinalAnalogueObjectWeightsArray() {
      this.finalAnalogueObjectWeightsArray = []
      if (this.finalComplianceWithObjectEvaluationCoefficientsArray.includes('Ошибка!')) {
        for (let i = 0; i < this.currentAnalogs.length; i++) {
          this.finalAnalogueObjectWeightsArray.push('Ошибка!')
        }
        return
      }

      const complianceWithObjectEvaluationCoefficientArray: Array<number | string> = []
      for (let i = 0; i < this.currentAnalogs.length; i++) {
        complianceWithObjectEvaluationCoefficientArray.push(useCoefficientOfConformity(i + 1))
      }
      const isError = complianceWithObjectEvaluationCoefficientArray.includes('Ошибка!')
      const complianceWithObjectEvaluationCoefficientArraySum: number | string = isError
        ? 'Ошибка!'
        : complianceWithObjectEvaluationCoefficientArray.reduce((sum, current) => Number(sum) + Number(current), 0)

      for (let i = 0; i < this.currentAnalogs.length; i++) {
        this.finalAnalogueObjectWeightsArray.push(
          complianceWithObjectEvaluationCoefficientArraySum !== 'Ошибка!'
            ? (
                (Number(complianceWithObjectEvaluationCoefficientArray[i]) /
                  Number(complianceWithObjectEvaluationCoefficientArraySum)) *
                100
              ).toFixed(2)
            : 'Ошибка!',
        )
      }
    },

    getComplianceWithObjectEvaluationCoefficient() {
      this.finalComplianceWithObjectEvaluationCoefficientsArray = []
      for (let i = 0; i < this.currentAnalogs.length; i++) {
        const absoluteSumCorrection: number | string = this.isBuildingForSale
          ? useAbsoluteSumCorrectionsForBuildingForSale(i + 1)
          : useAbsoluteSumCorrection(i + 1)

        this.finalComplianceWithObjectEvaluationCoefficientsArray.push(
          absoluteSumCorrection === 0 || absoluteSumCorrection === 'Ошибка!'
            ? 'Ошибка!'
            : Number(useCoefficientOfConformity(i + 1)).toFixed(2),
        )
      }
    },

    getWeightedAverageCost() {
      let cost: number | string = 0
      for (let i = 0; i < this.currentAnalogs.length; i++) {
        if (useFinalPrice(i) === 'Выберите справочник или введите значение вручную' || useFinalPrice(i) === 'Ошибка!') {
          cost = 'Ошибка!'
          break
        }

        if (
          this.adjustedCostValueArray[i] === 'Ошибка!' ||
          this.adjustedCostValueArray[i] === 'Ошибка!' ||
          this.finalAnalogueObjectWeightsArray[i] === 'Ошибка!'
        ) {
          cost = 'Ошибка!'
          break
        }

        cost += (Number(this.adjustedCostValueArray[i]) * Number(this.finalAnalogueObjectWeightsArray[i])) / 100
      }

      this.weightedAverageCost = cost === 'Ошибка!' ? cost : Number(cost)
    },

    getResults() {
      this.getFinalAdjustmentsArray()
      this.getAdjustedCostsValueArray()
      this.getAbsoluteSumCorrectionArray()
      this.getComplianceWithObjectEvaluationCoefficient()
      this.getFinalAnalogueObjectWeightsArray()
      this.getWeightedAverageCost()
    },

    changeIsShowEngineeringCommunicationCorrections() {
      this.isShowEngineeringCommunicationCorrections = !this.isShowEngineeringCommunicationCorrections
    },

    changeIsShowLocationFloorCorrections() {
      this.isShowLocationFloorCorrections = !this.isShowLocationFloorCorrections
    },

    onIsAllAnalogsInSelection() {
      this.isAllAnalogsInSelection = true
    },

    offIsAllAnalogsInSelection() {
      this.isAllAnalogsInSelection = false
    },

    setCurrentTabName(name: string) {
      this.currentTabName = name
    },

    updateActivedIndexList(tab: number) {
      this.activedIndexList.push(tab)
    },

    resetActivedIndexList() {
      this.activedIndexList = [0]
    }
  },
})
