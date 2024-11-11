<template>
  <div
    id="funcButtons"
    aria-label="Панель инструментов"
    class="card-toolbar hidden-scrollbar"
    role="toolbar"
    @wheel="hScroll"
  >
    <div class="text-nowrap w-100 d-flex" :class="props.data.length === 1 ? 'justify-content-end' : ''">
      <div
        v-if="['middle', 'end'].includes(srollStatus) && isNarrowScreen"
        class="btn btn-outline-secondary btn-sm-rounded func-buttons-scroll left"
      >
        <i class="icon icon-lg fi_chevron-left" @mousedown="buttonScrollStart(-10)" @mouseup="buttonScrollStop" />
      </div>
      <template v-for="buttonData in props.data">
        <button
          v-if="buttonData.type === 'button' && buttonData.for.includes('panel')"
          :class="['btn bth-tool me-1', { active: buttonData.active }]"
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
          class="nav-item-dropdown-files me-1"
          no-caret
          right
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
      <div class="btn ps-2"></div>
      <div
        v-if="['middle', 'start'].includes(srollStatus) && isNarrowScreen"
        class="btn btn-outline-secondary btn-sm-rounded func-buttons-scroll right"
      >
        <i class="icon icon-lg fi_chevron-right" @mousedown="buttonScrollStart(10)" @mouseup="buttonScrollStop" />
      </div>
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
  function?: (analog: Record<string, any>) => void
}

interface Props {
  data: objectProps[]
}

const props = defineProps<Props>()
const isNarrowScreen = computed(() => window.innerWidth < 1360)
const dropdownShow = ref<Record<string, boolean>>({})
const srollStatus = ref<string>('start')
const isButtonPressed = ref(false)

onMounted(() => {
  dropdownShow.value = props.data.reduce((acc: Record<string, boolean>, btn: objectProps) => {
    if (btn.type === 'select') {
      acc[btn.title] = false
    }
    return acc
  }, {})
})
const buttonScrollStart = (num: number) => {
  const elem = document.getElementById('funcButtons') as HTMLElement
  isButtonPressed.value = true
  const scrollInterval = setInterval(() => {
    console.log(num)
    if (isButtonPressed.value) {
      elem.scrollLeft += num
    } else {
      clearInterval(scrollInterval)
    }
    console.log(elem.scrollWidth, elem.clientWidth, elem.scrollLeft)
    if (elem.scrollWidth - elem.clientWidth - 10 <= elem.scrollLeft) {
      srollStatus.value = 'end'
      clearInterval(scrollInterval)
    } else if (elem.scrollLeft === 0) {
      srollStatus.value = 'start'
      clearInterval(scrollInterval)
    } else {
      srollStatus.value = 'middle'
    }
  }, 100)
}

const buttonScrollStop = () => {
  isButtonPressed.value = false
}

const hScroll = (event: WheelEvent) => {
  event.preventDefault()
  const elem = document.getElementById('funcButtons') as HTMLElement
  let modifier = 1
  if (event.deltaMode == event.DOM_DELTA_PIXEL) {
    modifier = 1
  } else if (event.deltaMode == event.DOM_DELTA_LINE) {
    modifier = parseInt(getComputedStyle(event.target as HTMLElement).lineHeight)
  } else if (event.deltaMode == event.DOM_DELTA_PAGE) {
    modifier = (event.target as HTMLElement).clientHeight
  }
  if (event.deltaY != 0) {
    elem.scrollLeft += modifier * event.deltaY
  }
  if ((event.target as HTMLElement).scrollWidth - elem.clientWidth < elem.scrollLeft) {
    srollStatus.value = 'end'
  } else if (elem.scrollLeft === 0) {
    srollStatus.value = 'start'
  } else {
    srollStatus.value = 'middle'
  }
}
watch(
  () => dropdownShow.value,
  () => {
    const elem = document.getElementById('funcButtons') as HTMLElement
    if (dropdownShow.value) {
      elem.style.overflow = 'visible'
    } else {
      elem.style.overflow = 'auto'
    }
  },
)
</script>
