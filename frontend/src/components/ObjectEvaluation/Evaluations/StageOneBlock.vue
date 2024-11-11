<template>
  <div
    :class="{ 'my-pointer-event': $calculations.evaluationStatus === 'E' }"
    class="overflow-y-auto overflow-x-hidden position-relative h-100"
  >
    <table class="table table-content" style="{table-layout: fixed}">
      <thead id="_columns" class="w-100">
        <tr>
          <th class="col align-middle text-center" scope="col" style="width: 3%"></th>
          <th class="col" scope="col" style="width: 20%">Показатель</th>
          <th class="col" scope="col" style="width: 20%">Объект оценки</th>

          <th v-for="(analog, index) of displayedAnalogs" class="col" scope="col" style="width: 20%">
            <div class="d-flex w-100 justify-content-lg-start">
              <div class="position-relative">
                <div
                  v-if="$calculations.selectedAnalogs.length > 3 && index === 0"
                  class="btn btn-outline-secondary btn-sm-rounded analogs-carousel left"
                  :class="{ disabled: analogsViewStartIndex === 0 }"
                >
                  <i class="icon icon-lg fi_chevron-left" @click="() => switchAnalogsCarousel('-')" />
                </div>
              </div>
              <div
                :id="`row_${index}_${analog.id}`"
                :class="{
                  'text-danger': 'is_deleted_error' in analog && analog['is_deleted_error'],
                }"
                class="d-flex align-items-center"
                style="white-space: nowrap"
              >
                Предложение #{{ analogsViewStartIndex + index + 1 }}
                <div
                  class="btn btn-outline-secondary btn-sm-rounded analogs-carousel-func"
                  @click="() => openGallery(analog)"
                >
                  <i class="icon icon-lg fi_image" />
                </div>
                <div
                  v-if="$calculations.evaluationStatus !== 'E'"
                  class="btn btn-outline-secondary btn-sm-rounded analogs-carousel-func"
                  @click="() => navToAnalog(analog)"
                >
                  <i class="icon icon-lg fi_edit-3" />
                </div>
                <div
                  v-if="$calculations.evaluationStatus !== 'E'"
                  class="btn btn-outline-secondary btn-sm-rounded analogs-carousel-func"
                  @click="() => removeAnalog(analog)"
                >
                  <i class="icon icon-lg fi_x" />
                </div>
              </div>
              <div class="position-relative">
                <div
                  v-if="$calculations.selectedAnalogs.length > 3 && index === displayedAnalogs.length - 1"
                  class="btn btn-outline-secondary btn-sm-rounded analogs-carousel right"
                  :class="{ disabled: analogsViewStartIndex + 3 === $calculations.selectedAnalogs.length }"
                  style="right: -20px"
                >
                  <i class="icon icon-lg fi_chevron-right" @click="switchAnalogsCarousel('+')" />
                </div>
              </div>
            </div>
            <BTooltip
              v-if="'is_deleted_error' in analog && analog['is_deleted_error']"
              :target="`row_${index}_${analog.id}`"
              custom-class="tooltip-xl"
              placement="left"
              triggers="hover"
            >
              <div class="text-start w-100">{{ analog_error_text }}</div>
            </BTooltip>
          </th>
        </tr>
      </thead>

      <tbody id="_body">
        <template v-for="(group, index) of fieldsForStageOne" class="table-string">
          <tr v-if="group.title && isGroupNotEmpty(group.fields)">
            <td></td>
            <td :colspan="displayedAnalogs.length + 2" class="h5 text-primary-emphasis">{{ group.title }}</td>
          </tr>
          <template v-for="field of group.fields" :key="field">
            <tr v-if="getObjectFieldName(aim, field)">
              <td>
                <i
                  v-if="
                    group.group !== 'standart_fields' &&
                    !['kadast_number', 'id', 'price_sale', 'price_sale_per_m', 'address_raw', 'address_by_tz'].includes(
                      field,
                    )
                  "
                  :class="[
                    'icon icon-lg',
                    adjustableFields.includes(field)
                      ? 'fi_checked-theme icon-primary'
                      : 'fi_unchecked-theme icon-secondary',
                  ]"
                  @click="updateAdjustableFields(field)"
                />
              </td>
              <td>{{ getFieldName(field) }}</td>
              <td>
                {{
                  field === 'date_calc'
                    ? dateFormatting(getObjectFieldName(aim, field))
                    : getObjectFieldName(aim, field)
                }}
              </td>

              <td
                v-for="(analog, index) of displayedAnalogs"
                :class="{
                  'bg-danger-subtle rounded-2':
                    adjustableFields.includes(field) &&
                    !getObjectFieldName(analog, field === 'date_calc' ? 'ads_updated' : field, getAnalogIndex(analog)),
                }"
              >
                {{
                  field === 'date_calc'
                    ? dateFormatting(getObjectFieldName(analog, 'ads_updated', getAnalogIndex(analog)))
                    : getObjectFieldName(analog, field, getAnalogIndex(analog))
                }}
              </td>
            </tr>
          </template>
        </template>
      </tbody>
    </table>
    <Gallery v-model="isGalleryOpen" :imgSrcList="imgSrcList" :index="0"></Gallery>
  </div>
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import { isEmpty } from 'lodash'
import type { aimType } from '~/types/calculationsTypes'
import Gallery from '~/components/UI-KIT/Gallery.vue'
import { pathToImagesLink } from '~/app_constants/filesGroup'
import { dateFormatting } from '~/utils/calculationsUtils'
import { analog_error_text } from '~/app_constants/wordAbbreviations'

