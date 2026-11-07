import './styles/main.css'
import { renderApp } from './components/app.js'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Application root element not found.')
}

renderApp(app)
