export function useSearchParams() {
  function updateSearchParams(
    searchParams: Record<string, any>,
    valueListLength: number,
    field: string,
    value: any,
    _in: string,
    _out: string,
  ) {
    if (valueListLength > 1) {
      searchParams[`${field}${_in}`] = value
      delete searchParams[`${field}${_out}`]
    } else {
      searchParams[`${field}${_out}`] = value
      delete searchParams[`${field}${_in}`]
    }
  }

  return {
    updateSearchParams,
  }
}
