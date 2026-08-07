import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { router, queryClient } from './router'
import './styles.css'
import { initAds } from './lib/ads'

// Pre-initialize ads as early as possible
try {
  initAds().catch(err => console.warn("Ad Init Suppressed:", err));
} catch (e) {
  console.warn("Ad Init Exception:", e);
}

const rootElement = document.getElementById('root')

if (rootElement) {
  if (!rootElement.innerHTML) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </React.StrictMode>
    )
  }
}
