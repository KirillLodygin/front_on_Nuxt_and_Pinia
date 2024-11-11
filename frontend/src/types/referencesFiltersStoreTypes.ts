export type tableHeaderFiltersType = Record<string, string>
export type searchParamsType = Record<any, any>
export type sortedFieldType = string
export type sortDirectionType = 'none' | 'asc' | 'desc'
export type nextDirectionType = Record<sortDirectionType, sortDirectionType>
export type objectsRespDataType = Record<string, any>
export type tableColumnType = {
  field: string
  label: { REF: string }
  isSwitchOn: boolean
  doNotSwitchOff?: boolean
  isTableMenuShown?: boolean
  calcType?: string[]
  columnIndex?: boolean
}
export type tableColumnsType = Array<tableColumnType>

type quater = string
type building = string
type landplot = string
type first = string
type second = string
type placeholder = string
type value = string
type base_search_fields = string

export type choiceType = {
  display_name: string
  value: string
  checked?: boolean
  disabled?: boolean
}

export type inputValueType = Record<placeholder | value, string>

export type intervalValuesType = Record<first | second, inputValueType>

export type filterType = {
  label: string
  field: string
  type: string
  input: inputValueType
  choices: Array<choiceType>
  intervalValues: intervalValuesType
  value: Array<string>
  isOpen: boolean
}

export type pricingParamsType = {
  value: string
  display_name: string
  checked: boolean
}

export type initReferenceType = {
  id: number
  name: string
  name_unique: string
  param_name: string
  type: string
  source: string
  source_to_report: string
  source_to_report_footnote: string
  source_to_report_footnote_unique: string
  date_book: string
  date_begin: string
  date_end: string
  type_data: string
  formula: string
  type_calc: string
  type_market?: string | null
  added_by: number | null
}

export type allFiltersType = Array<filterType>

export type allAdditionalFiltersType = Record<base_search_fields | quater | building | landplot, Array<filterType>>

export type allFilteredFieldsType = {
  base_search_fields: Array<string>
  search_fields_by_type: Record<quater | building | landplot, Array<string>>
  ignore_search_fields: Array<string>
}

export type optionType = {
  label: string
  checked: boolean
  value: string
}

export type allFiltersOptionsType = Array<optionType> | []
