<template>
  <BTabs
    :model-value="currentSection"
    :nav-wrapper-class="['tabs-list-wrapper']"
    content-class="tab-content-style"
    vertical
    @update:model-value="(value: number) => emit('updateSection', value)"
  >
    <BTab v-for="section in sections" :key="section.title" :title="section">
      <div class="h-100">
        <UserInfo v-if="section === 'Сведения'" />
        <UserActivity v-else-if="section === 'Активность'" />
        <UserOrganizationInfo v-else-if="section === 'Организация'" />
      </div>
    </BTab>
  </BTabs>
</template>

<script setup lang="ts">
import UserInfo from './UserInfo.vue'
import UserActivity from './UserActivity.vue'
import UserOrganizationInfo from './UserOrganizationInfo.vue'
interface Props {
  sections: Array<any>
  currentSection: number
  onlyHead: boolean

  tab: string
}
const {
  sections,
  currentSection,

  tab,
} = defineProps<Props>()
const emit = defineEmits(['updateSection'])
</script>

<style scoped></style>
