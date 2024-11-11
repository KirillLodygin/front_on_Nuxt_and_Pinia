<template>
  <template
    v-if="
      !(objectType === 'L' && (objectTypeCalc === 'NE' || adsType === 'R')) &&
      !isEmptyObjectError &&
      !isObjectError &&
      !createAccessDenied
    "
  >
    <Card
      v-if="!scenarioIsLoading"
      ref="cardRef"
      :tabs-structure="tabsStructure"
      :header-structure="headerStructure"
      :key-menu="keyMenu"
      :structureComputed="sideBarComputed"
      :designation="MenuSideBarDesignation"
      :tabs-to-display-footer="tabsToDisplayFooter"
      :navigateble-tabs-arr="navigatebleTabsArr"
      :next-available-modificator="!(isNew || !isBaseFieldsReady)"
      :previous-available-modificator="!(isNew || !isBaseFieldsReady)"
      :to-display-menus-side-bar="currentSectionName !== research"
    >
      <template #headerFunctionality="{ section }">
        <HeaderFunctionality
          :is-base-fields-ready="isBaseFieldsReady"
          :is-new="isNew"
          :mutable-data="mutableData"
          :is-required-fields-ready="initialRequiredFieldsReady"
          :is-form-changed="isFormChanged"
          :current-section="section"
          @set-default="handleSetDefault"
          @delete-obj="handleDeleteObj"
          @synchronization-card-data="dataSynchronization"
        />
      </template>
      <template #body="{ section, tab, isConst }">
        <BaseFields
          v-if="!isConst && tab === baseFields"
          :fields="fieldsComputed"
          :func-purposes-by-type-computed="functionalPurposeByTypeComputed"
          :is-new="isNew"
          :mutable-data="mutableData"
          :mutable-options="evoluationMutableOptions"
          :section-id="section"
          :tab="tab"
          :disable-coords="noNavigateNewObject"
          @add-rent-result="addRentResult"
          @delete-rent-result="deleteRentResult"
          @update-mutable-data="(field: string, value: any) => onUpdateData(field, value, section, tab)"
        />
        <StandartFields
          v-else-if="!isConst && tab && tab === standartFields"
          :key="tab"
          :scenario="metaScenario[standartFields]"
          :func-purposes-by-type-computed="functionalPurposeByTypeComputed"
          :is-new="isNew"
          :mutable-data="mutableData"
          :mutable-options="evoluationMutableOptions"
          :section-id="currentSectionName"
          :tab="tab"
          @add-rent-result="addRentResult"
          @delete-rent-result="deleteRentResult"
          @update-mutable-data="
            (field: string, value: any, sectionId: string) => onUpdateData(field, value, sectionId, tab)
          "
          @set-section="(value: any) => (currentSectionName = value)"
        />

        <StandartFields
          v-else-if="!isConst && tab === pzz"
          :scenario="metaScenario[pzz]"
          :func-purposes-by-type-computed="functionalPurposeByTypeComputed"
          :is-new="isNew"
          :mutable-data="mutableData"
          :mutable-options="evoluationMutableOptions"
          :section-id="currentSectionName"
          :tab="tab"
          @add-rent-result="addRentResult"
          @delete-rent-result="deleteRentResult"
          @update-mutable-data="
            (field: string, value: any, sectionId: string) => onUpdateData(field, value, sectionId, tab)
          "
          @set-section="(value: any) => (currentSectionName = value)"
        />

        <GeoTsof
          v-else-if="section === locationAccessibility && geoPos.coordinates[0] && geoPos.coordinates[1] && !isNew"
          :is-linked-real-estate="isLinkedRealEstate"
          :geo_pos="geoPos"
        />

        <Files
          v-else-if="section === photo"
          :is-new="isNew"
          :mutable-data="mutableData"
          :mode="photo"
          :api-url="api_unversal_realty"
          :files-group-data-prop="filesGroupCard"
          :object-type="objectType"
          :object-type-calc="objectTypeCalc"
          :disabled-modifier="$objectStore.readOnly"
          :required-files-accessor="$objectStore.scenarioByTabs[photo][photo].requiredFields"
          :is-card="true"
        />
        <Files
          v-else-if="section === documents"
          :is-new="isNew"
          :mutable-data="mutableData"
          :mode="documents"
          :api-url="api_unversal_realty"
          :files-group-data-prop="filesGroupCard"
          :object-type="objectType"
          :object-type-calc="objectTypeCalc"
          :disabled-modifier="$objectStore.readOnly"
          :required-files-accessor="$objectStore.scenarioByTabs[documents][documents].requiredFields"
          :is-card="true"
        />
        <GeoLayers
          v-else-if="section === geoLayer"
          :lat="mutableData.geo_pos.coordinates[1]"
          :lng="mutableData.geo_pos.coordinates[0]"
          :mutable-data="mutableData"
        />
        <History
          v-else-if="section === history"
          :mutable-data="mutableData"
          :mutable-options="evoluationMutableOptions"
        />
        <TradeInfo
          v-else-if="section === trade"
          :trade-info="mutableData.trade_info"
          :ads-type="mutableData.ads_type"
          :date-trade="mutableData.date_trade || ''"
          :price-start="Number(mutableData.price_start)"
          :price-start-per-m="Number(mutableData.price_start_per_m)"
          :price-sale="Number(mutableData.price_sale)"
          :price-sale-per-m="Number(mutableData.price_sale_per_m)"
          :object-area="Number(mutableData.object_area)"
          :mutable-options="evoluationMutableOptions"
          @update-mutable-data="(field: string, value: any) => onUpdateData(field, value, section, tab)"
        />
        <AddFactors
          v-else-if="section === factors"
          :add-factors="mutableData.add_factors"
          @update-mutable-data="(field: string, value: any) => onUpdateData(field, value, section, tab)"
        />
        <DevelopmentAnalysis
          v-else-if="section === development"
          :mutable-options="evoluationMutableOptions"
          :mutable-data="mutableData"
          :values-prop="valuesProp"
          @update-mutable-data="(field: string, value: any) => onUpdateData(field, value, section, tab)"
        />
        <ObjectDeal
          v-else-if="section === deal"
          :mutable-data="mutableData"
          :mutable-options="evoluationMutableOptions"
          @update-mutable-data="(field: string, value: any) => onUpdateData(field, value, section, tab)"
          @toggle-all-deal-fields="toggleAllDealFields"
        />
        <ResearchTab v-else-if="section === research" :geo-pos="mutableData.geo_pos" :mutableData="mutableData" />
        <ObjectEvaluation v-else-if="section === evaluation" ref="objEval" />
      </template>
      <template #footerFunctionality>
        <FooterFunctionality
          :is-base-fields-ready="isBaseFieldsReady"
          :is-form-changed="isFormChanged"
          :is-new="isNew"
          :is-required-fields-ready="isRequiredFieldsReady"
          :change-has-parent="changeHasParent"
          :mutable-data="mutableData"
          :no-navigate-new-object="noNavigateNewObject"
          @save="
            async (isToPublish) => {
              await saveObject(mutableData, objectTypeCalc === 'OO')
            }
          "
          @set-initial="isOpenSetInitial = true"
        />
      </template>
    </Card>
    <div v-else class="map-object-properties d-flex align-items-center justify-content-center vh-100">
      <BSpinner class="mx-auto mt-10"></BSpinner>
    </div>
    <ModalMessage v-if="!scenarioIsLoading" v-model="isOpenSetInitial" title="ОТМЕНА" @ok="setInitial()">
      Вы уверены, что хотите вернуть значения полей к последнему сохранению?
    </ModalMessage>

    <ModalMessage v-if="!scenarioIsLoading" v-model="isOpenLeave" size="lg" title="ЗАВЕРШИТЬ РЕДАКТИРОВАНИЕ">
      <template #default>
        Вы собираетесь покинуть страницу не сохранив свои изменения. Вы можете:
        <ul>
          <li>отменить изменения, вернув значения полей к последнему сохранению и покинуть страницу</li>
          <li>сохранить изменения и покинуть страницу</li>
          <li>вернуться к редактированию</li>
        </ul>
      </template>
      <template #footer="{ ok, cancel }">
        <div class="d-flex">
          <button
            class="btn btn-lg btn-outline-secondary me-2"
            @click="
              async () => {
                toLeave = true
                await revertChanges()
                cancel()
              }
            "
          >
            Отменить изменения
          </button>
          <button
            v-if="isBaseFieldsReady"
            class="btn btn-lg btn-outline-secondary me-2"
            @click="
              async () => {
                toLeave = true
                await saveObject(mutableData, objectTypeCalc === 'OO')
                cancel()
              }
            "
          >
            Сохранить изменения
          </button>
          <button
            class="btn btn-lg btn-primary"
            @click="
              () => {
                toLeave = false
                ok()
              }
            "
          >
            Вернуться к редактированию
          </button>
        </div>
      </template>
    </ModalMessage>
    <ModalMessage
      v-if="!scenarioIsLoading"
      v-model="isOpenSetDefault"
      v-model:showAgain="toShowSetDefault"
      icon="fi_info"
      okTitle="Заполнить"
      size="lg"
      title="Дозаполнить карточку автоматически"
      @ok="setDefault()"
    >
      Часть пустых полей будет заполнена стандартными значениями, которые приняты в АФК. Вы сможете в любой момент
      изменить эти значения.
    </ModalMessage>

    <ModalMessage
      v-if="!scenarioIsLoading"
      v-model="isShowErrorFormat"
      okOnly
      size="lg"
      title="Ошибка в формате данных"
      variant="danger"
    >
      Исправьте следующие ошибки:
      <li v-for="error in errorFormatMsg">{{ error }}</li>
    </ModalMessage>
    <ModalMessage
      v-if="!scenarioIsLoading"
      v-model="isOpenGoToAnalogs"
      v-model:showAgain="toShowGoToAnalogs"
      :okTitle="aimPath.path.length ? 'Вернуться к расчетам' : 'К списку предложений'"
      cancel-title="Остаться"
      icon="fi_help-circle"
      size="lg"
      title="Опубликовать предложение"
      @ok="goToAnalogs()"
    >
      <template v-if="!aimPath.path.length"
        >Теперь Ваш объект доступен в поиске всем пользователям системы. Что Вы будете делать дальше? <br />
        Останетесь редактировать карточку объекта или перейдёте к списку всех предложений?</template
      >
      <template v-else>
        Ваш объект успешно опубликован. Что Вы будете делать дальше? <br />
        Останетесь редактировать карточку или вернётесь к расчётам?
      </template>
    </ModalMessage>
  </template>
  <template v-else>
    <div class="page-card h-100 d-flex justify-content-center align-items-center">
      <div class="d-flex flex-column">
        <div class="map-object-properties_header_data_text__main placeholder-landplot">
          {{ getErrorMessage() }}
        </div>
        <button
          v-if="
            objectType === 'L' && (objectTypeCalc === 'NE' || adsType === 'R') && initialMutableData.object_type !== 'L'
          "
          class="btn btn-link p-0 me-1"
          @click="returnPreviousObjectType"
        >
          Вернуть предыдущий тип объекта
        </button>
      </div>
    </div>
  </template>
