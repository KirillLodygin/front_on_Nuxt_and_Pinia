<template>
  <div class="d-flex h-100 w-100 overflow-y-scroll">
    <BTableSimple
      :table-class="'geo-layer-table-content'"
      class="w-100"
      style="max-height: 100%"
      responsive
      sticky-header
    >
      <BThead head-variant="dark">
        <BTr>
          <BTh class="col-auto citooltip"> Ключ </BTh>
          <BTh class="col-auto citooltip"> Значение </BTh>
        </BTr>
      </BThead>
      <BTbody>
        <BTr v-for="(value, key) in obj" :key="key">
          <BTd>{{ key }} </BTd>
          <BTd>{{ value }} </BTd>
        </BTr>
      </BTbody>
    </BTableSimple>
  </div>
</template>

<script setup lang="ts">
interface Props {
  obj: Record<string, any>
}

const props = defineProps<Props>()
</script>

<style lang="scss" scoped></style>
