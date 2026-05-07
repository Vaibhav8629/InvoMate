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
import Chip from '@mui/material/Chip';

import PersonOutlineIcon       from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon       from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon        from '@mui/icons-material/LockOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import GridViewRoundedIcon     from '@mui/icons-material/GridViewRounded';
import InventoryOutlinedIcon   from '@mui/icons-material/Inventory2Outlined';
import TrendingUpOutlinedIcon  from '@mui/icons-material/TrendingUpOutlined';
import ArrowForwardIcon        from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon  from '@mui/icons-material/CheckCircleOutline';

import { useTheme } from '@mui/material/styles';
import { useAuth } from '../store/auth';
import { useNavigate } from 'react-router-dom';

// ── Feature bullet ─────────────────────────────────────────────────────────────
const Feature = ({ icon, text }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <Box sx={{
      width: 34, height: 34, borderRadius: '10px',
      background: 'rgba(255,255,255,0.14)',
      border: '1px solid rgba(255,255,255,0.22)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', flexShrink: 0,
    }}>
      {icon}
    </Box>
    <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>
      {text}
    </Typography>
  </Box>
);

export default function SignIn() {
  const theme = useTheme();
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [nameValue, setNameValue] = React.useState('');
  const [emailValue, setEmailValue] = React.useState('');
  const [passwordValue, setPasswordValue] = React.useState('');

  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');

  const handleName = (e) => setNameValue(e.target.value);
  const handleEmail = (e) => setEmailValue(e.target.value);
  const handlePassword = (e) => setPasswordValue(e.target.value);

  const validateInputs = () => {
    let isValid = true;

    if (!nameValue) {
      setNameError(true);
      setNameErrorMessage('Please enter a valid name.');
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    if (!emailValue || !/\S+@\S+\.\S+/.test(emailValue)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!passwordValue || passwordValue.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateInputs()) return;

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        credentials: 'include', // Enable cookies
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: nameValue,
          email: emailValue,
          password: passwordValue,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        await loginUser(); // Fetch user data after successful login
        navigate('/home');
      } else {
        alert(data.msg || 'Invalid Credentials');
      }
    } catch (error) {
      console.error('Error connecting to backend:', error);
      alert('Error connecting to server');
    }
  };

  // ── Shared field sx ────────────────────────────────────────────────────────
  const fieldSx = (hasError) => ({
    '& .MuiOutlinedInput-root': {
      fontFamily: "'DM Sans', sans-serif",
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
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '0.75rem',
      color: theme.palette.error.main,
    },
  });

  const labelSx = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.8rem',
    fontWeight: 700,
    color: theme.palette.text.secondary,
    mb: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <>
      <CssBaseline enableColorScheme />

      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        background: theme.palette.background.default,
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* ══════════════════════════════════
            LEFT PANEL — branding / features
        ══════════════════════════════════ */}
        <Box sx={{
          display: { xs: 'none', md: 'flex' },
          width: '48%',
          flexShrink: 0,
          background: theme.palette.primary.main,
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: '48px',
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* Decorative circles */}
          <Box sx={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: -120, right: -100, pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: -80, left: -60, pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: 160, right: 40, pointerEvents: 'none' }} />
          {/* Diagonal grid pattern */}
          <Box sx={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 14px)',
          }} />

          {/* Top: Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 1 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ReceiptLongOutlinedIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography sx={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1.4rem', fontWeight: 900,
              color: '#fff', letterSpacing: '-0.02em',
            }}>
              Invomate
            </Typography>
          </Box>

          {/* Middle: Headline + features */}
          <Box sx={{ zIndex: 1 }}>
            <Typography sx={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '2.1rem', fontWeight: 900,
              color: '#fff', lineHeight: 1.2,
              letterSpacing: '-0.03em', mb: '12px',
            }}>
              Welcome back
              <br />
              <Box component="span" sx={{ color: 'rgba(255,255,255,0.65)' }}>to Invomate.</Box>
            </Typography>

            <Typography sx={{
              fontSize: '0.9375rem',
              color: 'rgba(255,255,255,0.72)',
              lineHeight: 1.65, mb: '36px',
              maxWidth: 380,
            }}>
              Your billing dashboard, invoices, and inventory are waiting. Sign in to pick up where you left off.
            </Typography>

            {/* Feature list */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Feature icon={<GridViewRoundedIcon sx={{ fontSize: 17 }} />} text="Real-time dashboard with profit insights" />
              <Feature icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 17 }} />} text="Generate & share GST invoices instantly" />
              <Feature icon={<InventoryOutlinedIcon sx={{ fontSize: 17 }} />} text="Smart inventory with low-stock alerts" />
              <Feature icon={<TrendingUpOutlinedIcon sx={{ fontSize: 17 }} />} text="Track revenue and profit per sale" />
            </Box>
          </Box>

          {/* Bottom: Footer text */}
          <Typography sx={{
            fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.45)',
            zIndex: 1,
          }}>
            © 2026 Invomate · Built for local businesses
          </Typography>
        </Box>

        {/* ══════════════════════════════════
            RIGHT PANEL — sign in form
        ══════════════════════════════════ */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: '24px', sm: '48px', lg: '80px' },
          py: '48px',
          background: theme.palette.background.default,
        }}>

          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: '12px', mb: '32px' }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '12px',
              background: theme.palette.primary.main,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(27,110,243,0.35)',
            }}>
              <ReceiptLongOutlinedIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Typography sx={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1.3rem', fontWeight: 900,
              color: theme.palette.text.primary,
            }}>
              Invomate
            </Typography>
          </Box>

          {/* Form container */}
          <Box sx={{ width: '100%', maxWidth: 420 }}>

            {/* Heading */}
            <Box sx={{ mb: '32px' }}>
              <Typography sx={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '1.6rem', fontWeight: 900,
                color: theme.palette.text.primary, lineHeight: 1.2, mb: '8px',
              }}>
                Welcome back 👋
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', color: theme.palette.text.secondary, fontWeight: 500 }}>
                Sign in to your account to continue.
              </Typography>
            </Box>

            {/* Form */}
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >

              {/* Full Name */}
              <FormControl>
                <FormLabel htmlFor="username" sx={labelSx}>Full Name</FormLabel>
                <TextField
                  id="username"
                  value={nameValue}
                  onChange={handleName}
                  error={nameError}
                  helperText={nameErrorMessage}
                  placeholder="John Doe"
                  required
                  fullWidth
                  variant="outlined"
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
                  id="email"
                  value={emailValue}
                  onChange={handleEmail}
                  error={emailError}
                  helperText={emailErrorMessage}
                  placeholder="your@email.com"
                  required
                  fullWidth
                  variant="outlined"
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
                  id="password"
                  type="password"
                  value={passwordValue}
                  onChange={handlePassword}
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  placeholder="••••••••"
                  required
                  fullWidth
                  variant="outlined"
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

              {/* Submit */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  mt: '4px',
                  background: theme.palette.primary.main,
                  color: '#fff',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  textTransform: 'none',
                  borderRadius: '12px',
                  py: '13px',
                  boxShadow: '0 4px 18px rgba(27,110,243,0.38)',
                  letterSpacing: '0.01em',
                  transition: 'all 0.20s ease',
                  '&:hover': {
                    background: theme.palette.primary.dark,
                    boxShadow: '0 8px 28px rgba(27,110,243,0.48)',
                    transform: 'translateY(-1px)',
                  },
                  '&:active': { transform: 'translateY(0px)' },
                }}
              >
                Sign In
              </Button>
            </Box>

            {/* Trust badges */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: '20px', mt: '28px' }}>
              {['GST Ready', 'Secure Login', 'AI insights'].map((badge) => (
                <Box key={badge} sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 13, color: theme.palette.success.main }} />
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: theme.palette.text.secondary }}>
                    {badge}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}