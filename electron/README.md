
# Cozy Invoice Maker - Desktop App

This is a desktop version of the Invoice Maker application built with Electron and React.

## Running the Desktop App

### Development Mode

To run the app in development mode:

```bash
npm run electron:dev
```

This will start both the React development server and the Electron app. Changes to the React code will automatically refresh the app.

### Production Build

To build the desktop app for production:

```bash
npm run electron:build
```

This will create executable files for your platform in the `release` folder.

## Data Storage

All data is stored locally on your device using SQLite. The database file is located in your user data directory:

- Windows: `%APPDATA%\Cozy Invoice Maker\invoice-data.db`
- macOS: `~/Library/Application Support/Cozy Invoice Maker/invoice-data.db`
- Linux: `~/.config/Cozy Invoice Maker/invoice-data.db`

## Important NPM Scripts

Add these scripts to your package.json:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "electron:dev": "concurrently -k \"cross-env BROWSER=none npm run dev\" \"wait-on http://localhost:8080 && electron electron/main.js\"",
  "electron:build": "npm run build && electron-builder build -c electron/electron-builder.json"
}
```
