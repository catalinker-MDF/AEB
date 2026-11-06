import './styles/main.css'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Application root element not found.')
}

app.innerHTML = `
  <main class="app-container">
    <header class="app-header">
      <h1>AEB</h1>
      <p>Analisador de Extrato Bancário</p>
    </header>

    <section class="app-content">
      <h2>Bem-vindo ao AEB</h2>
      <p>
        Faça o upload de um extrato bancário em PDF
        para calcular suas entradas e saídas.
      </p>
    </section>
  </main>
`
