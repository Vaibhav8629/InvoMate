import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import { keyframes } from "@mui/system";

// ── Keyframes ──────────────────────────────────────────────────────────────
const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0);    }
`;

const floatUp = keyframes`
  0%, 100% { transform: translateY(0)     scale(1);    opacity: 0.5; }
  50%       { transform: translateY(-20px) scale(1.06); opacity: 0.9; }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const wobble = keyframes`
  0%, 100% { transform: rotate(-1.2deg) translateY(0);    }
  50%       { transform: rotate( 1.2deg) translateY(-8px); }
`;

const orbitSpin = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg);   }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0  0  0 rgba(27,110,243,0);       }
  50%       { box-shadow: 0 0 28px 8px rgba(27,110,243,0.22); }
`;

// ── Ambient particle ──────────────────────────────────────────────────────
const Particle = ({ size, top, left, right, bottom, delay, duration }) => (
  <Box
    component="span"
    aria-hidden="true"
    sx={{
      position: "absolute",
      borderRadius: "50%",
      width: size,
      height: size,
      background: "rgba(27,110,243,0.10)",
      top, left, right, bottom,
      animation: `${floatUp} ${duration} ease-in-out infinite`,
      animationDelay: delay,
      pointerEvents: "none",
    }}
  />
);

// ── Nav links ─────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Profile",  href: "/profile" },
  { label: "Inventory",   href: "/products" },
  { label: "Invoices",   href: "/invoices" },
];

// ── SVG wrappers ──────────────────────────────────────────────────────────
const HomeIcon = () => (
  <Box component="svg" width={17} height={17} viewBox="0 0 24 24" fill="currentColor" sx={{ display: "block" }}>
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </Box>
);

const BackIcon = () => (
  <Box component="svg" width={17} height={17} viewBox="0 0 24 24" fill="currentColor" sx={{ display: "block" }}>
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </Box>
);

const InfoIcon = () => (
  <Box component="svg" width={24} height={24} viewBox="0 0 24 24" fill="none" sx={{ display: "block" }}>
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
      fill="#1B6EF3"
    />
  </Box>
);

// ── Main component ────────────────────────────────────────────────────────
export default function NotFound404() {
  const [mounted, setMounted] = useState(false);
  const [mouse, setMouse]     = useState({ x: 0, y: 0 });
  const wrapRef               = useRef(null);

  useEffect(() => {
    setMounted(true);
    const onMove = (e) => {
      if (!wrapRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      setMouse({
        x: ((e.clientX - r.left) / r.width  - 0.5) * 18,
        y: ((e.clientY - r.top)  / r.height - 0.5) * 18,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    // ── Page wrapper ───────────────────────────────────────────────────────
    <Box
      ref={wrapRef}
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden",
        px: 3,
        py: 6,
        backgroundImage: `
          linear-gradient(rgba(27,110,243,0.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(27,110,243,0.045) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(27,110,243,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        },
      }}
    >
      {/* Ambient particles */}
      <Particle size={80}  top="7%"    left="5%"    delay="0s"    duration="7s" />
      <Particle size={40}  top="14%"   right="9%"   delay="1s"    duration="5s" />
      <Particle size={112} bottom="10%" left="3%"   delay="2s"    duration="9s" />
      <Particle size={56}  bottom="18%" right="6%"  delay="0.5s"  duration="6s" />
      <Particle size={22}  top="42%"   left="1.5%"  delay="1.5s"  duration="8s" />
      <Particle size={44}  top="62%"   right="2.5%" delay="3s"    duration="7s" />

      {/* ── Card ───────────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          zIndex: 10,
          maxWidth: 520,
          width: "100%",
          textAlign: "center",
          px: { xs: 3.5, sm: 7 },
          pt: { xs: 6, sm: 8 },
          pb: { xs: 5, sm: 7 },
          borderRadius: "24px",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 20px 64px rgba(15,28,46,0.11), 0 4px 16px rgba(15,28,46,0.06)",
          animation: `${fadeSlideUp} 0.65s cubic-bezier(0.22,1,0.36,1) both`,
          animationDelay: "0.05s",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0, left: "50%",
            transform: "translateX(-50%)",
            width: 200,
            height: 2,
            background: "linear-gradient(90deg, transparent, #1B6EF3, transparent)",
            borderRadius: "0 0 4px 4px",
          },
          transform: mounted
            ? `perspective(900px) rotateX(${-mouse.y * 0.28}deg) rotateY(${mouse.x * 0.28}deg)`
            : "none",
          transition: "transform 0.1s ease-out",
        }}
      >

        {/* ── 404 Hero ─────────────────────────────────────────────────────── */}
        <Box component="span" sx={{ position: "relative", display: "inline-block", mb: 1 }}>

          {/* Orbit ring */}
          <Box
            component="span"
            aria-hidden="true"
            sx={{
              position: "absolute",
              top: "50%", left: "50%",
              width: 210, height: 210,
              borderRadius: "50%",
              border: "1.5px dashed rgba(27,110,243,0.20)",
              animation: `${orbitSpin} 14s linear infinite`,
              "&::before": {
                content: '""',
                position: "absolute",
                top: -5, left: "50%",
                transform: "translateX(-50%)",
                width: 10, height: 10,
                borderRadius: "50%",
                bgcolor: "#1B6EF3",
                boxShadow: "0 0 8px rgba(27,110,243,0.7)",
              },
            }}
          />

          {/* Drop-shadow number */}
          <Typography
            component="span"
            aria-hidden="true"
            sx={{
              position: "absolute",
              top: 4, left: 4,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(100px, 18vw, 144px)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: "rgba(27,110,243,0.08)",
              userSelect: "none",
              zIndex: 1,
            }}
          >
            404
          </Typography>

          {/* Gradient number */}
          <Typography
            component="span"
            aria-label="404"
            sx={{
              position: "relative",
              zIndex: 2,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(100px, 18vw, 144px)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              background:
                "linear-gradient(135deg, #1B6EF3 0%, #3B82F6 40%, #155DD6 75%, #7C3AED 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: `${shimmer} 4s linear infinite, ${wobble} 5s ease-in-out infinite`,
              display: "inline-block",
            }}
          >
            404
          </Typography>
        </Box>

        {/* ── Info icon ──────────────────────────────────────────────────────── */}
        <Stack alignItems="center" sx={{ mt: 1.5 }}>
          <Box
            component="span"
            sx={{
              width: 52, height: 52,
              borderRadius: "14px",
              bgcolor: "primary.light",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              animation: `${glowPulse} 3s ease-in-out infinite`,
            }}
          >
            <InfoIcon />
          </Box>
        </Stack>

        {/* Accent divider */}
        <Box
          component="span"
          sx={{
            display: "block",
            width: 40, height: 3,
            mx: "auto",
            mt: 2.5, mb: 3,
            borderRadius: "999px",
            background: "linear-gradient(90deg, #1B6EF3, #7C3AED)",
            animation: `${fadeSlideUp} 0.6s cubic-bezier(0.22,1,0.36,1) both`,
            animationDelay: "0.28s",
          }}
        />

        {/* ── Copy ───────────────────────────────────────────────────────────── */}
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "text.primary",
            animation: `${fadeSlideUp} 0.6s cubic-bezier(0.22,1,0.36,1) both`,
            animationDelay: "0.33s",
          }}
        >
          Page not found
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            mt: 1.25, mb: 4,
            lineHeight: 1.7,
            animation: `${fadeSlideUp} 0.6s cubic-bezier(0.22,1,0.36,1) both`,
            animationDelay: "0.4s",
          }}
        >
          The URL might be misspelled, or this page may have been moved or
          deleted. Let's get you back on track.
        </Typography>

        {/* ── CTA buttons ──────────────────────────────────────────────────── */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="center"
          sx={{
            animation: `${fadeSlideUp} 0.6s cubic-bezier(0.22,1,0.36,1) both`,
            animationDelay: "0.47s",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            href="/home"
            startIcon={<HomeIcon />}
            sx={{
              px: 3, py: 1.35,
              fontSize: "0.875rem",
              borderRadius: "10px",
              boxShadow: "0 4px 14px rgba(27,110,243,0.38)",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(27,110,243,0.48)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Go Home
          </Button>

          <Button
            variant="outlined"
            onClick={() => window.history.back()}
            startIcon={<BackIcon />}
            sx={{
              px: 3, py: 1.35,
              fontSize: "0.875rem",
              borderRadius: "10px",
              borderColor: "divider",
              color: "text.primary",
              "&:hover": {
                borderColor: "primary.main",
                color: "primary.main",
                bgcolor: "primary.light",
                transform: "translateY(-2px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Go Back
          </Button>
        </Stack>

        {/* ── Quick-link chips ─────────────────────────────────────────────── */}
        <Box
          component="nav"
          aria-label="Quick links"
          sx={{
            mt: 4, pt: 3,
            borderTop: "1px solid",
            borderColor: "divider",
            animation: `${fadeSlideUp} 0.6s cubic-bezier(0.22,1,0.36,1) both`,
            animationDelay: "0.54s",
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: "text.secondary", mb: 1.5, display: "block" }}
          >
            Quick Links
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            flexWrap="wrap"
            useFlexGap
          >
            {NAV_LINKS.map(({ label, href }) => (
              <Chip
                key={label}
                label={label}
                component="a"
                href={href}
                clickable
                size="small"
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  bgcolor: "background.default",
                  border: "1px solid",
                  borderColor: "divider",
                  color: "text.secondary",
                  borderRadius: "6px",
                  height: 30,
                  "& .MuiChip-label": { px: 1.5 },
                  "&:hover": {
                    bgcolor: "primary.light",
                    borderColor: "primary.main",
                    color: "primary.main",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.18s ease",
                }}
              />
            ))}
          </Stack>
        </Box>

      </Paper>
    </Box>
  );
}