import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Tooltip,
  Avatar,
  IconButton,
  useTheme,
  Grid,
  Divider,
  Chip,
} from "@mui/material";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import TagOutlinedIcon from "@mui/icons-material/TagOutlined";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";

// ─── Sidebar Nav Item ──────────────────────────────────────────────────────────
const NavItem = ({ icon, label, onClick, active = false }) => {
  const theme = useTheme();
  return (
    <Tooltip title={label} placement="right" arrow>
      <Box
        onClick={onClick}
        sx={{
          width: 44,
          height: 44,
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: active ? theme.palette.primary.main : theme.palette.text.secondary,
          background: active ? theme.palette.primary.light : "transparent",
          transition: "all 0.18s ease",
          "&:hover": {
            background: theme.palette.primary.light,
            color: theme.palette.primary.main,
          },
        }}
      >
        {icon}
      </Box>
    </Tooltip>
  );
};

// ─── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, description }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        mb: 3,
        pb: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "10px",
          background: theme.palette.primary.light,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.palette.primary.main,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: "0.9rem",
            color: theme.palette.text.primary,
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: theme.palette.text.secondary,
              mt: "2px",
            }}
          >
            {description}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// ─── Field Component ───────────────────────────────────────────────────────────
const Field = ({
  icon,
  label,
  value,
  disabled,
  onChange,
  multiline = false,
  readOnly = false,
}) => {
  const theme = useTheme();

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: 0.75 }}>
        <Box
          sx={{
            color: theme.palette.text.disabled,
            display: "flex",
            alignItems: "center",
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 15 } })}
        </Box>
        <Typography
          sx={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: theme.palette.text.secondary,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {label}
        </Typography>
        {readOnly && (
          <Chip
            label="auto"
            size="small"
            sx={{
              height: 16,
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              background: theme.palette.action.hover,
              color: theme.palette.text.disabled,
              ml: 0.5,
              "& .MuiChip-label": { px: "6px" },
            }}
          />
        )}
      </Box>
      <TextField
        fullWidth
        value={value}
        disabled={disabled || readOnly}
        onChange={onChange}
        multiline={multiline}
        rows={multiline ? 3 : 1}
        size="small"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            background: readOnly
              ? theme.palette.action.hover
              : theme.palette.background.default,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.9rem",
            fontWeight: 600,
            "& fieldset": {
              borderColor: theme.palette.divider,
            },
            "&:hover fieldset": {
              borderColor:
                disabled || readOnly
                  ? theme.palette.divider
                  : theme.palette.primary.main,
            },
            "&.Mui-focused fieldset": {
              borderColor: theme.palette.primary.main,
              borderWidth: "1.5px",
            },
            "&.Mui-disabled": {
              "& fieldset": { borderColor: theme.palette.divider },
            },
          },
          "& .MuiInputBase-input.Mui-disabled": {
            WebkitTextFillColor: readOnly
              ? theme.palette.text.disabled
              : theme.palette.text.primary,
          },
        }}
      />
    </Box>
  );
};

