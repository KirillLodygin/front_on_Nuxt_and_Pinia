<template>
  <BNavbar v-if="route.path !== '/'" class="nav-breadcrumb">
    <BNavbarToggle target="nav-collapse" />
    <BCollapse id="nav-collapse" class="bg-light" is-nav>
      <BNavbarNav>
        <BNavItemDropdown
          v-model="mainMenuShow"
          :menu-class="['overflow-visible shadow', { 'd-block': mainMenuShow }]"
          no-caret
          :skip-wrapper="true"
          toggle-class="w-100"
        >
          <template #button-content>
            <i class="icon fi_menu align-middle m-2"></i>
          </template>
          <BNavItemDropdown
            v-for="(sysPath, index) in systemPaths"
            :key="sysPath.title"
            v-model="vmodelSystemPaths[sysPath.title]"
            :class="{ 'd-none': accessDenial(sysPath) }"
            :menu-class="`breadcrumb-ul breadcrumb-dropdown-${index} shadow`"
            :variant="null"
            no-caret
            right
            toggle-class="btn-navitem w-100"
            @mouseenter="() => setVisible(index, sysPath.title)"
            @mouseleave="() => setHidden(index, sysPath.title)"
          >
            <template #button-content>
              <div
                class="w-100 px-1 d-flex gap-3 align-items-center justify-content-between"
                @click="navigateTo(sysPath.path)"
              >
                <TooltipOverflow>
                  <i :class="sysPath.iconClass + ' me-1'"></i>
                  {{ sysPath.title }}
                </TooltipOverflow>
                <i class="icon fi_chevron-right"></i>
              </div>
            </template>
            <BDropdownItem
              v-for="(addItem, index) in sysPath.additionalItems"
              :key="index"
              :link-class="{ 'text-black-50': !getAccessStatus(addItem) }"
              :to="getAccessStatus(addItem) ? addItem.path : '#'"
              :variant="null"
              class="d-block"
            >
              <TooltipOverflow> <i :class="addItem.iconClass + ' me-3'" />{{ addItem.title }} </TooltipOverflow>
            </BDropdownItem>
          </BNavItemDropdown>
        </BNavItemDropdown>
      </BNavbarNav>
      <BNavbarNav class="bg-light h-100">
        <BNav class="catalog-nav" v-if="shouldShowCatalogLink">
          <BNavItem :to="$catalogsTable.previousRoute" class="border-start border-end breadcrumb-link">
            <TooltipOverflow>Каталоги</TooltipOverflow>
          </BNavItem>
          <BNavItemDropdown
            :disabled="true"
            class="breadcrumb-link"
            id="my-nav-dropdown"
            toggle-class="p-0"
            no-caret
            right
          >
            <template #button-content>
              <i class="icon fi_chevron-right align-middle mx-2"></i>
            </template>
          </BNavItemDropdown>
        </BNav>
        <BNav v-for="(item, i) in names" :key="i" pills>
          <BNavItem
            @click="showSavedComparisonsTable(i)"
            :disabled="
              (names.includes('Сравнение объектов недвижимости') && i === 1) ||
              (i === 2 && ['analog', 'evaluation', 'research', 'real_estate'].includes(paths[0]))
            "
            :to="navTo(i)"
            class="border-start border-end breadcrumb-link"
          >
            <TooltipOverflow>{{ names[i] }}</TooltipOverflow>
          </BNavItem>

          <BNavItemDropdown
            v-if="
              (tabsComputed.includes(route.hash.replace('#', '')) ||
                additionalUnshownTabsForBreadCrumb.includes(route.hash.replace('#', '')) ||
                isEvaluationResultPath) &&
              i < names.length - 2
            "
            id="my-nav-dropdown"
            v-model="nextMenuShow"
            :disabled="i > 0"
            :menu-class="{ 'd-block': nextMenuShow }"
            class="breadcrumb-link"
            :skip-wrapper="true"
            no-caret
            right
          >
            <template #button-content>
              <i v-if="i < names.length - 1" class="icon fi_chevron-right align-middle mx-2" />
            </template>
            <BDropdownItem
              v-for="(item, itemIndex) in (systemPaths.find((el) => names[i] === el.title) || {})['additionalItems'] ||
              []"
              :key="itemIndex"
              :variant="null"
              @click="navigateTo(item.path)"
            >
              <TooltipOverflow> <i :class="item.iconClass + ' me-2'"></i>{{ item.title }} </TooltipOverflow>
            </BDropdownItem>
          </BNavItemDropdown>

          <BNavItemDropdown
            v-else-if="i < names.length - 1 && tabsComputed.length"
            id="my-nav-dropdown"
            v-model="itemMenuShow"
            :menu-class="{ 'd-block': itemMenuShow }"
            :disabled="names.includes('Сравнение объектов недвижимости')"
            class="breadcrumb-link"
            :skip-wrapper="true"
            no-caret
            right
          >
            <template #button-content><i class="icon fi_chevron-right align-middle mx-2" /></template>
            <BDropdownItem
              v-for="(item, tabIndex) in tabsComputed"
              :key="tabIndex"
              :variant="null"
              @click="navigateTo({ hash: `#${item}` })"
            >
              <TooltipOverflow>{{ item }}</TooltipOverflow>
            </BDropdownItem>
          </BNavItemDropdown>
        </BNav>
        <template
          v-if="
            $calculations.orderName &&
            (['Расчёты', '#Расчёты'].includes(route.hash) || route.path.split('/').slice(-1)[0] === 'results')
          "
        >
          <BNavItem class="border-start border-end breadcrumb-link">
            <i class="icon fi_chevron-right align-middle mx-2"></i>
          </BNavItem>
          <BNavItem class="border-start border-end breadcrumb-link">
            <TooltipOverflow>{{ $calculations.orderName }}</TooltipOverflow>
          </BNavItem>
          <BNavItem class="border-start border-end breadcrumb-link">
            <i class="icon fi_chevron-right align-middle mx-2"></i>
          </BNavItem>
          <BNavItem class="border-start border-end breadcrumb-link">
            <TooltipOverflow>{{ evalTabName }}</TooltipOverflow>
          </BNavItem>
        </template>
      </BNavbarNav>
    </BCollapse>
  </BNavbar>
