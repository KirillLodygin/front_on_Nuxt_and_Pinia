<template>
  <template
    v-if="
      $geoObject.noNavigateNewCard &&
      $geoObject.createCardCalcType &&
      [createEvaluation, createAnalog, createResearch].includes(computedRouteHash as any)
    "
  >
    <MapObjectProperties :id="0" :object-type-calc-prop="$geoObject.createCardCalcType" />
  </template>
  <template
    v-else-if="
      $geoObject.linkExistingCardTable && $geoObject.linkExistingCardType && computedRouteHash === linkExistingCard
    "
  >
    <LoadingCover v-if="$userStore.pageLoading" />

    <TableBlockWrapper
      v-else
      :navigate-string="navigateString[navigateStringByCalcTypeMap[$geoObject.linkExistingCardType]]"
      :page-header="pageHeader[navigateStringByCalcTypeMap[$geoObject.linkExistingCardType]]"
      :title-for-add-button="titleForAddButton[navigateStringByCalcTypeMap[$geoObject.linkExistingCardType]]"
    />
  </template>
  <template
    v-else-if="
      $geoObject.linkExistingObjectsTable &&
      $geoObject.linkExistingObjectsType &&
      computedRouteHash === linkExistingObject
    "
  >
    <LoadingCover v-if="$userStore.pageLoading" />
    <div v-else class="h-100">
      <ModelBlockWrapper
        :navigate-string="navigateString.real_estate"
        :page-header="pageHeader.real_estate"
        :title-for-add-button="titleForAddButton.real_estate"
      />
    </div>
  </template>
  <template v-else>
    <LoadingCover v-if="!isInit" />
    <Card
      v-else
      ref="cardRef"
      :tabs-structure="tabsStructure"
      :header-structure="headerStructure"
      :structureComputed="sideBarComputed"
      :designation="MenuSideBarDesignation"
      :tabs-to-display-footer="tabsToDisplayFooter"
      :navigateble-tabs-arr="[]"
    >
      <template #headerFunctionality="{ section }">
        <GeoObjectHeaderFunctionality />
      </template>
      <template #body="{ section, tab, isConst }">
        <MergedFields
          ref="mergedFieldsRef"
          v-if="tab === mergedFields"
          :section="currentSectionName"
          @set-section="(value: any) => (currentSectionName = value)"
        />

        <GeoObjectLinksComponent v-else-if="section === nestedObjects" />
        <GeoTsof v-else-if="section === locationAccessibility" :is-geo-object="true" />
        <Files
          v-else-if="section === photo && !$geoObject.isNew"
          :is-new="$geoObject.isNew"
          :mutable-data="$geoObject.objectData"
          :mode="photo"
          :api-url="api_realty_objects"
          :files-group-data-prop="filesGroupObject"
          :object-type="$geoObject.objectData.object_type"
          :object-type-calc="'OA'"
          :disabled-modifier="$geoObject.readOnly"
          :is-card="false"
          :required-files-accessor="[]"
        />
        <Files
          v-else-if="section === documents && !$geoObject.isNew"
          :is-new="$geoObject.isNew"
          :mutable-data="$geoObject.objectData"
          :mode="documents"
          :api-url="api_realty_objects"
          :files-group-data-prop="filesGroupObject"
          :object-type="$geoObject.objectData.object_type"
          :object-type-calc="'OA'"
          :disabled-modifier="$geoObject.readOnly"
          :is-card="false"
          :required-files-accessor="[]"
        />
        <HistoryEstimation v-else-if="section === evaluationHistory" :id="props.id" />
        <HistoryOffers v-else-if="section === offerHistory" :id="props.id" />
        <MapObjectPropertiesGeoLayers
          v-else-if="section === geoLayer"
          :lat="$geoObject.initialObjectData.geo_pos.coordinates[1]"
          :lng="$geoObject.initialObjectData.geo_pos.coordinates[0]"
          :mutable-data="$geoObject.initialObjectData"
        />
      </template>
      <template #footerFunctionality>
        <GeoObjectFooterFunctionality />
      </template>
    </Card>
    <ModalMessage v-model="isOpenLeave" size="lg" title="ЗАВЕРШИТЬ РЕДАКТИРОВАНИЕ">
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
          <button class="btn btn-lg btn-outline-secondary me-2" @click="cancelChanges(cancel)">
            Отменить изменения
          </button>
          <button class="btn btn-lg btn-outline-secondary me-2" @click="saveChanges(cancel)">
            Сохранить изменения
          </button>
          <button class="btn btn-lg btn-primary" @click="returnToEditing(ok)">Вернуться к редактированию</button>
        </div>
      </template>
    </ModalMessage>
  </template>
