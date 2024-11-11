import { createAimObjectFields } from '~/utils/objectUtils'
import useConstants from '~/store/constants'
import { api_meta_fields, api_meta_fields_group } from '~/app_constants/api'
import { cloneDeep } from 'lodash'

export async function useAimModalFields(aim: Record<string, any>) {
  try {
    const { _data: fields } = await $http.get(api_meta_fields, {
      params: {
        functional_purpose: aim.func_purpose.id,
        exchange_type: 'M',
        stage: 0,
      },
    })
    const { _data: fields_groups } = await $http.get(api_meta_fields_group, {
      params: {
        functional_purpose: aim.func_purpose.id,
        exchange_type: 'M',
        stage: 0,
      },
    })
    const fields_options = cloneDeep(useConstants().fieldsOptions)
    const { fields: fieldsAll } = createAimObjectFields(fields, fields_groups, fields_options, aim)
    return fieldsAll
  } catch (err) {
    console.log(err)
  }
}
