
// This file provides instructions for running the Electron app

console.log(`
===== Cozy Invoice Maker - Desktop App =====

To run the Electron desktop app, follow these steps:

1. First, make sure you have the required dependencies:
   npm install concurrently cross-env wait-on better-sqlite3 electron electron-builder electron-is-dev

2. Add these scripts to your package.json file:

"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "electron:dev": "concurrently -k \"cross-env BROWSER=none npm run dev\" \"wait-on http://localhost:8080 && electron electron/main.js\"",
  "electron:build": "npm run build && electron-builder build -c electron/electron-builder.json"
}

3. Run the app in development mode:
   npm run electron:dev

4. To create a production build:
   npm run electron:build

The production build will create executable files in the 'release' folder.
`);
