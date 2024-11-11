import { isEmpty } from 'lodash'
import { DATE_CALC, ADS_UPDATED } from '~/app_constants/calculationsConsts'
import useCalculations from '~/store/calculations'

export const useIsBlockRunCalculations = () => {
  let isBlock = true
  if (useCalculations().activeTabIndex === 0) {
    if (
      !isEmpty(useCalculations().order) &&
      useCalculations().order?.calc_source.adjustableFields
    ) return !isBlock

    for (let i = 0; i < useCalculations().selectedAnalogs.length; i++) {
      for (let y = 0; y < useCalculations().adjustableFields.length; y++) {
        if (
          !isEmpty(useCalculations().order) &&
          (useCalculations().fieldsWithValuesAccordingGuideArray.includes(useCalculations().adjustableFields[y]) ||
            useCalculations().locationFloorArray.slice(1).includes(useCalculations().adjustableFields[y]) ||
            useCalculations().engineeringCommunicationArray.includes(useCalculations().adjustableFields[y]))
        ) {
          continue
        }
        isBlock =
          useCalculations().adjustableFields[y] === DATE_CALC
            ? !!useCalculations().selectedAnalogs[i][ADS_UPDATED]
            : !!useCalculations().selectedAnalogs[i][useCalculations().adjustableFields[y]]

        if (!isBlock) break
      }
      if (!isBlock) break
    }
    return !isBlock
  }

  if (
    useCalculations().activeTabIndex > 0 &&
    useCalculations().activeTabIndex < useCalculations().stageTwoTable.length
  ) {
    isBlock = false
    for (let i = 0; i < useCalculations().stageTwoTable[useCalculations().activeTabIndex].fields.length; i++) {
      if (
        useCalculations().referenceBooksSelected[
          useCalculations().stageTwoTable[useCalculations().activeTabIndex].fields[i]
        ]?.source === 'Ручное' &&
        useCalculations().corrections[
          useCalculations().stageTwoTable[useCalculations().activeTabIndex].fields[i]
        ]?.reduce((sum, current) => +sum + Number(current), 0) !== 0 &&
        !useCalculations().notesObject[useCalculations().stageTwoTable[useCalculations().activeTabIndex].fields[i]] &&
        !useCalculations()
          .utilitiesArray.slice(1)
          .concat(useCalculations().operatingCostsArray)
          .includes(useCalculations().stageTwoTable[useCalculations().activeTabIndex].fields[i])
      ) {
        isBlock = !isBlock
        break
      }
    }
    return isBlock
  }

  return false
}
