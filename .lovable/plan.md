Update `capacitor.config.ts`: change `webDir: "dist"` to `webDir: "dist/client"` so Capacitor finds the built `index.html` produced by TanStack Start.

After approval, on your PC run:
```powershell
git pull
bun run build
bunx cap sync
bunx cap open android
```