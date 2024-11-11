<template>
  <div class="row">
    <div v-for="setting in settings" :class="[setting.take === 'full' ? 'col-12' : 'col-6']">
      <div class="fw-light mt-2">{{ setting.name }} <i v-if="setting.required" class="icon form_required-star" /></div>
      <div v-if="setting.type === 'input'">
        <Input v-model="data[setting.field]" />
      </div>
      <div v-if="setting.type === 'hButtons'" class="d-flex">
        <ButtonGroup :buttons-data="setting.options || []" v-model="data[setting.field]" only-labels />
      </div>
      <div v-if="setting.type === 'select'">
        <CustomSelect :options="setting.options || []" v-model="data[setting.field]" @scrollToSelect="scrollToSelect" />
      </div>
      <div v-if="setting.type === 'colorSelect'">
        <ColorSelect v-model="data[setting.field]" />
      </div>
      <div v-if="setting.type === 'text'">
        <textarea class="form-control form-control-lg" v-model="data[setting.field]" />
      </div>
      <div v-if="setting.type === 'quarterly'">
        <CustomSelect :options="quarterlyOptionsData" v-model="data[setting.field]" />
      </div>
      <div v-if="setting.type === 'gradation'">
        <GradationSelect :options="gradationOptions" v-model="data[setting.field]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { settingsType } from '~/app_constants/mapInstrumentsData'
import Input from '~/components/UI-KIT/Inputs/Input.vue'
import ButtonGroup from '~/components/UI-KIT/Buttons/ButtonsGroup/ButtonGroup.vue'
import ColorSelect from '~/components/UI-KIT/Selects/ColorSelect.vue'
import CustomSelect from '~/components/UI-KIT/Selects/CustomSelect.vue'
import GradationSelect from '~/components/UI-KIT/Selects/GradationSelect.vue'

const props = defineProps({
  type: { type: String, required: true },
  settings: { type: Array as PropType<settingsType[]>, required: true },
})

const { $mapStore } = useNuxtApp()
const emit = defineEmits(['scrollToSelect'])

const data = computed<Record<string, any>>(() => {
  if (props.type === 'main') {
    return $mapStore.geoLayerNode || {}
  }
  if (props.type === 'style' && $mapStore.geoLayerNode?.style) {
    return $mapStore.geoLayerNode.style || {}
  }
  if (props.type === 'visualization') {
    return $mapStore.visualizationData || {}
  }
  return {}
})

const quarterlyOptionsData = computed(() => {
  const startYear = 2024
  const currentDate = new Date()
  const quarters = ['1 квартал', '2 квартал', '3 квартал', '4 квартал']

  const result = []
  let year = startYear

  while (true) {
    for (let i = 0; i < 4; i++) {
      const quarterEnd = new Date(year, (i + 1) * 3, 0)

      if (quarterEnd > currentDate) {
        result.push({
          displayName: `${quarters[i]} ${year} года`,
          value: `${year}-Q${i + 1}`,
        })
        return result
      } else {
        result.push({
          displayName: `${quarters[i]} ${year} года`,
          value: `${year}-Q${i + 1}`,
        })
      }
    }
    year++
  }
})

const gradationOptions = [
  {
    iconClass: 'first',
    value: 'first',
  },
  {
    iconClass: 'second',
    value: 'second',
  },
  {
    iconClass: 'third',
    value: 'third',
  },
]

const scrollToSelect = (customSelectContainer: HTMLElement) => {
  emit('scrollToSelect', customSelectContainer)
}
</script>
