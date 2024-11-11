<template>
  <div class="user-page-wrapper">
    <div class="user-profile-header d-flex">
      <div class="user-profile-header-text">
        {{
          $auth.user?.first_name +
          ' ' +
          $auth.user?.last_name +
          ($auth.user?.org_shot_name ? ' (' + $auth.user?.org_shot_name + ')' : '')
        }}
      </div>
    </div>
    <div class="user-profile-body d-flex">
      <UserProfileMenuSideBar
        :current-section-name="currentSectionName"
        :current-tab-name="currentTabName"
        :structure="tabsStructure"
        @set-tab-name="setTabName"
        @set-section-name="setSectionName"
      />
      <div class="user-profile-body-content">
        <BTabs
          ref="btabsRef"
          v-model="currentTab"
          :nav-wrapper-class="['tabs-list-wrapper']"
          active-tab-class="active-tab"
          class="user-profile-body-tab"
          content-class="tab-content-style"
          nav-class="tabs-list"
          pills
          vertical
        >
          <BTab v-for="tab in tabsStructure" :key="tab.tab" :title="tab.tab">
            <UserProfileTab
              :current-section="currentSection"
              :only-head="tab.onlyHead"
              :sections="tab.sections"
              :tab="tab.tab"
            />
          </BTab>
        </BTabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type tabType } from '~/types/userProfileTypes'
const { $auth } = useNuxtApp()
const tabsStructure: Ref<tabType[]> = ref([
  {
    tab: 'Сведения',
    sections: ['Сведения'],

    onlyHead: true,
  },
  {
    tab: 'Активность',
    sections: ['Активность'],

    onlyHead: true,
  },
  {
    tab: 'Организация',
    sections: ['Организация'],

    onlyHead: true,
  },
])
const initialTab = 'Сведения'
const initialSection = 'Сведения'
function updateSection(i: number) {
  currentSectionName.value = tabsStructure.value.filter(
    (item: { [key: string]: any }) => item.tab === currentTabName.value,
  )[0].sections[i]
}

const currentTabName = ref(initialTab)

const currentTab = computed({
  get(): number {
    let index = 0
    for (let i = 0; i < tabsStructure.value.length; i++) {
      if (tabsStructure.value[i].tab === currentTabName.value) {
        index = i
        break
      }
    }

    return index
  },
  set(i: number) {
    currentTabName.value = tabsStructure.value[i].tab
  },
})

const currentSectionName = ref(initialSection)

const currentSection = computed({
  get(): number {
    let index = 0

    for (let i = 0; i < tabsStructure.value.length; i++) {
      if (tabsStructure.value[i].tab === currentTabName.value) {
        for (let j = 0; j < tabsStructure.value[i].sections.length; j++) {
          if (tabsStructure.value[i].sections[j] === currentSectionName.value) {
            index = j
            break
          }
        }
      }
    }
    return index
  },
  set(i: number) {
    updateSection(i)
  },
})

function setTabName(name: string) {
  currentTabName.value = name
  currentSectionName.value = tabsStructure.value.filter(
    (item: { [key: string]: any }) => item.tab === currentTabName.value,
  )[0].sections[0]
}

function setSectionName(name: string, tab: string) {
  if (currentTabName.value !== tab) {
    currentTabName.value = tab
  }
  currentSectionName.value = name
}
</script>

<style scoped></style>