</template>

<script lang="ts" setup>
import { navigateTo, useNuxtApp } from 'nuxt/app'
import { additionalUnshownTabsForBreadCrumb } from '~/app_constants/geoObjectTabs'
import routes, { calcTypeToPath, systemPaths } from '~/app_constants/routes'
import useUserPermissions from '~/composables/useUserPermissions'
import TooltipOverflow from './TooltipOverflow.vue'
import { COMPARE } from '~/app_constants/comparisonConsts'
import { computed } from 'vue'

const { $objectStore, $auth, $calculations, $userStore, $geoObject, $comparison } = useNuxtApp()

const userPermissions: string[] = useUserPermissions($auth.user?.permissions)
// закрытие доступа к карточке по правам пользователя.
const accessDenial = (cardItem: Record<string, any>) => {
  const accessPerms = ['IS', 'ADMIN']
  if (accessPerms.some((perm) => userPermissions.includes(perm))) return false
  return (
    !!(
      'openOnlyFor' in cardItem.flags &&
      userPermissions.length &&
      !userPermissions.includes(cardItem.flags['openOnlyFor'])
    ) || !('openOnlyFor' in cardItem.flags)
  )
}
type ObjectType = {
  iconClass: string
  title: string
  path: string
  flags: Record<string, string>
}
const getAccessStatus = (item: ObjectType) => {
  return !('openOnlyFor' in item.flags) || userPermissions.includes(item.flags.openOnlyFor)
}

