import { api_unversal_realty } from '~/app_constants/api'

export async function useAim(id: string | string[]) {
  try {
    const { _data: fullAim } = await $http.get(api_unversal_realty + id)
    return fullAim
  } catch (err) {
    console.log(err)
  }
}
