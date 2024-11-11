<!-- Компонент выводит кнопку, по нажатию которой появляется выпадающее меню -->
<!-- Используется в компоненте KsTreeInput для контекстного меню элементов дерева -->
<!-- Используется в компоненте SearchAddressInput для контекстного меню с найденными адресами -->
<!-- Используется на панели аналагов AnalogsPanel.vue для контекстного меню выбора роли объекта - аналогом или целевым объектом -->
<template>
  <span ref="$holder" class="dropdown-holder">
    <div
      ref="$dropdown"
      class="dropdown"
      :class="(checkForValid ? (isValid ? 'is-valid' : 'is-invalid') : '') + (wrapperClass ? ' ' + wrapperClass : '')"
    >
      <!-- Слот кнопки выпадающего списка -->
      <slot v-if="!target" name="btn" :id="dropdownBtnId">
        <a href="#" :id="dropdownBtnId" :class="getBtnClass" data-bs-toggle="dropdown" @click.prevent="toggle($event)">
          <i v-if="icon" :class="[icon, 'fa-fw']"></i> {{ label }}
        </a>
      </slot>
      <div
        ref="$dropdownMenu"
        :class="[
          'dropdown-menu shadow mt-0',
          dropdownClass,
          { show: visible && showIf, 'disabled-ks-dropdown': disabled },
        ]"
        :aria-labelledby="dropdownBtnId"
      >
        <!-- Слот содержимого выпадающего списка -->
        <slot></slot>
      </div>
    </div>
  </span>
</template>

<script name="KsDropdown" setup>
const props = defineProps({
  // Идентификатор объекта, который будет активировать выпадение меню
  // Если пусто, то выводится кнопка из слота btn или кнопка по умолчанию с иконкой icon и надписью label
  target: { type: String, required: false },
  // Место выпадания меню (pointer, bottom)
  dropPos: {
    validator: (value) => {
      return ['pointer', 'bottom'].includes(value)
    },
    default: 'bottom',
  },
  // Иконка кнопки выпадающего списка
  icon: { type: String, required: false },
  // Надпись для кнопки выпадающего списка
  label: { type: String, required: false },
  // Класс для кнопки выпадающего списка
  btnClass: { type: String, required: false },
  // Id контейнера для отслеживания скролинга (необязательно)
  scrollHolderId: { type: String, required: false },
  // Отключено
  disabled: { type: Boolean, default: false },
  // Кнопка мыши, нажатие которой открывает меню - left / right
  mouseButton: {
    validator: (value) => {
      return ['left', 'right', 'manually'].includes(value)
    },
    default: 'left',
  },
  // Скрывать выпадающее меню при клике на нём
  hideOnMenuClick: { type: Boolean, default: true },
  // Скрывать выпадающее меню при прокрутке страницы или контейнера
  hideOnScroll: { type: Boolean, default: true },
  // Показать выпадающий список, если выполняется условие
  showIf: { type: Boolean, default: true },
  dropdownClass: { type: String, default: '' },
  wrapperClass: { type: String, default: '' },
  checkForValid: { type: Boolean, default: false },
  isValid: { type: Boolean, required: false },
})
const emit = defineEmits(['show', 'hide'])

const id = ref(0)
const visible = ref(false)
const $holder = ref(null)
const $dropdown = ref(null)
const $dropdownMenu = ref(null)
let scrollHolder = null
let targetEl = null
let dropdownBtnId

const getBtnClass = computed({
  get: () => {
    const res = ['btn-dropdown']
    if (props.btnClass) res.push(props.btnClass)
    if (props.disabled) res.push('disabled')
    if (visible) res.push('active')
    return res
  },
})

