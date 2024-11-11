import { LAND_AREA, LAND_RIGHTS_ADDITIONAL, ACCORDING_GUIDE } from '~/app_constants/calculationsConsts'
import useCalculations from '~/store/calculations'
import { useAimAddFactorsFieldsArr } from '~/composables/Calculations/useAimAddFactorsFieldsArr'

export const useCorrectionCalculatedValue = (field: string, corr1: number | string, corr2: number | string) => {
  if (!useCalculations().referenceBooksSelected[field]) return 0

  if (corr1 === '—' && corr2 === '—') {
    return '—'
  }

  if (
    useCalculations().referenceBooksSelected[field].source === 'Ручное' ||
    useCalculations().firstGroup.includes(field) ||
    useAimAddFactorsFieldsArr().includes(field)
  ) {
    return corr2
  }

  const { group: groupNum } = useCalculations().referenceBooksSelected[field]
  if (
    (groupNum !== null && useCalculations().referenceBooks[field]?.[groupNum].type_data === 'M') ||
    (groupNum !== null && useCalculations().referenceBooks[`${field}${ACCORDING_GUIDE}`]?.[groupNum].type_data === 'M')
  ) {
    if (Number(corr2) === 0) return 0
    return (Number(corr2) - 1) * 100
  }

  if (Number(corr1) === 0 || corr1 === '—' || !corr1) {
    if (Number(corr2) === 0 || corr2 === '—' || !corr2) return 0
    return 'Ошибка!'
  }
  if (Number(corr2) === 0 || corr2 === '—' || !corr2) {
    if (Number(corr1) === 0 || corr1 === '—' || !corr1) return 0
    return 'Ошибка!'
  }

  return useCalculations().isBuildingForSale && (field === LAND_AREA || field === LAND_RIGHTS_ADDITIONAL)
    ? (Number(corr2) / Number(corr1) - 1) * 100
    : (Number(corr1) / Number(corr2) - 1) * 100
}
