<template>
  <div class="top-menu" @mouseleave="setHiddenComparisonObjectsMenu">
    <BNavbar class="navbar ps-3 navbar-menu">
      <BNavbarBrand>
        <div
          alt="logo"
          class="logo cursor-pointer"
          @click="
            () => {
              navigateTo('/')
              $comparison.isOpenCurrentCompare()
            }
          "
        ></div>
      </BNavbarBrand>
      <BNavbarNav class="ms-auto">
        <!--контекстное меню кнопки Сравнения-->
        <BNavItemDropdown
          v-if="!route.path.includes(COMPARE)"
          v-model="comparisonObjectsMenuShow"
          :menu-class="['overflow-visible shadow', { 'd-block': comparisonObjectsMenuShow }]"
          :variant="null"
          disabled
          no-caret
          :skip-wrapper="true"
          class="m-0 p-0 bg-opacity-10 rounded-pill me-2 cursor-pointer"
          toggle-class="d-flex align-items-center"
          @mouseenter="setVisibleComparisonObjectsMenu"
        >
          <template #button-content>
            <div class="top-menu-btn top-menu-btn-comparison bg-opacity-25" style="position: relative">
              <i class="icon icon-2xl fi_compare" />
              <div v-if="comparisonObjectsForTopMenu.length && !isClearCompare" class="top-menu-bill">
                {{ comparisonObjectsForTopMenu.length }}
              </div>
            </div>
          </template>
          <!-- Объекты для сравнения -->
          <BDropdownItem
            v-for="(obj, index) in comparisonObjectsForTopMenu"
            :key="index"
            :variant="null"
            @mouseenter="setVisibleIcon(index)"
            @mouseleave="setHiddenIcon()"
          >
            <div class="d-flex flex-row justify-content-between">
              <span>
                <i class="icon me-1" :class="Array.isArray(obj.address) ? 'ic-location_regular' : 'ksi_building'"></i>
                {{ getObjectDataAddressString(obj) }}
              </span>
              <div>
                <i
                  v-if="isShowDeletedIconArr[index]"
                  class="icon fi_compare-off ms-2"
                  @click="deleteComparisonObject(index)"
                />
                <i v-else class="icon ms-2" style="opacity: 0"></i>
              </div>
            </div>
          </BDropdownItem>
          <BDropdownDivider v-if="comparisonObjectsForTopMenu.length > 1" />
          <!-- Перейти к сравнению -->
          <BDropdownItem
            v-if="comparisonObjectsForTopMenu.length > 1"
            :variant="null"
            @click.stop="isNavigateToCompare"
          >
            <i class="icon fi_compare me-1"></i> Перейти к сравнению
          </BDropdownItem>
          <BDropdownDivider />
          <!-- Очистить список сравнения -->
          <BDropdownItem :variant="null" @click.stop="isClearComparisonObjects">
            <i class="icon fi_broom-wide me-1"></i> Очистить список сравнения
          </BDropdownItem>
        </BNavItemDropdown>

        <BNavItem class="top-menu-btn bg-opacity-50 me-2" href="#" title="">
          <i class="icon icon-2xl fi_headset" />
        </BNavItem>

        <BNavItem class="top-menu-btn bg-opacity-25 me-2" href="#" title="">
          <i class="icon icon-2xl fi_help-circle" />
        </BNavItem>

        <BNavItemDropdown
          v-model="userMenuShow"
          :menu-class="['overflow-visible shadow', { 'd-block': userMenuShow }]"
          class="m-0 p-0 me-2 pe-3 bg-secondary bg-opacity-10 rounded-pill"
          :skip-wrapper="true"
          toggle-class="d-flex align-items-center"
        >
          <template #button-content>
            <span v-if="$auth.user" class="top-menu-btn align-items-center bg-opacity-25 me-2">
              <i class="icon icon-2xl fi_user"></i>
            </span>
            {{ userLabel() }}
          </template>
          <!-- Выпадающий список тем -->
          <BNavItemDropdown
            id="my-nav-dropdown"
            v-model="themeMenuShow"
            :menu-class="['theme-dropdown shadow', { 'd-block': themeMenuShow }]"
            :variant="null"
            dropend
            no-caret
            toggle-class="btn-navitem"
            @mouseenter="setVisible"
            @mouseleave="setHidden"
          >
            <template #button-content>
              <div class="px-2">
                <i class="icon fi_pallete me-1"></i> Тема оформления
                <i class="icon fi_chevron-left"></i>
              </div>
            </template>
            <BDropdownItem
              :active="appTheme === 'light-theme'"
              :variant="null"
              class="d-block"
              @click="onThemeClick($event, 'light-theme')"
            >
              <i class="icon-color fi_theme-light me-1"></i> Светлая
            </BDropdownItem>
            <BDropdownItem
              :active="appTheme === 'contrast-theme'"
              :variant="null"
              class="d-block"
              @click="onThemeClick($event, 'contrast-theme')"
            >
              <i class="icon-color fi_theme-contrast me-1"></i> Высококонтрастная
            </BDropdownItem>
          </BNavItemDropdown>
          <!-- Профиль -->
          <BDropdownItem :variant="null" @click.prevent="onProfileClick">
            <i class="icon fi_user me-1"></i> Профиль
          </BDropdownItem>
          <BDropdownDivider />
          <!-- Logout -->
          <BDropdownItem :variant="null" @click.stop="confirmLogout">
            <i class="icon fi_logout me-1"></i> Завершите работу
          </BDropdownItem>
        </BNavItemDropdown>
      </BNavbarNav>
    </BNavbar>
    <!-- Модальное окно подтверждения выхода -->
    <BModal id="logout-confirm-modal" v-model="showLogoutConfirm" title="Подтверждение выхода">
      <div>Вы уверены, что хотите завершить работу?</div>
      <template #footer>
        <BButton variant="primary" @click="onLogoutConfirm">Да</BButton>
        <BButton variant="secondary" @click="showLogoutConfirm = false">Нет</BButton>
      </template>
    </BModal>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { navigateTo, useNuxtApp } from 'nuxt/app'
