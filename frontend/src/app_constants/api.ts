export const api_user = '/api/v1/auth/user/'
export const api_user_profile = '/api/v1/auth/profile/'
export const api_address_vermins = 'api/v1/references/address_vermins/'
export const api_unversal_realty = '/api/v1/realty/universal_realty/'
export const api_functional_purpose = '/api/v1/realty/functional_purpose/'
export const api_meta_fields_group = '/api/v1/meta/fields_groups/'
export const api_meta_fields = '/api/v1/meta/fields/'
export const api_fields_options = '/api/v1/realty/universal_realty/'
export const api_orders = '/api/v1/order/orders/'
export const api_search_fields = '/api/v1/realty/search_fields/'
// для данных из таблицы констант БД
export const api_constant = '/api/v1/references/constants/'
export const api_layer_id = '?key=geo_layer_release_one_'
export const api_osm_layer_id = '?key=osm_layer_id'
export const api_geo_layers_ids_for_users = '?key=geo_layers_ids_for_users'
export const api_geo_objects_in_radius = '/api/v1/layers/geo_object_in_radius/'
export const api_report = '/api/v1/report/'
export const api_export_word = '/api/v1/report/estimate/'
export const api_export_analogs_excel = '/api/v1/report/analogs_xlsx/'
export const api_export_analogs_word = '/api/v1/report/analogs_docx/'
export const api_export_general_analogs_excel = '/api/v1/report/general_analogs_xlsx/'
export const api_users = '/api/v1/auth/users/'
export const api_all_analogs = 'api/v1/realty/all_analogs/'
export const api_reference_book_groups = '/api/v1/order/reference_book_groups/'
export const api_reference_books = `/api/v1/order/reference_books/?type=P`
export const api_upload_reference = '/api/v1/order/upload/'
export const api_unversal_realty_check = '/api/v1/realty/universal_realty/check/'
export const api_unversal_realty_clone = '/api/v1/realty/universal_realty/copy/'
export const api_realty_objects = '/api/v1/osm_obj/realty_objects/'
export const api_realty_objects_realty_cards = '/api/v1/osm_obj/realty_objects/?realty_cards='
export const api_link_objects = 'move/'
export const api_link_cards = 'set_rel/'
export const api_route = 'route?json='
export const api_worker_stat = '/api/v1/report/worker_stat/'
export const api_get_realty_objects_in_coords = '/api/v1/osm_obj/get_by_coords/'
export const api_fix_realty_object_paths = '/api/v1/osm_obj/realty_objects/fix/'
export const api_update_distances = '/api/v1/osm_obj/realty_objects/update_distances/'
export const api_geo_layer_tree = 'api/v1/layers/geo_layer_tree/'
export const api_geo_object_upload = '/api/v1/layers/geo_object_upload/'
export const api_geo_object = '/api/v1/layers/geo_object/'
export const api_geo_layer = '/api/v1/layers/geo_layer/'
export const api_update_card_data = '/api/v1/layers/update_card_data/'
export const api_compare = '/api/v1/osm_obj/compare/'
export const api_valhalla_request = '/api/v1/layers/valh/'

export const api_table =
  '/api/v1/realty/all_analogs/?ads_updated__range=2022-12-07,2023-12-07&object_type=Q&func_purpose__in=125&date_calc=2023-12-07&source_area=15.00&lat=59.93572687186045&lon=30.415871593253144&iteration=4'

export const getFirstStageScreenUrl = (aimCategoryId: string) => {
  return `/api/v1/meta/fields_groups/?functional_purpose=${aimCategoryId}&stage=1`
}

export const getSecondStageScreenUrl = (aimCategoryId: string) => {
  return `/api/v1/meta/fields_groups/?functional_purpose=${aimCategoryId}&stage=2`
}

export const getSelectedAnalogsUrl = (analogId: string) => {
  return `/api/v1/realty/universal_realty/${analogId}/`
}

export const getReferenceBookListForProgramUrl = (aimCategoryId: string) => {
  return `/api/v1/order/reference_books/?group=${aimCategoryId}&type=P`
}

export const getReferenceBookListForReportUrl = (aimCategoryId: string) => {
  return `/api/v1/order/reference_books/?group=${aimCategoryId}&type=R`
}

export const getModifiedByUserRealtiesUrl = (userId: number, monthAgo: string, today: string) =>
  api_unversal_realty +
  `?modified_by_id=${userId}&ads_updated_internal__gte=${monthAgo}&ads_updated_internal__lte=${today}&limit=1000&sort_data=-ads_updated_internal`
