import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import ProtectedRoute from './components/ProtectedRoute';

import baseMuiTheme from './theme/theme';
import SignUp from './pages/Register';
import SignIn from './pages/Login';
import BasicTextFields from "./pages/ItemsCrud";
import Profile from './pages/Profile';
import Dashboard from './pages/Home';
import InvoicePage from './pages/InvoicePage';
import Invoices from './pages/InvoiceList';
import InvoiceView from "./pages/InvoiceView";
import NotFound404 from './pages/404Page';
import GSTReportsPage from './pages/GSTReports';
import LandingPage from './pages/LandingPage';
import { useThemeMode } from "./store/theme";

const App = () => {
  const { theme } = useThemeMode();

  const muiTheme = useMemo(() => createTheme(baseMuiTheme, {
    palette: {
      mode: theme,
      background: theme === "dark"
        ? {
            default: "#0b0f16",
            paper: "#111827",
          }
        : {
            default: "#FAFBFC",
            paper: "#FFFFFF",
          },
      text: theme === "dark"
        ? {
            primary: "#E5E7EB",
            secondary: "#94A3B8",
            disabled: "#64748B",
          }
        : {
            primary: "#0E0E10",
            secondary: "#6B7280",
            disabled: "#9CA3AF",
          },
      divider: theme === "dark" ? "rgba(148,163,184,0.18)" : "#E8EAED",
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          body {
            background: ${theme === "dark" ? "#0b0f16" : "#FAFBFC"};
            color: ${theme === "dark" ? "#E5E7EB" : "#0E0E10"};
          }
        `,
      },
    },
  }), [theme]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline enableColorScheme />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LandingPage/>} />
          <Route path='/register' element={<SignUp />} />
          <Route path='/login' element={<SignIn />} />
          <Route path='/products' element={<ProtectedRoute><BasicTextFields /></ProtectedRoute>} />
          <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path='/home' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path='/createbill' element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />
          <Route path='/invoice/create' element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />
          <Route path='/invoice/edit/:id' element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />
          <Route path='/invoices' element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
          <Route path='/gst-reports' element={<ProtectedRoute><GSTReportsPage /></ProtectedRoute>} />
          <Route path="/invoice/:id" element={<ProtectedRoute><InvoiceView /></ProtectedRoute>} />
          <Route path='*' element={<NotFound404 />} />
        </Routes>
      </BrowserRouter>
    </MuiThemeProvider>
  );
};

export default App;