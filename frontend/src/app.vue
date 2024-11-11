<template>
  <div v-if="checkScreenWidth" class="main">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
  <div v-else class="main">
    <div class="row h-100">
      <div class="col d-flex justify-content-center align-items-center">
        <div class="login-card">
          <div class="row m-3">
            <div class="col-2 text-end">
              <i class="icon icon-3x fi_alert-triangle modal-icon"></i>
            </div>
            <div class="col-10">
              <div class="">
                Приложение работает только на ПК. Пожалуйста, используйте устройство с шириной экрана более 1024px.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Toast />
  <ModalMessage v-model="errorModal" okOnly title="ОШИБКА ПОДКЛЮЧЕНИЯ" variant="danger">
    {{ errorModalText }}
  </ModalMessage>
</template>

<script lang="ts" setup>
import Toast from '~/components/UI-KIT/Toast/Toast.vue'
import ModalMessage from '~/components/UI-KIT/Alerts/ModalMessage.vue'
import { permsMatchedSources } from '~/app_constants/routes'

const checkScreenWidth = computed(() => window.innerWidth > 1024)

const errorModal = computed({
  get: () => $userStore.errorModal,
  set: (newVal: boolean) => {
    $userStore.setErrorModal(newVal)
    if (!newVal) {
      $userStore.setErrorModalText(null)
    }
  },
})

const errorModalText = computed(() => {
  if ($userStore.errorModalText) return $userStore.errorModalText
  return 'При обращении к серверу возникла ошибка. Попробуйте обновить страницу или обратитесь к администратору.'
})

const { $userStore, $auth, $calculations } = useNuxtApp()
const route = useRoute()

onMounted(() => {
  cleanStorage()
  getTheme()
  if ($auth.user) {
    pathMatch()
  }
})

watch(
  () => route.path,
  () => {
    $userStore.setOldPath($userStore.newPath)
    $userStore.setNewPath({ path: route.path, hash: route.hash })
    if ($auth.user) {
      pathMatch()
    }

    cleanCalcStore()
    cleanAllStores()
  },
)

const cleanStorage = () => {
  const today = new Date().toISOString().split('T')[0]
  const lastCleaned = localStorage.getItem('lastStorageCleaned')

  if (!lastCleaned || lastCleaned !== today) {
    localStorage.clear()
    localStorage.setItem('lastStorageCleaned', today)
  }
}

const cleanCalcStore = () => {
  if (!Object.keys(route.params).includes('evaluation_id') && !$calculations.aimPath.path.length) {
    $calculations.resetState()
  }
}

const cleanAllStores = () => {
  if (route.path === '/login' && !$auth.user) {
    $userStore.clearAllStores()
  }
  if (route.path === '/') {
    $userStore.clearAllStores('notAll')
  }
}

const getTheme = () => {
  const html = document.querySelector('html')
  if (html) {
    if ('appTheme' in localStorage) {
      const theme = localStorage.getItem('appTheme')
      if (theme !== null) {
        html.className = theme
      }
    } else {
      localStorage.setItem('appTheme', 'light-theme')
      html.className = 'light-theme'
    }
  }
}

const pathMatch = () => {
  const userPermissions: string[] = useUserPermissions($auth.user?.permissions)
  const matchedSourceObj = permsMatchedSources.find((obj) => obj.matchedSource === route.path.split('/')[1])
  if (matchedSourceObj) {
    if (!matchedSourceObj.perms.some((permission) => userPermissions.includes(permission))) {
      window.location.href = '/'
    }
  }
}

// onErrorCaptured((err, instance, info) => {
//   // Логируем ошибку
//   console.error('Ошибка:', err)
//   console.log('Компонент:', instance)
//   console.log('Доп. информация:', info)
//
//   // Дополнительно: можно отправить ошибку на сервер или выполнить другую логику
//   // fetch("/log-error", { method: "POST", body: JSON.stringify({ err, info }) });
//
//   // Верните `false`, чтобы предотвратить всплытие ошибки
//   return false
// })
</script>
