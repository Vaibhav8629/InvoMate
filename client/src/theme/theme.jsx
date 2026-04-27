// src/muiTheme.js
import { createTheme } from "@mui/material/styles";

const muiTheme = createTheme({
  // ─── Palette ─────────────────────────────────────────────
  palette: {
    mode: "light",

    primary: {
      main: "#1B6EF3",
      light: "#EBF4FF",
      lighter: "#F5FAFF",
      dark: "#0D4FD9",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#7C3AED",
      light: "#F3E8FF",
      dark: "#6D28D9",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FAFBFC",
      paper: "#FFFFFF",
    },
    divider: "#E8EAED",
    text: {
      primary: "#0E0E10",
      secondary: "#6B7280",
      disabled: "#9CA3AF",
    },
    success: {
      main: "#10B981",
      light: "#ECFDF5",
      dark: "#059669",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#EF4444",
      light: "#FEF2F2",
      dark: "#DC2626",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#F59E0B",
      light: "#FFFBEB",
      dark: "#D97706",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#0EA5E9",
      light: "#F0F9FF",
      dark: "#0284C7",
      contrastText: "#FFFFFF",
    },
    custom: {
      purple: "#7C3AED",
      purpleLight: "#F3E8FF",
      sidebarBg: "#FFFFFF",
      blueGlow: "rgba(27, 110, 243, 0.25)",
      cardHover: "0 8px 24px rgba(15, 23, 42, 0.12)",
      border: "#E8EAED",
      borderLight: "#F3F4F6",
    },
  },

  // ─── Typography ─────────────────────────────────────────
  typography: {
    fontFamily: "'DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
    h1: {
      fontFamily: "'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', sans-serif",
      fontWeight: 700,
      fontSize: "2rem",
      lineHeight: 1.25,
      letterSpacing: "-0.015em",
      color: "#0E0E10",
    },
    h2: {
      fontFamily: "'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', sans-serif",
      fontWeight: 700,
      fontSize: "1.5rem",
      lineHeight: 1.33,
      letterSpacing: "-0.01em",
      color: "#0E0E10",
    },
    h3: {
      fontFamily: "'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', sans-serif",
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.4,
      color: "#0E0E10",
    },
    h4: {
      fontFamily: "'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', sans-serif",
      fontWeight: 600,
      fontSize: "1.125rem",
      lineHeight: 1.44,
      color: "#0E0E10",
    },
    h5: {
      fontFamily: "'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', sans-serif",
      fontWeight: 600,
      fontSize: "1rem",
      lineHeight: 1.5,
      color: "#0E0E10",
    },
    h6: {
      fontFamily: "'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', sans-serif",
      fontWeight: 600,
      fontSize: "0.875rem",
      lineHeight: 1.57,
      color: "#0E0E10",
    },
    subtitle1: { fontWeight: 500, fontSize: "0.9375rem", lineHeight: 1.6, color: "#6B7280" },
    subtitle2: { fontWeight: 500, fontSize: "0.875rem", lineHeight: 1.57, color: "#6B7280" },
    body1: { fontWeight: 400, fontSize: "0.9375rem", lineHeight: 1.6, color: "#0E0E10" },
    body2: { fontWeight: 400, fontSize: "0.875rem", lineHeight: 1.57, color: "#6B7280" },
    caption: { fontWeight: 500, fontSize: "0.75rem", lineHeight: 1.67, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" },
    overline: { fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9CA3AF" },
    button: { fontFamily: "'DM Sans', '-apple-system', 'BlinkMacSystemFont', sans-serif", fontWeight: 500, fontSize: "0.875rem", textTransform: "none", letterSpacing: "0.01em" },
  },

  // ─── Shape ───────────────────────────────────────────────
  shape: { borderRadius: 10 },

  // ─── Shadows ─────────────────────────────────────────────
  shadows: [
    "none",
    "0 1px 2px rgba(15, 23, 42, 0.05)",
    "0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)",
    "0 4px 6px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.06)",
    "0 10px 15px rgba(15, 23, 42, 0.10), 0 4px 6px rgba(15, 23, 42, 0.05)",
    "0 20px 25px rgba(15, 23, 42, 0.12), 0 10px 10px rgba(15, 23, 42, 0.06)",
    "0 25px 50px rgba(15, 23, 42, 0.15)",
    "0 30px 60px rgba(15, 23, 42, 0.18)",
    "0 2px 5px rgba(15, 23, 42, 0.06)",
    "0 8px 16px rgba(15, 23, 42, 0.10)",
    "0 12px 24px rgba(15, 23, 42, 0.12)",
    "0 16px 32px rgba(15, 23, 42, 0.14)",
    "0 20px 40px rgba(15, 23, 42, 0.16)",
    "0 24px 48px rgba(15, 23, 42, 0.18)",
    "0 28px 56px rgba(15, 23, 42, 0.20)",
    "0 32px 64px rgba(15, 23, 42, 0.22)",
    "0 36px 72px rgba(15, 23, 42, 0.24)",
    "0 40px 80px rgba(15, 23, 42, 0.26)",
    "0 44px 88px rgba(15, 23, 42, 0.28)",
    "0 48px 96px rgba(15, 23, 42, 0.30)",
    "0 52px 104px rgba(15, 23, 42, 0.32)",
    "0 56px 112px rgba(15, 23, 42, 0.34)",
    "0 60px 120px rgba(15, 23, 42, 0.36)",
    "0 64px 128px rgba(15, 23, 42, 0.38)",
    "0 68px 136px rgba(15, 23, 42, 0.40)",
  ],

  // ─── Spacing ───────────────────────────────────────────
  spacing: 8,

  // ─── Breakpoints ───────────────────────────────────────
  breakpoints: {
    values: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 },
  },

  // ─── Components Overrides ───────────────────────────────
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 500,
          fontFamily: "'DM Sans', '-apple-system', 'BlinkMacSystemFont', sans-serif",
          fontSize: "0.875rem",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": { transform: "translateY(-1px)" },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #1B6EF3 0%, #1B6EF3 100%)",
          color: "#FFFFFF",
          boxShadow: "0 4px 12px rgba(27, 110, 243, 0.3)",
          border: "1px solid transparent",
          "&:hover": {
            background: "linear-gradient(135deg, #0D4FD9 0%, #0D4FD9 100%)",
            boxShadow: "0 8px 24px rgba(27, 110, 243, 0.4)",
          },
          "&:active": { transform: "translateY(0)" },
          "&:disabled": { boxShadow: "none", opacity: 0.6 },
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #7C3AED 0%, #7C3AED 100%)",
          color: "#FFFFFF",
          boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
          "&:hover": {
            background: "linear-gradient(135deg, #6D28D9 0%, #6D28D9 100%)",
            boxShadow: "0 8px 24px rgba(124, 58, 237, 0.4)",
          },
        },
        outlinedPrimary: {
          borderColor: "#1B6EF3",
          color: "#1B6EF3",
          border: "1.5px solid #1B6EF3",
          background: "transparent",
          "&:hover": {
            background: "rgba(27, 110, 243, 0.05)",
            borderColor: "#0D4FD9",
            color: "#0D4FD9",
          },
        },
        outlinedSecondary: {
          borderColor: "#7C3AED",
          color: "#7C3AED",
          border: "1.5px solid #7C3AED",
          "&:hover": {
            background: "rgba(124, 58, 237, 0.05)",
            borderColor: "#6D28D9",
            color: "#6D28D9",
          },
        },
        outlined: {
          borderColor: "#E8EAED",
          color: "#0E0E10",
          border: "1px solid #E8EAED",
          backgroundColor: "#FFFFFF",
          "&:hover": {
            borderColor: "#1B6EF3",
            backgroundColor: "#F5FAFF",
          },
        },
        text: {
          color: "#1B6EF3",
          "&:hover": { background: "rgba(27, 110, 243, 0.08)" },
        },
        sizeSmall: { padding: "6px 14px", fontSize: "0.8125rem" },
        sizeMedium: { padding: "10px 20px", fontSize: "0.875rem" },
        sizeLarge: { padding: "12px 28px", fontSize: "0.9375rem" },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          background: "#FFFFFF",
          border: "1px solid #E8EAED",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            borderColor: "#1B6EF320",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: "12px",
          background: "#FFFFFF",
          border: "1px solid #E8EAED",
        },
        elevation0: { boxShadow: "none" },
        elevation1: { boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)", borderColor: "#E8EAED" },
        elevation2: { boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)" },
        elevation3: { boxShadow: "0 8px 16px rgba(15, 23, 42, 0.10)" },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #E8EAED",
          fontFamily: "'DM Sans', '-apple-system', 'BlinkMacSystemFont', sans-serif",
          fontSize: "0.875rem",
          padding: "14px 16px",
          color: "#0E0E10",
          transition: "background 0.2s ease",
        },
        head: {
          fontWeight: 600,
          fontSize: "0.75rem",
          color: "#6B7280",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          background: "#FAFBFC",
          borderBottom: "1px solid #E8EAED",
          padding: "12px 16px",
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background 0.15s ease",
          "&:hover": { background: "#F5FAFF", td: { background: "transparent" } },
          "&:last-child td": { borderBottom: "1px solid #E8EAED" },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'DM Sans', '-apple-system', 'BlinkMacSystemFont', sans-serif",
          fontWeight: 500,
          fontSize: "0.75rem",
          borderRadius: "6px",
          border: "1px solid transparent",
          transition: "all 0.2s ease",
          height: "24px",
        },
        filled: {
          background: "#F3F4F6",
          color: "#6B7280",
          "&:hover": { background: "#E5E7EB" },
        },
        colorPrimary: { background: "#EBF4FF", color: "#1B6EF3" },
        colorSecondary: { background: "#F3E8FF", color: "#7C3AED" },
        outlined: { border: "1px solid #E8EAED" },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          fontFamily: "'DM Sans', '-apple-system', 'BlinkMacSystemFont', sans-serif",
          fontSize: "0.875rem",
          transition: "all 0.2s ease",
          backgroundColor: "#FFFFFF",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E8EAED",
            transition: "all 0.2s ease",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1B6EF3" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1B6EF3",
            borderWidth: "1.5px",
            boxShadow: "0 0 0 3px rgba(27, 110, 243, 0.1)",
          },
          "&.Mui-disabled": { backgroundColor: "#F9FAFB", color: "#D1D5DB" },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": { borderColor: "#EF4444" },
        },
        input: { padding: "10px 14px", color: "#0E0E10" },
        multiline: { padding: "12px 14px" },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: "'DM Sans', '-apple-system', 'BlinkMacSystemFont', sans-serif",
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "#6B7280",
          transform: "translate(14px, -9px) scale(0.75)",
          "&.Mui-focused": { color: "#1B6EF3" },
          "&.Mui-error": { color: "#EF4444" },
        },
      },
    },

    MuiTextField: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
          },
        },
      },
    },

    MuiLink: {
      defaultProps: { underline: "hover" },
      styleOverrides: {
        root: {
          color: "#1B6EF3",
          fontWeight: 500,
          transition: "all 0.2s ease",
          "&:hover": { color: "#0D4FD9" },
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#E8EAED",
          backgroundColor: "transparent",
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: "#1F2937",
          color: "#FFFFFF",
          fontSize: "0.75rem",
          fontFamily: "'DM Sans', '-apple-system', 'BlinkMacSystemFont', sans-serif",
          fontWeight: 500,
          borderRadius: "6px",
          padding: "8px 12px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(4px)",
        },
        arrow: { color: "#1F2937" },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: {
          fontFamily: "'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', sans-serif",
          fontWeight: 600,
          fontSize: "0.875rem",
          background: "linear-gradient(135deg, #1B6EF3, #7C3AED)",
          color: "#FFFFFF",
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #E8EAED",
          minHeight: "48px",
        },
        indicator: {
          backgroundColor: "#1B6EF3",
          height: "2px",
          borderRadius: "1px",
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.875rem",
          color: "#6B7280",
          transition: "all 0.2s ease",
          padding: "12px 16px",
          minHeight: "48px",
          "&:hover": { color: "#0E0E10", background: "rgba(27, 110, 243, 0.04)" },
          "&.Mui-selected": { color: "#1B6EF3", fontWeight: 600 },
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: "8px",
          border: "1px solid #E8EAED",
          boxShadow: "0 10px 40px rgba(15, 23, 42, 0.2)",
          marginTop: "8px",
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: "'DM Sans', '-apple-system', 'BlinkMacSystemFont', sans-serif",
          fontSize: "0.875rem",
          color: "#0E0E10",
          transition: "all 0.15s ease",
          "&:hover": { background: "rgba(27, 110, 243, 0.08)" },
          "&.Mui-selected": {
            background: "rgba(27, 110, 243, 0.12)",
            color: "#1B6EF3",
            fontWeight: 500,
          },
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          borderRight: "1px solid #E8EAED",
        },
      },
    },

    MuiModal: {
      styleOverrides: {
        backdrop: { backdropFilter: "blur(4px)", backgroundColor: "rgba(0, 0, 0, 0.4)" },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "12px",
          border: "1px solid #E8EAED",
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.2)",
        },
      },
    },

    MuiCssBaseline: {
      styleOverrides: `
        *, *::before, *::after { box-sizing: border-box; }
        html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; overflow-y: scroll; }
        body {
          background: #FAFBFC;
          font-family: 'DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif;
          color: #0E0E10;
        }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #F3F4F6; }
        ::-webkit-scrollbar-thumb {
          background: #D1D5DB;
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        ::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
        a { color: #1B6EF3; text-decoration: none; transition: color 0.2s ease; }
        a:hover { color: #0D4FD9; }
      `,
    },
  },
});

export default muiTheme;