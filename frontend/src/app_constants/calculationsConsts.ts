import type {
  conditionFinishAccordingGuideType,
  engineeringCommunicationObjectsType,
  techStatusAccordingGuideType,
  utilitiesFieldsAndOperatingCostsFieldsType,
  wallsMaterialAccordingGuideType,
} from '~/types/calculationsTypes'

export const limitIssueAnalogs = 10
export const VATConst = 0.2
export const deviationCoefficient = 0.25

export const ACCORDING_GUIDE = '_according_guide'
export const PRICE_SALE_PER_M = 'price_sale_per_m'
export const PRICE_RENT_PER_M = 'price_rent_per_m'
export const PRICE_SALE = 'price_sale'
export const GENERAL_INFORMATION = 'general_information'
export const COMPOSITION_ELEMENTS_FIRST_GROUP = 'comparison_elements_first_group'
export const COMPOSITION_ELEMENTS_SECOND_GROUP = 'comparison_elements_second_group'
export const ADJUSTMENTS_TAKING_INTO_ACCOUNT_THE_LAND_PLOT = 'adjustments_taking_into_account_the_land_plot'
export const ADJUSTMENTS_WITHOUT_TAKING_INTO_ACCOUNT_THE_LAND_PLOT =
  'adjustments_without_taking_into_account_the_land_plot'
export const ISOLATING_THE_COST_OF_LAND_PLOTS = 'isolating_the_cost_of_land_plots'
export const WALLS_MATERIAL_ACCORDING_GUIDE = 'walls_material_according_guide'
export const TECH_STATUS_ACCORDING_GUIDE = 'tech_status_according_guide'
export const LAND_PERMITTED_USE = 'land_permitted_use'
export const TERMS_OF_SALE = 'terms_of_sale'
export const ANALOGS_CAROUSEL_FUNC = 'btn-outline-secondary'
export const ANALOGS_CAROUSEL_ATTENTION_FUNC = 'btn-outline-danger'
export const THIRD_FLOOR_AND_ABOVE_LOCATION_COEFFICIENT = 'third_floor_and_above_location_coefficient_'
export const BASE_LAND_PLOT_COST = 'baseLandPlotCost'
export const FUNC_PURPOSE = 'func_purpose'
export const DATE_CALC = 'date_calc'
export const FLOOR_NUMBER = 'floor_number'
export const UTILITIES = 'utilities'
export const PERMISSION_TYPE_GROUP = 'permission_type_group'
export const PERMISSION_USE_TYPE_SUBGROUP = 'permitted_use_type_subgroup'
export const AVAILABILITY_OF_ENGINEERING_SUPPORT = 'availability_of_engineering_support'
export const OBJECT_AREA = 'object_area'
export const LAND_RIGHTS_ADDITIONAL = 'land_rights_additional'
export const LAND_AREA = 'land_area'
export const ADS_UPDATED = 'ads_updated'
export const ADDRESS_RAW = 'address_raw'
export const OBJECT_TYPE = 'object_type'
export const ID = 'id'

// TODO: kLodygin - нижеследующие массивы и объекты, вероятно, стоит вынести в бэк
export const engineeringCommunicationObjects: engineeringCommunicationObjectsType = {
  L: {
    availability_of_engineering_support: 'Наличие (отсутствие) инженерного обеспечения',
    engineering_electricity_220: 'Электричество_220',
    engineering_electricity_380: 'Электричество_380',
    engineering_water: 'Водопровод',
    engineering_severage: 'Канализация',
    engineering_gas: 'Газ',
    engineering_heat: 'Теплоснабжение',
  },
  Q: {
    availability_of_engineering_support: 'Наличие (отсутствие) инженерного обеспечения',
    engineering_electricity: 'Электричество',
    engineering_water: 'Водопровод',
    engineering_severage: 'Канализация',
    engineering_heat: 'Теплоснабжение',
  },
  B: {
    availability_of_engineering_support: 'Наличие (отсутствие) инженерного обеспечения',
    engineering_electricity: 'Электричество',
    engineering_water: 'Водопровод',
    engineering_severage: 'Канализация',
    engineering_heat: 'Теплоснабжение',
  },
}

export const utilitiesFields: utilitiesFieldsAndOperatingCostsFieldsType = {
  utilities: 'КУ',
  pu_electricity: 'электричество',
  pu_water_sewerage: 'водоснабжение/канализация',
  pu_heating: 'отопление',
}

