import { api_unversal_realty } from '~/app_constants/api'

export async function useShortAim(id: string | string[]) {
  try {
    const { _data: shortAim } = await $http.get(api_unversal_realty + `short/${id}`)
    return shortAim
  } catch (err) {
    console.log(err)
  }
}
