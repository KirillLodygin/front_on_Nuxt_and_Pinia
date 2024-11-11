export function removeEmptyFields(obj: Record<string, any> | null): Record<string, any> {
  if (obj) {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
        .map(([key, value]) => [
          key,
          value && typeof value === 'object' && !Array.isArray(value) ? removeEmptyFields(value) : value,
        ]),
    )
  }
  return {}
}