export const operatingCostsFields: utilitiesFieldsAndOperatingCostsFieldsType = {
  operating_costs: 'ЭР',
  co_cleaning: 'уборка',
  co_inet: 'интернет/связь',
  co_guard: 'охрана',
  co_repair: 'ремонт (текущий)',
}

export const utilitiesAndOperatingCostsTitle = 'Коммунальные услуги (КУ), эксплуатационные расходы (ЭР)'
export const utilitiesAndOperatingCostsNotIncluded = 'Не включены'
export const rentCalculationArray = [
  'gross_rent_per_m',
  'utilities_and_operating_costs_in_rent',
  'rent_excluding_utilities_and_operating_costs',
]

export const locationFloorInitArray = [
  'floor_number',
  'basement_location_coefficient',
  'plinth_location_coefficient',
  'ground_floor_location_coefficient',
  'second_floor_location_coefficient',
  'third_floor_and_above_location_coefficient',
]

export const landPermittedGroupArray = [
  'land_permitted_use_group_according_guide',
  'land_permitted_use_subgroup_according_guide',
]

export const baseFloorOptions = [
  {
    value: 'U',
    display_name: 'Подвал',
    field: 'basement_location_coefficient',
  },
  {
    value: 'G',
    display_name: 'Цоколь',
    field: 'plinth_location_coefficient',
  },
  {
    value: 'O',
    display_name: '1 этаж',
    field: 'ground_floor_location_coefficient',
  },
  {
    value: 'T',
    display_name: '2 этаж',
    field: 'second_floor_location_coefficient',
  },
  {
    value: 'TR',
    display_name: '3 и выше',
    field: 'third_floor_and_above_location_coefficient',
  },
]

export const wallsMaterialAccordingGuide: wallsMaterialAccordingGuideType = {
  'Ж/б, Панельные': 'Железобетонные',
  Деревянные: 'Деревянные',
  Металлические: 'Металлические',
  'Сэндвич-панели': 'Сэндвич-панели',
  Кирпичные: 'Кирпичные',
  Монолитные: 'Железобетонные',
}

export const techStatusAccordingGuide: techStatusAccordingGuideType = {
  Отличное: 'Хорошее состояние (новое здание)',
  Хорошее: 'Хорошее состояние (новое здание)',
  Удовлетворительное: 'Удовлетворительное состояние',
  Неудовлетворительное: 'Требует капитального ремонта (в неудовлетворительном состоянии)',
}

export const conditionFinishAccordingGuide: conditionFinishAccordingGuideType = {
  'Производственно-складское': {
    Хорошее: 'Типовой ремонт (отделка "стандарт")',
    Удовлетворительное: 'Требуется косметический ремонт',
    'Без отделки': 'Без отделки',
    'Частично выполнена отделка': 'Частично выполнена отделка',
    'Требует замены отделки': '',
    'Удовл./Неудовл.': '',
  },
  Офисное: {
    Отличное: 'Комфортный ремонт (отделка "премиум")',
    Хорошее: 'Типовой ремонт (отделка "стандарт")',
    Удовлетворительное: 'Требуется косметический ремонт',
    'Без отделки': 'Без отделки',
    Неудовлетворительное: 'Требуется капитальный ремонт',
    'Частично выполнена отделка': 'Частично выполнена отделка',
    'Удовл./Неудовл.': '',
  },
  ПСН: {
    Отличное: 'Комфортный ремонт (отделка "премиум")',
    Хорошее: 'Типовой ремонт (отделка "стандарт")',
    Удовлетворительное: 'Требуется косметический ремонт',
    'Без отделки': 'Без отделки',
    Неудовлетворительное: 'Требуется капитальный ремонт',
    'Частично выполнена отделка': 'Частично выполнена отделка',
    'Удовл./Неудовл.': '',
  },
  Торговое: {
    Отличное: 'Комфортный ремонт (отделка "премиум")',
    Хорошее: 'Типовой ремонт (отделка "стандарт")',
    Удовлетворительное: 'Требуется косметический ремонт',
    'Без отделки': 'Без отделки',
    Неудовлетворительное: 'Требуется капитальный ремонт',
    'Частично выполнена отделка': 'Частично выполнена отделка',
    'Удовл./Неудовл.': '',
  },
  'Офисно-торговое': {
    Отличное: 'Комфортный ремонт (отделка "премиум")',
    Хорошее: 'Типовой ремонт (отделка "стандарт")',
    Удовлетворительное: 'Требуется косметический ремонт',
    'Без отделки': 'Без отделки',
    Неудовлетворительное: 'Требуется капитальный ремонт',
    'Частично выполнена отделка': 'Частично выполнена отделка',
    'Удовл./Неудовл.': '',
  },
  'Гостинично-рекреационное': {
    Отличное: 'Комфортный ремонт (отделка "премиум")',
    Хорошее: 'Типовой ремонт (отделка "стандарт")',
    Удовлетворительное: 'Требуется косметический ремонт',
    'Без отделки': 'Без отделки',
    Неудовлетворительное: 'Требуется капитальный ремонт',
    'Частично выполнена отделка': 'Частично выполнена отделка',
    'Удовл./Неудовл.': '',
  },
  Сельскохозяйственное: {
    Хорошее: 'Типовой ремонт (отделка "стандарт")',
    Удовлетворительное: 'Требуется косметический ремонт',
    'Без отделки': 'Без отделки',
    'Частично выполнена отделка': 'Частично выполнена отделка',
    'Требует замены отделки': '',
    'Удовл./Неудовл.': '',
  },
}

