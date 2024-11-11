<template>
  <div class="h-100 overflow-hidden overflow-y-auto align-items-center">
    <div class="row p-3 border-bottom border-dark-subtle">
      <div class="d-inline-flex">
        <div class="d-flex gap-5 me-5">
          <div
            :class="['user-avatar', { 'text-center align-content-center': !userPhoto }, { 'text-end': userPhoto }]"
            :style="{
              'background-image': `url('${$baseURL}/media/${userPhoto}')`,
            }"
            @mouseenter="isPhotoFocusing = true"
            @mouseleave="isPhotoFocusing = false"
          >
            <button
              v-if="userPhoto && isPhotoFocusing"
              class="btn btn-light rounded-5 border-0"
              @click="() => deleteUserPhoto()"
            >
              <i class="icon fi_x"></i>
            </button>

            <i v-if="!userPhoto" class="icon icon-4x fi_user"></i>
          </div>

          <div class="d-flex flex-column align-self-start">
            <div class="h4 fw-semibold">
              {{ fullName }}
            </div>
            <div class="fs-6">
              {{ username }}
            </div>
          </div>
        </div>

        <div class="d-flex gap-5 mt-1">
          <div>
            <label class="text-body-secondary" for="email">Электронная почта:</label>
            <div id="email" class="fw-medium mb-2">{{ email }}</div>
            <label class="text-body-secondary" for="roles">Роли:</label>
            <div id="roles" class="fw-medium mb-2">{{ roles }}</div>
          </div>
          <div class="d-flex flex-column">
            <div class="text-body-secondary" for="authTime">Последний вход в систему:</div>
            <div id="authTime" class="fw-medium mb-2">{{ authTime }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="row mt-3">
      <div class="ms-3 h5">Настройки</div>
    </div>
    <div class="row mt-3">
      <div class="ms-3 col">
        <label class="text-body-secondary mb-2">Электронная почта</label>
        <Input v-model="newEmail" placeholder="Введите ваш email" @input="validateEmail" />
        <span v-if="emailError" class="text-danger">{{ emailError }}</span>
      </div>
      <div class="col">
        <label class="text-body-secondary mb-2">Фотография</label>
        <FileInput height="60%" @get-files="getFiles" border-radius="5px" />
      </div>
    </div>

    <div class="d-flex p-3 bottom-0 w-100 justify-content-end border-dark-subtle">
      <div class="m-3">
        <ButtonWithLoader
          style="min-width: 106px"
          height="60px"
          value="Отмена"
          variant="light"
          @click="() => cleanUserData()"
        />
      </div>
      <div class="m-3">
        <ButtonWithLoader
          style="min-width: 106px"
          :loading="isSaving"
          height="60px"
          value="Сохранить"
          variant="dark"
          @click="() => saveUserData()"
          :disabled="!isEmailValid"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import Input from '~/components/UI-KIT/Inputs/Input.vue'
import FileInput from '~/components/UI-KIT/Inputs/FileInput.vue'
import ButtonWithLoader from '~/components/UI-KIT/Buttons/BaseFormButton.vue'
import type { UserProfileType } from '~/types/userProfileTypes'
import useUserPermissions from '~/composables/useUserPermissions'

const { $auth, $userStore, $baseURL } = useNuxtApp()
const profile = computed(() => $auth.user?.profile as UserProfileType)
const fullName = computed(
  () =>
    `${$auth.user?.first_name} ${$auth.user?.last_name}${$auth.user?.org_shot_name ? ` (${$auth.user?.org_shot_name})` : ''}`,
)
const username = computed(() => $auth.user?.username)
const email = computed(() => $auth.user?.email)
const userPermissions: string[] = useUserPermissions($auth.user?.permissions)
const roles = computed(() => {
  const result = []
  if (userPermissions.includes('ADMIN')) {
    result.push('Администратор')
  } else {
    result.push('Пользователь')
  }
  return result.join(', ')
})
const userPhoto = computed(() => {
  return profile.value.photo?.length ? profile.value.photo[0].file : ''
})
const newEmail = ref('')
const filesSavedTrigger = ref(false)
let formData = new FormData()
const isSaving = ref(false)
const isPhotoFocusing = ref(false)

const emailError = ref('')
const isEmailValid = ref(true)

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (newEmail.value && !emailRegex.test(newEmail.value)) {
    emailError.value = 'Неверный формат email'
    isEmailValid.value = false
  } else {
    emailError.value = ''
    isEmailValid.value = true
  }
}

watch(
  () => newEmail.value,
  () => {
    if (!newEmail.value) emailError.value = ''
    if (formData.get('email')) {
      formData.set('email', newEmail.value)
    } else {
      formData.append('email', newEmail.value)
    }
  },
)

const getFiles = async (files: any) => {
  if (formData.get('files')) {
    formData.set('files', files[0])
  } else {
    formData.append('files', files[0])
  }
}

const authTime = computed(() => {
  let dateToShow
  if (profile.value.last_login_date) {
    dateToShow = new Date(profile.value.last_login_date)
  } else {
    dateToShow = new Date()
  }

  const options: Intl.DateTimeFormatOptions | undefined = { hour: '2-digit', minute: '2-digit' }
  const timeString = dateToShow.toLocaleTimeString('ru-RU', options)

  return `Сегодня в ${timeString}`
})

const saveUserData = () => {
  if ($auth.user && isEmailValid.value) {
    isSaving.value = true
    $userStore.patchUserData($auth.user?.id, formData).then((user) => {
      $auth.setUser(user)
      isSaving.value = false
    })
  }
  newEmail.value = ''
  filesSavedTrigger.value = !filesSavedTrigger.value
  formData = new FormData()
}

const deleteUserPhoto = () => {
  if (profile.value) {
    $userStore.deleteUserPhoto(profile.value.id).then((user) => $auth.setUser(user))
  }
}

const cleanUserData = () => {
  newEmail.value = ''
}
</script>
