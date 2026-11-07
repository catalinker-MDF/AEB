export interface Transaction {
  id: string
  date: string
  description: string
  amountInCents: number
  isPossibleDuplicate: boolean
}

export interface ExtractionTextItem {
  text: string
  x: number
  y: number
}

export interface ExtractedPdfPage {
  pageNumber: number
  items: ExtractionTextItem[]
}

export interface StatementParseResult {
  isRecognized: boolean
  transactions: Transaction[]
  warnings: string[]
  unparsedRows: string[]
}

export interface CalculationResult {
  incomingInCents: number
  outgoingInCents: number
  transactions: Transaction[]
}