export const controlValueForAbsoluteSumCorrection: Record<string, number> = {
  express: 50,
  '1': 60,
  '2': 60,
  '3': 60,
  '4': 70,
}

export const functional_purpose_analog: Record<number, number> = {
  100: 123,
  101: 124,
  102: 125,
  103: 126,
  108: 130,
  109: 131,
  110: 132,
  111: 133,
  112: 143,
  113: 144,
  114: 145,
  115: 146,
  104: 137,
  105: 138,
  106: 139,
  107: 140,
}

export const fp_ids: Record<string, any> = {
  Q: {
    R: { 126: [123, 124, 125, 126], 124: [124, 126], 125: [125, 126] },
    S: { 133: [130, 131, 132, 133], 131: [131, 133], 132: [132, 133] },
  },
  B: { R: { 140: [137, 138, 139, 140], 138: [138, 140], 139: [139, 140] } },
}
export const stageTabName1: string = 'Сравнение предложений'
export const stageTabName2: string = 'Показатели КУ и ЭР'
export const stageTabName3: string = 'Корректировки по первой группе элементов сравнения'
export const stageTabName4: string = 'Корректировки по второй группе элементов сравнения'
export const stageTabName5: string = 'Внесение корректировок к стоимости с учетом земельного участка'
export const stageTabName6: string = 'Выделение стоимости земельных участков из стоимости предложений'
export const stageTabName7: string = 'Внесение корректировок к стоимости без учета земельного участка'
export const stageTabName8: string = 'Результат'

export const AllEvaluationsStagesTabs: Record<string, Record<string, string[]>> = {
  Q: {
    R: [stageTabName1, stageTabName2, stageTabName3, stageTabName4, stageTabName8],

    S: [stageTabName1, stageTabName3, stageTabName4, stageTabName8],
  },

  B: {
    R: [stageTabName1, stageTabName2, stageTabName3, stageTabName4, stageTabName8],

    S: [stageTabName1, stageTabName3, stageTabName5, stageTabName6, stageTabName7, stageTabName8],
  },
}

export const adjustedCostLabelObject = {
  S: 'Скорректированная стоимость, руб./кв. м',
  R: 'Скорректированная арендная плата, руб./кв. м в месяц,\n' + 'без учета КУ, без учета ЭР',
}

export const weightedAverageOfMarketValue: Record<string, Record<string, string>> = {
  L: {
    S: 'Средневзвешенная величина рыночной стоимости земельного участка (НДС не облагается), руб./кв. м',
    R: '',
  },
  Q: {
    S: 'Средневзвешенная величина рыночной стоимости объекта недвижимости, руб./кв. м',
    R: 'Средневзвешенная величина арендной платы, руб./кв. м в месяц, без учета КУ, без учета ЭР',
  },
  B: {
    S: 'Средневзвешенная величина рыночной стоимости объекта недвижимости, руб./кв. м',
    R: 'Средневзвешенная величина арендной платы, руб./кв. м в месяц, без учета КУ, без учета ЭР',
  },
}

