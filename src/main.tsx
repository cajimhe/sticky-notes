import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Board } from './components/Board/Board'
import './style.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Board />
  </StrictMode>,
)
