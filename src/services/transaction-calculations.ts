import type { CalculationResult, Transaction } from '../types/transactions.js'

export function calculateTransactionsInRange(
  transactions: Transaction[],
  startDate: string,
  endDate: string,
): CalculationResult {
  const selectedTransactions = transactions.filter((transaction) => (
    transaction.date >= startDate && transaction.date <= endDate
  ))

  return selectedTransactions.reduce<CalculationResult>((result, transaction) => {
    if (transaction.amountInCents > 0) result.incomingInCents += transaction.amountInCents
    if (transaction.amountInCents < 0) result.outgoingInCents += Math.abs(transaction.amountInCents)
    result.transactions.push(transaction)
    return result
  }, { incomingInCents: 0, outgoingInCents: 0, transactions: [] })
}