</template>

<script lang="ts" setup>
import _isEqual from 'lodash/isEqual'
import _, { cloneDeep } from 'lodash'
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useNuxtApp, useRoute } from 'nuxt/app'
import useUserPermissions from '~/composables/useUserPermissions'
import { calculateSimilarity } from '~/utils/similarity'
import { createBuildingRealtyObjectBasedOnQuarter } from '~/utils/objectUtils'

import ModalMessage from '~/components/UI-KIT/Alerts/ModalMessage.vue'
import Card from '~/components/UI-KIT/ObjectCard/Card.vue'
import BaseFields from '~/components/MapObjectProperties/Sections/BaseFields.vue'
import AddFactors from '~/components/MapObjectProperties/Sections/AddFactors.vue'
import DevelopmentAnalysis from '~/components/MapObjectProperties/Sections/DevelopmentAnalysis.vue'
import Files from '~/components/MapObjectProperties/Sections/Files.vue'
import GeoLayers from '~/components/MapObjectProperties/Sections/GeoLayers.vue'
import GeoTsof from '~/components/MapObjectProperties/Sections/GeoTsof.vue'
import History from '~/components/MapObjectProperties/Sections/History.vue'
import ObjectDeal from '~/components/MapObjectProperties/Sections/ObjectDeal.vue'
import ResearchTab from '~/components/MapObjectProperties/Sections/ResearchTab.vue'
import StandartFields from '~/components/MapObjectProperties/Sections/StandartFields.vue'
import TradeInfo from '~/components/MapObjectProperties/Sections/TradeInfo.vue'
import HeaderFunctionality from './HeaderFunctionality.vue'
import FooterFunctionality from './FooterFunctionality.vue'

import { api_constant, api_layer_id, api_unversal_realty, api_update_card_data } from '~/app_constants/api'
import { calcTypeToPath } from '~/app_constants/routes'
import { filesGroupCard } from '~/app_constants/filesGroup'
import { objectTypeCalcToTextDeclined, objectTypeToText } from '~/app_constants/mergedFieldsConst'
import {
  allTypesConstTabs,
  weights,
  evaluationConstTabs,
  researchConstTabs,
  analogsConstTabs,
  childSections,
  baseFields,
  standartFields,
  geoTsof,
  pzz,
} from '~/app_constants/mapObjectConsts'
import {
  photo,
  documents,
  geoLayer,
  history,
  trade,
  factors,
  development,
  deal,
  research,
  evaluation,
  locationAccessibility,
  customSectionBehavior,
} from '~/app_constants/mapObjectConsts'

import {
  type defaultFiltersType,
  type funcPurposeAsChoice,
  type objectTypeCalcType,
  type objectTypeType,
} from '~/types/mapObjectPropertiesTypes'
import {
  type sectionType,
  type constTabType,
  type constSectionType,
  type tabsStructureType,
  type headerDesignationType,
  type menuSideBarStructureType,
  type menuSideBarDesignationType,
} from '~/types/cardTypes'
import type { aimType } from '~/types/calculationsTypes'

interface Props {
  id: number
  objectTypeCalcProp: objectTypeCalcType
}

const { id, objectTypeCalcProp } = defineProps<Props>()

const { $objectStore, $userStore, $auth, $calculations, $constData, $filtersStore, $geoObject } = useNuxtApp()
const userPermissions: string[] = useUserPermissions($auth.user?.permissions)
const createAccessDenied = computed(() => {
  const accessPerms = ['CC', 'ADMIN']
  return !accessPerms.some((perm) => userPermissions.includes(perm))
})
const defaultFilters: defaultFiltersType = {
  OA: {
    object_type: 'Q' as objectTypeType,
    object_type_calc: 'OA' as objectTypeCalcType,
    ads_type: 'R',
    exchange_type: 'M',
    func_purpose: 123,
  },
  OO: {
    object_type: 'Q' as objectTypeType,
    object_type_calc: 'OO' as objectTypeCalcType,
    ads_type: 'R',
    exchange_type: 'M',
    func_purpose: 100,
  },
  NE: {
    object_type: 'Q' as objectTypeType,
    object_type_calc: 'NE' as objectTypeCalcType,
    ads_type: 'S',
    exchange_type: 'M',
    func_purpose: 157,
  },
}
const isNew = computed(() => !id || !mutableData.value.pk)
const activeTabIndex = computed(() => $calculations.activeTabIndex)
const scenarioIsLoading = ref(true)
const mutableData = ref<Record<string, any>>({})
const initialMutableData = ref<Record<string, any>>({})
const initialRequiredFieldsReady = ref(false)
const evoluationMutableOptions = ref<Record<string, any>>({})
const metaScenario: Ref<{ [key: string]: any }> = ref({})
const toShowGoToAnalogs = ref(true)
const isOpenGoToAnalogs = ref(false)
const has_parent_id = ref(null)
const changeHasParent = ref(false)
const isDataSynchronization = ref(false)
const tabsStructure: Ref<tabsStructureType> = ref([])

let funcPurposes: funcPurposeAsChoice[] = []
const funcPurposesByType: Ref<funcPurposeAsChoice[]> = ref([])
const notBaseFieldsIsLoading: Ref<boolean> = ref(false)
const keyMenu: Ref<number> = ref(0)

function goToAnalogs() {
  if (aimPath.value.path.length) {
    navigateTo(aimPath.value)
  } else navigateTo('/analog?mode=all')
}

function createComputedStoreProperty(store: any, propName: string, setterName: string) {
  return computed({
    get() {
      return store[propName]
    },
    set(value) {
      store[setterName](value)
    },
  })
}

const adsType: any = createComputedStoreProperty($objectStore, 'adsType', 'setAdsType')
const objectType: any = createComputedStoreProperty($objectStore, 'objectType', 'setObjectType')
const objectTypeCalc: any = createComputedStoreProperty($objectStore, 'objectTypeCalc', 'setObjectTypeCalc')
const exchangeType: any = createComputedStoreProperty($objectStore, 'exchangeType', 'setExchangeType')

