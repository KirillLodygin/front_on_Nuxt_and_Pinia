<template>
  <div class="row justify-content-center align-items-center h-100">
    <div class="col-4">
      <div class="login-card">
        <div class="text-center fs-2 m-3">ВХОД В СИСТЕМУ</div>
        <form @submit.prevent="userLogin">
          <div class="m-3">
            <label class="form-label" for="loginInput">Имя пользователя</label>
            <Input id="loginInput" v-model="state.login.username" iconClass="fi_user icon-lg" />
          </div>
          <div class="m-3">
            <label class="form-label" for="passwordInput">Пароль</label>
            <Input id="passwordInput" v-model="state.login.password" iconClass="fi_lock icon-lg" type="password" />
          </div>
          <div v-if="state.error" class="alert alert-danger d-flex mx-3">
            <i class="icon icon-xl fi_alert-octagon flex-shrink-0 me-3"></i>
            <div v-if="state.loginTryingCount > 4">
              {{
                `Имя пользователя и пароль введены неверно 5 раз.
              Следующая попытка будет доступна через ${minutes}:${seconds}`
              }}
            </div>
            <div v-else>В системе не найдена комбинация введённых имени пользователя и пароля</div>
          </div>
          <div class="row justify-content-center m-3 p-3">
            <div class="col-6">
              <ButtonWithLoader
                :disabled="state.loginTryingCount > 4"
                :loading="state.loading"
                :outlineVariant="''"
                button-class="p-3"
                size="lg"
                type="submit"
                value="Войти"
                width="100%"
              />
            </div>
          </div>
        </form>
        <div class="row m-3 text-end">
          <div>
            <a href="#" @click.prevent="setRecoveryModal(true)"> Восстановить пароль </a>
          </div>
          <div>
            <a href="#" @click.prevent="setRegistrationModal(true)"> Запросить регистрацию </a>
          </div>
        </div>
      </div>
    </div>

    <ModalMessage v-model="recoveryModal" icon="fi_info" okOnly title="ВОССТАНОВИТЬ ПАРОЛЬ" variant="primary">
      Для восстановления пароля обратитесь к администратору системы help@gisanda.ru
    </ModalMessage>

    <ModalMessage v-model="registrationModal" icon="fi_info" okOnly title="РЕГИСТРАЦИЯ" variant="primary">
      Для регистрации обратитесь к администратору системы help@gisanda.ru
    </ModalMessage>
  </div>
</template>

<script lang="ts" setup>
import Input from '~/components/UI-KIT/Inputs/Input.vue'
import ButtonWithLoader from '~/components/UI-KIT/Buttons/BaseFormButton.vue'
import ModalMessage from '~/components/UI-KIT/Alerts//ModalMessage.vue'

definePageMeta({
  layout: 'blank',
})
const { $auth, $userStore } = useNuxtApp()

onMounted(() => {
  if ($auth.user) {
    navigateTo($userStore.oldPath)
  }
})

// Запуск модалки восстановления
const recoveryModal = ref(false)
const setRecoveryModal = (bool: boolean) => {
  recoveryModal.value = bool
}

const registrationModal = ref(false)
const setRegistrationModal = (bool: boolean) => {
  registrationModal.value = bool
}

const state = reactive({
  login: {
    username: '',
    password: '',
  },
  error: false,
  loading: false,
  loginTryingCount: 0,
  loginTryingTime: 0,
  currentTime: 1,
  timer: -1,
})

const minutes = computed(() => {
  return Math.floor(state.currentTime / 60)
})

const seconds = computed(() => {
  return `${state.currentTime % 60}`.length > 1 ? `${state.currentTime % 60}` : `0${state.currentTime % 60}`
})
const startTimer = () => {
  localStorage.setItem('islgntrng', '1')
  state.timer = window.setInterval(() => {
    state.currentTime--
  }, 1000)
}
const stopTimer = () => {
  localStorage.setItem('islgntrng', '0')
  window.clearTimeout(state.timer)
  state.loginTryingCount = 0
  state.loginTryingTime = 0
  localStorage.setItem('lgntrngcnt', '0')
  localStorage.setItem('lgntrngtm', '0')
  state.error = false
}

if (localStorage.getItem('lgntrngcnt') && localStorage.getItem('lgntrngtm')) {
  state.loginTryingCount = Number(localStorage.getItem('lgntrngcnt'))
  state.loginTryingTime = Number(localStorage.getItem('lgntrngtm'))
  if (+new Date() - state.loginTryingTime > 300000) {
    state.loginTryingCount = 0
    state.loginTryingTime = 0
    localStorage.setItem('lgntrngcnt', '0')
    localStorage.setItem('lgntrngtm', '0')
    state.error = false
  } else {
    state.currentTime = Math.floor((state.loginTryingTime + 300000 - +new Date()) / 1000)
    state.error = true
    startTimer()
  }
}

watch(
  () => state.currentTime,
  (newVal) => {
    if (newVal === 0) {
      stopTimer()
    }
  },
)

if (localStorage.getItem('islgntrng')) {
  if (localStorage.getItem('islgntrng') === '0') {
    startTimer()
  }
}

const userLogin = async () => {
  try {
    state.loading = true
    console.log('Пытаемся авторизовать пользователя:', state.login.username)
    await $auth.loginWith('local', { body: state.login }).then(() => {
      console.log('Авторизация успешна. Проверка сохраненного пути в localStorage и store...')

      // Проверяем сохраненный путь в localStorage
      const savedPath = localStorage.getItem('savedPath')
      const parsedPath = savedPath ? JSON.parse(savedPath) : null

      if (parsedPath && parsedPath.path !== '/login') {
        console.log('Перенаправление на сохраненный путь из localStorage:', parsedPath.path)
        navigateTo(parsedPath) // Переход на сохраненный путь из localStorage

        // Очистка сохраненного пути в localStorage после редиректа
        localStorage.removeItem('savedPath')
      } else if ($userStore.oldPath && $userStore.oldPath.path !== '/login') {
        console.log('Перенаправление на сохраненный путь из store:', $userStore.oldPath.path)
        navigateTo($userStore.oldPath) // Переход на сохраненный путь из store
      } else {
        console.log('Сохраненный путь не найден, переход на главную страницу')
        navigateTo('/') // Переход на главную страницу или другую дефолтную
      }
    })
  } catch (err) {
    console.log('Ошибка авторизации:', err)
    if (err instanceof Error) {
      const responseError = err as { response?: { status: unknown } }
      if (responseError.response) {
        if (responseError.response?.status === 401) {
          state.error = true
          console.log('Неверные учетные данные. Количество попыток:', state.loginTryingCount)
          localStorage.setItem('lgntrngcnt', `${++state.loginTryingCount}`)
          if (state.loginTryingCount > 4) {
            console.log('Превышено количество попыток. Блокировка на 5 минут.')
            localStorage.setItem('lgntrngtm', `${+new Date()}`)
            state.loginTryingTime = +new Date()
            state.currentTime = 300
            startTimer()
          }
        } else {
          console.log('Неизвестная ошибка авторизации. Открытие модального окна ошибки.')
          $userStore.setErrorModal(true)
        }
      } else {
        console.log('Неизвестная ошибка без ответа сервера. Открытие модального окна ошибки.')
        $userStore.setErrorModal(true)
      }
    } else {
      console.log('Ошибка не является объектом Error.')
      $userStore.setErrorModal(true)
    }
    state.loading = false
  }
}
</script>
