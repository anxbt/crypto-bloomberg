import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TerminalPage from './pages/TerminalPage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TerminalPage />
  </StrictMode>,
)
