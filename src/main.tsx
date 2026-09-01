import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { router, queryClient } from './router'
import './styles.css'
import { initAds } from './lib/ads'
import { exchangeOAuthCodeFromUrl } from './lib/oauth-redirect'

// Pre-initialize ads as early as possible
try {
  initAds().catch(err => console.warn("Ad Init Suppressed:", err));
} catch (e) {
  console.warn("Ad Init Exception:", e);
}

const rootElement = document.getElementById('root')

async function mount() {
  await exchangeOAuthCodeFromUrl().catch((err) => console.error("[oauth] bootstrap failed", err));

  if (rootElement && !rootElement.innerHTML) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </React.StrictMode>
    )
  }
}

void mount();
