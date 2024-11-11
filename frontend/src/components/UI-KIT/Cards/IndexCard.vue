<template>
  <div class="col">
    <div class="main-card">
      <div class="row main-card-row">
        <div class="col main-card-icon-col">
          <img :src="iconSrc()" style="width: 200px; height: 200px" />
        </div>

        <div class="col main-card-title-col">
          <div class="main-card-text-large-2 lh-1 mb-3">
            <NuxtLink :href="`${props.path}${props.searchParams}`" class="link-dark link-underline-opacity-0">{{
              props.title
            }}</NuxtLink>
          </div>
          <div class="main-card-text-big lh-sm text-secondary">{{ props.description }}</div>
          <div class="main-card-links-block mt-3">
            <div v-for="item in props.additionalItems" class="mb-1">
              <NuxtLink
                :class="{ 'text-black-50': !getAccessStatus(item) }"
                :href="getAccessStatus(item) ? item.path : '/'"
                class="main-card-text-normal icon-link"
              >
                <i :class="[item.iconClass]"></i>
                {{ item.title }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <div class="col main-card-links-col align-self-end">
          <div v-for="item in props.additionalItems" class="mb-1">
            <NuxtLink
              :class="{ 'text-black-50': !getAccessStatus(item) }"
              :href="getAccessStatus(item) ? item.path : '/'"
              class="main-card-text-normal icon-link"
            >
              <i :class="[item.iconClass]"></i>
              {{ item.title }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useNuxtApp } from 'nuxt/app'
import type { PropType } from 'vue'
import useUserPermissions from '~/composables/useUserPermissions'

type ObjectType = {
  iconClass: string
  title: string
  path: string
  flags: Record<string, string>
}

const props = defineProps({
  title: { type: String, required: true },
  path: { type: String, required: false },
  description: { type: String, required: true },
  additionalItems: { type: Array as PropType<ObjectType[]>, required: true },
  searchParams: { type: String },
})

const { $auth, $constData } = useNuxtApp()
const userPermissions: string[] = useUserPermissions($auth.user?.permissions)
const getAccessStatus = (item: ObjectType) => {
  const accessPerms = ['IS', 'OOAO', 'ROAO', 'ADMIN']
  if (accessPerms.some((perm) => userPermissions.includes(perm))) return true
  return !('openOnlyFor' in item.flags) || userPermissions.includes(item.flags.openOnlyFor)
}

const iconSrc = (): string => {
  let src: string = ''
  if (props.path) {
    src = '/img/3d_' + props.path.replace('/', '') + '.webp'
  }
  return src
}
</script>