import { useRoute, useRouter } from 'vue-router'
import { COMPARE } from '~/app_constants/comparisonConsts'

const { $auth, $comparison, $filtersStore, $objectModelTable } = useNuxtApp()
const router = useRouter()
const route = useRoute()

const appTheme = ref('light-theme')
const userMenuShow = ref(false)
const themeMenuShow = ref(false)
const showLogoutConfirm = ref(false)
const isShowDeletedIconArr: Ref<boolean[]> = ref([])
const comparisonObjectsMenuShow = ref(false)

onMounted(() => getTheme())

const comparisonObjectsForTopMenu = computed(() => $comparison.getComparisonObjectsForTopMenu())
const isClearCompare = computed(() => $comparison.isClearCompare)

const getTheme = () => {
  const html = document.querySelector('html')
  if (html) {
    if ('appTheme' in localStorage) {
      const theme = localStorage.getItem('appTheme')
      if (theme !== null) {
        appTheme.value = theme
        html.className = theme
      }
    } else {
      localStorage.setItem('appTheme', appTheme.value)
      html.className = appTheme.value
    }
  }
}

const onProfileClick = () => {
  router.push('/user')
}

const confirmLogout = () => {
  showLogoutConfirm.value = true
}

const onLogoutConfirm = async () => {
  const pathToCheck = ['/analog', '/evaluation', '/research']

  // Функция для проверки, если путь содержит число после указанного префикса
  const checkPathWithNumber = (path: any) => {
    const regex = new RegExp(`^${path}/\\d+`)
    return regex.test(route.path)
  }

  // Проверяем каждый путь в pathToCheck, если он совпадает с текущим маршрутом и содержит число после префикса
  if (pathToCheck.some((path) => checkPathWithNumber(path))) {
    if (await handleSaveAndLogout()) {
      sessionStorage.setItem('isLoggingOut', 'true') // Устанавливаем флаг перед выходом
      await $auth.logout() // Дожидаемся завершения выхода
      await router.push('/login') // Редирект на страницу логина
      $filtersStore.updateSearchObjectLimit(15)
      $objectModelTable.updateSearchObjectLimit(15)
    }
  } else {
    sessionStorage.setItem('isLoggingOut', 'true')
    await $auth.logout() // Дожидаемся завершения выхода
    await router.push('/login') // Редирект на страницу логина
    $filtersStore.updateSearchObjectLimit(15)
    $objectModelTable.updateSearchObjectLimit(15)
  }
  showLogoutConfirm.value = false
}

