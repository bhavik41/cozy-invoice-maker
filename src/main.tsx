
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Check if running in Electron
const isElectron = window.navigator.userAgent.indexOf('Electron') !== -1;

// Log the environment for debugging
console.log(`Running in ${isElectron ? 'Electron' : 'Web Browser'} environment`);

createRoot(document.getElementById("root")!).render(<App />);
