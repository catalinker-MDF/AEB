import { parseBrazilianDate } from './date.js'
import { parseBrazilianAmount } from './money.js'
import type { ExtractedPdfPage, ExtractionTextItem, StatementParseResult, Transaction } from '../types/transactions.js'

interface VisualRow {
  y: number
  items: ExtractionTextItem[]
}

interface StatementLayout {
  idPrefix: string
  dateColumnEnd: number
  amountColumnStart: number
  amountColumnEnd: number
}

const pixStatementLayout: StatementLayout = {
  idPrefix: 'itau-pix',
  dateColumnEnd: 85,
  amountColumnStart: 510,
  amountColumnEnd: Number.POSITIVE_INFINITY,
}

function groupRows(items: ExtractionTextItem[]): VisualRow[] {
  const rows: VisualRow[] = []
  const orderedItems = [...items].filter((item) => item.text.trim()).sort((first, second) => second.y - first.y || first.x - second.x)

  for (const item of orderedItems) {
    const row = rows.find((candidate) => Math.abs(candidate.y - item.y) <= 2)
    if (row) row.items.push(item)
    else rows.push({ y: item.y, items: [item] })
  }

  return rows.map((row) => ({ ...row, items: row.items.sort((first, second) => first.x - second.x) }))
}

function createTransactionId(layout: StatementLayout, pageNumber: number, rowIndex: number): string {
  return `${layout.idPrefix}-${pageNumber}-${rowIndex}`
}

function findCurrentAccountLayout(pages: ExtractedPdfPage[]): StatementLayout | null {
  for (const page of pages) {
    const hasCurrentAccountHeading = page.items.some((item) => /extrato\s+conta\s+corrente/i.test(item.text))
    const valueHeading = page.items.find((item) => /^valor\s*\(r\$\)$/i.test(item.text.trim()))

    if (!hasCurrentAccountHeading || !valueHeading) continue

    const balanceHeading = page.items.find((item) => /^saldo\s*\(r\$\)$/i.test(item.text.trim()))
    return {
      idPrefix: 'itau-current-account',
      dateColumnEnd: 85,
      // Os valores são alinhados à direita e podem começar antes do título da coluna.
      amountColumnStart: valueHeading.x - 30,
      amountColumnEnd: balanceHeading ? balanceHeading.x - 10 : Number.POSITIVE_INFINITY,
    }
  }

  return null
}

function detectStatementLayout(pages: ExtractedPdfPage[]): StatementLayout | null {
  if (pages.some((page) => page.items.some((item) => /extrato\s+pix\s*\/\s*lançamentos/i.test(item.text)))) {
    return pixStatementLayout
  }

  return findCurrentAccountLayout(pages)
}

export function parseItauPixStatement(pages: ExtractedPdfPage[]): StatementParseResult {
  const layout = detectStatementLayout(pages)
  if (!layout) {
    return { isRecognized: false, transactions: [], warnings: [], unparsedRows: [] }
  }

  const transactions: Transaction[] = []
  const unparsedRows: string[] = []

  for (const page of pages) {
    const rows = groupRows(page.items)
    for (const [rowIndex, row] of rows.entries()) {
      const dateItem = row.items.find((item) => item.x < layout.dateColumnEnd && /^\d{2}\/\d{2}\/\d{4}$/.test(item.text.trim()))
      if (!dateItem) continue

      const description = row.items
        .filter((item) => item.x >= layout.dateColumnEnd && item.x < layout.amountColumnStart)
        .map((item) => item.text.trim())
        .join(' ')
        .trim()
      const amountText = row.items
        .filter((item) => item.x >= layout.amountColumnStart && item.x < layout.amountColumnEnd)
        .map((item) => item.text.trim())
        .join('')
      const date = parseBrazilianDate(dateItem.text)
      const amountInCents = parseBrazilianAmount(amountText)

      if (!date || !description || amountInCents === null || amountInCents === 0) {
        unparsedRows.push(row.items.map((item) => item.text.trim()).join(' | '))
        continue
      }

      transactions.push({
        id: createTransactionId(layout, page.pageNumber, rowIndex),
        date,
        description,
        amountInCents,
        isPossibleDuplicate: false,
      })
    }
  }

  const occurrences = new Map<string, number>()
  for (const transaction of transactions) {
    const key = `${transaction.date}\u0000${transaction.description}\u0000${transaction.amountInCents}`
    occurrences.set(key, (occurrences.get(key) ?? 0) + 1)
  }
  for (const transaction of transactions) {
    const key = `${transaction.date}\u0000${transaction.description}\u0000${transaction.amountInCents}`
    transaction.isPossibleDuplicate = (occurrences.get(key) ?? 0) > 1
  }

  const warnings: string[] = []
  if (unparsedRows.length > 0) warnings.push(`${unparsedRows.length} linha(s) com aparência de lançamento não puderam ser interpretadas.`)
  if (transactions.some((transaction) => transaction.isPossibleDuplicate)) warnings.push('Há lançamentos possivelmente duplicados. Todos foram mantidos para conferência.')

  return { isRecognized: true, transactions, warnings, unparsedRows }
}