const functionalPurposeByTypeComputed = computed(() => funcPurposesByType.value)
const requiredFilters = computed(() => $objectStore.requiredFilters[$objectStore.objectTypeCalc])
const noNavigateNewObject = computed(() => $geoObject.noNavigateNewCard)

async function initEmptyObject() {
  scenarioIsLoading.value = true
  $objectStore.toggleReadOnly()
  $objectStore.setId(0)
  if (noNavigateNewObject.value && $geoObject.objectData.object_type === 'L') {
    $objectStore.setAdsType('S')
  } else {
    $objectStore.setAdsType(defaultFilters[objectTypeCalcProp].ads_type)
  }
  $objectStore.setObjectTypeCalc(defaultFilters[objectTypeCalcProp].object_type_calc)
  $objectStore.setExchangeType(defaultFilters[objectTypeCalcProp].exchange_type)
  $objectStore.setObjectType($geoObject.objectData.object_type)
  console.log(adsType.value, objectTypeCalc.value, exchangeType.value)
  Object.assign(mutableData.value, await $objectStore.init({ object_type: $geoObject.objectData.object_type }, true))
  funcPurposes = await getFuncPurposes()
  getFuncPurposeByType()
  await $objectStore.getScenario(mutableData.value.func_purpose.id, mutableData.value.exchange_type)
  $objectStore.setObjectData(mutableData.value)
  Object.assign(initialMutableData.value, { ...mutableData.value })
  $objectStore.is_checked = initialMutableData.value.is_checked
  Object.assign(evoluationMutableOptions.value, { ...$objectStore.evoluationMutableOptions })
  metaScenario.value = { ...$objectStore.metaScenario }
  if (noNavigateNewObject.value) {
    evoluationMutableOptions.value.object_type.flags.disabled = true
    evoluationMutableOptions.value.address_raw.flags.disabled = true
    autofillFieldsByRealtyObject($geoObject.objectData)
  }
  createTabsStructure()
  await nextTick()
  checkAllSections()
  scenarioIsLoading.value = false
}

async function initExistingObject(objectData?: Record<string, any>) {
  scenarioIsLoading.value = true
  await getObjetcData(id, objectData)
  $objectStore.setId(objectData ? objectData.id : id)
  $objectStore.setAdsType(mutableData.value.ads_type)
  $objectStore.setObjectTypeCalc(mutableData.value.object_type_calc)
  $objectStore.setExchangeType(mutableData.value.exchange_type)
  $objectStore.setObjectType(mutableData.value.object_type)
  await $objectStore.init({ object_type: mutableData.value.object_type }, false)
  funcPurposes = await getFuncPurposes()
  getFuncPurposeByType()
  Object.assign(initialMutableData.value, { ...mutableData.value })
  $objectStore.is_checked = initialMutableData.value.is_checked
  await $objectStore.getScenario(mutableData.value.func_purpose.id, mutableData.value.exchange_type)
  $objectStore.setObjectData(mutableData.value)
  Object.assign(evoluationMutableOptions.value, { ...$objectStore.evoluationMutableOptions })
  $objectStore.checkChoices(mutableData.value, evoluationMutableOptions.value)
  metaScenario.value = { ...$objectStore.metaScenario }
  createTabsStructure()
  checkTermsOfSale()
  if (noNavigateNewObject.value) {
    evoluationMutableOptions.value.object_type.flags.disabled = true
  }
  scenarioIsLoading.value = false
  nextTick(() => {
    checkAllSections()
    initialRequiredFieldsReady.value = isRequiredFieldsReady.value
    console.log(mutableData.value, evoluationMutableOptions.value)
  })
}

const getErrorMessage = () => {
  const errors = [
    {
      condition: objectType === 'L' && (objectTypeCalc === 'NE' || adsType === 'R'),
      message: () => `Карточка земельного участка${adsType === 'R' ? ' аренды' : ''} в разработке`,
    },
    {
      condition: isEmptyObjectError,
      message: () => 'Данного объекта не существует',
    },
    {
      condition: createAccessDenied,
      message: () => 'Вы не можете создать карточку',
    },
    {
      condition: isObjectError,
      message: () => `Ошибка при загрузке объекта: ${isObjectError}`,
    },
  ]

  const error = errors.find((err) => err.condition)
  return error ? error.message() : ''
}

// Методы

async function getFuncPurposes() {
  return (await $constData.getFuncPurposes()).map(
    (item: { id: any; type: any; name: any; calc_type: any; object_type: any; date: any }) => {
      return {
        content: {
          id: item.id,
          type: item.type,
          name: item.name,
          calc_type: item.calc_type,
          object_type: item.object_type,
          date: item.date,
        },
        display_name: item.name,
        value: item.id,
      }
    },
  )
}

function getFuncPurposeByType(props?: {
  ads_type: string
  exchange_type: string
  func_purpose: number
  object_type: string
  object_type_calc: string
}) {
  const purpuses: funcPurposeAsChoice[] = []
  // Заменим any на funcPurposeAsChoice для параметра purpose
  funcPurposes.forEach((purpose: any) => {
    if (
      (purpose.content.type === objectType.value &&
        purpose.content.calc_type === adsType.value &&
        purpose.content.object_type === objectTypeCalc.value) ||
      (props &&
        props.ads_type &&
        props.exchange_type &&
        props.func_purpose &&
        props.object_type &&
        props.object_type_calc &&
        purpose.content.type === props.object_type &&
        purpose.content.calc_type === props.ads_type &&
        purpose.content.object_type === props.object_type_calc)
    ) {
      purpuses.push(purpose)
    }
  })

  funcPurposesByType.value = purpuses.map((item) => {
    return {
      ...item,
      display_name: item.display_name.split(':')[0],
      disabled:
        item.display_name.split(':')[0] === 'Прочее' ||
        item.display_name.split(':')[0] === 'Квартира' ||
        item.display_name.split(':')[0] === 'Апартаменты' ||
        item.display_name.split(':')[0] === 'Жилое',
    }
  })
  if (funcPurposesByType.value.length) {
    funcPurposesByType.value.forEach((item) => {
      if (
        mutableData.value.func_purpose &&
        item.display_name === mutableData.value.func_purpose.name.split(':')[0] &&
        item.content.object_type === mutableData.value.object_type_calc &&
        item.content.calc_type === adsType.value &&
        item.content.type === mutableData.value.object_type
      ) {
        mutableData.value.func_purpose = item.content
      }
    })

    if (
      (mutableData.value.object_type &&
        mutableData.value.func_purpose &&
        (mutableData.value.func_purpose.type !== mutableData.value.object_type ||
          mutableData.value.func_purpose.calc_type !== mutableData.value.ads_type ||
          mutableData.value.func_purpose.object_type !== mutableData.value.object_type_calc)) ||
      isNew.value
    ) {
      mutableData.value.func_purpose = funcPurposesByType.value[0].content
    }
  }
}

