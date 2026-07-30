import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from '../router'

console.log("RewardLoop: Booting...");
try {
  const router = getRouter()
  const rootElement = document.getElementById('root')
  if (rootElement) {
    const root = createRoot(rootElement)
    root.render(<RouterProvider router={router} />)
    console.log("RewardLoop: Rendered.");
  } else {
    console.error("RewardLoop: Root not found.");
  }
} catch (err) {
  console.error("RewardLoop: Boot failure", err);
}
