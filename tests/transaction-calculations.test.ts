import assert from 'node:assert/strict'
import test from 'node:test'
import { parseBrazilianAmount } from '../src/services/money.js'
import { calculateTransactionsInRange } from '../src/services/transaction-calculations.js'
import type { Transaction } from '../src/types/transactions.js'

const transactions: Transaction[] = [
  { id: '1', date: '2026-10-01', description: 'Entrada fictícia', amountInCents: 10000, isPossibleDuplicate: false },
  { id: '2', date: '2026-10-31', description: 'Saída fictícia', amountInCents: -2550, isPossibleDuplicate: false },
  { id: '3', date: '2026-11-01', description: 'Fora do período', amountInCents: 4000, isPossibleDuplicate: false },
]

test('inclui ambas as datas limite e calcula valores em centavos', () => {
  const result = calculateTransactionsInRange(transactions, '2026-10-01', '2026-10-31')
  assert.equal(result.transactions.length, 2)
  assert.equal(result.incomingInCents, 10000)
  assert.equal(result.outgoingInCents, 2550)
})

test('rejeita valores monetários malformados sem arredondamento', () => {
  assert.equal(parseBrazilianAmount('1.234,56'), 123456)
  assert.equal(parseBrazilianAmount('-0,01'), -1)
  assert.equal(parseBrazilianAmount('12.34'), null)
  assert.equal(parseBrazilianAmount('12,345'), null)
})
