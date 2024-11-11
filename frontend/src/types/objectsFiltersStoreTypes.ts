export type tableHeaderFiltersType = Record<string, string>
export type searchParamsType = Record<string, string>
export type sortedFieldType = string
export type sortDirectionType = 'none' | 'asc' | 'desc'
export type nextDirectionType = Record<sortDirectionType, sortDirectionType>
export type objectsRespDataType = Record<string, any>
export type tableColumnType = {
  field: string
  label: string | { OA: string; OO: string; NE: string; REF?: string }
  isSwitchOn: boolean
  doNotSwitchOff?: boolean
  isTableMenuShown?: boolean
  calcType?: string[]
  columnIndex?: boolean
}
export type tableColumnsType = Array<tableColumnType>

type B = string
type Q = string
type L = string
type R = string
type S = string
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
  value: string
  isOpen: boolean
}

export type allFiltersType = Array<filterType>

export type allAdditionalFiltersType = Record<base_search_fields | quater | building | landplot, Array<filterType>>

export type allFilteredFieldsType = {
  base_search_fields: Array<string>
  search_fields_by_type: Record<quater | building | landplot, Array<string>>
  ignore_search_fields: Array<string>
  OO: Array<string>
  OA: Array<string>
  NE: Array<string>
}

export type funcPurposeObjectType = {
  id: number
  name: string
  type: 'B' | 'Q' | 'L'
  calc_type: 'R' | 'S' | null
  object_type: 'OA' | 'OO' | 'NE'
  date: string
}

export type functionalPurposeListType = Array<funcPurposeObjectType> | []

export type functionalPurposeType = {
  labels: Array<string>
  ids: Array<number>
}

type functionalPurposeTypeObjetType = Record<R | S, functionalPurposeType>

export type functionalPurposeObjectType = Record<B | Q | L, functionalPurposeTypeObjetType>

export type optionType = {
  label: string
  checked: boolean
  value: string
}

export type allFiltersOptionsType = Array<optionType> | []

export type tableParamsDataType = {
  limit: number
  displayedColumns: string[]
  sortField: string | null
  sortDirection: string
}
