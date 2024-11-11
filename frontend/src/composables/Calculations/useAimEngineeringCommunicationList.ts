import useCalculations from '~/store/calculations'

export const useAimEngineeringCommunicationList = () => {
  const listItems = useCalculations().engineeringCommunicationArray.filter(
    (item) => useCalculations().aim[item] === 'E',
  )
  return listItems.map((item) => {
    const obj = useCalculations().fieldsForStageTwo.filter((el) => el.field === item)[0]
    return obj.label
  })
}
