import { evaluate } from 'mathjs'
import type { bookJsonStringType } from '~/types/calculationsTypes'

export const convertStringToNumber = (str: string | number) => {
  if (typeof str === 'number') return str.toString()
  let strArr: string | string[] = str.replace(/\s+/g, '')
  if (!strArr) return '0'
  strArr = strArr.split('.')
  if (strArr[1] && isNaN(Number(strArr[1]))) return strArr[0]
  strArr[1] = Number(strArr[1]).toString()
  return strArr.join('.') === '0.0' ? '0' : strArr.join('.')
}

export const getFormulaString = (
  formula: string,
  indexesArr: bookJsonStringType,
  apprRow: bookJsonStringType,
  targetField: string | number,
  valueType: number,
) => {
  const indexesSymbols: Array<string> = []
  indexesArr.forEach((item) => {
    if (!indexesSymbols.includes(item.toString()) && !!item) {
      indexesSymbols.push(item.toString())
    }
  })
  const sudArraySize = indexesSymbols.length

  const indexesValues: Array<string> = apprRow
    .slice(1, apprRow.length - 1)
    .map((item) => (typeof item === 'number' ? item.toString() : convertStringToNumber(item)))
  const indexesValuesGroups = []
  for (let i = 0; i < indexesValues.length; i += sudArraySize) {
    indexesValuesGroups.push(indexesValues.slice(i, i + sudArraySize))
  }
  const actualIndexesValuesGroup = indexesValuesGroups[valueType < sudArraySize ? valueType : 0]

  let formulaString = formula
  indexesSymbols.forEach((symbol, index) => {
    formulaString = formulaString.replace(symbol, actualIndexesValuesGroup[index])
  })

  const formulasElement = formulaString.match(/[A-Za-z]/gi)?.[0]
  if (formulasElement) {
    while (formulaString.includes(formulasElement)) {
      formulaString = formulaString.replace(formulasElement, convertStringToNumber(targetField))
    }
  }
  return formulaString
}

export const calculateString = (str: string) => {
  return evaluate(str)
}

export const getNewDisplayName = (str: string) => {
  if (str) {
    const index = str.indexOf(':')
    return index !== -1 ? str.slice(0, index) : str
  }
  return ''
}

export const searchChoices = (choices: Record<string, any>[], value: string) => {
  for (const key of choices) {
    if (key.value === value) {
      return key
    }
  }
  return {
    value,
    display_name: value,
  }
}

export const getField = (object: Record<string, any>, path: any) => {
  if (typeof object !== 'object') {
    return undefined
  }
  if (path instanceof Array) {
    let prop = object
    for (const key of path) {
      if (typeof prop === 'object' && prop !== null) {
        prop = prop[key]
      } else {
        return undefined
      }
    }
    return prop
  } else if (!(path instanceof Object)) {
    return object[path] || ''
  } else {
    return undefined
  }
}

export const getOption = (object: Record<string, any>, pathInput: any) => {
  let path = pathInput
  if (pathInput instanceof Array) {
    path = [...pathInput]
    let iter = 0
    while (iter < path.length - 1) {
      path.splice(iter + 1, 0, 'children')
      iter = iter + 2
    }
  }
  return getField(object, path)
}

export const numberWithSpaces = (x: number | string) => {
  if (x === 'Ошибка!') return x
  const str = x?.toString().replace(/\s/g, '')
  return str?.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export const formatCorrectionFloat = (floatValue: number | string) => {
  return Number(floatValue).toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const isDesiredRange = (string: string, targetValue: string) => {
  let arr = string.split('-')
  arr = arr.filter((item) => !!item)

  if (arr.length === 1) {
    return Number(targetValue.replace(',', '.')) >= Number(arr[0].replace(',', '.'))
  }

  return (
    Number(targetValue.replace(',', '.')) >= Number(arr[0].replace(',', '.')) &&
    Number(targetValue.replace(',', '.')) <= Number(arr[1].replace(',', '.'))
  )
}

export const getAnalogsType = (aimObjectType: string) => {
  switch (aimObjectType) {
    case 'L':
      return 'landplots'

    case 'B':
      return 'buildings'

    default:
      return 'quaters'
  }
}

export const diffDates = (dayOne: number | string | Date, dayTwo: number | string | Date) => {
  return (+new Date(dayOne) - +new Date(dayTwo)) / (60 * 60 * 24 * 1000)
}

export const dateFormatting = (date: string) => {
  return date?.slice(0, 10).split('-').reverse().join('.')
}

export const splitIntoOrdersWithComma = (string: string) => {
  const stringArray = string.toString().split('.')
  stringArray[0] = numberWithSpaces(stringArray[0])
  return stringArray.join(',')
}
