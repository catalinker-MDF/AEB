import assert from 'node:assert/strict'
import test from 'node:test'
import { isDateRangeValid, parseBrazilianDate } from '../src/services/date.js'

test('converte datas brasileiras válidas para o formato ISO usado internamente', () => {
  assert.equal(parseBrazilianDate('01/10/2026'), '2026-10-01')
  assert.equal(parseBrazilianDate(' 31/12/2026 '), '2026-12-31')
})

test('rejeita datas brasileiras malformadas ou inexistentes', () => {
  assert.equal(parseBrazilianDate('2026-10-01'), null)
  assert.equal(parseBrazilianDate('31/02/2026'), null)
  assert.equal(parseBrazilianDate('1/10/2026'), null)
})

test('valida que a data final não anteceda a inicial', () => {
  assert.equal(isDateRangeValid('2026-10-01', '2026-10-31'), true)
  assert.equal(isDateRangeValid('2026-10-31', '2026-10-01'), false)
})
