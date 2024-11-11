import { ref } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import type { tabsStructureType } from '~/types/cardTypes'

export function useTabs(tabsStructure: Ref<tabsStructureType>, navigatebleTabsArr: string[]) {
  console.log(tabsStructure)
  const navigatebleTabs = computed(() => {
    return tabsStructure.value.filter((item: any) => navigatebleTabsArr.includes(item.tab)).map((item: any) => item.tab)
  })
  const sectionsLength = computed(() => {
    return tabsStructure.value.filter((item: any) => item.tab === currentTabName.value)[0].sections.length
  })
  const nextAvailable = computed(() => {
    if (currentTabName.value !== navigatebleTabs.value.slice(-1)[0]) {
      return true
    } else {
      return currentSection.value !== sectionsLength.value - 1
    }
  })
  const previousAvailable = computed(() => {
    if (currentTabName.value !== navigatebleTabs.value[0]) {
      return true
    } else {
      return currentSection.value !== 0
    }
  })
  const currentTabName = ref(tabsStructure.value[0].tab)

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
      if (tabsStructure.value.length > i) {
        currentTabName.value = tabsStructure.value[i] ? tabsStructure.value[i].tab : 'Базовые поля'
      }
    },
  })

  const currentSectionName = ref(tabsStructure.value[0].sections[0].name)

  const currentSection = computed({
    get(): number {
      let index = 0

      for (let i = 0; i < tabsStructure.value.length; i++) {
        if (tabsStructure.value[i].tab === currentTabName.value) {
          for (let j = 0; j < tabsStructure.value[i].sections.length; j++) {
            if (tabsStructure.value[i].sections[j].name === currentSectionName.value) {
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

  function moveToNext() {
    console.log('moveToNext')
    if (sectionsLength.value === 1) {
      currentTab.value++
      if (sectionsLength.value === 1) {
        currentSection.value = 0
      }
      updateSection(currentSection.value)
      return
    }
    if (sectionsLength.value !== 1) {
      if (currentSection.value !== sectionsLength.value - 1) {
        currentSection.value++

        return
      }
      if (currentSection.value === sectionsLength.value - 1) {
        currentTab.value++
        updateSection(currentSection.value)
        return
      }
    }
  }

  function moveToPrevious() {
    if (sectionsLength.value === 1) {
      currentTab.value--
      if (sectionsLength.value === 1) {
        currentSection.value = 0
      }
      updateSection(currentSection.value)
      return
    }
    if (sectionsLength.value !== 1) {
      if (currentSection.value !== 0) {
        currentSection.value--

        return
      }
      if (currentSection.value === 0) {
        currentTab.value--
        updateSection(currentSection.value)
        return
      }
    }
  }
  function updateSection(i: number) {
    currentSectionName.value = tabsStructure.value.filter(
      (item: { [key: string]: any }) => item.tab === currentTabName.value,
    )[0].sections[i].name
  }
  function setTabName(value: string) {
    currentTabName.value = value
  }
  function setSectionName(value: string) {
    currentSectionName.value = value
  }
  const tabsList = computed(() => {
    return tabsStructure.value.map((item) => item.tab)
  })
  return {
    currentSection,
    currentSectionName,
    currentTab,
    currentTabName,
    tabsList,
    nextAvailable,
    previousAvailable,
    moveToNext,
    moveToPrevious,
    setTabName,
    setSectionName,
  }
}
