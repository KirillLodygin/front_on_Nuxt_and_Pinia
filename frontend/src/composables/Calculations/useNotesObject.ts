import useCalculations from '~/store/calculations'

export const useNotesObject = () => {
  const notesObject: Record<string, string> = {}

  Object.keys(useCalculations().corrections).forEach((key) => {
    if (
      !useCalculations().engineeringCommunicationArray.slice(1).includes(key) &&
      !useCalculations().locationFloorArray.slice(1).includes(key)
    ) {
      notesObject[key] = ''
    }
  })

  return notesObject
}
