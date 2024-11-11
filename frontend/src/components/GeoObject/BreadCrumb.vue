<template>
  <div class="d-inline-block">
    <div class="geo-object-breadcrumb">
      <i class="icon fi_folder mx-2"></i>
      <div v-for="(elem, index) in breadcrumbData" class="align-middle">
        {{ elem }}
        <i v-if="index !== breadcrumbData.length - 1" class="icon fi_chevron-right mx-2"></i>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const breadcrumbData = ['123', '456', '789', '000']
</script>