const route = useRoute()
// const isEvalResults = computed(() => {
//   return route.path.split('/').slice(-1)[0] === 'results'
// })
const evalTabName = computed(() => {
  if (route.path.split('/').slice(-1)[0] === 'results') {
    if ($calculations.isExpress || $calculations.evaluationType === 'EX') return 'Результаты ЭО'
    return $calculations.evaluationsStagesTabs[$calculations.activeTabIndex]
  } else {
    if ($calculations.isExpress || $calculations.evaluationType === 'EX') return 'Экспресс-оценка'
    return 'Добавление предложений в расчет'
  }
})
let routeElem = reactive({
  matchedPath: '',
  path: '',
  name: '',
}) as { matchedPath: string; path: string; name: string } | null

const matchedPaths = ref<string[]>([])
const paths = ref<string[]>([])
const names = ref<string[]>([])
const mainMenuShow = ref(false)
const nextMenuShow = ref(false)
const itemMenuShow = ref(false)
const vmodelSystemPaths: Ref<Record<string, boolean>> = ref({})
const previousRoute = ref<any>(null)

onMounted(() => {
  if (route) {
    createPaths()
    setCalcTypeForPage()
    setModeOfPage()
    console.log(route.matched[0].path)
    console.log('hash', route.hash)
  }
})
const matches = {
  OA: 'analog_id',
  OO: 'evaluation_id',
  NE: 'research_id',
}

watch(
  () => route.path,
  () => {
    // console.log('reset', route.path, route.params, route)
    if ($objectStore.id) {
      // console.log('$objectStore.id', route.params[matches[$objectStore.objectTypeCalc]])
      if ($objectStore.id !== +route.params[matches[$objectStore.objectTypeCalc]]) {
        console.log('reset')
        $objectStore.resetState()
      }
    }
    createPaths()
    setCalcTypeForPage()
  },
)

watch(
  () => route.path,
  (newPath, oldPath) => {
    previousRoute.value = oldPath // Сохраняем старый маршрут как предыдущий
    console.log('from catalog-oldPath', oldPath)
    // if (previousRoute.value.includes('/catalog')) {
    //   console.log('from catalog')
    // }
  },
  { immediate: true },
)

watch(
  () => route.query,
  () => setModeOfPage(),
)

watch(
  () => route.hash,
  () => createPaths(),
)

watch(
  () => $geoObject.initialObjectData.name,
  () => createPaths(),
)

const shouldShowCatalogLink = computed(() => {
  return (
    (route.path.includes('real_estate') ||
      route.path.includes('evaluation') ||
      route.path.includes('analog') ||
      route.path.includes('research')) &&
    previousRoute.value === '/catalog'
  )
})

const setCalcTypeForPage = () => {
  const pathArr = route.path.split('/')
  const calcType = Object.keys(calcTypeToPath).find((key) => calcTypeToPath[key] === pathArr[1])
  if (calcType && calcType !== $userStore.calcTypeForPage) {
    $userStore.setCalcTypeForPage(calcType)
  }
}

const setModeOfPage = () => {
  if ('mode' in route.query && route.query.mode) {
    const mode = Array.isArray(route.query.mode) ? route.query.mode[0] : route.query.mode
    $userStore.setModeOfPage(mode as string)
  }
}
const createPaths = async () => {
  routeElem = routes.find((el) => el.matchedPath === route.matched[0].path) || null
  if (routeElem) {
    matchedPaths.value = routeElem.matchedPath.split('/')
    matchedPaths.value = matchedPaths.value.slice(1, matchedPaths.value.length)
    paths.value = routeElem.path.split('/')
    names.value = routeElem.name.split('/')
  }
  paths.value.map((path, i) => {
    if (path in route.params) {
      if (names.value[i] === '#') {
        if (path === 'real_estate_id') {
          names.value[i] = $geoObject.objectData.name
        }
      } else names.value[i] = names.value[i] + ' ' + route.params[path]
      paths.value[i] = `${route.params[path]}`
    }
  })

  if (paths.value.includes(COMPARE) && names.value.length > 1) {
    $comparison.setSavedComparisons().then(() => {
      names.value[1] = $comparison.getComparisonObjectNameById(names.value[1] || null)
    })
  }
  if (route.hash) {
    if (route.hash.includes('>')) {
      const hashPath = route.hash.replace('#', '').split('>').map(decodeURIComponent)
      hashPath.forEach((name) => {
        names.value.push(name)
      })
    } else {
      names.value.push(route.hash.replace('#', ''))
      paths.value.push(route.hash)
    }
  }
  vmodelSystemPaths.value = {}
  systemPaths.forEach((item) => {
    vmodelSystemPaths.value[item.title] = false
  })
}

