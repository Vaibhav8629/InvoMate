import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from './components/ProtectedRoute';
import { PageMotion } from './components/MotionPrimitives';

import baseMuiTheme from './theme/theme';
import SignUp from './pages/Register';
import SignIn from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
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

const TransitionRoutes = () => {
  const location = useLocation();

  const withPageTransition = (element) => <PageMotion>{element}</PageMotion>;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={withPageTransition(<LandingPage />)} />
        <Route path='/register' element={withPageTransition(<SignUp />)} />
        <Route path='/login' element={withPageTransition(<SignIn />)} />
        <Route path='/auth/forgot-password' element={withPageTransition(<ForgotPassword />)} />
        <Route path='/auth/reset-password/:token' element={withPageTransition(<ResetPassword />)} />
        <Route path='/products' element={withPageTransition(<ProtectedRoute><BasicTextFields /></ProtectedRoute>)} />
        <Route path='/profile' element={withPageTransition(<ProtectedRoute><Profile /></ProtectedRoute>)} />
        <Route path='/home' element={withPageTransition(<ProtectedRoute><Dashboard /></ProtectedRoute>)} />
        <Route path='/invoice/create' element={withPageTransition(<ProtectedRoute><InvoicePage /></ProtectedRoute>)} />
        <Route path='/invoice/edit/:id' element={withPageTransition(<ProtectedRoute><InvoicePage /></ProtectedRoute>)} />
        <Route path='/invoices' element={withPageTransition(<ProtectedRoute><Invoices /></ProtectedRoute>)} />
        <Route path='/gst-reports' element={withPageTransition(<ProtectedRoute><GSTReportsPage /></ProtectedRoute>)} />
        <Route path="/invoice/:id" element={withPageTransition(<ProtectedRoute><InvoiceView /></ProtectedRoute>)} />
        <Route path='*' element={withPageTransition(<NotFound404 />)} />
      </Routes>
    </AnimatePresence>
  );
};

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
        <TransitionRoutes />
      </BrowserRouter>
    </MuiThemeProvider>
  );
};

export default App;