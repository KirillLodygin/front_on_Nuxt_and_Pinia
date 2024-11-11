import { getSecondStageScreenUrl } from '~/app_constants/api'
import useCalculations from '~/store/calculations'

export const useObjectEvolutionTableStageTwoArray = async () => {
  const aimCategoryId = useCalculations().aim.func_purpose.id.toString()

  return await $http.get(getSecondStageScreenUrl(aimCategoryId)).then((res: Record<string, any>) => {
    const data: any = Object.values(res._data)
    return [].concat(...data)
  })
}