export const finalResultsTitles: Record<string, string> = {
  S: 'Рыночная стоимость объекта недвижимости, определенная в рамках сравнительного подхода, руб./кв. м',
  R: 'Скорректированная арендная плата, руб./кв. м в месяц, без учета КУ, без учета ЭР ',
}

export const finalAdjustment: Record<string, string> = {
  S: 'Итоговая корректировка по независимым элементам сравнения, %',
  R: 'Суммарная корректировка по 2-й группе элементов сравнения, %',
}

export const finalAdjustmentForCorrectionIntoAccountLandPlot: { label: string; value: Array<string | null> } = {
  label:
    'Итоговая корректировка по независимым элементам сравнения\n' +
    'для объекта недвижимости с учетом земельного участка, %',
  value: [],
}

export const finalAdjustmentForCorrectionWithoutAccountLandPlot: { label: string; value: Array<string | null> } = {
  label:
    'Итоговая корректировка по независимым элементам сравнения\n' +
    'для объекта недвижимости без земельного участка, %',
  value: [],
}

export const isolatingCostOfLandPlotsFieldsObject: Record<string, { label: string; value: Array<number | null> }> = {
  baseLandPlotCost: {
    label: 'Стоимость земельного участка объекта оценки (базового), руб./ кв. м',
    value: [],
  },
  adjustedSqmCostOfLandPlot: {
    label: 'Скорректированная стоимость земельного участка предложений, руб./ кв. м',
    value: [],
  },
  adjustedCostOfLandPlot: {
    label: 'Скорректированная стоимость земельного участка предложений, руб.',
    value: [],
  },
  adjustedCostOfAnalogueObjectsWithLandPlot: {
    label: 'Скорректированная стоимость предложений с учетом земельных участков, руб.',
    value: [],
  },
  costOfAnalogueObjectsWithoutLandPlot: {
    label: 'Стоимость предложений без учета земельного участка, руб.',
    value: [],
  },
  adjustedCostWithoutLandPlot: {
    label: 'Скорректированная стоимость (без учета земельного участка), руб./кв. м',
    value: [],
  },
}

export const adjustedCostTitleObject: Record<string, string> = {
  S: 'Скорректированная стоимость, руб./кв. м',
  R: 'Скорректированная арендная плата, руб./кв. м в месяц, без учета КУ, без учета ЭР',
}

export const absoluteValuesSumCorrectionTitle = 'Абсолютная валовая корректировка, %'

export const complianceWithObjectEvaluationCoefficient =
  'Коэффициент соответствия объекту оценки (обратно пропорционален показателю абсолютной валовой корректировки)'

export const analogueObjectWeightTitle = 'Вес предложения с учетом коэффициента соответствия, %'

export const conformityCoefficient = 'Коэффициент соответствия объекту оценки'

export const analogueObjectWeightLabel = 'Вес предложения с учетом коэффициента соответствия, %'

export const totalRentLabelComponents: Record<string, any> = {
  label: 'Итоговая арендная плата',
  rent_vat: {
    V: 'с учетом НДС',
    W: 'без учета НДС',
  },
  rent_pu: {
    P: 'с учетом КУ',
    W: 'без учета КУ',
  },
  rent_co: {
    C: 'с учетом ЭР',
    W: 'без учета ЭР',
  },
  rent_dimension: {
    SM: 'руб./кв. м в месяц',
    SY: 'руб./кв. м в год',
    M: 'руб. в месяц',
    Y: 'руб. в год',
  },
}

export const rentLabelForExpressComponents: Record<string, Record<string, string>> = {
  label: {
    min: 'Минимальная арендная плата',
    median: 'Средняя арендная плата',
    max: 'Максимальная арендная плата',
  },
  rent_vat: {
    V: 'с учетом НДС',
    W: 'без учета НДС',
  },
  rent_pu: {
    P: 'с учетом КУ',
    W: 'без учета КУ',
  },
  rent_co: {
    C: 'с учетом ЭР',
    W: 'без учета ЭР',
  },
  rent_dimension: {
    SM: 'руб./кв. м в месяц',
    SY: 'руб./кв. м в год',
    M: 'руб. в месяц',
    Y: 'руб. в год',
  },
}

