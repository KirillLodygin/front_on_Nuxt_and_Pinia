import useCalculations from '~/store/calculations'
import { GENERAL_INFORMATION, ACCORDING_GUIDE } from '~/app_constants/calculationsConsts'

export const useIsCorrectionFactorBlock = (field: string) => {
  if (
    useCalculations().engineeringCommunicationArray.slice(1).includes(field) ||
    useCalculations().locationFloorArray.slice(1).includes(field) ||
    useCalculations().utilitiesArray.concat(useCalculations().operatingCostsArray).includes(field)
  )
    return false

  const generalInformationFields = useCalculations().stageTwoTable.filter(
    (group) => group.group === GENERAL_INFORMATION,
  )[0].fields
  return (
    !useCalculations().fieldsWithValuesAccordingGuideArray.includes(`${field}${ACCORDING_GUIDE}`) &&
    !generalInformationFields.includes(field)
  )
}
