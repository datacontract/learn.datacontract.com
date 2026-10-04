import { StrictMode } from 'react'
import { App } from './App'
import { RouterProvider, type Route } from './router'
import { PrefsProvider } from './state/prefs'
import { ProgressProvider } from './state/progress'

export function Root({ route }: { route: Route }) {
  return (
    <StrictMode>
      <RouterProvider initial={route}>
        <PrefsProvider>
          <ProgressProvider>
            <App />
          </ProgressProvider>
        </PrefsProvider>
      </RouterProvider>
    </StrictMode>
  )
}
