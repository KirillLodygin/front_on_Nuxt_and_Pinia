<template>
  <div class="overflow-y-auto overflow-x-hidden position-relative h-100">
    <table
      v-if="accessPerms.some((perm) => userPermissions.includes(perm))"
      class="table table-content"
      style="table-layout: fixed"
    >
      <thead id="_columns" class="w-100">
        <tr>
          <th class="col" scope="col" style="width: 20%">Показатель</th>
          <th class="col" scope="col">Объект оценки</th>
          <th v-for="(analog, index) of displayedAnalogs" class="col" scope="col" style="width: 20%">
            <div class="d-flex w-100 justify-content-between">
              <div class="position-relative w-75">
                <div
                  v-if="analogs.length > 3 && index === 0"
                  :class="{ disabled: analogsViewStartIndex === 0 }"
                  class="btn btn-outline-secondary btn-sm-rounded analogs-carousel left"
                >
                  <i class="icon icon-lg fi_chevron-left" @click="() => switchAnalogsCarousel('-')" />
                </div>
                <div class="d-flex align-items-center" style="white-space: nowrap">
                  Предложение #{{ analogsViewStartIndex + index + 1 }}
                </div>
              </div>
              <div class="position-relative w-25">
                <div
                  v-if="analogs.length > 3 && index === displayedAnalogs.length - 1"
                  :class="{ disabled: analogsViewStartIndex + 3 === analogs.length }"
                  class="btn btn-outline-secondary btn-sm-rounded analogs-carousel right"
                >
                  <i class="icon icon-lg fi_chevron-right" @click="() => switchAnalogsCarousel('+')" />
                </div>
              </div>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="elem in finalTableArr">
          <tr :class="{ 'stage-two-table-field-tr': !isCorrectField(elem) }">
            <template v-if="isTitleField(elem)">
              <td class="fw-bolder" colspan="5">
                {{ getFieldName(elem) }}
              </td>
            </template>
            <template v-else>
              <td class="align-middle">
                {{ getFieldName(elem) }}
              </td>
              <td>{{ getObjectValue(elem, 1) }}</td>
              <td v-for="analog of displayedAnalogs">{{ getObjectValue(elem, getAnalogIndex(analog)) }}</td>
            </template>
          </tr>
        </template>
      </tbody>
    </table>
    <div class="h5 text-primary-emphasis mt-5 mb-3">Результаты экспресс-оценки</div>
    <table class="table table-content w-50">
      <tbody>
        <tr>
          <td class="fw-medium h6 text-primary-emphasis">Аналогов в подборке</td>
          <td class="text-nowrap">
            {{ analogs.length }}
          </td>
        </tr>

        <tr>
          <td v-if="adsType === 'S' && expressResults.rub_sq_m" :colspan="2" class="h6 text-primary-emphasis">
            Удельные показатели
          </td>
        </tr>

        <template
          v-if="adsType === 'S' && expressResults.rub_sq_m"
          v-for="(arr, index) of expressResults.rub_sq_m"
          :key="`rub_sq_m_${index}`"
        >
          <template v-for="item in arr">
            <template v-for="[key, val] in Object.entries(item)" :key="key">
              <tr>
                <td class="fw-medium">
                  {{ key }}
                </td>
                <td class="text-nowrap">
                  {{ val }}
                </td>
              </tr>
            </template>
          </template>
        </template>

        <tr>
          <td v-if="adsType === 'S' && expressResults.rub" :colspan="2" class="h6 text-primary-emphasis">
            Итого, за объект
          </td>
        </tr>

        <template
          v-if="adsType === 'S' && expressResults.rub"
          v-for="(arr, index) of expressResults.rub"
          :key="`rub_${index}`"
        >
          <template v-for="item in arr">
            <template v-for="[key, val] in Object.entries(item)" :key="key">
              <tr>
                <td class="fw-medium">
                  {{ key }}
                </td>
                <td class="text-nowrap">
                  {{ val }}
                </td>
              </tr>
            </template>
          </template>
        </template>

        <template v-if="adsType === 'R'">

          <td :colspan="2" class="h6 text-primary-emphasis">Результаты экспресс-оценки</td>

          <template v-for="(arr, index) of expressResults.results" :key="`results_${index}`">
            <template v-for="item in arr">
              <template v-for="[key, val] in Object.entries(item)" :key="key">
                <tr :class="{ 'stage-two-table-field-tr': index % 2 !== 0 }">
                  <td class="fw-medium">
                    {{ key }}
                  </td>
                  <td class="text-nowrap">
                    {{ val }}
                  </td>
                </tr>
              </template>
            </template>
          </template>

        </template>
      </tbody>
    </table>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import { numberWithSpaces } from '~/utils/calculationsUtils'
import useUserPermissions from '~/composables/useUserPermissions'

const { $auth, $calculations } = useNuxtApp()

const accessPerms = ['IS', 'ADMIN']
const userPermissions: string[] = useUserPermissions($auth.user?.permissions)

const finalTableArr = computed(() => $calculations.finalTableArr)
const analogs = computed(() => $calculations.currentAnalogs)
const expressResults = computed(() => $calculations.expressResults)
const adsType = computed(() => $calculations.aim.ads_type)

const getFieldName = (elem: (string | number | null)[]) => {
  if (elem[0] === 'ID') return 'ID объекта'
  return elem[0]
}
const getObjectValue = (elem: (string | number | null)[], index: number) => {
  if (elem[index] === '—') return '—'
  if (elem[0] === 'ID') return elem[index]
  if (elem[index] && typeof elem[index] === 'number') {
    return (elem[index] as number).toFixed(2)
  }
  if (elem[index] && isRubField(elem)) {
    if (index === 1) return '—'
    const val = Number(elem[index]?.toString().replace(' ₽', '').replace(' ', ''))
    return numberWithSpaces(val.toFixed(0)) + ' ₽'
  }
  if (elem[index] && isCorrectField(elem)) {
    const val = Number(elem[index]?.toString().replace(' %', ''))
    return val.toFixed(2)
  }
  return elem[index]
}
const analogsViewStartIndex = ref(0)
const displayedAnalogs = computed(() =>
  analogs.value.slice(analogsViewStartIndex.value, analogsViewStartIndex.value + 3),
)

const getAnalogIndex = (analog: Record<string, any>) => {
  const idsArr = analogs.value.map((analog: Record<string, any>) => analog.id)
  return idsArr.indexOf(analog.id) + 2
}
const isCorrectField = (elem: (string | number | null)[]) => elem[0]?.toString().toLowerCase().includes('коррект')
const isRubField = (elem: (string | number | null)[]) => elem[0]?.toString().toLowerCase().includes('руб.')
const isTitleField = (elem: (string | number | null)[]) =>
  elem[0]?.toString().toLowerCase().includes('элементов сравнения')
const switchAnalogsCarousel = (sign: string) => {
  if (sign === '-' && analogsViewStartIndex.value > 0) {
    analogsViewStartIndex.value--
  }
  if (sign === '+' && analogsViewStartIndex.value < analogs.value.length - 3) {
    analogsViewStartIndex.value++
  }
}
</script>
