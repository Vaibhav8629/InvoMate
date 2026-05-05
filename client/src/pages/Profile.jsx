import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Stack,
  Divider,
  Tooltip,
  Avatar,
  Chip,
  useTheme,
} from "@mui/material";

import SignatureUpload from '../components/SignatureUpload';
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
          color: active
            ? theme.palette.primary.main
            : theme.palette.text.secondary,
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

// ─── Field Label ──────────────────────────────────────────────────────────────
const FieldLabel = ({ children }) => {
  const theme = useTheme();
  return (
    <Typography
      sx={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "0.72rem",
        fontWeight: 700,
        color: theme.palette.text.secondary,
        mb: "6px",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </Typography>
  );
};

// ─── ShopProfile ──────────────────────────────────────────────────────────────
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

  // ── Shared TextField sx ───────────────────────────────────────────────────
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.9rem",
      borderRadius: "10px",
      background: editing ? theme.palette.background.paper : theme.palette.background.default,
      transition: "background 0.18s ease",
      "& fieldset": {
        borderColor: theme.palette.divider,
      },
      "&:hover fieldset": {
        borderColor: editing ? theme.palette.primary.main : theme.palette.divider,
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
        borderWidth: "1.5px",
      },
      "&.Mui-disabled": {
        background: theme.palette.background.default,
        "& fieldset": { borderColor: theme.palette.divider },
      },
    },
    "& .MuiInputBase-input.Mui-disabled": {
      WebkitTextFillColor: theme.palette.text.primary,
      cursor: "default",
    },
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/auth/findprofile", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    await fetch(
      profileExist
        ? "http://localhost:5000/api/auth/updateprofile"
        : "http://localhost:5000/api/auth/createprofile",
      {
        method: profileExist ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

        {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
        <Box sx={{
          width: 72, flexShrink: 0, background: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          display: "flex", flexDirection: "column", alignItems: "center",
          py: "24px", gap: "8px", position: "sticky", top: 0, height: "100vh",
        }}>
          <Box onClick={() => navigate("/home")} sx={{
            width: 40, height: 40, borderRadius: "12px", background: theme.palette.primary.main,
            display: "flex", alignItems: "center", justifyContent: "center",
            mb: "16px", cursor: "pointer", boxShadow: "0 4px 12px rgba(27,110,243,0.35)",
          }}>
            <GridViewRoundedIcon sx={{ color: "#fff", fontSize: 20 }} />
          </Box>
          <NavItem icon={<GridViewRoundedIcon fontSize="small" />} label="Dashboard" onClick={() => navigate("/dashboard")} />
          <NavItem icon={<AddCircleOutlineIcon fontSize="small" />} label="New Invoice" onClick={() => navigate("/createbill")} />
          <NavItem icon={<ReceiptLongOutlinedIcon fontSize="small" />} label="Invoices" onClick={() => navigate("/invoices")} />
          <NavItem icon={<InventoryIcon fontSize="small" />} label="Products" onClick={() => navigate("/products")}  />
          <NavItem icon={<StorefrontOutlinedIcon fontSize="small" />} label="Profile" onClick={() => navigate("/profile")} active/>
          <Box sx={{ mt: "auto" }}>
            <NavItem icon={<LogoutIcon fontSize="small" />} label="Logout" onClick={handleLogout} />
          </Box>
        </Box>

        <Box sx={{ mt: "auto" }}>
          <NavItem
            icon={<LogoutIcon fontSize="small" />}
            label="Logout"
            onClick={handleLogout}
          />
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
              {/* Avatar */}
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
              <SignatureUpload />

              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                  {shopCode && (
                    <Chip
                      label={shopCode}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        background: theme.palette.primary.light,
                        color: theme.palette.primary.main,
                        height: 22,
                        borderRadius: "6px",
                      }}
                    />
                  )}
                </Box>
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
              <Stack direction="row" spacing={1.5}>
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
                    boxShadow: "0 4px 14px rgba(34,197,94,0.30)",
                    "&:hover": {
                      background: theme.palette.success.dark,
                      boxShadow: "0 6px 20px rgba(34,197,94,0.40)",
                    },
                  }}
                >
                  Save Changes
                </Button>
              </Stack>
            )}
          </Box>

          <Divider sx={{ borderColor: theme.palette.divider }} />

          {/* ── FORM ──────────────────────────────────────────────────── */}
          <Box sx={{ p: "32px" }}>

            {/* Section label */}
            <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "24px" }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  background: theme.palette.primary.light,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.palette.primary.main,
                }}
              >
                <BadgeOutlinedIcon fontSize="small" />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: theme.palette.text.primary,
                }}
              >
                Business Information
              </Typography>
              {editing && (
                <Chip
                  label="Editing"
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    background: theme.palette.warning.light,
                    color: theme.palette.warning.main,
                    height: 22,
                    borderRadius: "6px",
                    ml: "4px",
                  }}
                />
              )}
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: "20px",
              }}
            >
              {/* Shop Name */}
              <Box>
                <FieldLabel>Shop Name</FieldLabel>
                <TextField
                  fullWidth
                  value={name}
                  disabled={true}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter shop name"
                  sx={fieldSx}
                />
              </Box>

              {/* GST Number */}
              <Box>
                <FieldLabel>GST Number</FieldLabel>
                <TextField
                  fullWidth
                  value={GSTNum}
                  disabled={!editing}
                  onChange={(e) => setGSTNum(e.target.value)}
                  placeholder="Enter GST number"
                  sx={fieldSx}
                />
              </Box>

              {/* Shop Code */}
              <Box>
                <FieldLabel>Shop Code</FieldLabel>
                <TextField
                  fullWidth
                  value={shopCode}
                  disabled={!editing}
                  onChange={(e) => setShopCode(e.target.value)}
                  placeholder="Enter shop code"
                  sx={fieldSx}
                />
              </Box>

              {/* Phone */}
              <Box>
                <FieldLabel>Phone</FieldLabel>
                <TextField
                  fullWidth
                  value={phone}
                  disabled={!editing}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  InputProps={{
                    startAdornment: (
                      <PhoneOutlinedIcon
                        sx={{
                          fontSize: 18,
                          color: theme.palette.text.secondary,
                          mr: "8px",
                        }}
                      />
                    ),
                  }}
                  sx={fieldSx}
                />
              </Box>

              {/* Email */}
              <Box>
                <FieldLabel>Email</FieldLabel>
                <TextField
                  fullWidth
                  value={email}
                  disabled={true}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  InputProps={{
                    startAdornment: (
                      <EmailOutlinedIcon
                        sx={{
                          fontSize: 18,
                          color: theme.palette.text.secondary,
                          mr: "8px",
                        }}
                      />
                    ),
                  }}
                  sx={fieldSx}
                />
              </Box>

              {/* Pincode */}
              <Box>
                <FieldLabel>Pincode</FieldLabel>
                <TextField
                  fullWidth
                  value={pincode}
                  disabled={!editing}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter pincode"
                  sx={fieldSx}
                />
              </Box>

              {/* Address — full width */}
              <Box sx={{ gridColumn: "1 / -1" }}>
                <FieldLabel>Address</FieldLabel>
                <TextField
                  fullWidth
                  value={address}
                  disabled={!editing}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full address"
                  multiline
                  rows={2}
                  InputProps={{
                    startAdornment: (
                      <LocationOnOutlinedIcon
                        sx={{
                          fontSize: 18,
                          color: theme.palette.text.secondary,
                          mr: "8px",
                          alignSelf: "flex-start",
                          mt: "10px",
                        }}
                      />
                    ),
                  }}
                  sx={fieldSx}
                />
              </Box>
            </Box>

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