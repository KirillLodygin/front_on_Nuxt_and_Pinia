export type aimModalFieldsType = Array<Record<string, any>>
export type aimType = Record<string, any>
export type aimObjectCategoryType = Record<string, any>
export type metaGroupType = {
  fields: Array<string>
  group: string
  group_id: number
  id: string
  is_base: boolean
  meta_realty: {
    date: string
    exchange_type: string
    functional_purpose: number
    id: number
    name: string | null
    parent: number
  }
  position: number
  stage: number
  tab: string
  title: string
}

export type objectEvolutionTableStageArrayType = Array<metaGroupType>
export type bookJsonStringType = Array<string | number>
export type bookJsonType = Array<bookJsonStringType>
export type bookType = {
  description: string | null
  group: number | null
  groupNameUnique?: string | null
  id: number
  json_data: bookJsonType
  region: string | null
  type: string | null
}
export type referenceBookType = {
  added_by: number | null
  books: Array<bookType> | []
  date_begin: string
  date_book: string
  date_end: string
  formula: string
  id: number
  name: string
  name_unique: string
  param_name: string
  source: string
  source_to_report: string
  source_to_report_footnote: string
  source_to_report_footnote_unique: string
  type: string
  type_calc: string
  type_data: string
  type_market: string | null
}
export type referenceBooksType = Record<string, Array<referenceBookType>>
export type referenceBookSourceListType = Set<string>
export type referenceBookSourceListsType = Record<string, referenceBookSourceListType>
export type referenceBookSelectedType = {
  book: number | null
  group: number | null
  source: string | null
  valueCol: number | null
}
export type referenceBooksSelectedType = Record<string, referenceBookSelectedType>
export type floorOptionType = {
  display_name: string
  field: string
  value: string
}
export type regionOptionType = {
  display_name: string
  value: number
}
export type optionsForAdditionalDropdownType = {
  value: string | number
  display_name: string | number
  disabled?: boolean
}

export type wallsMaterialAccordingGuideType = Record<string, string>
export type techStatusAccordingGuideType = Record<string, string>
export type conditionFinishAccordingGuideType = Record<string, Record<string, string>>
export type accordingGuideGroupDropdownsValuesType = Record<
  string,
  wallsMaterialAccordingGuideType | techStatusAccordingGuideType | conditionFinishAccordingGuideType
>
export type engineeringCommunicationObjectsType = Record<string, Record<string, string>>
export type utilitiesFieldsAndOperatingCostsFieldsType = Record<string, string>
export type aimPathType = {
  path: string
  hash: string
}

export type floorNumberType = Record<string, { area: number }>

export type correctionFactorLineType = Array<string | number | null>
export type finalTableArrType = Array<correctionFactorLineType>
export type expressResultBlockType = Array<Record<string, number | string>>
export type expressResultKeyType = Array<expressResultBlockType>
export type expressResultType = Record<string, expressResultKeyType>
