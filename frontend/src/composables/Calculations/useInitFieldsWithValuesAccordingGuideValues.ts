import useCalculations from '~/store/calculations'

export const useInitFieldsWithValuesAccordingGuideValues = () => {
  const fieldsWithValuesAccordingGuideValues: Record<string, Array<string>> = {}
  useCalculations().fieldsWithValuesAccordingGuideArray.forEach((field) => {
    fieldsWithValuesAccordingGuideValues[field] = []
    for (let i = 0; i < useCalculations().objects.length; i++) {
      fieldsWithValuesAccordingGuideValues[field].push('')
    }
  })
  return fieldsWithValuesAccordingGuideValues
}
