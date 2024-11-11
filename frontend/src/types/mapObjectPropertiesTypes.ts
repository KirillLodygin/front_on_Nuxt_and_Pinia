import { weights } from '~/app_constants/mapObjectConsts'
import type { funcPurposeObjectType } from './objectsFiltersStoreTypes'
import { photo, documents } from '~/app_constants/mapObjectConsts'

export type FileType = {
  pk: number
  label: string
  url: string
  original_filename: string
  name: string
  description: string
  uploaded_at: string
  _file_size: number
}

export type FileForComponentType = {
  file: FileType
  selected: boolean
  originalFile?: File
}

const filesTabs = [photo, documents]
type requiredFlagForFiles = (typeof filesTabs)[number]

export type FileGroup = {
  [key in objectTypeCalcEnum]: {
    flags: {
      [key in objectTypeTypeEnum]: {
        required: {
          [key: requiredFlagForFiles]: string[]
        }
      }
    }
    Q: string[]
    B: string[]
    L: string[]
  }
}

export type groupedFilesType = {
  [key: string]: Array<FileForComponentType>
}

export type fileUpdateParamsType = {
  name?: string | null
  description?: string | null
}

export type objectTypeType = 'Q' | 'B' | 'L'
export enum objectTypeTypeEnum {
  Q = 'Q',
  B = 'B',
  L = 'L',
}

export type objectTypeCalcType = 'OA' | 'OO' | 'NE'
export enum objectTypeCalcEnum {
  OA = 'OA',
  OO = 'OO',
  NE = 'NE',
}
export type adsTypeType = 'R' | 'S' | ''
export type exchangeTypeType = 'M' | 'T'

export type defaultFiltersType = {
  [key in objectTypeCalcType]: {
    object_type: objectTypeType
    object_type_calc: objectTypeCalcType
    ads_type: adsTypeType
    func_purpose: number
    exchange_type: exchangeTypeType
  }
}

export type choiceOption = {
  display_name: string
  value: string
}

export type funcPurposeAsChoice = {
  content: funcPurposeObjectType
  display_name: string
  value: number
}

const tabs = Object.keys(weights)
export type tabsType = (typeof tabs)[number]