export const isCorrectionBlockMenuListOpen: Record<string, boolean> = {
  dateOptions: false,
  regionOptions: false,
  marketTypeOptions: false,
  valueOptions: false,
}

export const analogsFieldsValuesForExpress: Record<number, Record<string, any>> = {
  102: {
    land_rights: 'TR',
    financing: 'T',
    terms_of_sale: 'O',
    type_obj_room_or_building: 'N',
    realty_class: null,
    tech_status: 'S',
    condition_finish: 'S',
    floor_number: null,
    access_type: 'O',
    engineering_electricity: 'E',
    engineering_water: 'E',
    engineering_heat: 'E',
    engineering_severage: 'E',
  },
  101: {
    land_rights: 'TR',
    financing: 'T',
    terms_of_sale: 'O',
    type_obj_room_or_building: 'N',
    realty_class: 'B',
    tech_status: 'S',
    condition_finish: 'S',
    floor_number: null,
    access_type: 'O',
    engineering_electricity: 'E',
    engineering_water: 'E',
    engineering_heat: 'E',
    engineering_severage: 'E',
  },
  103: {
    land_rights: 'TR',
    financing: 'T',
    terms_of_sale: 'O',
    type_obj_room_or_building: 'N',
    realty_class: null,
    tech_status: 'S',
    condition_finish: 'S',
    floor_number: null,
    access_type: 'O',
    engineering_electricity: 'E',
    engineering_water: 'E',
    engineering_heat: 'E',
    engineering_severage: 'E',
  },
  100: {
    land_rights: 'TR',
    financing: 'T',
    terms_of_sale: 'O',
    type_obj_room_or_building: 'N',
    realty_class: 'C',
    tech_status: 'S',
    condition_finish: 'S',
    floor_number: null,
    access_type: 'C',
    engineering_electricity: 'E',
    engineering_water: 'E',
    engineering_heat: 'E',
    engineering_severage: 'E',
  },
  106: {
    land_rights: 'TR',
    financing: 'T',
    terms_of_sale: 'O',
    type_obj_room_or_building: 'B',
    realty_class: null,
    tech_status: 'S',
    condition_finish: 'S',
    floor_number: null,
    access_type: 'O',
    engineering_electricity: 'E',
    engineering_water: 'E',
    engineering_heat: 'E',
    engineering_severage: 'E',
  },
  105: {
    land_rights: 'TR',
    financing: 'T',
    terms_of_sale: 'O',
    type_obj_room_or_building: 'B',
    realty_class: 'B',
    tech_status: 'S',
    condition_finish: 'S',
    floor_number: null,
    access_type: 'O',
    engineering_electricity: 'E',
    engineering_water: 'E',
    engineering_heat: 'E',
    engineering_severage: 'E',
  },
  107: {
    land_rights: 'TR',
    financing: 'T',
    terms_of_sale: 'O',
    type_obj_room_or_building: 'B',
    realty_class: null,
    tech_status: 'S',
    condition_finish: 'S',
    floor_number: null,
    access_type: 'O',
    engineering_electricity: 'E',
    engineering_water: 'E',
    engineering_heat: 'E',
    engineering_severage: 'E',
  },
  104: {
    land_rights: 'TR',
    financing: 'T',
    terms_of_sale: 'O',
    type_obj_room_or_building: 'B',
    realty_class: 'C',
    tech_status: 'S',
    condition_finish: 'S',
    floor_number: null,
    access_type: 'C',
    engineering_electricity: 'E',
    engineering_water: 'E',
    engineering_heat: 'E',
    engineering_severage: 'E',
  },
  110: {
    land_rights: 'O',
    financing: 'T',
    terms_of_sale: 'O',
    type_obj_room_or_building: 'N',
    realty_class: null,
    tech_status: 'S',
    condition_finish: 'S',
    floor_number: null,
    access_type: 'O',
    engineering_electricity: 'E',
    engineering_water: 'E',
    engineering_heat: 'E',
    engineering_severage: 'E',
  },
  109: {
    land_rights: 'O',
    financing: 'T',
    terms_of_sale: 'O',
    type_obj_room_or_building: 'N',
    realty_class: 'B',
    tech_status: 'S',
    condition_finish: 'S',
    floor_number: null,
    access_type: 'O',
    engineering_electricity: 'E',
    engineering_water: 'E',
    engineering_heat: 'E',
    engineering_severage: 'E',
  },
  111: {
    land_rights: 'O',
    financing: 'T',
    terms_of_sale: 'O',
    type_obj_room_or_building: 'N',
    realty_class: null,
    tech_status: 'S',
    condition_finish: 'S',
    floor_number: null,
    access_type: 'O',
    engineering_electricity: 'E',
    engineering_water: 'E',
    engineering_heat: 'E',
    engineering_severage: 'E',
  },
  108: {
    land_rights: 'O',
    financing: 'T',
    terms_of_sale: 'O',
    type_obj_room_or_building: 'N',
    realty_class: 'C',
    tech_status: 'S',
    condition_finish: 'S',
    floor_number: null,
    access_type: 'C',
    engineering_electricity: 'E',
    engineering_water: 'E',
    engineering_heat: 'E',
    engineering_severage: 'E',
  },
  114: {
    land_rights: 'O',
    financing: 'T',
    terms_of_sale: 'O',
    type_obj_room_or_building: 'B',
    realty_class: 'B',
    tech_status: 'S',
    condition_finish: 'S',
    floor_number: null,
    access_type: 'O',
    engineering_electricity: 'E',
    engineering_water: 'E',
    engineering_heat: 'E',
    engineering_severage: 'E',
  },
  115: {
    land_rights: 'O',
    financing: 'T',
    terms_of_sale: 'O',
    type_obj_room_or_building: 'B',
    realty_class: null,
    tech_status: 'S',
    condition_finish: 'S',
    floor_number: null,
    access_type: 'O',
    engineering_electricity: 'E',
    engineering_water: 'E',
    engineering_heat: 'E',
    engineering_severage: 'E',
  },
  113: {
    land_rights: 'O',
    financing: 'T',
    terms_of_sale: 'O',
    type_obj_room_or_building: 'B',
    realty_class: null,
    tech_status: 'S',
    condition_finish: 'S',
    floor_number: null,
    access_type: 'C',
    engineering_electricity: 'E',
    engineering_water: 'E',
    engineering_heat: 'E',
    engineering_severage: 'E',
  },
  112: {
    land_rights: 'O',
    financing: 'T',
    terms_of_sale: 'O',
    type_obj_room_or_building: 'B',
    realty_class: 'C',
    tech_status: 'S',
    condition_finish: 'S',
    floor_number: null,
    access_type: 'C',
    engineering_electricity: 'E',
    engineering_water: 'E',
    engineering_heat: 'E',
    engineering_severage: 'E',
  },
}

