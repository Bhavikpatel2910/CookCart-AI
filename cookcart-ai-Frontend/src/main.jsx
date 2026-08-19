import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

// Suppress MetaMask extension console noise in development
if (import.meta.env.DEV) {
  const originalError = console.error
  const originalWarn = console.warn
  const metamaskPatterns = [
    'MetaMask',
    'ObjectMultiplex',
    'MaxListenersExceededWarning',
    'contentscript.js',
    'inpage.js',
    'logsListener.bundle.js',
    'ethereum',
    'wallet',
  ]
  console.error = (...args) => {
    if (args.some(a => typeof a === 'string' && metamaskPatterns.some(p => a.includes(p)))) return
    originalError.apply(console, args)
  }
  console.warn = (...args) => {
    if (args.some(a => typeof a === 'string' && metamaskPatterns.some(p => a.includes(p)))) return
    originalWarn.apply(console, args)
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
