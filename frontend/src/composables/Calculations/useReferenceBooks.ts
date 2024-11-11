import { cloneDeep } from 'lodash'
import type { fpInterface } from '~/store/constants'
import useConstants from '~/store/constants'
import { FLOOR_NUMBER, UTILITIES } from '~/app_constants/calculationsConsts'
import type {
  bookType,
  referenceBookSelectedType,
  referenceBookSourceListsType,
  referenceBooksType,
  referenceBookType,
} from '~/types/calculationsTypes'
import useCalculations from '~/store/calculations'

async function getLoadReferenceBookGroups() {
  const referenceBookGroupList = await useConstants().getReferenceBookGroups()
  const funcPurposesNamesArray: fpInterface[] = await useConstants().getFuncPurposes()
  const funcPurposesSet = new Set(funcPurposesNamesArray.map((funcPurpose: Record<string, any>) => funcPurpose.name))
  const funcPurposesArray: Array<string> = [...funcPurposesSet]

  return { referenceBookGroupList, funcPurposesArray }
}

export async function useReferenceBooks() {
  const referenceBooksSelected: Record<string, referenceBookSelectedType> = {}
  const referenceBooks: referenceBooksType = {}
  const referenceBookSourceLists: referenceBookSourceListsType = {}

  const { referenceBookGroupList, funcPurposesArray } = await getLoadReferenceBookGroups()

  const filteredReferenceBookGroupList = referenceBookGroupList.filter(
    (item: referenceBookType) =>
      item.type === useCalculations().aim.object_type && item.type_calc === useCalculations().aim.ads_type,
  )

  const structuredReferenceBookGroupList = []

  useCalculations().fieldsForStageTwo.forEach((field) => {
    let result = filteredReferenceBookGroupList.filter(
      (bookItem: referenceBookType) => bookItem.param_name === field.label,
    )

    if (result.length !== 0) {
      result = result.filter((item: referenceBookType) => {
        const controlArr = funcPurposesArray.filter((funcPurpose: string) => item.name_unique.includes(funcPurpose))
        if (!controlArr.length) {
          return item
        }
        return item.name_unique.includes(useCalculations().aim.func_purpose.name)
      })
    }

    if (result.length !== 0) {
      structuredReferenceBookGroupList.push({
        fieldName: field.field,
        groups: result,
      })
    }
  })

  if (useCalculations().aim.ads_type === 'R') {
    const result = filteredReferenceBookGroupList.filter(
      (bookItem: referenceBookType) => bookItem.param_name === 'КУ_ЭР',
    )
    if (result.length !== 0) {
      structuredReferenceBookGroupList.push({
        fieldName: UTILITIES,
        groups: result,
      })
    }
  }

  if (useCalculations().aim.object_type === 'L') {
    let result = filteredReferenceBookGroupList.filter(
      (bookItem: referenceBookType) =>
        bookItem.param_name === 'Группа вида разрешенного использования, согласно использованному справочнику',
    )
    if (result.length !== 0) {
      structuredReferenceBookGroupList.push({
        fieldName: 'land_permitted_use',
        groups: result,
      })
    }

    result = filteredReferenceBookGroupList.filter(
      (bookItem: referenceBookType) =>
        bookItem.param_name === 'Функциональное назначение земель с/х назначения, согласно использованному справочнику',
    )
    if (result.length !== 0) {
      structuredReferenceBookGroupList.push({
        fieldName: 'land_type_by_agro',
        groups: result,
      })
    }
  }

  const data = cloneDeep(useConstants().referenceBooks)

  for (const { fieldName, groups } of structuredReferenceBookGroupList) {
    referenceBooks[fieldName] = []
    for (let j = 0; j < groups.length; j++) {
      const dataArr = cloneDeep(data).filter((item: bookType) => item.group === groups[j].id)

      for (let i = 0; i < dataArr.length; i++) {
        dataArr[i].groupNameUnique = groups[j].name_unique
      }

      groups[j].books = cloneDeep(dataArr)

      groups[j].books = groups[j].books.map((item: bookType) => {
        const jsonData = cloneDeep(item.json_data)
        item.json_data =
          fieldName === 'land_permitted_use'
            ? jsonData
            : jsonData.filter(
                (el) =>
                  el[0] === useCalculations().aim.func_purpose.name ||
                  (typeof el[0] === 'string' && el[0].includes('Назначение')) ||
                  !el[0],
              )
        return item
      })

      groups[j].books = groups[j].books.filter((item: bookType) => {
        if (groups[j].type_data === 'M' || groups[j].type_data === 'F') {
          return item.json_data.length > 2
        }
        return item.json_data.length > 1
      })

      if (useCalculations().analogRegion && useCalculations().analogRegion !== 'Россия') {
        groups[j].books = groups[j].books.filter(
          (item: bookType) => item.region === useCalculations().analogRegion || item.region === 'Россия',
        )

        // if (groups[j].books.filter((item: bookType) => item.region !== 'Россия').length) {
        //   groups[j].books = groups[j].books.filter((item: bookType) => item.region !== 'Россия')
        // }
      }

      if (useCalculations().analogRegion && useCalculations().analogRegion === 'Россия') {
        groups[j].books = groups[j].books.filter(
          (item: bookType) => item.region && !['Москва', 'Санкт-Петербург'].includes(item.region),
        )
      }

      if (!groups[j].books.length) continue
      referenceBooks[fieldName][j] = groups[j]
    }
    // инициализация referenceBooksSelected
    const referenceBooksSelectedObject: referenceBookSelectedType = {
      group: null,
      book: null,
      valueCol: null,
      source: null,
    }
    referenceBooksSelected[fieldName] = cloneDeep(referenceBooksSelectedObject)
  }

  Object.keys(referenceBooks).forEach((item) => {
    referenceBooks[item] = referenceBooks[item].filter(() => true)
    if (!referenceBooks[item].length) {
      delete referenceBooks[item]
    }

    if (item === FLOOR_NUMBER) {
      referenceBooks[item].forEach((el) => {
        el.books[0].json_data.forEach((item) => {
          item[1] = String(item[1])
        })
      })
    }
  })
  Object.keys(referenceBooks).forEach((item) => {
    // инициализация referenceBookSourceLists
    const sourceSet: Set<string> = new Set()
    for (const book of referenceBooks[item]) {
      sourceSet.add(book.source)
    }
    sourceSet.add('Ручное')
    referenceBookSourceLists[item] = sourceSet
  })

  return { referenceBooks, referenceBooksSelected, referenceBookSourceLists }
}
