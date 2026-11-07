import { formatDate } from '../services/date.js'
import { formatCurrency } from '../services/money.js'
import { extractPdfText } from '../services/pdf-extractor.js'
import { parseItauPixStatement } from '../services/itau-pix-parser.js'
import { calculateTransactionsInRange } from '../services/transaction-calculations.js'
import type { StatementParseResult } from '../types/transactions.js'

interface AppState {
  parsedStatement: StatementParseResult | null
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] ?? character)
}

function getDateBounds(parsedStatement: StatementParseResult): { min: string; max: string } | null {
  if (parsedStatement.transactions.length === 0) return null
  const dates = parsedStatement.transactions.map((transaction) => transaction.date).sort()
  return { min: dates[0], max: dates[dates.length - 1] }
}

function requiredElement<T extends Element>(container: Element, selector: string): T {
  const element = container.querySelector<T>(selector)
  if (!element) throw new Error('Não foi possível inicializar a interface.')
  return element
}

export function renderApp(app: HTMLDivElement): void {
  const state: AppState = { parsedStatement: null }

  app.innerHTML = `
    <main class="app-container">
      <header class="app-header">
        <p class="eyebrow">AEB</p>
        <h1>Analisador de Extrato Bancário</h1>
        <p class="subtitle">Analise seu extrato Pix do Itaú diretamente no seu navegador.</p>
      </header>

      <section class="card" aria-labelledby="upload-title">
        <h2 id="upload-title">1. Envie o extrato Pix</h2>
        <p class="hint">O arquivo é processado apenas nesta página e não é enviado nem salvo.</p>
        <label class="file-input" for="statement-file">
          <span>Selecionar PDF</span>
          <input id="statement-file" type="file" accept="application/pdf,.pdf" />
        </label>
        <p id="file-name" class="file-name" aria-live="polite">Nenhum arquivo selecionado.</p>
        <div id="upload-message" class="message" aria-live="polite"></div>
      </section>

      <section id="analysis-section" class="card is-hidden" aria-labelledby="period-title">
        <h2 id="period-title">2. Selecione o período</h2>
        <div class="date-fields">
          <label>Data inicial <input id="start-date" type="date" required /></label>
          <label>Data final <input id="end-date" type="date" required /></label>
        </div>
        <p id="date-message" class="message" aria-live="polite"></p>
        <div id="warnings" class="warnings"></div>
        <div id="results" aria-live="polite"></div>
      </section>
    </main>
  `

  const fileInput = requiredElement<HTMLInputElement>(app, '#statement-file')
  const fileName = requiredElement<HTMLParagraphElement>(app, '#file-name')
  const uploadMessage = requiredElement<HTMLDivElement>(app, '#upload-message')
  const analysisSection = requiredElement<HTMLElement>(app, '#analysis-section')
  const startDate = requiredElement<HTMLInputElement>(app, '#start-date')
  const endDate = requiredElement<HTMLInputElement>(app, '#end-date')
  const dateMessage = requiredElement<HTMLParagraphElement>(app, '#date-message')
  const warnings = requiredElement<HTMLDivElement>(app, '#warnings')
  const results = requiredElement<HTMLDivElement>(app, '#results')

  function renderWarnings(parsedStatement: StatementParseResult): void {
    const warningItems = parsedStatement.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')
    const unparsedItems = parsedStatement.unparsedRows.map((row) => `<li><code>${escapeHtml(row)}</code></li>`).join('')
    warnings.innerHTML = warningItems
      ? `<div class="warning-box"><strong>Revise os resultados</strong><ul>${warningItems}</ul>${unparsedItems ? `<details><summary>Ver linhas não interpretadas</summary><ul>${unparsedItems}</ul></details>` : ''}</div>`
      : ''
  }

  function updateResults(): void {
    const parsedStatement = state.parsedStatement
    if (!parsedStatement) return

    const initialDate = startDate.value
    const finalDate = endDate.value
    if (!initialDate || !finalDate) {
      dateMessage.textContent = 'Informe as duas datas para calcular o período.'
      results.innerHTML = ''
      return
    }
    if (initialDate > finalDate) {
      dateMessage.textContent = 'A data inicial não pode ser posterior à data final.'
      results.innerHTML = ''
      return
    }

    dateMessage.textContent = ''
    const calculation = calculateTransactionsInRange(parsedStatement.transactions, initialDate, finalDate)
    const transactionRows = calculation.transactions.map((transaction) => `
      <tr>
        <td>${formatDate(transaction.date)}</td>
        <td>${escapeHtml(transaction.description)}${transaction.isPossibleDuplicate ? ' <span class="duplicate-badge">Possível duplicidade</span>' : ''}</td>
        <td class="amount ${transaction.amountInCents > 0 ? 'incoming' : 'outgoing'}">${transaction.amountInCents > 0 ? '+' : '−'} ${formatCurrency(Math.abs(transaction.amountInCents))}</td>
      </tr>`).join('')

    results.innerHTML = `
      <div class="totals" aria-label="Totais do período">
        <article><span>Entradas</span><strong class="incoming">${formatCurrency(calculation.incomingInCents)}</strong></article>
        <article><span>Saídas</span><strong class="outgoing">${formatCurrency(calculation.outgoingInCents)}</strong></article>
      </div>
      <h3>Lançamentos incluídos (${calculation.transactions.length})</h3>
      ${calculation.transactions.length > 0 ? `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Descrição</th><th>Valor</th></tr></thead><tbody>${transactionRows}</tbody></table></div>` : '<p class="empty-state">Não há lançamentos no período selecionado.</p>'}
    `
  }

  async function handleFileSelection(): Promise<void> {
    const file = fileInput.files?.[0]
    state.parsedStatement = null
    analysisSection.classList.add('is-hidden')
    uploadMessage.textContent = ''

    if (!file) {
      fileName.textContent = 'Nenhum arquivo selecionado.'
      return
    }
    fileName.textContent = file.name
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      uploadMessage.textContent = 'Selecione um arquivo no formato PDF.'
      return
    }

    uploadMessage.textContent = 'Lendo o extrato no seu navegador…'
    try {
      const pages = await extractPdfText(file)
      const parsedStatement = parseItauPixStatement(pages)
      if (!parsedStatement.isRecognized) {
        uploadMessage.textContent = 'Formato não reconhecido. Esta primeira versão aceita apenas extratos Pix do Itaú no formato compatível.'
        return
      }
      if (parsedStatement.transactions.length === 0) {
        uploadMessage.textContent = 'O extrato foi reconhecido, mas nenhum lançamento pôde ser interpretado. Revise o formato do PDF.'
        return
      }

      state.parsedStatement = parsedStatement
      const bounds = getDateBounds(parsedStatement)
      if (!bounds) return
      startDate.value = bounds.min
      endDate.value = bounds.max
      analysisSection.classList.remove('is-hidden')
      uploadMessage.textContent = `${parsedStatement.transactions.length} lançamento(s) identificado(s).`
      renderWarnings(parsedStatement)
      updateResults()
    } catch (error) {
      uploadMessage.textContent = error instanceof Error ? error.message : 'Ocorreu um erro ao processar o PDF.'
    }
  }

  fileInput.addEventListener('change', () => { void handleFileSelection() })
  startDate.addEventListener('change', updateResults)
  endDate.addEventListener('change', updateResults)
}