async function onUpdateData(field: string, value: any, sectionId?: string, tab?: string) {
  // Обновление initialDataToCompare
  initialDataToCompare[field] = {
    prev: _isEqual(initialDataToCompare[field]?.prev, initialMutableData.value[field])
      ? initialDataToCompare[field]?.prev
      : isNaN(mutableData.value[field]) || field === 'add_factors' || mutableData.value[field] === null
        ? initialMutableData.value[field]
        : +initialMutableData.value[field],
    curr: isNaN(value) || field === 'add_factors' || value === null ? value : +value,
    parent: null,
  }

  // Проверка изменения формы
  const isChanged = checkForInitialData({ ...initialDataToCompare })
  isFormChanged.value = isChanged
  $calculations.setIsFormChanged(isChanged)

  const fields: string[] = []

  // Словарь функций-обработчиков для каждого поля
  const fieldHandlers: { [key: string]: (value: any) => void } = {
    address_region: (value) => {
      mutableData.value.address_region = value
      mutableData.value.address_district = null
    },
    address_and_coord: (value) => {
      mutableData.value.address_raw = value.address
      mutableData.value.geo_pos.coordinates = [value.lngLat.lng, value.lngLat.lat]
    },
    object_type: (value) => {
      mutableData.value.object_type = value
      objectType.value = value
      if (value === 'L' && objectTypeCalc.value !== 'NE') {
        mutableData.value.ads_type = 'S'
        adsType.value = 'S'
        evoluationMutableOptions.value.ads_type.flags.disabled = true
      }
    },
    ads_type: (value) => {
      mutableData.value.ads_type = value
      adsType.value = value
      mutableData.value.price_rent_period = value === 'R' ? 'M' : null
    },
    exchange_type: (value) => {
      mutableData.value.exchange_type = value
      exchangeType.value = value
    },
    object_area_rent_json: (value) => {
      if (objectTypeCalc.value === 'OO') {
        mutableData.value.object_area_rent_json = { variant_1: value }
      }
    },
    engineering_electricity_220: (value) => {
      const otherField = 'engineering_electricity_380'
      if (value !== 'A') {
        mutableData.value.engineering_electricity_220 = value
        mutableData.value[otherField] = 'A'
      }
    },
    engineering_electricity_380: (value) => {
      const otherField = 'engineering_electricity_220'
      if (value !== 'A') {
        mutableData.value.engineering_electricity_380 = value
        mutableData.value[otherField] = 'A'
      }
    },
    engineering_electricity: (value) => {
      mutableData.value.engineering_electricity = value
      if (objectTypeCalc.value === 'NE') {
        mutableData.value.lectricity_power = null
        evoluationMutableOptions.value.lectricity_power.flags.disabled = value === 'A'
      }
    },
    date_calc: (value) => {
      mutableData.value.date_calc = value
      mutableData.value.offer_date = value.split('T')[0]
    },
    floor_number: (value) => {
      mutableData.value.floor_number = value
      mutableData.value.object_area_full_json = null
      mutableData.value.object_area_rent_json = null
    },
    coord_lng: (value) => {
      mutableData.value.geo_pos.coordinates[0] = parseFloat(value.toString().replace(',', '.'))
    },
    coord_lat: (value) => {
      mutableData.value.geo_pos.coordinates[1] = parseFloat(value.toString().replace(',', '.'))
    },
    address_raw: (value) => {
      mutableData.value.address_raw = value
    },
    price_sale: (value) => {
      mutableData.value.price_sale = value
      if (objectTypeCalc.value === 'NE') {
        const area = mutableData.value.object_area || 1
        mutableData.value.price_sale_per_m = (value / area).toFixed(2)
      }
    },
    funct_purp_building_nei: (value) => {
      mutableData.value.funct_purp_building_nei = value
      $objectStore.checkRealtyClassNE(mutableData.value, evoluationMutableOptions.value)
    },
    object_area: (value) => {
      mutableData.value.object_area = value
      if (objectTypeCalc.value === 'NE') {
        const priceSale = mutableData.value.price_sale || 0
        mutableData.value.price_sale_per_m = (priceSale / value).toFixed(2)
      }
      mutableData.value.floor_number = null
      fields.push('floor_number', 'object_area')
    },
    terms_of_sale: (value) => {
      mutableData.value.terms_of_sale = value
      console.log(field, value)
      checkTermsOfSale()
    },
  }

  // Вызов соответствующего обработчика или установка значения по умолчанию
  if (fieldHandlers[field]) {
    fieldHandlers[field](value)
  } else {
    mutableData.value[field] = value
  }

  // Проверка обязательных фильтров
  if (requiredFilters.value.includes(field)) {
    getFuncPurposeByType()
  }

  // Проверка и обновление секций при изменении полей
  if (tab && sectionId) {
    const fieldsToCheck = fields.length ? fields : field
    $objectStore.checkBySection(tab, sectionId, mutableData.value, fieldsToCheck)
  }
}

watch(
  () => mutableData.value.func_purpose,
  async (newVal, oldVal) => {
    if (!newVal) return

    if ((oldVal && newVal.id === oldVal.id) || !newVal || !mutableData.value.exchange_type || scenarioIsLoading.value)
      return
    notBaseFieldsIsLoading.value = true

    await $objectStore.getScenario(newVal.id, mutableData.value.exchange_type)
    $objectStore.setFuncPurpose(newVal)
    $objectStore.setObjectData(mutableData.value)
    Object.assign(evoluationMutableOptions.value, { ...$objectStore.evoluationMutableOptions })
    $objectStore.checkChoices(mutableData.value, evoluationMutableOptions.value)
    metaScenario.value = { ...$objectStore.metaScenario }
    createTabsStructure()
    checkAllSections()
    if (noNavigateNewObject.value) {
      evoluationMutableOptions.value.object_type.flags.disabled = true
    }
    notBaseFieldsIsLoading.value = false
  },
)

watch(
  () => mutableData.value.has_parent,
  () => {
    if (!isNew.value) {
      changeHasParent.value = true
    }
  },
)

watch(
  () => mutableData.value.exchange_type,
  async (newVal, oldVal) => {
    console.log('exchange_type watcher')
    if (!newVal || !mutableData.value.func_purpose || newVal === oldVal || scenarioIsLoading.value) return
    notBaseFieldsIsLoading.value = true
    await $objectStore.getScenario(mutableData.value.func_purpose.id, newVal)
    $objectStore.setObjectData(mutableData.value)
    Object.assign(evoluationMutableOptions.value, { ...$objectStore.evoluationMutableOptions })
    $objectStore.checkChoices(mutableData.value, evoluationMutableOptions.value)
    metaScenario.value = { ...$objectStore.metaScenario }
    createTabsStructure()
    checkAllSections()
    if (noNavigateNewObject.value) {
      evoluationMutableOptions.value.object_type.flags.disabled = true
    }
    notBaseFieldsIsLoading.value = false
  },
)

function createTabsStructure() {
  const structure: tabsStructureType = []
  const constStructures: any = createConstSctrucures()

  Object.keys($objectStore.scenarioByTabs).forEach((tab) => {
    if (constStructures[tab]) {
      structure.push(constStructures[tab])
    } else {
      const sections = Object.keys($objectStore.scenarioByTabs[tab]).map((section) => ({
        name: $objectStore.scenarioByTabs[tab][section].label,
      }))

      structure.push({
        tab,
        sections,
        isConst: false,
        onlyHead: sections.length === 1,
        customSectionBehavior: customSectionBehavior.includes(tab),
      })
    }
  })

  structure.sort((a, b) => weights[b.tab] - weights[a.tab])
  tabsStructure.value = structure

  $objectStore.setTabNames(structure.map((item) => item.tab))

  nextTick(() => {
    if (route.hash) {
      const defaultTab = 'Базовые поля'
      if (noNavigateNewObject.value) {
        setTabName(defaultTab, false)
      } else {
        setTabName(route.hash.replace('#', ''), false)
      }
    } else if (!(objectType.value === 'L' && (objectTypeCalc.value === 'NE' || adsType.value === 'R'))) {
      navigateToHashWrapper('Базовые поля')
    }
  })
}

function createConstSctrucures() {
  const constStructures: Record<string, constTabType> = {}

  allTypesConstTabs.forEach((tab) => setConstSectionObject(constStructures, tab))

  if (objectTypeCalc.value === 'OO') {
    evaluationConstTabs.forEach((tab) => setConstSectionObject(constStructures, tab))
  }

  if (objectTypeCalc.value === 'NE') {
    researchConstTabs.forEach((tab) => setConstSectionObject(constStructures, tab))
  }

  if (objectTypeCalc.value === 'OA') {
    analogsConstTabs.forEach((tab) => setConstSectionObject(constStructures, tab))
  }

  return constStructures
}

function setConstSectionObject(constStructures: any, tab: string) {
  const sections = childSections[tab]?.map((section) => ({ name: section })) || [{ name: tab }]
  constStructures[tab] = {
    tab,
    sections,
    isConst: true,
    onlyHead: sections.length === 1,
  }
}

const route = useRoute()

watch(
  () => route.hash,
  (newVal, oldVal) => {
    if (newVal === oldVal || noNavigateNewObject.value) return
    setTabName(newVal.replace('#', ''), false)
  },
)
// враппер для хэша. в карточке ОН используется свой хэш, поэтому здесь он не нужен
const router = useRouter()
function navigateToHashWrapper(hash: string) {
  if (!noNavigateNewObject.value) {
    if (hash && route.hash !== `#${hash}`) {
      router.options.history.replace(route.path.split('/').slice(0, -1).join('/'))
    }
    // navigateTo({ hash: `#${hash}` })
    router.push({ hash: `#${hash}` })
  }
}

async function setTabName(name: string, toNavigate = true) {
  currentTabName.value = name

  if (!currentSectionName.value || !currentTabName.value) return

  const tab = tabsStructure.value.find((item) => item.tab === currentTabName.value)
  const sectionExists = tab?.sections.some((section) => section.name === currentSectionName.value)

  if (!sectionExists) {
    currentSectionName.value = tab?.sections[0].name || ''
  }

  $calculations.setCurrentTabName(name)
  navigateToHashWrapper(name)
}

