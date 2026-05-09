import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NotFound404 from './404Page';

import { useTheme } from '@mui/material/styles';
import { useAuth } from '../store/auth';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
  const theme = useTheme();
  const { loginUser, role } = useAuth();
  const navigate = useNavigate();

  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');

  const validateInputs = () => {
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const name = document.getElementById('name');
    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true); setEmailErrorMessage('Please enter a valid email address.'); isValid = false;
    } else { setEmailError(false); setEmailErrorMessage(''); }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true); setPasswordErrorMessage('Password must be at least 6 characters long.'); isValid = false;
    } else { setPasswordError(false); setPasswordErrorMessage(''); }

    if (!name.value || name.value.length < 1) {
      setNameError(true); setNameErrorMessage('Name is required.'); isValid = false;
    } else { setNameError(false); setNameErrorMessage(''); }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include', // Enable cookies
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: name, email, password }),
      });
      const data = await response.json();
      if (response.status === 200) {
        alert('User registered successfully');
        navigate('/home');
      } else {
        alert(data.msg || 'Registration failed');
      }
      console.log('Server response:', data);
    } catch (error) {
      console.error('Error connecting to backend:', error);
      alert('Error connecting to server');
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit(e); };

  const fieldSx = (hasError) => ({
    '& .MuiOutlinedInput-root': {
      fontFamily: 'sans-serif',
      fontSize: '0.9rem',
      borderRadius: '10px',
      background: theme.palette.background.default,
      transition: 'all 0.18s ease',
      '& fieldset': {
        borderColor: hasError ? theme.palette.error.main : theme.palette.divider,
        borderWidth: '1.5px',
      },
      '&:hover fieldset': {
        borderColor: hasError ? theme.palette.error.main : theme.palette.primary.main,
      },
      '&.Mui-focused fieldset': {
        borderColor: hasError ? theme.palette.error.main : theme.palette.primary.main,
        borderWidth: '1.5px',
      },
      '&.Mui-focused': {
        background: theme.palette.background.paper,
        boxShadow: hasError
          ? `0 0 0 3px ${theme.palette.error.main}18`
          : `0 0 0 3px ${theme.palette.primary.main}18`,
      },
    },
    '& .MuiFormHelperText-root': {
      fontFamily: 'sans-serif',
      fontSize: '0.75rem',
      color: theme.palette.error.main,
    },
  });

  const labelSx = {
    fontFamily: 'sans-serif',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: theme.palette.text.secondary,
    mb: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  if (role === 'admin') {
    return (
      <>
        <CssBaseline enableColorScheme />

        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: theme.palette.background.default,
            fontFamily: 'sans-serif',
            px: '16px',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 440,
              background: theme.palette.background.paper,
              borderRadius: '20px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: '0 8px 32px rgba(15,28,46,0.08)',
              overflow: 'hidden',
            }}
          >
            {/* Top Accent */}
            <Box
              sx={{
                height: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
              }}
            />

            <Box sx={{ px: { xs: '24px', sm: '36px' }, py: '36px' }}>
              {/* Logo + App Name */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: '32px' }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '12px',
                    background: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(27,110,243,0.30)',
                  }}
                >
                  <ReceiptLongOutlinedIcon sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: theme.palette.text.primary }}>
                    Invomate
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: theme.palette.text.secondary, fontWeight: 500 }}>
                    Billing made simple
                  </Typography>
                </Box>
              </Box>

              {/* Heading */}
              <Typography sx={{ fontSize: '1.45rem', fontWeight: 900, color: theme.palette.text.primary, mb: '6px' }}>
                Create account 🚀
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary, mb: '28px' }}>
                Get started — it only takes a minute.
              </Typography>

              {/* Form */}
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                {/* Full Name */}
                <FormControl>
                  <FormLabel htmlFor="name" sx={labelSx}>Full Name</FormLabel>
                  <TextField
                    autoComplete="name"
                    name="name"
                    required
                    fullWidth
                    id="name"
                    placeholder="John Doe"
                    error={nameError}
                    helperText={nameErrorMessage}
                    color={nameError ? 'error' : 'primary'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldSx(nameError)}
                  />
                </FormControl>

                {/* Email */}
                <FormControl>
                  <FormLabel htmlFor="email" sx={labelSx}>Email Address</FormLabel>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    placeholder="your@email.com"
                    name="email"
                    autoComplete="email"
                    variant="outlined"
                    error={emailError}
                    helperText={emailErrorMessage}
                    color={passwordError ? 'error' : 'primary'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldSx(emailError)}
                  />
                </FormControl>

                {/* Password */}
                <FormControl>
                  <FormLabel htmlFor="password" sx={labelSx}>Password</FormLabel>
                  <TextField
                    onKeyDown={handleKey}
                    required
                    fullWidth
                    name="password"
                    placeholder="••••••••"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    variant="outlined"
                    error={passwordError}
                    helperText={passwordErrorMessage}
                    color={passwordError ? 'error' : 'primary'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldSx(passwordError)}
                  />
                </FormControl>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  onClick={validateInputs}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    mt: '6px',
                    background: theme.palette.primary.main,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    textTransform: 'none',
                    borderRadius: '12px',
                    py: '12px',
                    boxShadow: '0 4px 16px rgba(27,110,243,0.35)',
                    transition: 'all 0.18s ease',
                    '&:hover': {
                      background: theme.palette.primary.dark,
                      boxShadow: '0 6px 22px rgba(27,110,243,0.45)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': { transform: 'translateY(0)' },
                  }}
                >
                  Create Account
                </Button>
              </Box>

              {/* Divider */}
              <Divider sx={{ my: '22px', fontSize: '0.78rem', color: theme.palette.text.disabled, '&::before, &::after': { borderColor: theme.palette.divider } }}>
                or
              </Divider>

              {/* Sign In link */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', py: '13px', borderRadius: '10px', background: theme.palette.background.default, border: `1px solid ${theme.palette.divider}` }}>
                <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>Already have an account?</Typography>
                <Link href="/login" underline="none" sx={{ color: theme.palette.primary.main, fontWeight: 700, fontSize: '0.875rem', borderBottom: '2px solid transparent', transition: 'border-color 0.18s', '&:hover': { borderBottom: `2px solid ${theme.palette.primary.main}` } }}>
                  Sign in →
                </Link>
              </Box>

              {/* Trust Badges */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: '20px', mt: '20px' }}>
                {['GST Ready', 'Secure Sign Up', 'Free to Use'].map((badge) => (
                  <Box key={badge} sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 13, color: theme.palette.success.main }} />
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: theme.palette.text.secondary }}>{badge}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Footer */}
          <Typography sx={{ position: 'fixed', bottom: '16px', left: 0, right: 0, textAlign: 'center', fontSize: '0.72rem', color: theme.palette.text.disabled }}>
            © 2025 Invomate · Billing made simple for local businesses
          </Typography>
        </Box>
      </>
    );
  } else {
    return <NotFound404 />;
  }
}