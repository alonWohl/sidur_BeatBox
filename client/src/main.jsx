import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App.jsx'
import './assets/styles/style.css'

createRoot(document.getElementById('root')).render(
  <Router>
    <App />
  </Router>
)
