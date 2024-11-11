import useCalculations from '~/store/calculations'
import { useFinalCorrections } from '~/composables/Calculations/useFinalCorrections'

export const useSecondGroupFieldsFinalCorrections = (analogCounter: number) => {
  let result: number | string = 0

  const actualGroup = useCalculations().isBuildingForSale
    ? useCalculations().fieldsForCorrectionWithoutAccountLandPlot
    : useCalculations().secondGroupFields

  actualGroup
    .filter(
      (item: string) =>
        !useCalculations().engineeringCommunicationArray.includes(item) &&
        !useCalculations().locationFloorArray.includes(item) &&
        Object.keys(useCalculations().corrections).includes(item) &&
        useCalculations().adjustableFields.includes(item),
    )
    .forEach((key: string) => {
      result =
        useFinalCorrections(key, analogCounter) === 'Ошибка!' || result === 'Ошибка!'
          ? 'Ошибка!'
          : Number(result) + Number(useFinalCorrections(key, analogCounter))
    })

  return result
}