const showSavedComparisonsTable = (i: number) => {
  if (i === 0 && paths.value.slice(0, i + 1).join('/') === COMPARE) {
    $comparison.setSavedComparisons().then(() => {
      navigateTo(`/${COMPARE}`)
      $comparison.resetActiveComparisonItem()
      $comparison.resetAuxiliaryValues()
      $comparison.isUpdateComparisonObjects([])
    })
  }
}

const navTo = (i: number) => {
  const path = () => {
    if (i === 2 && paths.value.includes('results')) {
      if ($calculations.evaluationType === 'EX') {
        $userStore.setEvaluationComponent('orders')
        $calculations.setOrderName('')
        // $calculations.setIsExpress(false)
      }
      return paths.value.slice(0, i).join('/')
    }
    return paths.value.slice(0, i + 1).join('/')
  }

  const hash = () => {
    if (i === 2 && paths.value.includes('results')) {
      return 'Расчёты'
    } else if (i === 1) {
      return paths.value.includes('real_estate') ? $geoObject.tabsNames[0] : $objectStore.tabsNames[0]
    } else if (paths.value.includes('catalog')) {
      // Определяем индекс элемента 'catalog' и формируем хеш из всех последующих элементов до текущего индекса i
      const catalogIndex = names.value.indexOf('Каталоги')
      if (i > catalogIndex) {
        const hashParts = names.value.slice(catalogIndex + 1, i + 1)
        console.log('hashParts', hashParts.join('>'))
        return hashParts.join('>')
      }
    }
    return ''
  }

  console.log('path', path(), 'hash ', hash())

  if (paths.value.includes('catalog')) {
    const catalogsPath = `/${path()}${hash() ? '#' + hash() : ''}`
    console.log('catalogsPath', catalogsPath)
    return catalogsPath
  }

  // Возвращаем объект для router.push

  return {
    path: '/' + path(),
    hash: paths.value.includes('catalog')
      ? hash()
        ? '#' + encodeURIComponent(hash())
        : ''
      : hash()
        ? '#' + hash()
        : '',
  }
}

const setVisible = (id: number, title: string) => {
  vmodelSystemPaths.value[title] = true

  if (document.querySelector(`.breadcrumb-dropdown-${id}`) as HTMLUListElement) {
    ;(document.querySelector(`.breadcrumb-dropdown-${id}`) as HTMLUListElement).style.display = ''
  }
}
const setHidden = (id: number, title: string) => {
  vmodelSystemPaths.value[title] = false
  if (document.querySelector(`.breadcrumb-dropdown-${id}`) as HTMLUListElement) {
    ;(document.querySelector(`.breadcrumb-dropdown-${id}`) as HTMLUListElement).style.display = 'none'
  }
}

watch(
  () => $objectStore.tabsNames,
  (newVal) => {
    console.log('route.hash ', route.hash)
    console.log('breadcrumb tabNames', newVal)
  },
)

const tabsComputed = computed(() => {
  if (paths.value[0] === 'real_estate') return $geoObject.tabsNames
  else if (['analog', 'evaluation', 'research', 'compare'].includes(paths.value[0])) return $objectStore.tabsNames
  else if (['catalog'].includes(paths.value[0])) return ['']
  else return []
})

const isEvaluationResultPath = computed(() => route.path.slice(route.path.lastIndexOf('/') + 1) === 'results')
</script>
