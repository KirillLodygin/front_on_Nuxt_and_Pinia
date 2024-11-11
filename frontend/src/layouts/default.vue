<template>
  <div v-if="render" class="main-h">
    <TopMenu />
    <div class="under-menu">
      <BreadCrumb />
      <div class="down-from-top-menu">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TopMenu from './menu/TopMenu'
import BreadCrumb from '~/layouts/menu/BreadCrumb.vue'
import { calcTypeToPath } from '~/app_constants/routes'

const { $constData, $filtersStore, $auth, $userStore, $objectModelTable } = useNuxtApp()

const render = ref(true)
const route = useRoute()

onMounted(async () => {
  try {
    await $constData.getAll()

    const userId = $auth.user ? $auth.user.id : ''
    if (!userId) {
      return
    }

    await $filtersStore.setUserId(userId)
    await $objectModelTable.setUserId(userId)

    await handleRouteChange()
  } catch (error) {
    console.error('[onMounted] Ошибка инициализации:', error)
  }
})

async function handleRouteChange() {
  const normalizedPath = route.path.replace(/\/+$/, '')

  if (normalizedPath.includes('real_estate')) {
    return
  }

  if (Object.values(calcTypeToPath).some((type) => normalizedPath === `/${type}`)) {
    $userStore.setPageLoading(true)

    try {
      await $filtersStore.appStartingFilterFunctions()
      $filtersStore.updateSearchObjectTypeCalc($userStore.calcTypeForPage)

      const userId = $auth.user ? $auth.user.id : ''
      if ($userStore.modeOfPage === 'self') {
        $filtersStore.initFilters($userStore.calcTypeForPage, 'Требует проверки', userId.toString())
      } else {
        $filtersStore.initFilters($userStore.calcTypeForPage)
      }

      await $filtersStore.getObjects()
    } catch (error) {
      console.error('[handleRouteChange] Ошибка при выполнении запросов:', error)
    } finally {
      $userStore.setPageLoading(false)
    }
  }
}

// Наблюдение за изменениями в хранилище и маршруте
watch([() => $userStore.modeOfPage, () => $userStore.calcTypeForPage], () => {
  handleRouteChange()
})
</script>