// надо при передаче tab находить таб и ставить нужный таб
function setSectionName(name: string, tab: string) {
  currentSectionName.value = name
  const currentTab = tabsStructure.value.find((item) => item.tab === currentTabName.value)
  const sectionExists = currentTab?.sections.some((section) => section.name === currentSectionName.value)

  if (!sectionExists) {
    setTabName(tab)
  }
}

const isEmptyObjectError = ref(false)
const isObjectError = ref(0)

async function getObjetcData(id: number, objectData?: Record<string, any>) {
  let data: Record<string, any> = {}
  if (!objectData) {
    data = await $http
      .get(api_unversal_realty + id + '/')
      .then((res: Record<string, any>) => res._data)
      .catch((error: any) => {
        if (error.status === 404) {
          isEmptyObjectError.value = true
        } else {
          isObjectError.value = error.status
        }
        console.log(error.status)
      })
  } else {
    data = _.cloneDeep(objectData)
  }

  if (!data.add_factors) {
    data.add_factors = []
  }
  if (!data.exchange_type) {
    data.exchange_type = 'M'
  }
  let pathArr = route.path.split('/')
  if (
    calcTypeToPath[data.object_type_calc] &&
    pathArr[1] !== calcTypeToPath[data.object_type_calc] &&
    !noNavigateNewObject.value
  ) {
    pathArr[1] = calcTypeToPath[data.object_type_calc]
    window.location.href = pathArr.join('/') + route.hash
    // navigateTo({ path: pathArr.join('/'), hash: route.hash })
  }
  Object.assign(mutableData.value, data)
  Object.assign(initialMutableData.value, data)
  $objectStore.is_checked = initialMutableData.value.is_checked
  $calculations.setAimTzNumber(data.tz_number)
}

function checkAllSections() {
  tabsStructure.value.forEach((item: any) => {
    item.sections.forEach((section: any) => {
      $objectStore.checkBySection(item.tab, section.name, mutableData.value, '')
    })
  })
  keyMenu.value++
}

// Сохранение

const isBaseFieldsReady = computed(() => $objectStore.scenarioByTabs['Базовые поля']['Базовые поля'].completed)
const isRequiredFieldsReady = computed(() => $objectStore.isRequiredFieldsReady)
const aimPath = computed(() => $calculations.aimPath)

let initialDataToCompare: { [key: string]: any } = {}
const isFormChanged: Ref<boolean> = ref(false)

async function saveObject(mutableDataParam: { [key: string]: any }, isForEvoluation: boolean) {
  scenarioIsLoading.value = true
  // Если mutableData является реактивным объектом Vue, используйте ref или reactive
  let mutableData = reactive({ ...mutableDataParam })

  try {
    // Обработка нового объекта или изменения родителя
    if ((isNew.value || changeHasParent.value) && !noNavigateNewObject.value) {
      await handleParentObject(mutableData)
    }

    // Предварительная обработка данных
    preprocessMutableData(mutableData)

    // Сохранение в базу данных и обработка результата
    const result = await savetoDB(mutableData)
    await processSaveResult(result, mutableData)
  } catch (error) {
    console.error(error)
  } finally {
    // Устанавливаем scenarioIsLoading.value в false, если необходимо
    if (noNavigateNewObject.value || (!noNavigateNewObject.value && !isNew.value)) {
      scenarioIsLoading.value = false
    }
  }
}

// Вспомогательная функция для обработки родительского объекта
async function handleParentObject(mutableData: any) {
  if (mutableData.not_found_has_parent) {
    await createNewParent(mutableData)
  } else {
    has_parent_id.value = mutableData.has_parent.id

    if (mutableData.object_type === 'Q' && mutableData.has_parent.object_type === 'B') {
      await createQuarterUnderBuilding(mutableData)
    }
    if (isNew.value) {
      await updateDistances(has_parent_id.value)
      await $geoObject.getObjectData(has_parent_id.value)
      mutableData = autofillFieldsByRealtyObject($geoObject.initialObjectData, false)
    }
  }
}

// Создание нового родительского объекта
async function createNewParent(mutableData: any) {
  setGeoObjectData(mutableData)
  await $geoObject.save(false)
  has_parent_id.value = $geoObject.initialObjectData.id
  await updateDistances(has_parent_id.value)

  if (mutableData.object_type === 'B') {
    await linkFirstLandplot(mutableData)
  } else if (mutableData.object_type === 'Q') {
    await createAndLinkBuilding(mutableData)
  }
  $geoObject.$reset()

  if (isNew.value) {
    await $geoObject.getObjectData(has_parent_id.value)
    mutableData = autofillFieldsByRealtyObject($geoObject.initialObjectData, false)
    $geoObject.$reset()
  }
}

// Установка данных $geoObject
function setGeoObjectData(mutableData: any) {
  $geoObject.objectData.object_type = mutableData.object_type
  $geoObject.objectData.address_raw = mutableData.address_raw
  $geoObject.objectData.geo_pos = mutableData.geo_pos
  $geoObject.objectData.geo_obj = mutableData.geo_pos
  $geoObject.objectData.osm_id = 0
  $geoObject.objectData.name = 'rename-re-cards'
}

// Связывание с первым земельным участком
async function linkFirstLandplot(mutableData: any) {
  const firstLandplot = await getFirstRealtyObjectByCoordAndType(
    mutableData.geo_pos.coordinates[1],
    mutableData.geo_pos.coordinates[0],
    'L',
  )
  if (firstLandplot) {
    await createRealtyObjectLinkToRealtyObject(firstLandplot.id, has_parent_id.value)
  }
}

// Создание и связывание здания на основе квартала
async function createAndLinkBuilding(mutableData: any) {
  const firstBuilding = await createBuildingRealtyObjectBasedOnQuarter(
    has_parent_id.value,
    mutableData.geo_pos,
    mutableData.address_raw,
  )
  await updateDistances(firstBuilding.id)
  await createRealtyObjectLinkToRealtyObject(firstBuilding.id, has_parent_id.value)
}

// Создание квартала под зданием
async function createQuarterUnderBuilding(mutableData: any) {
  setGeoObjectData(mutableData)
  await $geoObject.save(false)
  await createRealtyObjectLinkToRealtyObject(mutableData.has_parent.id, $geoObject.initialObjectData.id)
  has_parent_id.value = $geoObject.initialObjectData.id
}

// Предварительная обработка данных перед сохранением
function preprocessMutableData(mutableData: any) {
  const defaultFields: any = {
    seller_type: 'U',
    object_area_source_dim: 'M',
    building_land_area_source_dim: 'M',
    price_sale_source_type: 'A',
  }

  // Установка значений по умолчанию для полей
  Object.keys(defaultFields).forEach((key) => {
    if (!mutableData[key]) {
      mutableData[key] = defaultFields[key]
    }
  })

  // Обработка поля date_calc
  if ('date_calc' in mutableData) {
    if (mutableData.date_calc) {
      const todayWithTime = new Date()
      const hours = todayWithTime.getHours().toString().padStart(2, '0')
      const minutes = todayWithTime.getMinutes().toString().padStart(2, '0')
      const seconds = todayWithTime.getSeconds().toString().padStart(2, '0')
      mutableData.date_calc = `${mutableData.date_calc.split('T')[0]}T${hours}:${minutes}:${seconds}`
    }
    if (objectTypeCalc.value === 'OA') {
      mutableData.date_calc = null
    }
  }

  // Обработка поля source
  if (mutableData.source) {
    mutableData.source = mapSourceValue(mutableData.source)
  }
}

// Преобразование значения поля 'source'
function mapSourceValue(source: string): string | null {
  const sourceMap: { [key: string]: string[] } = {
    C: ['cian', 'циан'],
    A: ['avito', 'авито'],
    M: ['move', 'мув'],
    E: ['etaji', 'этажи'],
    Y: ['yandex', 'яндекс'],
    EM: ['emls', 'емлс'],
    D: ['domclick', 'домклик'],
    Z: ['zemvopros', 'земвопрос'],
    P: ['perspectiva', 'перспектива'],
    ZO: ['zoltor', 'золтор'],
    V: ['valdis', 'валдис'],
    F: ['fi_spb', 'фи'],
    R: ['rad', 'рад'],
    FA: ['farpost', 'фарпост'],
    O: ['other', 'другой'],
  }

  const normalizedSource = source.toLowerCase().split(' ')[0]
  for (const [key, values] of Object.entries(sourceMap)) {
    if (values.includes(normalizedSource)) {
      return key
    }
  }
  return null
}

