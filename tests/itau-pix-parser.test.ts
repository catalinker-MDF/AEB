import assert from 'node:assert/strict'
import test from 'node:test'
import { parseItauPixStatement } from '../src/services/itau-pix-parser.js'
import type { ExtractedPdfPage } from '../src/types/transactions.js'

function pageWithRows(rows: Array<[string, string, string]>): ExtractedPdfPage {
  return {
    pageNumber: 1,
    items: [
      { text: 'extrato Pix / lançamentos', x: 28, y: 729 },
      ...rows.flatMap(([date, description, amount], index) => {
        const y = 680 - index * 18
        return [{ text: date, x: 37, y }, { text: description, x: 96, y }, { text: amount, x: 530, y }]
      }),
    ],
  }
}

function currentAccountPageWithRows(rows: Array<[string, string, string]>, pageNumber = 1): ExtractedPdfPage {
  return {
    pageNumber,
    items: [
      ...(pageNumber === 1
        ? [
            { text: 'extrato conta corrente', x: 28, y: 729 },
            { text: 'data', x: 32, y: 660 },
            { text: 'lançamentos', x: 104, y: 660 },
            { text: 'valor (R$)', x: 420, y: 660 },
            { text: 'saldo (R$)', x: 520, y: 660 },
          ]
        : []),
      ...rows.flatMap(([date, description, amount], index) => {
        const y = 620 - index * 18
        return [{ text: date, x: 32, y }, { text: description, x: 104, y }, { text: amount, x: 430, y }]
      }),
    ],
  }
}

test('interpreta lançamentos Pix do Itaú a partir de itens posicionados', () => {
  const result = parseItauPixStatement([pageWithRows([
    ['02/10/2026', 'PIX TRANSF Cliente fictício', '1.234,56'],
    ['03/10/2026', 'PIX QRS Loja fictícia', '-45,70'],
  ])])

  assert.equal(result.isRecognized, true)
  assert.deepEqual(result.transactions.map(({ date, description, amountInCents }) => ({ date, description, amountInCents })), [
    { date: '2026-10-02', description: 'PIX TRANSF Cliente fictício', amountInCents: 123456 },
    { date: '2026-10-03', description: 'PIX QRS Loja fictícia', amountInCents: -4570 },
  ])
})

test('mantém possíveis duplicidades e sinaliza linhas não interpretadas', () => {
  const result = parseItauPixStatement([pageWithRows([
    ['04/10/2026', 'PIX TRANSF Pessoa fictícia', '10,00'],
    ['04/10/2026', 'PIX TRANSF Pessoa fictícia', '10,00'],
    ['05/10/2026', 'PIX TRANSF Sem valor', 'valor inválido'],
  ])])

  assert.equal(result.transactions.length, 2)
  assert.equal(result.transactions.every((transaction) => transaction.isPossibleDuplicate), true)
  assert.equal(result.unparsedRows.length, 1)
})

test('interpreta o extrato de conta corrente do Itaú, inclusive páginas sem cabeçalho', () => {
  const result = parseItauPixStatement([
    currentAccountPageWithRows([['01/07/2026', 'PIX TRANSF Cliente fictício', '-1.350,00']]),
    currentAccountPageWithRows([['02/07/2026', 'PIX TRANSF Recebimento fictício', '509,00']], 2),
  ])

  assert.equal(result.isRecognized, true)
  assert.deepEqual(result.transactions.map(({ date, amountInCents }) => ({ date, amountInCents })), [
    { date: '2026-07-01', amountInCents: -135000 },
    { date: '2026-07-02', amountInCents: 50900 },
  ])
})

test('não reconhece outros formatos', () => {
  const result = parseItauPixStatement([{ pageNumber: 1, items: [{ text: 'Extrato bancário', x: 20, y: 20 }] }])
  assert.equal(result.isRecognized, false)
})
