type emitType = (event: 'setSection' | any, ...args: any[]) => void

export const useMergedSections = (
  titles: Ref<Element[] | ComponentPublicInstance[] | null[]>,
  section: () => string,
  allSections: string[],
  emit: emitType,
) => {
  let noScroll = false
  let noScrollFromEvent = false
  const sectionComputed = computed(() => {
    return section()
  })
  watch(
    () => sectionComputed.value,
    (newVal) => {
      console.log(newVal, noScrollFromEvent)
      if (noScrollFromEvent || !allSections.includes(newVal)) return
      noScroll = true
      setTimeout(() => {
        scrollToSection(newVal)
      }, 0)
    },
  )

  const scrollToSection = (section: string) => {
    console.log('scrollToSection', document.getElementById('to-scroll-id_' + section))
    document.getElementById('to-scroll-id_' + section)?.scrollIntoView({ behavior: 'auto', block: 'start' })

    noScroll = false
  }
  const onScroll = () => {
    if (noScroll) return
    const firstInViewport = titles.value.find((element) => {
      // @ts-ignore
      const { top, bottom } = element.getBoundingClientRect()

      return bottom - 120 > 0 && top < window.innerHeight
    })
    if (!firstInViewport) return
    // @ts-ignore
    const sectionName = firstInViewport.id.split('_')[0]

    if (sectionName !== sectionComputed.value) {
      console.log('sectionName !== sectionComputed.value')
      noScrollFromEvent = true
      emit('setSection', sectionName)
      //   nextTick(() => {
      //     noScrollFromEvent = false
      //   })
    }
  }
  const onScrollEnd = () => {
    console.log('onScrollEnd')
    noScrollFromEvent = false
  }
  onBeforeUpdate(() => {
    titles.value = []
  })
  return {
    scrollToSection,
    onScroll,
    onScrollEnd,
  }
}
