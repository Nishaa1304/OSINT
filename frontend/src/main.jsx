import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import 'leaflet/dist/leaflet.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0d1526',
            color: '#e2e8f0',
            border: '1px solid rgba(0,212,255,0.3)',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#00ff88', secondary: '#0d1526' } },
          error:   { iconTheme: { primary: '#ff3366', secondary: '#0d1526' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