</template>

<script setup lang="ts">
import LoadingCover from '../UI-KIT/Loaders/LoadingCover.vue'
import TableBlockWrapper from '../ObjectsTable/TableBlockWrapper.vue'
import Files from '~/components/MapObjectProperties/Sections/Files.vue'
import MapObjectPropertiesGeoLayers from '../MapObjectProperties/Sections/GeoLayers.vue'
import GeoTsof from '../MapObjectProperties/Sections/GeoTsof.vue'
import { navigateString, pageHeader, titleForAddButton } from '~/app_constants/objectsTable'
import type {
  constTabType,
  headerDesignationType,
  menuSideBarDesignationType,
  menuSideBarStructureType,
  sectionType,
  tabsStructureType,
} from '~/types/cardTypes'
import Card from '../UI-KIT/ObjectCard/Card.vue'
import MergedFields from '../MapObjectProperties/MergedFields.vue'
import GeoObjectLinksComponent from './GeoObjectLinksComponent.vue'
import GeoObjectFooterFunctionality from './GeoObjectFooterFunctionality.vue'
import HistoryEstimation from '~/components/CardSummary/HistoryEstimation.vue'
import HistoryOffers from '~/components/CardSummary/HistoryOffers.vue'
import ModalMessage from '~/components/UI-KIT/Alerts/ModalMessage.vue'
import {
  geoLayer,
  allTypesConstTabs,
  childSections,
  weights,
  mergedFields,
  customSectionBehavior,
  nestedObjects,
  photo,
  documents,
  geoTsof,
  evaluationHistory,
  offerHistory,
  locationAccessibility,
  linkExistingCard,
  linkExistingObject,
  createResearch,
  createAnalog,
  createEvaluation,
} from '~/app_constants/geoObjectTabs'
import { api_realty_objects } from '~/app_constants/api'
import type { objectTypeCalcType } from '~/types/mapObjectPropertiesTypes'
import { scenarioCreateObject } from '~/app_constants/mergedFieldsConst'
import { scenario } from '~/app_constants/mergedFieldsConst'
import { filesGroupObject } from '~/app_constants/filesGroup'
import ModelBlockWrapper from '../ObjectModelTable/ModelBlockWrapper.vue'
import { objectTypeToText } from '~/app_constants/mergedFieldsConst'
import { cloneDeep } from 'lodash'
import { ref } from 'vue'

interface Props {
  id: number
}

const props = defineProps<Props>()
const { $geoObject, $userStore } = useNuxtApp()
const tabsStructure: Ref<tabsStructureType> = ref([])
const tabsToDisplayFooter = [mergedFields]
const isLandplot = ref(false)
const route = useRoute()
const isOpenLeave = ref(false)
const toLeave = ref(false)
const computedRouteHash = computed(() => {
  const routeHash = cloneDeep(route.hash)
  return routeHash.replace('#', '')
})
watch(
  () => route.hash,
  (newVal, oldVal) => {
    console.log(newVal, oldVal)

    nextTick(() => {
      if (newVal === oldVal || !cardRef.value?.tabsList.includes(newVal.replace('#', ''))) return
      setTabName(newVal.replace('#', ''))
    })
  },
)