// ─── Main Profile Component ────────────────────────────────────────────────────
const ShopProfile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logoutUser, user } = useAuth();

  const [profileExist, setProfileExist] = useState(false);
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("");
  const [GSTNum, setGSTNum] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pincode, setPincode] = useState("");
  const [shopCode, setShopCode] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/findprofile`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setName(user?.username || data.ShopName || "");
      setGSTNum(data.GSTNumber ?? "");
      setAddress(data.Address ?? "");
      setPhone(data.Phone ?? "");
      setEmail(data.email || "");
      setPincode(data.Pincode ?? "");
      setShopCode(data.ShopCode ?? "");
      setProfileExist(true);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSave = async () => {
    try {
      await fetch(
        profileExist
          ? `${import.meta.env.VITE_API_URL}/api/auth/updateprofile`
          : `${import.meta.env.VITE_API_URL}/api/auth/createprofile`,
        {
          method: profileExist ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ShopName: name,
            GSTNumber: GSTNum,
            Address: address,
            Phone: phone,
            Email: email,
            Pincode: pincode,
            ShopCode: shopCode,
          }),
        }
      );
      setEditing(false);
      fetchData();
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: theme.palette.background.default,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          width: 72,
          flexShrink: 0,
          background: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: "24px",
          gap: "8px",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <Box
          onClick={() => navigate("/home")}
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            background: theme.palette.primary.main,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: "16px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(27,110,243,0.35)",
          }}
        >
          <GridViewRoundedIcon sx={{ color: "#fff", fontSize: 20 }} />
        </Box>
        <NavItem icon={<AddCircleOutlineIcon fontSize="small" />} label="New Invoice" onClick={() => navigate("/createbill")} />
        <NavItem icon={<ReceiptLongOutlinedIcon fontSize="small" />} label="Invoices" onClick={() => navigate("/invoices")} />
        <NavItem icon={<InventoryIcon fontSize="small" />} label="Products" onClick={() => navigate("/products")} />
        <NavItem icon={<StorefrontOutlinedIcon fontSize="small" />} label="Profile" onClick={() => navigate("/profile")} active />
        <Box sx={{ mt: "auto" }}>
          <NavItem icon={<LogoutIcon fontSize="small" />} label="Logout" onClick={handleLogout} />
        </Box>
      </Box>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, p: "32px", overflow: "auto" }}>

        {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: "28px",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "1.4rem",
                fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: theme.palette.text.primary,
                lineHeight: 1.2,
              }}
            >
              Shop Profile
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, mt: "4px", fontWeight: 500 }}
            >
              Manage your shop details and business information
            </Typography>
          </Box>

          {/* Action Buttons — top right */}
          {!editing ? (
            <Button
              startIcon={<EditOutlinedIcon />}
              onClick={() => setEditing(true)}
              variant="contained"
              sx={{
                textTransform: "none",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                borderRadius: "10px",
                px: "20px",
                background: theme.palette.primary.main,
                boxShadow: "0 4px 14px rgba(27,110,243,0.25)",
                "&:hover": {
                  background: theme.palette.primary.dark,
                  boxShadow: "0 6px 20px rgba(27,110,243,0.35)",
                },
              }}
            >
              Edit Profile
            </Button>
          ) : (
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                startIcon={<CloseOutlinedIcon />}
                onClick={() => { setEditing(false); fetchData(); }}
                variant="outlined"
                sx={{
                  textTransform: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  borderRadius: "10px",
                  px: "18px",
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    borderColor: theme.palette.text.secondary,
                    background: theme.palette.background.default,
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                startIcon={<SaveOutlinedIcon />}
                onClick={handleSave}
                variant="contained"
                sx={{
                  textTransform: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  borderRadius: "10px",
                  px: "20px",
                  background: theme.palette.success.main,
                  boxShadow: "0 4px 14px rgba(34,197,94,0.25)",
                  "&:hover": {
                    background: theme.palette.success.dark,
                    boxShadow: "0 6px 20px rgba(34,197,94,0.35)",
                  },
                }}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </Box>

        {/* ── IDENTITY CARD ───────────────────────────────────────────── */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "16px",
            border: `1px solid ${theme.palette.divider}`,
            mb: "20px",
            overflow: "hidden",
            background: theme.palette.background.paper,
          }}
        >
          {/* Thin accent bar */}
          <Box
            sx={{
              height: 4,
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, #60A5FA 100%)`,
            }}
          />
          <Box
            sx={{
              p: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: theme.palette.primary.main,
                color: "#fff",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: "1.3rem",
                boxShadow: "0 4px 14px rgba(27,110,243,0.28)",
              }}
            >
              {name ? name.charAt(0).toUpperCase() : "S"}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color: theme.palette.text.primary,
                  lineHeight: 1.2,
                }}
              >
                {name || "Shop Name"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, mt: "3px", fontWeight: 500 }}
              >
                {email || "Email not set"}
              </Typography>
            </Box>
            {GSTNum && (
              <Chip
                icon={<BadgeOutlinedIcon sx={{ fontSize: "14px !important" }} />}
                label={`GST: ${GSTNum}`}
                size="small"
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  background: theme.palette.primary.light,
                  color: theme.palette.primary.main,
                  border: `1px solid ${theme.palette.primary.light}`,
                }}
              />
            )}
          </Box>
        </Paper>

        {/* ── BUSINESS INFO CARD ──────────────────────────────────────── */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "16px",
            border: `1px solid ${theme.palette.divider}`,
            mb: "20px",
            background: theme.palette.background.paper,
            p: "24px",
          }}
        >
          <SectionHeader
            icon={<BusinessOutlinedIcon sx={{ fontSize: 18 }} />}
            title="Business Information"
            description="Legal and tax details for your shop"
          />

          <Grid container spacing={3}>
            {/* Shop Name — read only */}
            <Grid item xs={12} sm={6}>
              <Field
                icon={<StorefrontOutlinedIcon />}
                label="Shop Name"
                value={name}
                disabled
                readOnly
              />
            </Grid>
            {/* GST Number */}
            <Grid item xs={12} sm={6}>
              <Field
                icon={<BadgeOutlinedIcon />}
                label="GST Number"
                value={GSTNum}
                disabled={!editing}
                onChange={(e) => setGSTNum(e.target.value)}
              />
            </Grid>
            {/* Pincode */}
            <Grid item xs={12} sm={6}>
              <Field
                icon={<LocationOnOutlinedIcon />}
                label="Pincode"
                value={pincode}
                disabled={!editing}
                onChange={(e) => setPincode(e.target.value)}
              />
            </Grid>
            {/* Address — full width */}
            <Grid item xs={12}>
              <Field
                icon={<LocationOnOutlinedIcon />}
                label="Business Address"
                value={address}
                disabled={!editing}
                onChange={(e) => setAddress(e.target.value)}
                multiline
              />
            </Grid>
          </Grid>
        </Paper>

        {/* ── CONTACT INFO CARD ───────────────────────────────────────── */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "16px",
            border: `1px solid ${theme.palette.divider}`,
            mb: "20px",
            background: theme.palette.background.paper,
            p: "24px",
          }}
        >
          <SectionHeader
            icon={<ContactMailOutlinedIcon sx={{ fontSize: 18 }} />}
            title="Contact Details"
            description="How customers and vendors can reach you"
          />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Field
                icon={<PhoneOutlinedIcon />}
                label="Phone Number"
                value={phone}
                disabled={!editing}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Field
                icon={<EmailOutlinedIcon />}
                label="Email Address"
                value={email}
                disabled
                readOnly
              />
            </Grid>
          </Grid>
        </Paper>

        {/* ── IDENTIFIERS CARD ────────────────────────────────────────── */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "16px",
            border: `1px solid ${theme.palette.divider}`,
            background: theme.palette.background.paper,
            p: "24px",
          }}
        >
          <SectionHeader
            icon={<TagOutlinedIcon sx={{ fontSize: 18 }} />}
            title="Shop Identifiers"
            description="System codes used for invoicing and tracking"
          />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Field
                icon={<QrCode2OutlinedIcon />}
                label="Shop Code"
                value={shopCode}
                disabled={!editing}
                onChange={(e) => setShopCode(e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* ── HINT BAR ────────────────────────────────────────────────── */}
        {!editing && (
          <Box
            sx={{
              mt: "20px",
              p: "12px 18px",
              borderRadius: "10px",
              background: theme.palette.primary.light,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <EditOutlinedIcon sx={{ fontSize: 15, color: theme.palette.primary.main }} />
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 500,
                color: theme.palette.primary.main,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Click <strong>Edit Profile</strong> at the top to update your shop details. Fields marked <strong>auto</strong> are managed by the system.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ShopProfile;