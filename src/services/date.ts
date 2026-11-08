export function parseBrazilianDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim())
  if (!match) return null

  const [, dayText, monthText, yearText] = match
  const day = Number.parseInt(dayText, 10)
  const month = Number.parseInt(monthText, 10)
  const year = Number.parseInt(yearText, 10)
  const date = new Date(Date.UTC(year, month - 1, day))

  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null
  }

  return `${yearText}-${monthText}-${dayText}`
}

export function formatDate(date: string): string {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export function isDateRangeValid(startDate: string, endDate: string): boolean {
  return startDate <= endDate
}