function createTabsStructure() {
  const structure: tabsStructureType = []

  const constStructures = createConstSctrucures()
  for (const tab in constStructures) {
    structure.push(constStructures[tab])
  }

  structure.sort((a: constTabType, b: constTabType) => {
    const aTab = a.tab
    const bTab = b.tab
    return weights[bTab] - weights[aTab]
  })
  tabsStructure.value = structure
  $geoObject.setTabNames(structure.map((item) => item.tab))
  console.log(cardRef.value?.tabsList, route.hash)
  if (route.hash && cardRef.value?.tabsList.includes(computedRouteHash.value)) {
    setTabName(computedRouteHash.value)
  } else {
    navigateTo({ hash: `#${mergedFields}` })
  }
}
function createConstSctrucures() {
  const constStructures: Record<string, constTabType> = {}
  allTypesConstTabs.forEach((tab) => {
    setConstSectionObject(constStructures, tab)
  })

  return constStructures
}
function setConstSectionObject(constStructures: Record<string, any>, tab: string) {
  if (childSections[tab]) {
    constStructures[tab] = {
      tab: tab,
      sections:
        tab === mergedFields
          ? childSections[tab]
              .map((section) => {
                return {
                  name: section,
                }
              })
              .filter((item) => getMergedFieldsFilterArr().includes(item.name))
          : childSections[tab].map((section) => {
              return {
                name: section,
              }
            }),
      isConst: true,
      onlyHead: false,
      customSectionBehavior: customSectionBehavior.includes(tab),
    }
  } else {
    constStructures[tab] = {
      tab: tab,
      sections: [{ name: tab }],
      isConst: true,
      onlyHead: true,
      customSectionBehavior: customSectionBehavior.includes(tab),
    }
  }
}

function getMergedFieldsFilterArr() {
  if ($geoObject.isNew) {
    return scenarioCreateObject.map((item) => item.title)
  } else {
    return scenario[$geoObject.objectData.object_type].map((item) => item.title)
  }
}

const headerStructure = computed(() => {
  const structure: headerDesignationType = {
    title: 'КАРТОЧКА СВОДНАЯ',
    infoList: [],
  }

  const addInfoItem = (title: string, info: any, clickHandler?: () => void) => {
    structure.infoList.push({ title, info, clickHandler })
  }

  addInfoItem('идентификатор', $geoObject.objectData.id)
  addInfoItem('адрес', $geoObject.objectData.address_raw)
  addInfoItem('дата изменения', reformatDate($geoObject.initialObjectData.modified_date))

  const parentObject = $geoObject.objectData.parent
  if (parentObject) {
    const parentTypeText = objectTypeToText[parentObject.object_type].toLowerCase()
    const parentId = parentObject.id

    addInfoItem('связан с объектом', `${parentTypeText} #${parentId}`, () => {
      navigateTo(`/real_estate/${parentId}`, {
        external: true,
        open: { target: '_blank' },
      })
    })
  } else {
    addInfoItem('связан с объектом', 'нет связи')
  }

  return structure
})

const sideBarComputed = computed(() => {
  const structure: menuSideBarStructureType = []
  tabsStructure.value.forEach((tab, index) => {
    const toShow = true
    const tabClassName = [
      currentTabName.value === tab.tab ? 'map-object-properties_body_menu-side-bar_tab__active' : '',
      tab.tab !== mergedFields && $geoObject.isNew ? 'inactive_menu' : '',
    ]
    let tabIcon = ''
    let tabId = ''
    if (tab.onlyHead) {
      tabIcon = 'map-object-properties_body_menu-side-bar_icon icon fi_minus m-2'
      tabId = 'menu-sidebar-icon-info' + index
    } else {
      tabIcon = 'map-object-properties_body_menu-side-bar_icon icon fi_chevron-down m-2'
      tabId = 'menu-sidebar-icon-info' + index
    }
    const toShowSections = !tab.onlyHead
    const handleTabClick = (tab: string) => {
      if ($geoObject.isNew && tab !== mergedFields) return
      setTabName(tab)
    }
    const sections: sectionType[] = []
    tab.sections.forEach((section: any, sectionIndex: number) => {
      const name = section.name
      const sectionClass = [
        currentSectionName.value === section.name ? 'map-object-properties_body_menu-side-bar_section__active' : '',
        tab.tab !== mergedFields && $geoObject.isNew ? 'inactive_menu' : '',
      ]
      let sectionIcon = ''
      let sectionId = ''

      sectionIcon =
        tab.tab === mergedFields
          ? 'map-object-properties_body_menu-side-bar_icon icon ksi_union me-2'
          : 'map-object-properties_body_menu-side-bar_icon icon fi_minus me-2'
      sectionId = 'menu-sidebar-icon-info_section' + sectionIndex

      const handleSectionClick = (section: string, tabName: string) => {
        if ($geoObject.isNew && tabName !== mergedFields) return
        setSectionName(section, tabName)
      }
      sections.push({
        name,
        sectionClass,
        sectionIcon,
        sectionId,
        handleSectionClick,
      })
    })
    structure.push({
      ...tab,
      toShow,
      tabClassName,
      tabIcon,
      tabId,
      toShowSections,
      sections,
      handleTabClick,
    })
  })

  return structure
})

