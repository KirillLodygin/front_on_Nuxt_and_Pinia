<template>
  <div class="row evaluation-stages">
    <div
      v-for="(tab, index) of props.tabs"
      :class="[
        'col evaluation-stages-tabs',
        { start: index === 0 },
        { end: index === props.tabs.length - 1 },
        { visited: activedIndexList.includes(index) },
        { active: index === activeTabIndex },
        { 'is-invalid': tabNameAttentionObject[props.tabs[props.activeTabIndex]] },
      ]"
    >
      <div class="line left"></div>
      <div class="line right"></div>
      <div class="point cursor-pointer" @click="() => getNewCalculationsStep(index)"></div>
      <div class="label cursor-pointer" @click="() => getNewCalculationsStep(index)">
        {{ tab }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { isEmpty } from 'lodash'
import { computed, onMounted } from 'vue'

const props = defineProps({
  tabs: { type: Array<string>, required: true },
  activeTabIndex: { type: Number, required: true },
})
const { $calculations } = useNuxtApp()
const order = computed(() => $calculations.order)
const tabNameAttentionObject = computed(() => $calculations.tabNameAttentionObject)
const isBlockRunCalculations = computed(() => $calculations.getIsBlockRunCalculations())
const selectedAnalogs = computed(() => $calculations.selectedAnalogs)
const adjustableFields = computed(() => $calculations.adjustableFields)
const fieldsWithValuesAccordingGuideArray = computed(() => $calculations.fieldsWithValuesAccordingGuideArray)
const activedIndexList = computed(() => $calculations.activedIndexList)

watch(
  () => props.activeTabIndex,
  () => {
    $calculations.updateActivedIndexList(props.activeTabIndex)
  },
)


const getNewCalculationsStep = (index: number) => {
  if (isBlockRunCalculations.value) return
  props.activeTabIndex === 0 &&
  (isEmpty(order.value) ||
    order.value.source?.activeTabIndex === 0 ||
    order.value.source?.selectedAnalogs.length > selectedAnalogs.value.length)
    ? $calculations.onRunCalculations().then(() => {
        $calculations.setActiveTabIndex(index)
      })
    : $calculations.setActiveTabIndex(index)
}
</script>
