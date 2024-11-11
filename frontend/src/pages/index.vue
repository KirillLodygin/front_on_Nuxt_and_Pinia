<template>
  <div class="main-cards-container mx-auto">
    <div class="row row-cols-1 row-cols-lg-2 justify-content-center">
      <IndexCard
        v-for="item of systemPaths"
        :additional-items="item.additionalItems"
        :class="{ 'd-none': accessDenial(item) }"
        :description="item.description"
        :title="item.title"
        :path="item.path"
        :searchParams="item.searchParams ? item.searchParams : ''"
      />

      <div class="col"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { systemPaths } from '~/app_constants/routes'
import IndexCard from '~/components/UI-KIT/Cards/IndexCard.vue'
import { useNuxtApp } from 'nuxt/app'
import useUserPermissions from '~/composables/useUserPermissions'

const { $auth } = useNuxtApp()

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
    ) ||
    !('openOnlyFor' in cardItem.flags) ||
    !userPermissions.length
  )
}

definePageMeta({
  layout: 'home',
})
</script>
