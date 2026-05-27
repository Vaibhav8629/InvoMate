import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './store/auth.jsx'
import { ThemeProvider } from "./store/theme.jsx";
import ScrollRevealProvider from './components/ScrollRevealProvider.jsx';


createRoot(document.getElementById('root')).render(

    <ThemeProvider>
      <ScrollRevealProvider />
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>

)
