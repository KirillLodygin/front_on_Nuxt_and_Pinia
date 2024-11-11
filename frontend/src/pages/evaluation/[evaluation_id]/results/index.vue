<template>
  <div class="map-object-properties page-card">
    <ComponentHeader />
    <div class="map-object-properties_body" style="padding-top: 25px">
      <div class="map-object-properties_body_content max-width">
        <EvaluationsComponent v-if="$calculations.evaluationType === 'ST'" />
        <ExpressResultComponent v-if="$calculations.evaluationType === 'EX'" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import EvaluationsComponent from '~/components/ObjectEvaluation/Evaluations/EvaluationsComponent.vue'
import ComponentHeader from '~/components/ObjectEvaluation/Evaluations/ComponentHeader.vue'
import ExpressResultComponent from '~/components/ObjectEvaluation/Express/ExpressResultComponent.vue'

const { $calculations } = useNuxtApp()
</script>
