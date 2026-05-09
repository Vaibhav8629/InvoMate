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

// ─── Input Card Component ──────────────────────────────────────────────────────
const InputCard = ({ icon, label, value, disabled, onChange, onEdit, multiline = false }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ position: "relative" }}>
      {/* Icon */}
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "14px",
          background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.palette.primary.main,
          mb: 2,
        }}
      >
        {icon}
      </Box>
      
      {/* Label */}
      <Typography
        sx={{
          fontSize: "0.75rem",
          fontWeight: 700,
          color: theme.palette.text.secondary,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          mb: 1,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {label}
      </Typography>
      
      {/* Input with Edit Button */}
      <Box sx={{ position: "relative" }}>
        <TextField
          fullWidth
          value={value}
          disabled={disabled}
          onChange={onChange}
          multiline={multiline}
          rows={multiline ? 2 : 1}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "16px",
              background: theme.palette.background.default,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "1rem",
              fontWeight: 600,
              pr: onEdit ? "50px" : "16px",
              "& fieldset": {
                borderColor: theme.palette.divider,
              },
              "&:hover fieldset": {
                borderColor: disabled ? theme.palette.divider : theme.palette.primary.main,
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.palette.primary.main,
                borderWidth: "1.5px",
              },
              "&.Mui-disabled": {
                "& fieldset": {
                  borderColor: theme.palette.divider,
                },
              },
            },
            "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: theme.palette.text.primary,
            },
          }}
        />
        {onEdit && (
          <Tooltip title={`Edit ${label}`}>
            <IconButton
              onClick={onEdit}
              sx={{
                position: "absolute",
                right: 8,
                top: multiline ? 8 : "50%",
                transform: multiline ? "none" : "translateY(-50%)",
                width: 36,
                height: 36,
                background: theme.palette.primary.light,
                color: theme.palette.primary.main,
                "&:hover": {
                  background: theme.palette.primary.main,
                  color: "#fff",
                },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
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

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/findprofile`, {
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setName(user?.username || data.ShopName || "");
      setGSTNum(data.GSTNumber ?? "");
      setAddress(data.Address ?? "");
      setPhone(data.Phone ?? "");
      setEmail(user?.email || data.Email || "");
      setPincode(data.Pincode ?? "");
      setShopCode(data.ShopCode ?? "");
      setProfileExist(true);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      await fetch(
        profileExist
          ? `${import.meta.env.VITE_API_URL}/api/auth/updateprofile`
          : `${import.meta.env.VITE_API_URL}/api/auth/createprofile`,
        {
          method: profileExist ? "PUT" : "POST",
          credentials: 'include',
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

  // ── Render ────────────────────────────────────────────────────────────────
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
        {/* Page title */}
        <Box sx={{ mb: "28px" }}>
          <Typography
            sx={{
              fontSize: "1.5rem",
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

        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
            background: theme.palette.background.paper,
          }}
        >
          {/* ── BANNER ────────────────────────────────────────────────── */}
          <Box
            sx={{
              height: 110,
              background: `linear-gradient(120deg, ${theme.palette.primary.main} 0%, #60A5FA 60%, #93C5FD 100%)`,
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                inset: 0,
                background:
                  "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 12px)",
              },
            }}
          />

          {/* ── PROFILE HEADER ────────────────────────────────────────── */}
          <Box
            sx={{
              px: "32px",
              pt: "20px",
              pb: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  background: theme.palette.primary.main,
                  color: "#fff",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  boxShadow: "0 4px 16px rgba(27,110,243,0.30)",
                  border: `3px solid ${theme.palette.background.paper}`,
                  mt: "-44px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {name ? name.charAt(0).toUpperCase() : "S"}
              </Avatar>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: "1.15rem",
                    color: theme.palette.text.primary,
                  }}
                >
                  {name || "Shop Name"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary, mt: "2px" }}
                >
                  {email || "Email not set"}
                </Typography>
              </Box>
            </Box>

            {/* Action buttons */}
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
                  boxShadow: "0 4px 14px rgba(27,110,243,0.30)",
                  "&:hover": {
                    background: theme.palette.primary.dark,
                    boxShadow: "0 6px 20px rgba(27,110,243,0.40)",
                  },
                }}
              >
                Edit Profile
              </Button>
            ) : (
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button
                  startIcon={<CloseOutlinedIcon />}
                  onClick={() => {
                    setEditing(false);
                    fetchData();
                  }}
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
                    boxShadow: "0 4px 14px rgba(34,197,94,0.30)",
                    "&:hover": {
                      background: theme.palette.success.dark,
                      boxShadow: "0 6px 20px rgba(34,197,94,0.40)",
                    },
                  }}
                >
                  Save Changes
                </Button>
              </Box>
            )}
          </Box>

          {/* ── FORM CARDS ──────────────────────────────────────────────── */}
          <Box sx={{ p: "32px" }}>
            <Typography
              sx={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: theme.palette.text.primary,
                mb: 3,
              }}
            >
              Business Information
            </Typography>

            {/* Row 1: Shop Name + GST Number */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <InputCard
                  icon={<StorefrontOutlinedIcon sx={{ fontSize: 24 }} />}
                  label="Shop Name"
                  value={name}
                  disabled={true}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <InputCard
                  icon={<BadgeOutlinedIcon sx={{ fontSize: 24 }} />}
                  label="GST Number"
                  value={GSTNum}
                  disabled={!editing}
                  onChange={(e) => setGSTNum(e.target.value)}
                  onEdit={editing ? null : () => setEditing(true)}
                />
              </Grid>
            </Grid>

            {/* Row 2: Phone + Email */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <InputCard
                  icon={<PhoneOutlinedIcon sx={{ fontSize: 24 }} />}
                  label="Phone Number"
                  value={phone}
                  disabled={!editing}
                  onChange={(e) => setPhone(e.target.value)}
                  onEdit={editing ? null : () => setEditing(true)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <InputCard
                  icon={<EmailOutlinedIcon sx={{ fontSize: 24 }} />}
                  label="Email Address"
                  value={email}
                  disabled={true}
                />
              </Grid>
            </Grid>

            {/* Row 3: Shop Code + Pincode */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <InputCard
                  icon={<QrCode2OutlinedIcon sx={{ fontSize: 24 }} />}
                  label="Shop Code"
                  value={shopCode}
                  disabled={!editing}
                  onChange={(e) => setShopCode(e.target.value)}
                  onEdit={editing ? null : () => setEditing(true)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <InputCard
                  icon={<LocationOnOutlinedIcon sx={{ fontSize: 24 }} />}
                  label="Pincode"
                  value={pincode}
                  disabled={!editing}
                  onChange={(e) => setPincode(e.target.value)}
                  onEdit={editing ? null : () => setEditing(true)}
                />
              </Grid>
            </Grid>

            {/* Row 4: Address (Full Width) */}
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <InputCard
                  icon={<LocationOnOutlinedIcon sx={{ fontSize: 24 }} />}
                  label="Business Address"
                  value={address}
                  disabled={!editing}
                  onChange={(e) => setAddress(e.target.value)}
                  onEdit={editing ? null : () => setEditing(true)}
                  multiline={true}
                />
              </Grid>
            </Grid>

            {/* Footer info bar */}
            {!editing && (
              <Box
                sx={{
                  mt: "28px",
                  p: "14px 20px",
                  borderRadius: "12px",
                  background: theme.palette.primary.light,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <EditOutlinedIcon
                  sx={{ fontSize: 16, color: theme.palette.primary.main }}
                />
                <Typography
                  sx={{
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    color: theme.palette.primary.main,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Click <strong>Edit Profile</strong> to update your shop details.
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ShopProfile;
