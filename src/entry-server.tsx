import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

// Разметка страницы на этапе сборки: без неё первый кадр ждёт загрузки и запуска JS (LCP на телефоне 3,4 с).
export const render = () =>
  renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
