import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from '../router'

console.log("Client: Initializing router...");
try {
  const router = getRouter()
  console.log("Client: Router created.");

  const rootElement = document.getElementById('root')
  if (rootElement) {
    console.log("Client: Root element found, rendering...");
    const root = createRoot(rootElement)
    root.render(<RouterProvider router={router} />)
    console.log("Client: Render called.");
  } else {
    console.error("Client: Root element NOT found!");
  }
} catch (err) {
  console.error("Client: Fatal initialization error", err);
}
