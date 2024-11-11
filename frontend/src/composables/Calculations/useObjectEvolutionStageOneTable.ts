import { getFirstStageScreenUrl } from '~/app_constants/api'

export async function useObjectEvolutionStageOneTable(aimCategoryId: string) {
  try {
    const { _data: resp } = await $http.get(getFirstStageScreenUrl(aimCategoryId))
    const respValues: any = Object.values(resp)
    return [].concat(...respValues)
  } catch (err) {
    console.log(err)
  }
}
