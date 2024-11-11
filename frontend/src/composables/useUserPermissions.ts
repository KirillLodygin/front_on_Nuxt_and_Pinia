export default (permsObjects: Record<string, string> | undefined | null | unknown) => {
  if (permsObjects) {
    return Object.keys(permsObjects)
  }
  return []
}