onMounted(async () => {
  // await nextTick()
  const instance = getCurrentInstance()
  if (instance) {
    id.value = instance.uid.toString()
    dropdownBtnId = 'ddb-' + id.value

    document.addEventListener('click', onDocumentClick)
    document.addEventListener('mousedown', onDocumentMouseDown)
    document.addEventListener('contextmenu', onDocumentCtxMenu)
    document.addEventListener('scroll', onDocumentScroll)

    if (props.scrollHolderId) {
      scrollHolder = document.querySelector('#' + props.scrollHolderId)
      if (scrollHolder) {
        scrollHolder.addEventListener('scroll', onHolderScroll)
      }
    }

    if (props.target) {
      targetEl = document.querySelector('#' + props.target)
    } else {
      targetEl = document.querySelector('#' + dropdownBtnId)
    }

    if (targetEl) {
      if (props.mouseButton === 'left') {
        targetEl.addEventListener('click', onTargetClick)
      } else if (props.mouseButton === 'right') {
        targetEl.addEventListener('contextmenu', onTargetClick, false)
      }
    } else {
      console.error('dropdown: Cannot find target')
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('mousedown', onDocumentMouseDown)
  document.removeEventListener('contextmenu', onDocumentCtxMenu)
  document.removeEventListener('scroll', onDocumentScroll)
  scrollHolder?.removeEventListener('scroll', onHolderScroll)
})

onBeforeUnmount(() => {
  hide()

  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('mousedown', onDocumentMouseDown)
  document.removeEventListener('contextmenu', onDocumentCtxMenu)
  document.removeEventListener('scroll', onDocumentScroll)
  if (scrollHolder) {
    scrollHolder.removeEventListener('scroll', onHolderScroll)
  }
})

const closestEl = (searchInEl, targetEl) => {
  while (searchInEl != null) {
    if (targetEl === searchInEl) {
      return true
    } else {
      searchInEl = searchInEl.parentElement
    }
  }
  return false
}

const onDocumentClick = (event) => {
  // Если выпадающее меню отображается и клик не по кнопке dropdown
  if (visible.value && !event.target.closest('#' + dropdownBtnId)) {
    // Если клик не по области выпадающего меню или hideOnMenuClick === true
    if (props.hideOnMenuClick || !closestEl(event.target, $dropdownMenu.value)) {
      hide()
    }
  }
}

const onDocumentMouseDown = (event) => {
  // Если выпадающее меню отображается и клик не по кнопке dropdown
  if (visible.value && !event.target.closest('#' + dropdownBtnId)) {
    // Если клик не по области выпадающего меню или hideOnMenuClick === true
    if (!closestEl(event.target, $dropdownMenu.value)) {
      hide()
    }
  }
}

const onDocumentCtxMenu = (event) => {
  // Если выпадающее меню отображается и клик не на области выпадания
  if (visible.value && (!targetEl || !event.target.closest('#' + props.target))) {
    hide()
  }
}
const onDocumentScroll = (event) => {
  // Скрываем меню, если его контейнер прокручивается
  if (visible.value && props.hideOnScroll) {
    hide()
  }
}
const onHolderScroll = () => {
  // Скрываем меню, если его контейнер прокручивается
  if (visible.value && props.hideOnScroll) {
    hide()
  }
}

const onTargetClick = (event) => {
  if ((event.button === 0 && props.mouseButton === 'left') || (event.button === 2 && props.mouseButton === 'right')) {
    toggle(event)
  }
  event.preventDefault()
}

const toggle = (event) => {
  if (props.disabled) {
    return
  }
  if (visible.value) {
    hide()
  } else {
    show(event)
  }
}

const show = (event) => {
  if (props.disabled) {
    return
  }

  if ($holder.value) {
    $holder.value.onscroll = onHolderScroll
  }
  if ($dropdownMenu.value) {
    if (props.dropPos === 'pointer' && event) {
      document.body.appendChild($dropdownMenu.value)

      setTimeout(() => {
        const dropdownRect = $dropdownMenu.value.getBoundingClientRect()
        console.log(
          event.pageY,
          event.pageX,
          dropdownRect,
          $dropdownMenu.value.offsetWidth,
          document.body.clientWidth,
          document.body.clientWidth - event.pageX,
        )
        $dropdownMenu.value.style.top = event.pageY + 'px'
        if (document.body.clientWidth - event.pageX < $dropdownMenu.value.offsetWidth * 0.95) {
          $dropdownMenu.value.style.left = event.pageX - $dropdownMenu.value.offsetWidth + 'px'
        } else $dropdownMenu.value.style.left = event.pageX + 'px'
      }, 0)
    } else if (props.dropPos === 'bottom' && $dropdown.value) {
      $dropdown.value.appendChild($dropdownMenu.value)
      const dropdownRect = $dropdown.value.getBoundingClientRect()
      $dropdownMenu.value.style.top = dropdownRect.height + 'px'
      $dropdownMenu.value.style.left = 0 + 'px'
    }
  }

  visible.value = true
  if (event) event.preventDefault()
  emit('show')
}

const hide = () => {
  if ($dropdown.value && $dropdownMenu.value) {
    $dropdown.value.appendChild($dropdownMenu.value)
  } else {
    console.error('dropdown: cannot hide')
  }

  visible.value = false
  emit('hide')
}

defineExpose({ show, hide })
</script>
