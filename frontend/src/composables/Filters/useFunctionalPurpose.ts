import { cloneDeep } from 'lodash'
import type { funcPurposeObjectType } from '~/types/objectsFiltersStoreTypes'
export type functionalPurposeListType = Array<funcPurposeObjectType> | []

export function useFunctionalPurpose() {
  function initFunctionalPurposeObject(functionalPurposeObject: any, functionalPurposeList: functionalPurposeListType) {
    functionalPurposeList.forEach((functionalPurpose) => {
      const { type, calc_type, name, id } = functionalPurpose

      if (calc_type) {
        const target = functionalPurposeObject[type][calc_type]

        if (!target.labels.includes(name)) {
          target.labels.push(name)
        }

        if (!target.ids.includes(id)) {
          target.ids.push(id)
        }
      }
    })

    return cloneDeep(functionalPurposeList)
  }

  return {
    initFunctionalPurposeObject,
  }
}
