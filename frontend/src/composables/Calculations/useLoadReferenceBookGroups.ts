import { cloneDeep } from 'lodash'
import useConstants from '~/store/constants'
import type { fpInterface } from '~/store/constants'

export async function useLoadReferenceBookGroups() {
  const referenceBookGroupList = cloneDeep(useConstants().referenceBookGroups)
  const funcPurposesNamesArray: fpInterface[] = cloneDeep(useConstants().funcPurposes)
  const funcPurposesSet = new Set(funcPurposesNamesArray.map((funcPurpose: Record<string, any>) => funcPurpose.name))
  const funcPurposesArray = [...funcPurposesSet]

  return { referenceBookGroupList, funcPurposesArray }
}