export const orderSourceKeys: Record<string, Array<string>> = {
  source: [
    'aim',
    'aimModalFields',
    'adsType',
    'analogs',
    'selectedAnalogs',
    'currentAnalogs',
    'objects',
    'defaultMarketType',
    'activeTabIndex',
    'orderUpdated',
    'updatedBy',
    'funcAppointment',
    'evaluationsStagesTabs',
  ],
  calc_source: [
    'notesObject',
    'corrections',
    'referenceBooks',
    'referenceBooksSelected',
    'referenceBookSourceLists',
    'hasCorrectionsFields',
    'newPrices',
    'floorOptions',
    'rentCalculationObject',
    'engineeringCommunicationObject',
    'isFieldWithValuesAccordingGuideListOpen',
    'isCorrectionBlockMenuListOpen',
    'engineeringCommunicationArray',
    'locationFloorArray',
    'adjustableFields',
    'utilitiesArray',
    'operatingCostsArray',
    'fieldsWithValuesAccordingGuideArray',
    'stageTwoTableAllFieldsArr',
    'stageTwoTable',
    'stageOneTable',
    'fieldsForStageTwo',
    'secondGroupFields',
    'fieldsForCorrectionWithoutAccountLandPlot',
    'fieldsWithValuesAccordingGuideValues',
    'adjustedCostValueArray',
    'report',
    'isBuildingForSale',
    'finalAdjustmentsArray',
    'absoluteSumCorrectionArray',
    'finalComplianceWithObjectEvaluationCoefficientsArray',
    'finalAnalogueObjectWeightsArray',
    'analogueObjectWeightArray',
    'weightedAverageCost',
    'intoAccountLandPlotCorrections',
    'firstGroup',
    'isolatingCostOfLandPlotsFieldsObject',
    'isAllAnalogsInSelection',
  ],
}
