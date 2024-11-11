import useCalculations from '~/store/calculations'
import {
  rentCalculationArray,
  PRICE_SALE_PER_M,
  ACCORDING_GUIDE,
  FUNC_PURPOSE,
  ADDRESS_RAW,
  OBJECT_TYPE,
  utilitiesFields,
  operatingCostsFields,
} from '~/app_constants/calculationsConsts'

export const useStageTwoTableAllFieldsArr = () => {
  return useCalculations()
    .objectEvolutionTableStageTwoArray.map((item) => item.fields)
    .reduce((arr, current) => arr.concat(current), [])
    .filter(
      (field: string) =>
         [PRICE_SALE_PER_M, FUNC_PURPOSE, ADDRESS_RAW, OBJECT_TYPE].includes(field) ||
        useCalculations().adjustableFields.includes(field) ||
        useCalculations().adjustableFields.includes(`${field}${ACCORDING_GUIDE}`) ||
        useCalculations().locationFloorArray.includes(field) ||
        rentCalculationArray.includes(field) ||
        Object.keys(utilitiesFields).concat(Object.keys(operatingCostsFields)).includes(field) ||
        useCalculations().engineeringCommunicationArray.includes(field) ||
        (field.includes(ACCORDING_GUIDE) &&
          useCalculations().adjustableFields.includes(field.replace(ACCORDING_GUIDE, ''))),
    )
}
