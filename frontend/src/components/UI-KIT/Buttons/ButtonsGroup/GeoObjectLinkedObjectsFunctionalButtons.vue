<template>
  <div
    id="funcButtons"
    class="card-toolbar overflow-x-scroll overflow-y-hidden functional-buttons-scroll d-flex"
    aria-label="Панель инструментов"
    role="toolbar"
  >
    <div class="card-toolbar-wrapper w-100 d-flex text-nowrap">
      <template v-for="buttonData in props.data">
        <button
          v-if="buttonData.type === 'button' && buttonData.for.includes('panel')"
          :class="[
            'btn bth-tool me-1',
            { active: buttonData.active },
            buttonData.customClass ? buttonData.customClass : '',
          ]"
          :disabled="buttonData.disabled"
          name="addObjectBtn"
          type="button"
          @click="buttonData.function"
        >
          <i :class="buttonData.iconClass"></i>&nbsp;{{ buttonData.title }}
        </button>
        <div v-if="buttonData.type === 'space' && buttonData.for.includes('panel')" class="flex-grow-1"></div>
        <BNavItemDropdown
          v-if="buttonData.type === 'select' && buttonData.for.includes('panel')"
          v-model="dropdownShow[buttonData.title]"
          :disabled="buttonData.disabled"
          :menu-class="['nav-item-dropdown-files_menu shadow', { 'd-block': dropdownShow[buttonData.title] }]"
          class="nav-item-dropdown-files functional-buttons-dropdown position-static me-1"
          no-caret
          right
          :skip-wrapper="true"
          style="width: fit-content; float: left"
        >
          <template #button-content>
            <button :class="['btn bth-tool', { disabled: buttonData.disabled }]">
              <i :class="buttonData.iconClass" />&nbsp;{{ buttonData.title }}&nbsp;<i
                class="icon fi_chevron-down-small"
              />
            </button>
          </template>
          <BDropdownItem v-for="option in buttonData.options" :disabled="option.disabled" @click="option.function">
            <div><i :class="option.iconClass" />&nbsp;{{ option.title }}</div>
          </BDropdownItem>
        </BNavItemDropdown>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface optionsProps {
  title: string
  disabled: boolean
  iconClass: string
  function: () => void
}

interface objectProps {
  type: string
  for: string[]
  title: string
  disabled: boolean
  active?: boolean
  iconClass: string
  options?: optionsProps[]
  customClass?: string
  function?: (analog: Record<string, any>) => void
}

interface Props {
  data: objectProps[]
}

const props = defineProps<Props>()

const dropdownShow = ref<Record<string, boolean>>({})

onMounted(() => {
  dropdownShow.value = props.data.reduce((acc: Record<string, boolean>, btn: objectProps) => {
    if (btn.type === 'select') {
      acc[btn.title] = false
    }
    return acc
  }, {})
  const scrollContainer = document.getElementById('funcButtons') as HTMLElement

  scrollContainer.addEventListener('wheel', (e) => {
    e.preventDefault()
    scrollContainer.scrollLeft += e.deltaY
  })
})
</script>