const { $calculations, $baseURL } = useNuxtApp()

const analogsViewStartIndex = ref(0)

const aim = computed(() => $calculations.aim)
const analogs = computed(() => $calculations.selectedAnalogs)
const fieldsForStageOne = computed(() => $calculations.stageOneTable)
const adjustableFields = computed(() => $calculations.adjustableFields)
const displayedAnalogs = computed(() =>
  $calculations.selectedAnalogs.slice(analogsViewStartIndex.value, analogsViewStartIndex.value + 3),
)
const order = computed(() => $calculations.order)

const getFieldName = (field: string) => {
  return $calculations.getFieldName(field)
}

const getObjectFieldName = (object: any, field: string, index?: undefined | number) => {
  return $calculations.getObjectFieldName(object, field, index)
}

const switchAnalogsCarousel = (sign: string) => {
  if (sign === '-' && analogsViewStartIndex.value > 0) {
    analogsViewStartIndex.value--
  }
  if (sign === '+' && analogsViewStartIndex.value < analogs.value.length - 3) {
    analogsViewStartIndex.value++
  }
}

const removeAnalog = (analog: aimType) => {
  const filteredAnalogs = $calculations.selectedAnalogs.filter((item: aimType) => item.id !== analog.id)
  $calculations.initSelectedAnalogs()
  $calculations.setSelectedAnalogs(filteredAnalogs)

  if ($calculations.selectedAnalogs.length === 0) {
    navigateTo(`/evaluation/${$calculations.aim.id}#Расчёты`)
  }
}

const navToAnalog = (analog: aimType) => {
  navigateTo(`/analog/${analog.id}#Базовые поля`)

  const route = useRoute()
  $calculations.setAimPath({
    path: route.path,
    hash: route.hash,
  })
}

const isGalleryOpen: Ref<boolean> = ref(false)
const imgSrcList: Ref<any> = ref([])
const openGallery = (analog: aimType) => {
  const result: { title: string; url: string }[] = []
  if ('ads_screenshot' in analog) {
    result.push({
      title: analog.ads_screenshot.split('/')[-1],
      url: analog.ads_screenshot.includes('http')
        ? analog.ads_screenshot
        : $baseURL + pathToImagesLink + analog.ads_screenshot,
    })
  }
  if ('images_links' in analog) {
    analog.images_links.forEach((link: string) => {
      result.push({
        title: link.split('/')[-1],
        url: link.includes('http') ? link : $baseURL + pathToImagesLink + link,
      })
    })
  }
  imgSrcList.value = result
  isGalleryOpen.value = true
}

const isGroupNotEmpty = (fields: Array<string>) => {
  const actualAimFields = fields.filter((field) => !!aim.value[field])
  return actualAimFields.length > 0
}

const getAnalogIndex = (analog: Record<string, any>) => {
  const idsArr = analogs.value.map((analog) => analog.id)
  return idsArr.indexOf(analog.id)
}

const updateAdjustableFields = (field: string) => {
  if (!isEmpty(order.value) && order.value.evaluation_status === 'E') return
  $calculations.updateAdjustableFields(field)
}
</script>