// Обработка результата сохранения
async function processSaveResult(result: any, mutableData: any) {
  console.log(result)
  $objectStore.mutableData.is_checked = result.is_checked
  $objectStore.mutableData.func_purpose = result.func_purpose

  if (noNavigateNewObject.value && !$objectStore.id) {
    $objectStore.resetState()
    await initExistingObject(result)
    await $geoObject.linkCardsWithSideEffect([result.id])
    setRelatyObjectProperty()
    console.log('noNavigateNewObject-savetoDB', mutableData.value)
  }

  if ($calculations.aimPath.path.length) {
    await updateCalculations(result)
  }

  updateAnalogLists(result)
  isFormChanged.value = false
  $calculations.setIsFormChanged(false)
  Object.assign(initialMutableData.value, result)
  $objectStore.is_checked = initialMutableData.value.is_checked
  initialRequiredFieldsReady.value = isRequiredFieldsReady.value
  initialDataToCompare = {}
  if (activeTabIndex.value > 0) {
    $calculations.onRunCalculations()
  }

  if ((isNew.value || changeHasParent.value) && !noNavigateNewObject.value) {
    await handleNavigationAfterSave(result, mutableData)
  }

  console.log('noNavigateNewObject-noNavigateNewObject', noNavigateNewObject.value)
  console.log('noNavigateNewObject', mutableData.value)

  if (objectTypeCalc.value === 'OA' && toShowGoToAnalogs.value && result.is_checked && !noNavigateNewObject.value) {
    isOpenGoToAnalogs.value = true
  }

  checkAllSections()
}

// Обновление расчетов
async function updateCalculations(result: any) {
  const aim = $calculations.aim
  const searchRadius = $calculations.searchRadius

  const index = $calculations.analogs.findIndex((item: aimType) => item.id === result.id)
  const indexFromAllAnalogs = $calculations.allAnalogs.findIndex((item: aimType) => item.id === result.id)

  const computedSimilarity = calculateSimilarity(aim, result, searchRadius)

  if (index !== -1 || indexFromAllAnalogs !== -1) {
    if (index !== -1) {
      const analogs = cloneDeep($calculations.analogs)
      analogs[index] = {
        ...result,
        similarity: computedSimilarity,
        distance: analogs[index].distance,
        ads_updated: new Date().toISOString().split('T')[0],
      }
      $calculations.setAnalogs(analogs)
    }
    if (indexFromAllAnalogs !== -1) {
      const allAnalogs = cloneDeep($calculations.allAnalogs)
      allAnalogs[indexFromAllAnalogs] = {
        ...result,
        similarity: computedSimilarity,
        distance: allAnalogs[indexFromAllAnalogs].distance,
        ads_updated: new Date().toISOString().split('T')[0],
      }
      $calculations.setAllAnalogs(allAnalogs)
    }
  } else {
    $calculations.addAnalog(result)
  }
}

// Обновление списков аналогов
function updateAnalogLists(result: any) {
  if ($calculations.analogs.length) {
    $calculations.setAnalogs(
      $calculations.analogs.map((analog) =>
        analog.id === result.id ? { ...result, similarity: analog.similarity, distance: analog.distance } : analog,
      ),
    )
  }

  if ($calculations.selectedAnalogs.length) {
    $calculations.setSelectedAnalogs(
      $calculations.selectedAnalogs.map((analog) =>
        analog.id === result.id ? { ...result, similarity: analog.similarity, distance: analog.distance } : analog,
      ),
    )
  }
}

// Обработка навигации после сохранения
async function handleNavigationAfterSave(result: any, mutableData: any) {
  if (mutableData.realty_object && mutableData.realty_object.length) {
    await $geoObject.deleteCardLink([mutableData.id], mutableData.realty_object[0].id)
  }

  await $geoObject.getObjectData(has_parent_id.value)
  if ($geoObject.objectData.name === 'rename-re-cards') {
    $geoObject.objectData.name = `${objectTypeToText[$geoObject.objectData.object_type]} на основе карточки #${result.pk}`
    $geoObject.objectData.description = `Объект недвижимости создан на основе карточки #${result.pk}`
  }
  await $geoObject.createCardLink([result.pk])
  await $geoObject.save(false)
  $geoObject.$reset()

  if (isNew.value) {
    navigateTo(`/${route.fullPath.split('/')[1]}/${result.pk}`)
  }
}

async function savetoDB(mutableData: { [key: string]: any }) {
  const layerConstant: any = await $http.get(api_constant + api_layer_id + objectTypeCalc.value)

  const layerId = layerConstant._data[0].value
  try {
    let response: Record<string, any> = {}

    mutableData.enrichment_begin = mutableData.enrichment_begin ? mutableData.enrichment_begin : null
    mutableData.enrichment_end = mutableData.enrichment_end ? mutableData.enrichment_end : null
    mutableData.geo_layer = mutableData.geo_layer ? mutableData.geo_layer : layerId
    mutableData.ads_updated_internal = new Date().toISOString()
    mutableData.modified_by = $auth.user?.id
    try {
      const regionName = await $calculations.getAnalogRegion(
        mutableData.geo_pos.coordinates[0],
        mutableData.geo_pos.coordinates[1],
      )
      mutableData.address_region = { name: regionName, name_lower: regionName.toLowerCase() }
    } catch (error) {
      mutableData.address_region = { name: '-', name_lower: '-' }
    }
    mutableData.address_district = null
    mutableData.is_cannot_check = false
    mutableData.is_removed_from_publication = false
    if (!isNew.value) {
      if (objectTypeCalc.value === 'NE') {
        mutableData.ads_type = 'S'
      } else {
        mutableData.ne_ads_type = mutableData.ads_type
      }

      mutableData.is_checked = isRequiredFieldsReady.value && isBaseFieldsReady.value

      response = (await $http.put(api_unversal_realty + mutableData.pk + '/', { body: mutableData }))._data
      console.log(response)

      initialDataToCompare = {}
    } else {
      if (objectTypeCalc.value === 'NE') {
        mutableData.ads_type = 'S'
      } else {
        mutableData.ne_ads_type = mutableData.ads_type
      }

      mutableData.is_checked = false
      delete mutableData.pk
      delete mutableData.id

      response = await $http
        .post(api_unversal_realty, { body: mutableData })
        .then((res: Record<string, any>) => res._data)
      let responseSynch = await clearDataSynchroniztion(response.id)
      if (responseSynch) {
        response = responseSynch
      }
    }

    return response
  } catch (error: any) {
    console.log(error.data)
    const errMSg: string[] = []
    if (error.data) {
      Object.keys(error.data).forEach((item) => {
        if (error.data[item] instanceof Array) {
          const label = evoluationMutableOptions.value[item]?.objectData.label
          errMSg.push(label + ': ' + error.data[item][0])
        } else {
          errMSg.push(error.data[item])
        }
      })
    }
    errorFormatMsg.value = errMSg
    console.log('errorFormat', error)
    isShowErrorFormat.value = true
    return { pk: 0 }
  }
}

const errorFormatMsg = ref([''])
const isShowErrorFormat = ref(false)

function checkForInitialData(initialDataToCompare: { [key: string]: any }) {
  let isChanged = false
  for (const key in initialDataToCompare) {
    if (!_isEqual(initialDataToCompare[key].prev, initialDataToCompare[key].curr)) {
      isChanged = true
    }
  }

  return isChanged
}

function setInitial() {
  Object.assign(mutableData.value, initialMutableData.value)
}

function setDefault() {
  for (const key in mutableData.value) {
    if (
      evoluationMutableOptions.value[key] &&
      !mutableData.value[key] &&
      evoluationMutableOptions.value[key].flags.defaultValue
    ) {
      const newVal = evoluationMutableOptions.value[key].choices.filter(
        (item: any) =>
          item.display_name.toLowerCase() === evoluationMutableOptions.value[key].flags.defaultValue.toLowerCase(),
      )[0]

      if (newVal) {
        mutableData.value[key] = newVal.value
        if (evoluationMutableOptions.value[key].tab && evoluationMutableOptions.value[key].section) {
          onUpdateData(
            key,
            newVal.value,
            evoluationMutableOptions.value[key].section,
            evoluationMutableOptions.value[key].tab,
          )
        } else {
          onUpdateData(key, newVal.value)
        }
      } else if (evoluationMutableOptions.value[key].tab && evoluationMutableOptions.value[key].section) {
        onUpdateData(
          key,
          evoluationMutableOptions.value[key].flags.defaultValue,
          evoluationMutableOptions.value[key].section,
          evoluationMutableOptions.value[key].tab,
        )
      } else {
        onUpdateData(key, evoluationMutableOptions.value[key].flags.defaultValue)
      }
    }
  }
}

const isDeleting = ref(false)

