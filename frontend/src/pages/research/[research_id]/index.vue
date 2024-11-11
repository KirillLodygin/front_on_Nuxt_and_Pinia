<template>
  <MapObjectProperties :id="object_id" :object-type-calc-prop="'NE'" />
</template>

<script lang="ts" setup>
import routes from '~/app_constants/routes'
import MapObjectProperties from '~/components/MapObjectProperties/MapObjectProperties.vue'

const route = useRoute()
const { $userStore } = useNuxtApp()
let routeElem = reactive({
  path: '',
  name: '',
}) as { path: string; name: string } | null

if (route) {
  routeElem = routes.find((el) => el.path === route.matched[0].path) || null
}
const object_id: number = +route.params.research_id
</script>
