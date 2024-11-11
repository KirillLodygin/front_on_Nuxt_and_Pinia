<template>
  <GeoObject :id="object_id" />
</template>

<script setup lang="ts">
import routes from '~/app_constants/routes'
const route = useRoute()
const object_id: number = +route.params.real_estate_id
</script>