async function deleteObj() {
  try {
    let response
    console.log()
    if ($auth.user?.id === 1 && initialRequiredFieldsReady.value) {
      response = (
        await $http.patch(api_unversal_realty + mutableData.value.pk + '/', {
          body: {
            is_deleted: true,
            func_purpose: initialMutableData.value.func_purpose,
            address_district: null,
            address_region: mutableData.value.address_region,
          },
        })
      )._data
    } else if (!initialRequiredFieldsReady.value) {
      response = await $http
        .delete(`${api_unversal_realty + mutableData.value.pk}/`)
        .then((res: Record<string, any>) => res._data)
    }
    isDeleting.value = true
    navigateTo('/')

    return response
  } catch (error) {
    console.log(error)
    return { data: { pk: 0 } }
  }
}

async function dataSynchronization() {
  try {
    const params = { card_id: mutableData.value.pk }
    const changedData = await $http.get(api_update_card_data, { params }).then((res: Record<string, any>) => res._data)
    const resultText = changedData.length
      ? 'Обновлены: ' + changedData.map((item: Record<string, any>) => `${item.label}: ${item.value}`).join(', ')
      : 'Данные не обновлены'
    $userStore.setToastMessage(resultText, 'message')
    const { _data } = await $http.get(api_unversal_realty + mutableData.value.pk)
    isFormChanged.value = false
    Object.assign(mutableData.value, { ..._data })
    mutableData.value.isDataSynchronization = true
    Object.assign(initialMutableData.value, { ..._data })
    $objectStore.is_checked = initialMutableData.value.is_checked
    initialRequiredFieldsReady.value = isRequiredFieldsReady.value
    initialDataToCompare = {}
    setTimeout(() => (mutableData.value.isDataSynchronization = false), 1000)
  } catch (err) {
    console.error(err)
  }
}

async function clearDataSynchroniztion(id: number) {
  try {
    const params = { card_id: id }
    const changedData = await $http.get(api_update_card_data, { params }).then((res: Record<string, any>) => res._data)
    const { _data } = await $http.get(api_unversal_realty + id)
    return _data
  } catch (err) {
    console.error(err)
  }
}
// Навигация

// Rent_result_json
function addRentResult(item: any) {
  let isAlreadyContains = false

  if (!mutableData.value.rent_result_json) mutableData.value.rent_result_json = []
  mutableData.value.rent_result_json.forEach((arrItem: any) => {
    if (_isEqual(arrItem, item)) {
      isAlreadyContains = true
    }
  })
  if (!isAlreadyContains) {
    mutableData.value.rent_result_json.push(item)
  }

  mutableData.value.rent_co = null
  mutableData.value.rent_pu = null
  mutableData.value.rent_dimension = null
  mutableData.value.rent_vat = null
}

function deleteRentResult(item: any) {
  mutableData.value.rent_result_json = mutableData.value.rent_result_json.filter(
    (arrItem: any) => !_isEqual(arrItem, item),
  )
}

// Подтверждения
const isOpenSetInitial = ref(false)
const isOpenLeave = ref(false)
const isOpenSetDefault = ref(false)

const toShowSetDefault = ref(true)
let toLeave = ref(false)
const originalData = ref({})
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const waitFor = async (predicate: () => boolean) => {
  while (!predicate()) {
    await sleep(1000)
  }
  return true
}

const nextRoute = ref<Function | null>(null)

onBeforeRouteLeave(async (to: any, from: any, next: Function) => {
  if (noNavigateNewObject.value) return
  if (
    (objectType.value === 'L' && (objectTypeCalc.value === 'NE' || adsType.value === 'R')) ||
    !isBaseFieldsReady.value ||
    isDeleting.value
  ) {
    $filtersStore.getObjects()
    next()
    return
  }

  if (!isFormChanged.value) {
    if (isNew.value) {
      $objectStore.resetState()
    }
    $filtersStore.getObjects()
    next()
    return
  }

  isOpenLeave.value = true
  nextRoute.value = next

  await waitFor(() => !isOpenLeave.value)

  if (!toLeave.value) {
    next(false)
  } else {
    if (isNew.value) {
      $objectStore.resetState()
    }
    $filtersStore.getObjects()
    next()
  }
})

const handleLogoutEvent = async () => {
  if (isFormChanged.value) {
    isOpenLeave.value = true

    await waitFor(() => !isOpenLeave.value)

    if (!toLeave.value) {
      window.dispatchEvent(new CustomEvent('logoutReady', { detail: { success: false } }))
      return
    }

    await saveObject(mutableData.value, (objectTypeCalc.value as any) === 'OO')
  }

  window.dispatchEvent(new CustomEvent('logoutReady', { detail: { success: true } }))
}

const revertChanges = async () => {
  if (originalData.value && Object.keys(originalData.value).length > 0) {
    mutableData.value.value = JSON.parse(JSON.stringify(originalData.value))
  }
}
const handleSetDefault = () => {
  if (toShowSetDefault.value) {
    isOpenSetDefault.value = true
  } else {
    setDefault()
  }
}

const handleDeleteObj = async () => {
  await deleteObj()
}

function returnPreviousObjectType() {
  $objectStore.setObjectType(initialMutableData.value.object_type)
  $objectStore.setAdsType(initialMutableData.value.ads_type)
  $objectStore.setExchangeType(initialMutableData.value.exchange_type)
  getFuncPurposeByType()
  mutableData.value.object_type = initialMutableData.value.object_type
  mutableData.value.ads_type = initialMutableData.value.ads_type
  mutableData.value.exchange_type = initialMutableData.value.exchange_type
  mutableData.value.func_purpose = { ...initialMutableData.value.func_purpose }
}

function toggleAllDealFields(fields: string[], toToggle: boolean) {
  if (toToggle) {
    $objectStore.setNewRequiredFieldsForTab('Сделка с ОН', 'Сделка с ОН', [])
    fields.forEach((field) => {
      evoluationMutableOptions.value[field].flags.requiredField = false
    })
  } else {
    $objectStore.setNewRequiredFieldsForTab('Сделка с ОН', 'Сделка с ОН', fields)
    fields.forEach((field) => {
      evoluationMutableOptions.value[field].flags.requiredField = true
    })
  }
}

function checkTermsOfSale() {
  console.log(mutableData.value.terms_of_sale, objectTypeCalc.value)
  if (mutableData.value.terms_of_sale === 'D' && objectTypeCalc.value === 'OA') {
    toggleAllDealFields([...$objectStore.objectDealFields], false)
  } else if (mutableData.value.terms_of_sale === 'O' && objectTypeCalc.value === 'OA') {
    toggleAllDealFields([...$objectStore.objectDealFields], true)
  }
}

const analysisScenario = [
  'residential_area',
  'malls_area',
  'industrial_area',
  'cultural_historical_area',
  'landmarks_area',
  'major_transport_routes',
]
const valuesProp: { [key: string]: any } = ref({})
analysisScenario.forEach((item) => {
  valuesProp.value[item] = mutableData.value[item] === 'Y'
})

const fieldsComputed = computed(() => {
  if (!metaScenario.value[currentTabName.value]) return {}
  const fields: { [key: string]: any } = {}

  metaScenario.value[currentTabName.value].forEach((item: any) => {
    fields[item.title] = item.fields
  })

  return fields[currentSectionName.value]
})

const cardRef = ref<InstanceType<typeof Card>>()
const currentTabName = computed({
  get() {
    return cardRef.value?.currentTabName ? cardRef.value.currentTabName : ''
  },
  set(value: string) {
    cardRef.value?.setTabName(value)
  },
})
const currentSectionName = computed({
  get() {
    return cardRef.value?.currentSectionName ? cardRef.value.currentSectionName : ''
  },
  set(value: string) {
    cardRef.value?.setSectionName(value)
  },
})

