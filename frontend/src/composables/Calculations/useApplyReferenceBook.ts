import {
  PERMISSION_TYPE_GROUP,
  PERMISSION_USE_TYPE_SUBGROUP,
  UTILITIES,
  FLOOR_NUMBER,
  AVAILABILITY_OF_ENGINEERING_SUPPORT,
  TERMS_OF_SALE,
} from '~/app_constants/calculationsConsts'
import useCalculations from '~/store/calculations'

export const useApplyReferenceBook = (fieldName: string) => {
  if (fieldName === PERMISSION_TYPE_GROUP || fieldName === PERMISSION_USE_TYPE_SUBGROUP) {
    return
  }

  if (fieldName === UTILITIES) {
    useCalculations().setNewPublicUtilitiesAndOperatingCostsCorrections(fieldName)
    if (!useCalculations().isOnRunCalculations) {
      useCalculations().getResults()
    }
    return
  }

  if (fieldName === FLOOR_NUMBER) {
    useCalculations().setNewLocationFloorCorrections()
    if (!useCalculations().isOnRunCalculations) {
      useCalculations().getResults()
    }
    return
  }

  if (fieldName === AVAILABILITY_OF_ENGINEERING_SUPPORT) {
    useCalculations().setEngineeringCommunicationCorrections(fieldName)
    if (!useCalculations().isOnRunCalculations) {
      useCalculations().getResults()
    }
    return
  }

  if (
    useCalculations().aimModalFields.filter((item) => item.field === fieldName)[0]?.hasCorrectionFactor ||
    fieldName === TERMS_OF_SALE
  ) {
    useCalculations().setNewCorrections(fieldName)
    if (!useCalculations().isOnRunCalculations) {
      useCalculations().getResults()
    }
  }
}
