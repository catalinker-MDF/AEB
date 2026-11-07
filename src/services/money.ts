export function parseBrazilianAmount(value: string): number | null {
  const normalized = value.trim().replace(/^R\$\s*/, '').replace(/\s/g, '')

  if (!/^-?\d{1,3}(?:\.\d{3})*,\d{2}$/.test(normalized) && !/^-?\d+,\d{2}$/.test(normalized)) {
    return null
  }

  const isNegative = normalized.startsWith('-')
  const unsignedValue = isNegative ? normalized.slice(1) : normalized
  const [integerPart, decimalPart] = unsignedValue.split(',')
  const cents = Number.parseInt(integerPart.replace(/\./g, ''), 10) * 100 + Number.parseInt(decimalPart, 10)

  return isNegative ? -cents : cents
}

export function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amountInCents / 100)
}