// Настройка карточки
const headerStructure = computed(() => {
  const structure: headerDesignationType = {
    title: '',
    infoList: [],
  }

  const addInfoItem = (title: string, info: any, showTooltip: boolean = false) => {
    structure.infoList.push({ title, info, showTooltip })
  }

  const formatDate = (date: string | null) => {
    return date ? date.split('T')[0].split('-').reverse().join('.') : '-'
  }

  if (objectTypeCalc.value === 'OA') {
    structure.title = 'ПРЕДЛОЖЕНИЕ'
    addInfoItem('идентификатор', mutableData.value.pk)
    addInfoItem('адрес', mutableData.value.address_raw, true)
    addInfoItem('статус', initialMutableData.value.is_checked ? 'Проверен' : 'Не проверен')
    addInfoItem('обновлён в системе', formatDate(mutableData.value.ads_updated_internal))
  } else if (['OO', 'NE'].includes(objectTypeCalc.value)) {
    structure.title = objectTypeCalc.value === 'OO' ? 'ОБЪЕКТ ОЦЕНКИ' : 'ОБЪЕКТ НЭИ'
    addInfoItem('идентификатор', mutableData.value.pk)
    addInfoItem('адрес', mutableData.value.address_raw, true)
    const dateTitle = objectTypeCalc.value === 'OO' ? 'дата оценки' : 'дата исследования'
    addInfoItem(dateTitle, formatDate(mutableData.value.date_calc))
  }

  const relatedObjectExists =
    isNew.value || changeHasParent.value ? mutableData.value.has_parent : mutableData.value.realty_object?.length

  if (relatedObjectExists) {
    const relatedId =
      isNew.value || changeHasParent.value ? mutableData.value.has_parent.id : mutableData.value.realty_object[0].id

    const relatedType =
      objectTypeToText[
        isNew.value || changeHasParent.value ? mutableData.value.has_parent.object_type : mutableData.value.object_type
      ]?.toLowerCase()

    addInfoItem('связан с объектом', `${relatedType} #${relatedId}`)
    structure.infoList[structure.infoList.length - 1].clickHandler = () => {
      navigateTo(`/real_estate/${relatedId}`, {
        external: true,
        open: { target: '_blank' },
      })
    }
  } else {
    addInfoItem('связан с объектом', 'нет связи')
  }

  return structure
})

const tabsToDisplayFooter = ['Базовые поля', 'Стандартные поля', 'ПЗЗ', 'Доп. ЦОФ', 'Сделка с ОН']

const navigatebleTabsArr = ['Базовые поля', 'Стандартные поля', 'ПЗЗ', 'Сделка с ОН']

const sideBarComputed = computed(() => {
  const structure: menuSideBarStructureType = []
  const onlyBase = isNew.value || !isBaseFieldsReady.value
  const isTabInactive = (tab: string) => notBaseFieldsIsLoading.value || onlyBase

  const getTabIconAndId = (tab: any, index: number) => {
    const scenario = $objectStore.scenarioByTabs[tab.tab][tab.sections[0].name]
    if (tab.onlyHead) {
      if (!scenario.requiredFields?.length) {
        return { icon: 'icon fi_minus m-2', id: `menu-sidebar-icon-info${index}` }
      } else if (scenario.completed) {
        return { icon: 'icon form_ready m-2', id: `menu-sidebar-icon-info${index}` }
      } else {
        return { icon: 'icon form_not-ready m-2', id: `menu-sidebar-icon-info${index}` }
      }
    }
    return { icon: 'icon fi_chevron-down m-2', id: `menu-sidebar-icon-info${index}` }
  }

  const getSectionIconAndId = (tab: any, section: any, sectionIndex: number) => {
    const scenario = $objectStore.scenarioByTabs[tab.tab][section.name]
    if (!scenario.requiredFields?.length) {
      return { icon: 'icon fi_minus me-2', id: `menu-sidebar-icon-info_section${sectionIndex}` }
    } else if (scenario.completed) {
      return { icon: 'icon form_ready me-2', id: `menu-sidebar-icon-info_section${sectionIndex}` }
    } else {
      return { icon: 'icon form_not-ready me-2', id: `menu-sidebar-icon-info_section${sectionIndex}` }
    }
  }

  const handleTabClick = (tab: string) => {
    if (notBaseFieldsIsLoading.value || (onlyBase && tab !== 'Базовые поля')) return
    setTabName(tab)
  }

  const handleSectionClick = (section: string, tabName: string) => {
    if (notBaseFieldsIsLoading.value || onlyBase) return
    setSectionName(section, tabName)
  }

  tabsStructure.value.forEach((tab, index) => {
    const toShow = !(tab.tab !== baseFields && notBaseFieldsIsLoading.value)
    const tabClassName = [
      currentTabName.value === tab.tab ? 'map-object-properties_body_menu-side-bar_tab__active' : '',
      tab.tab !== 'Базовые поля' && isTabInactive(tab.tab) ? 'inactive_menu' : '',
    ]
    const { icon: tabIcon, id: tabId } = getTabIconAndId(tab, index)

    const sections: sectionType[] = tab.sections.map((section: any, sectionIndex: number) => {
      const sectionClass = [
        currentSectionName.value === section.name ? 'map-object-properties_body_menu-side-bar_section__active' : '',
        isTabInactive(tab.tab) ? 'inactive_menu' : '',
      ]
      const { icon: sectionIcon, id: sectionId } = getSectionIconAndId(tab, section, sectionIndex)

      return {
        name: section.name,
        sectionClass,
        sectionIcon,
        sectionId,
        handleSectionClick,
      }
    })

    structure.push({
      ...tab,
      toShow,
      tabClassName,
      tabIcon,
      tabId,
      toShowSections: !tab.onlyHead && !(tab.tab !== baseFields && notBaseFieldsIsLoading.value),
      sections,
      handleTabClick,
    })
  })

  return structure
})

const MenuSideBarDesignation: menuSideBarDesignationType = [
  {
    icon: 'icon fi_minus me-2',
    name: 'На вкладке нет обязательных полей',
  },
  {
    icon: 'icon form_not-ready me-2',
    name: 'На вкладке есть незаполненные обязательные поля',
  },
  {
    icon: 'icon form_ready me-2',
    name: 'На вкладке все обязательные поля заполнены',
  },
  {
    icon: 'icon fi_chevron-down me-2',
    name: 'Пункт меню имеет вложенное меню',
  },
]

watch(
  () => $objectStore.is_checked,
  (newVal) => {
    console.log('watch(() => $objectStore.is_checked')
    initialMutableData.value.is_checked = newVal
  },
)

const isLinkedRealEstate = computed(() => !!mutableData.value.realty_object?.length)
const geoPos = computed(() => mutableData.value.geo_pos)

function autofillFieldsByRealtyObject(realtyObject: Record<string, any>, autoFillAddress = true) {
  let excludedFields = [
    'added_by',
    'files',
    'is_deleted',
    'id',
    'pk',
    'modified_by',
    'parent',
    'func_purpose',
    'path',
    'object_type_calc',
    'object_type',
  ]
  // TODO проверить наследование floor_number
  // console.log(realtyObject.object_area, mutableData.value.object_area, +realtyObject.object_area, +mutableData.value.object_area)
  if (+realtyObject.object_area !== +mutableData.value.object_area && +mutableData.value.object_area !== 0) {
    excludedFields.push('floor_number')
  }
  const cardFields = Object.keys(mutableData.value)
  for (const key in realtyObject) {
    if (!excludedFields.includes(key) && cardFields.includes(key) && checkIsKeyEmpty(key)) {
      mutableData.value[key] = realtyObject[key]
    }
  }
  if (realtyObject.price_sale) {
    mutableData.value.price_sale = +realtyObject.price_sale.replace(/\s+/, '').split('₽')[0].replace(',', '.')
  } else {
    mutableData.value.price_sale = 0
  }
  if (autoFillAddress) {
    mutableData.value.address_raw = realtyObject.address_raw
    mutableData.value.geo_pos = realtyObject.geo_pos
    mutableData.value.osm_id = realtyObject.osm_id
  }
  mutableData.value.center_city_distance = (+realtyObject.distance_center_city).toFixed(1)
  mutableData.value.metro_distance = (+realtyObject.distance_metro * 1000).toFixed(1)
  mutableData.value.water_distantce = (+realtyObject.distance_water * 1000).toFixed(1)
  return { ...mutableData.value }
}

function checkIsKeyEmpty(key: string) {
  if (!evoluationMutableOptions.value[key]) return true
  if (evoluationMutableOptions.value[key].type === 'decimal' || evoluationMutableOptions.value[key].type === 'integer')
    return !+mutableData.value[key]
  else return mutableData.value[key]
}

function setRelatyObjectProperty() {
  mutableData.value.has_parent = $geoObject.objectData
}

// Инициализация
onBeforeMount(async () => {
  if (noNavigateNewObject.value) {
    await initEmptyObject()
  } else if (id === 0) {
    await initEmptyObject()
  } else if (!isNaN(id)) {
    await initExistingObject()
  }
  $objectStore.setFuncPurpose(mutableData.value.func_purpose)
})

onMounted(() => {
  window.addEventListener('checkChangesAndLogout', handleLogoutEvent)
  // Проверка наличия данных перед созданием копии
  if (mutableData.value.value && Object.keys(mutableData.value.value).length > 0) {
    originalData.value = JSON.parse(JSON.stringify(mutableData.value.value)) // Создаем копию исходных данных
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('checkChangesAndLogout', handleLogoutEvent)
})
</script>

<style scoped></style>
