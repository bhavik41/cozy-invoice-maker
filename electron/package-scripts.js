
// This file will be used to guide users on updating their package.json scripts

console.log(`
To run the Electron app, please add these scripts to your package.json file:

"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "electron:dev": "concurrently -k \"cross-env BROWSER=none npm run dev\" \"wait-on http://localhost:8080 && electron electron/main.js\"",
  "electron:build": "npm run build && electron-builder build -c electron/electron-builder.json"
}
`);