const MenuSideBarDesignation: menuSideBarDesignationType = [
  {
    icon: 'icon fi_chevron-down me-2',
    name: 'Пункт меню имеет вложенное меню',
  },
]

const cardRef = ref<InstanceType<typeof Card>>()
watch(
  () => cardRef.value,
  () => {
    if (route.hash && cardRef.value?.tabsList.includes(computedRouteHash.value)) {
      setTabName(computedRouteHash.value)
    }
  },
)

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
    // if (currentTabName.value === mergedFields) {
    //   mergedFieldsRef.value?.scrollToSection(value)
    // }
  },
})

function setSectionName(name: string, tab: string) {
  // if (currentTabName.value !== tab) {
  //   currentTabName.value = tab
  // }
  currentSectionName.value = name
  const tabHasSection = tabsStructure.value
    .filter((item) => item.tab === currentTabName.value)[0]
    .sections.filter((item) => item.name === currentSectionName.value).length
  console.log(tabHasSection)
  if (!tabHasSection) {
    setTabName(tab)
  }
}

function setTabName(name: string) {
  currentTabName.value = name

  if (!currentSectionName.value || !currentTabName.value) return
  const tabHasSection = tabsStructure.value
    .filter((item) => item.tab === currentTabName.value)[0]
    .sections.filter((item) => item.name === currentSectionName.value).length
  if (!tabHasSection) {
    currentSectionName.value = tabsStructure.value.filter(
      (item: { [key: string]: any }) => item.tab === currentTabName.value,
    )[0].sections[0].name
  }

  navigateTo({ hash: `#${name}` })
  console.log(currentTabName.value, name)
}

onBeforeMount(async () => {
  await $geoObject.init(props.id)
  createTabsStructure()

  isInit.value = true
})

const mergedFieldsRef = ref<InstanceType<typeof MergedFields>>()

// Инициализация объекта

const isInit = ref(false)
type tablePropsMapper = keyof typeof navigateString | keyof typeof pageHeader | keyof typeof titleForAddButton
const navigateStringByCalcTypeMap: Record<objectTypeCalcType, tablePropsMapper> = {
  OO: 'aim',
  OA: 'analogs',
  NE: 'research',
}

const waitFor = async (predicate: () => boolean) => {
  while (!predicate()) await new Promise((resolve) => setTimeout(resolve, 1000))
  return true
}

const cancelChanges = async (cancel: () => void) => {
  toLeave.value = true
  await $geoObject.setInitial()
  cancel()
}
const saveChanges = async (cancel: () => void) => {
  toLeave.value = true
  await $geoObject.save()
  cancel()
}
const returnToEditing = (ok: () => void) => {
  toLeave.value = false
  ok()
}

onBeforeUnmount(() => {
  $geoObject.$reset()
})

onBeforeRouteLeave(async (to: any, from: any, next: Function) => {
  // Проверяем, если изменений не было, то сразу продолжаем навигацию
  if (!$geoObject.isFormChanged) {
    next()
    return
  }

  // Если изменения были, показываем подтверждение выхода
  isOpenLeave.value = true
  // nextRoute.value = next

  // Ждем, пока пользователь примет решение
  await waitFor(() => !isOpenLeave.value)

  // Если пользователь решил остаться, отменяем переход
  if (!toLeave.value) {
    next(false)
  } else {
    next()
  }
})
</script>

<style scoped></style>
