import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import ProtectedRoute from './components/ProtectedRoute';

import muiTheme from './theme/theme';
import SignUp from './pages/Register';
import SignIn from './pages/Login';
import BasicTextFields from "./pages/ItemsCrud";
import Profile from './pages/Profile';
import Dashboard from './pages/Home';
import InvoicePage from './pages/InvoicePage';
import Invoices from './pages/InvoiceList';
import InvoiceView from "./pages/InvoiceView";
import NotFound404 from './pages/404Page';

const App = () => {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline enableColorScheme />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<ProtectedRoute><Navigate to="/home"/></ProtectedRoute>} />
          <Route path='/register' element={<SignUp />} />
          <Route path='/login' element={<SignIn />} />
          <Route path='/products' element={<ProtectedRoute><BasicTextFields /></ProtectedRoute>} />
          <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path='/home' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path='/createbill' element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />
          <Route path='/invoices' element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
          <Route path="/invoice/:id" element={<ProtectedRoute><InvoiceView /></ProtectedRoute>} />
          <Route path='*' element={<NotFound404 />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;