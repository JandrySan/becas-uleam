const token = localStorage.getItem('token')
if (!token && window.location.pathname !== '/') window.location.href = '/'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { PostulacionProvider } from './context/PostulacionContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <PostulacionProvider>
        <App />
      </PostulacionProvider>
    </HashRouter>
  </StrictMode>,
)