const handleSaveAndLogout = async () => {
  // Запускаем проверку и сохранение изменений
  return await new Promise((resolve) => {
    const event = new Event('checkChangesAndLogout')
    window.dispatchEvent(event)

    const onLogoutReady = (e: any) => {
      window.removeEventListener('logoutReady', onLogoutReady)
      resolve(e.detail.success)
    }
    window.addEventListener('logoutReady', onLogoutReady)
  })
}

const onThemeClick = (event: any, theme: any) => {
  const html = document.querySelector('html')
  if (html) {
    localStorage.setItem('appTheme', theme)
    appTheme.value = theme
    html.className = theme
  }
}

const setVisible = () => {
  themeMenuShow.value = true
  const themeDropdown = document.querySelector(`.theme-dropdown`) as HTMLUListElement
  if (themeDropdown) {
    themeDropdown.style.display = ''
  }
}

const setVisibleComparisonObjectsMenu = () => {
  if (isClearCompare.value || !comparisonObjectsForTopMenu.value.length) return
  comparisonObjectsMenuShow.value = true
}

const setHidden = () => {
  themeMenuShow.value = false
  const themeDropdown = document.querySelector(`.theme-dropdown`) as HTMLUListElement
  if (themeDropdown) {
    themeDropdown.style.display = 'none'
  }
}

const setHiddenComparisonObjectsMenu = () => {
  comparisonObjectsMenuShow.value = false
}

const userLabel = () => {
  if ($auth.user) {
    if ($auth.user.username == 'prod_admin') {
      return 'Администратор'
    } else {
      return (
        $auth.user.first_name +
        ' ' +
        $auth.user.last_name +
        ($auth.user.org_shot_name ? ' ' + $auth.user.org_shot_name : '')
      )
    }
  } else {
    return null
  }
}

const getObjectDataAddressString = (objectData: { id: number; address: string | [number, number] }) => {
  if (Array.isArray(objectData.address)) return `[${objectData.address[0]}, ${objectData.address[1]}]`

  if (!Array.isArray(objectData.address) && objectData.address.length > 21)
    return `${objectData.address.slice(0, 21)}...`

  return objectData.address
}

const setVisibleIcon = (index: number) => {
  for (let i = 0; i < comparisonObjectsForTopMenu.value.length; i++) {
    isShowDeletedIconArr.value.push(false)
  }
  isShowDeletedIconArr.value[index] = true
}

const setHiddenIcon = () => {
  isShowDeletedIconArr.value = []
}

const deleteComparisonObject = (index: number) => {
  $comparison.deleteComparisonObject(index)
}

const isClearComparisonObjects = () => {
  $comparison.isClearComparisonObjects()
}

const emit = defineEmits(['setIsComparisonModal'])

const isNavigateToCompare = () => {
  $comparison.initPricingFactors().then(() => {
    navigateTo('/compare')
    $comparison.changeIsComparisonModal(true)
    $comparison.getDistancesArr().then(() => {
      $comparison.isOpenCurrentCompare()
    })
  })
}
</script>
