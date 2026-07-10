
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { PostulacionProvider } from './context/PostulacionContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <PostulacionProvider>
        <App />
      </PostulacionProvider>
    </HashRouter>
  </StrictMode>,
)
