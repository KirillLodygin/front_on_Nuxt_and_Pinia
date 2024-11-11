import { cloneDeep } from 'lodash'
import useCalculations from '~/store/calculations'
import type { referenceBooksSelectedType, referenceBookSelectedType } from '~/types/calculationsTypes'

export const useReferenceBooksSelectedObjects = () => {
  const referenceBooksSelected: referenceBooksSelectedType = {}

  const filteredCorrections = Object.keys(useCalculations().corrections).filter(
    (field) =>
      !Object.keys(useCalculations().referenceBooks).includes(field) &&
      !useCalculations().engineeringCommunicationArray.slice(1).includes(field) &&
      !useCalculations().locationFloorArray.slice(1).includes(field),
  )
  filteredCorrections.forEach((field) => {
    const referenceBooksSelectedObject: referenceBookSelectedType = {
      group: 0,
      book: 0,
      valueCol: 0,
      source: 'Ручное',
    }
    referenceBooksSelected[field] = cloneDeep(referenceBooksSelectedObject)
  })
  return referenceBooksSelected
}
