import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { PrefsProvider } from './state/prefs'
import { ProgressProvider } from './state/progress'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrefsProvider>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </PrefsProvider>
  </StrictMode>,
)
