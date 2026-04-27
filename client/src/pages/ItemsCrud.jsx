import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Typography, Button, Stack, TextField,
  Chip, Tooltip, IconButton, InputAdornment, Paper,
  LinearProgress, Avatar, Skeleton, useTheme, Snackbar, Alert,
  Dialog, DialogContent,
} from "@mui/material";

import TrendingUpIcon           from "@mui/icons-material/TrendingUp";
import EditIcon                 from "@mui/icons-material/Edit";
import DeleteIcon               from "@mui/icons-material/Delete";
import AddIcon                  from "@mui/icons-material/Add";
import CloseIcon                from "@mui/icons-material/Close";
import InventoryIcon            from "@mui/icons-material/Inventory2Outlined";
import SaveOutlinedIcon         from "@mui/icons-material/SaveOutlined";
import CurrencyRupeeIcon        from "@mui/icons-material/CurrencyRupee";
import PercentIcon              from "@mui/icons-material/Percent";
import QrCodeOutlinedIcon       from "@mui/icons-material/QrCodeOutlined";
import DownloadIcon             from "@mui/icons-material/Download";
import ReceiptLongOutlinedIcon  from "@mui/icons-material/ReceiptLongOutlined";
import CategoryOutlinedIcon     from "@mui/icons-material/CategoryOutlined";
import LayersOutlinedIcon       from "@mui/icons-material/LayersOutlined";
import SearchIcon               from "@mui/icons-material/Search";
import GridViewRoundedIcon      from "@mui/icons-material/GridViewRounded";
import StorefrontOutlinedIcon   from "@mui/icons-material/StorefrontOutlined";
import LogoutIcon               from "@mui/icons-material/Logout";
import AddCircleOutlineIcon     from "@mui/icons-material/AddCircleOutline";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlineIcon   from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon         from "@mui/icons-material/ErrorOutline";
import TagOutlinedIcon          from "@mui/icons-material/TagOutlined";
import LocalOfferOutlinedIcon   from "@mui/icons-material/LocalOfferOutlined";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";

// ─── Sidebar Nav Item ──────────────────────────────────────────────────────────
const NavItem = ({ icon, label, onClick, active = false }) => {
  const theme = useTheme();
  return (
    <Tooltip title={label} placement="right" arrow>
      <Box onClick={onClick} sx={{
        width: 44, height: 44, borderRadius: "12px",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        color: active ? theme.palette.primary.main : theme.palette.text.secondary,
        background: active ? theme.palette.primary.light : "transparent",
        transition: "all 0.18s ease",
        "&:hover": { background: theme.palette.primary.light, color: theme.palette.primary.main },
      }}>
        {icon}
      </Box>
    </Tooltip>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, bg, iconColor }) => {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{
      border: `1px solid ${theme.palette.divider}`, borderRadius: "16px", p: "18px",
      background: theme.palette.background.paper,
      display: "flex", alignItems: "center", gap: "14px",
      transition: "all 0.20s ease",
      "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(15,28,46,0.10)" },
    }}>
      <Box sx={{ width: 46, height: 46, borderRadius: "12px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: iconColor, flexShrink: 0 }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.5rem", fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.1 }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: "0.78rem", color: theme.palette.text.secondary, fontWeight: 500, mt: "2px" }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
};

// ─── Product Card ──────────────────────────────────────────────────────────────
const ProductCard = ({ p, onEdit, onDelete, maxStock }) => {
  const theme = useTheme();
  const stock = Number(p.Stock);
  const stockPct = maxStock > 0 ? Math.min((stock / maxStock) * 100, 100) : 0;

  const stockConfig =
    stock > 20
      ? { label: "In Stock",  bg: theme.palette.success.light, color: theme.palette.success.dark,  bar: theme.palette.success.main,  icon: <CheckCircleOutlineIcon sx={{ fontSize: 11 }} /> }
      : stock > 5
      ? { label: "Low Stock", bg: theme.palette.warning.light, color: theme.palette.warning.dark,  bar: theme.palette.warning.main,  icon: <WarningAmberOutlinedIcon sx={{ fontSize: 11 }} /> }
      : { label: "Critical",  bg: theme.palette.error.light,   color: theme.palette.error.main,    bar: theme.palette.error.main,    icon: <ErrorOutlineIcon sx={{ fontSize: 11 }} /> };

  const stripColors = [
    theme.palette.primary.main, theme.palette.info.main,
    "#7C3AED", "#DB2777", theme.palette.success.main, "#EA580C",
  ];
  let h = 0;
  for (let i = 0; i < (p.item?.length ?? 0); i++) h = p.item.charCodeAt(i) + ((h << 5) - h);
  const accent = stripColors[Math.abs(h) % stripColors.length];

  const catPalette = [
    { bg: theme.palette.primary.light, color: theme.palette.primary.main },
    { bg: theme.palette.success.light, color: theme.palette.success.dark },
    { bg: theme.palette.info.light,    color: theme.palette.info.dark },
    { bg: theme.palette.warning.light, color: theme.palette.warning.dark },
    { bg: "#EDE9FE", color: "#7C3AED" },
    { bg: "#FCE7F3", color: "#DB2777" },
  ];
  let hc = 0;
  for (let i = 0; i < (p.category?.length ?? 0); i++) hc = p.category.charCodeAt(i) + ((hc << 5) - hc);
  const cat = catPalette[Math.abs(hc) % catPalette.length];

  return (
    <Paper elevation={0} sx={{
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: "18px",
      background: theme.palette.background.paper,
      overflow: "hidden",
      display: "flex", flexDirection: "column",
      transition: "all 0.22s ease",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 16px 40px rgba(15,28,46,0.12)",
        borderColor: `${accent}55`,
      },
    }}>
      <Box sx={{ height: 5, background: `linear-gradient(90deg, ${accent}, ${accent}70)` }} />
      <Box sx={{ px: "18px", pt: "16px", pb: "12px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
          <Avatar sx={{
            width: 44, height: 44, borderRadius: "12px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900, fontSize: "1.1rem",
            background: `${accent}18`, color: accent, flexShrink: 0,
            border: `1.5px solid ${accent}30`,
          }}>
            {p.item?.[0]?.toUpperCase() ?? "?"}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: "0.9rem",
              color: theme.palette.text.primary, lineHeight: 1.25,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140,
            }}>
              {p.item}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px", mt: "3px" }}>
              <TagOutlinedIcon sx={{ fontSize: 10, color: theme.palette.text.disabled }} />
              <Typography sx={{ fontSize: "0.67rem", fontFamily: "'JetBrains Mono', monospace", color: theme.palette.text.secondary, fontWeight: 600 }}>
                {p.item_code}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Chip label={p.category} size="small" sx={{
          fontWeight: 700, fontSize: "0.67rem",
          background: cat.bg, color: cat.color,
          height: 20, borderRadius: "5px", flexShrink: 0,
        }} />
      </Box>

      <Box sx={{ mx: "18px", height: "1px", background: theme.palette.divider }} />

      <Box sx={{ px: "18px", py: "14px", display: "flex", gap: "10px" }}>
        <Box sx={{ flex: 1, borderRadius: "10px", background: theme.palette.background.default, border: `1px solid ${theme.palette.divider}`, p: "10px 12px" }}>
          <Typography sx={{ fontSize: "0.63rem", fontWeight: 700, color: theme.palette.text.secondary, textTransform: "uppercase", letterSpacing: "0.06em", mb: "4px" }}>Price</Typography>
          <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: "1.05rem", color: theme.palette.text.primary }}>
            ₹{Number(p.price).toLocaleString("en-IN")}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, borderRadius: "10px", background: theme.palette.success.light, border: `1px solid ${theme.palette.success.main}33`, p: "10px 12px" }}>
          <Typography sx={{ fontSize: "0.63rem", fontWeight: 700, color: theme.palette.success.dark, textTransform: "uppercase", letterSpacing: "0.06em", mb: "4px" }}>Profit</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <TrendingUpIcon sx={{ fontSize: 14, color: theme.palette.success.main }} />
            <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: "1.05rem", color: theme.palette.success.dark }}>
              ₹{Number(p.profit).toLocaleString("en-IN")}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: "18px", pb: "14px", display: "flex", gap: "8px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "5px", background: theme.palette.info.light, borderRadius: "7px", px: "10px", py: "4px" }}>
          <LocalOfferOutlinedIcon sx={{ fontSize: 11, color: theme.palette.info.dark }} />
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: theme.palette.info.dark }}>HSN {p.HSN}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "5px", background: theme.palette.primary.light, borderRadius: "7px", px: "10px", py: "4px" }}>
          <PercentIcon sx={{ fontSize: 11, color: theme.palette.primary.main }} />
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: theme.palette.primary.main }}>GST {p.GST}%</Typography>
        </Box>
      </Box>

      <Box sx={{ mx: "18px", mb: "14px", background: theme.palette.background.default, borderRadius: "12px", border: `1px solid ${theme.palette.divider}`, p: "12px 14px" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "8px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "5px", color: stockConfig.color }}>
            {stockConfig.icon}
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: stockConfig.color }}>{stockConfig.label}</Typography>
          </Box>
          <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "0.85rem", color: theme.palette.text.primary }}>
            {stock} <Box component="span" sx={{ fontWeight: 500, fontSize: "0.68rem", color: theme.palette.text.secondary }}>units</Box>
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={stockPct} sx={{
          height: 6, borderRadius: "6px",
          background: theme.palette.divider,
          "& .MuiLinearProgress-bar": { borderRadius: "6px", background: stockConfig.bar },
        }} />
      </Box>

      <Box sx={{ px: "18px", pb: "16px", display: "flex", gap: "8px" }}>
        <Button fullWidth startIcon={<EditIcon sx={{ fontSize: 15 }} />} onClick={() => onEdit(p.item_code)} sx={{
          textTransform: "none", fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.8rem", borderRadius: "10px", py: "8px",
          color: theme.palette.primary.main, background: theme.palette.primary.light,
          border: `1px solid ${theme.palette.primary.main}30`,
          "&:hover": { background: theme.palette.primary.main, color: "#fff", boxShadow: "0 4px 12px rgba(27,110,243,0.30)" },
          transition: "all 0.18s ease",
        }}>
          Edit
        </Button>
        <Button fullWidth startIcon={<DeleteIcon sx={{ fontSize: 15 }} />} onClick={() => onDelete(p._id)} sx={{
          textTransform: "none", fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.8rem", borderRadius: "10px", py: "8px",
          color: theme.palette.error.main, background: theme.palette.error.light,
          border: `1px solid ${theme.palette.error.main}30`,
          "&:hover": { background: theme.palette.error.main, color: "#fff", boxShadow: "0 4px 12px rgba(239,68,68,0.28)" },
          transition: "all 0.18s ease",
        }}>
          Delete
        </Button>
      </Box>
    </Paper>
  );
};

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: "18px", overflow: "hidden" }}>
      <Skeleton variant="rectangular" height={5} />
      <Box sx={{ p: "18px" }}>
        <Box sx={{ display: "flex", gap: "12px", mb: "14px" }}>
          <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: "12px", flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={18} />
            <Skeleton variant="text" width="40%" height={13} />
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: "10px", mb: "12px" }}>
          <Skeleton variant="rounded" height={58} sx={{ flex: 1, borderRadius: "10px" }} />
          <Skeleton variant="rounded" height={58} sx={{ flex: 1, borderRadius: "10px" }} />
        </Box>
        <Skeleton variant="rounded" height={52} sx={{ borderRadius: "12px", mb: "12px" }} />
        <Box sx={{ display: "flex", gap: "8px" }}>
          <Skeleton variant="rounded" height={36} sx={{ flex: 1, borderRadius: "10px" }} />
          <Skeleton variant="rounded" height={36} sx={{ flex: 1, borderRadius: "10px" }} />
        </Box>
      </Box>
    </Paper>
  );
};

// ─── Field Group Label ─────────────────────────────────────────────────────────
const GroupLabel = ({ icon, label, color, bg }) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "14px", mt: "4px" }}>
      <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
        {icon}
      </Box>
      <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: theme.palette.text.primary }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: "1px", bgcolor: theme.palette.divider }} />
    </Box>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ProductsTable() {
  const theme    = useTheme();
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  const [products, setProducts]       = useState([]);
  const [openDialog, setOpenDialog]   = useState(false);
  const [updateData, setUpdateData]   = useState(false);
  const [search, setSearch]           = useState("");
  const [loading, setLoading]         = useState(true);
  const [filterStock, setFilterStock] = useState("all");
  const [snackbar, setSnackbar]       = useState({ open: false, message: "", severity: "success" });

  const showSnackbar  = (message, severity = "success") => setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  const [productName,     setProductName]     = useState("");
  const [productItemCode, setProductItemCode] = useState("");
  const [productStock,    setProductStock]    = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productGST,      setProductGST]      = useState("");
  const [productPrice,    setProductPrice]    = useState("");
  const [productHSN,      setProductHSN]      = useState("");
  const [productProfit,   setProductProfit]   = useState("");
  const [productId,       setProductId]       = useState("");

  const resetFields = () => {
    setProductId(""); setProductCategory(""); setProductGST("");
    setProductItemCode(""); setProductName(""); setProductPrice("");
    setProductHSN(""); setProductStock(""); setProductProfit("");
  };

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/auth/getproducts", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      setProducts(await res.json());
    } catch (e) {
      console.error(e);
      showSnackbar("Failed to load products. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdd = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        updateData ? "http://localhost:5000/api/auth/updateproduct" : "http://localhost:5000/api/auth/addproducts",
        {
          method: updateData ? "PUT" : "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            _id: productId, item_code: productItemCode, item: productName,
            price: productPrice, category: productCategory, GST: productGST,
            Stock: productStock, HSN: productHSN, profit: productProfit,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to save product");
      resetFields(); setUpdateData(false); setOpenDialog(false);
      fetchData();
      showSnackbar(updateData ? "Product updated successfully!" : "Product added successfully!");
    } catch (e) {
      console.error(e);
      showSnackbar("Failed to save product. Please try again.", "error");
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/auth/deleteproduct/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete product");
      fetchData();
      showSnackbar("Product deleted successfully!");
    } catch (e) {
      console.error(e);
      showSnackbar("Failed to delete product. Please try again.", "error");
    }
  };

  const handleUpdate = (code) => {
    const p = products.find((x) => x.item_code === code);
    if (!p) return;
    setProductId(p._id); setProductCategory(p.category); setProductName(p.item);
    setProductItemCode(p.item_code); setProductStock(p.Stock); setProductPrice(p.price);
    setProductGST(p.GST); setProductHSN(p.HSN); setProductProfit(p.profit);
    setUpdateData(true); setOpenDialog(true);
  };

  const handleLogout = () => { logoutUser(); navigate("/login"); };

  useEffect(() => { fetchData(); }, [fetchData]);

  const maxStock = products.length > 0 ? Math.max(...products.map((p) => Number(p.Stock))) : 100;

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.item?.toLowerCase().includes(q) ||
      p.item_code?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q);
    const s = Number(p.Stock);
    const matchStock =
      filterStock === "all"      ? true :
      filterStock === "low"      ? s <= 20 && s > 5 : s <= 5;
    return matchSearch && matchStock;
  });

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem", borderRadius: "10px",
      background: theme.palette.background.default,
      "& fieldset": { borderColor: theme.palette.divider },
      "&:hover fieldset": { borderColor: theme.palette.primary.main },
      "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main, borderWidth: "1.5px" },
    },
    "& .MuiInputLabel-root": { fontFamily: "'DM Sans', sans-serif", color: theme.palette.text.secondary, fontSize: "0.875rem" },
    "& .MuiInputLabel-root.Mui-focused": { color: theme.palette.primary.main },
  };

  // Preview accent for the dialog header avatar
  const previewAccent = theme.palette.primary.main;

  // ── Barcode ────────────────────────────────────────────────────────────────
  const barcodeRef   = useRef(null);
  const [barcodeGenerated, setBarcodeGenerated] = useState(false);

  const generateBarcode = () => {
    if (!productItemCode) {
      showSnackbar("Please enter an Item Code first to generate barcode.", "error");
      return;
    }
    import("jsbarcode").then((mod) => {
      const JsBarcode = mod.default;
      try {
        JsBarcode(barcodeRef.current, productItemCode, {
          format:      "CODE128",
          width:       2,
          height:      60,
          displayValue: true,
          fontSize:    13,
          fontOptions: "bold",
          textMargin:  6,
          margin:      10,
          background:  "#ffffff",
          lineColor:   "#0F1C2E",
        });
        setBarcodeGenerated(true);
      } catch (err) {
        showSnackbar("Failed to generate barcode. Check item code.", "error");
      }
    });
  };

  const downloadBarcode = () => {
    if (!barcodeRef.current || !barcodeGenerated) return;
    const url  = barcodeRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.href     = url;
    link.download = `barcode-${productItemCode}.png`;
    link.click();
  };

  // Reset barcode when dialog closes or item code changes
  useEffect(() => { setBarcodeGenerated(false); }, [productItemCode, openDialog]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: theme.palette.background.default, fontFamily: "'DM Sans', sans-serif" }}>

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
        <NavItem icon={<GridViewRoundedIcon fontSize="small" />}     label="Dashboard"   onClick={() => navigate("/dashboard")} />
        <NavItem icon={<AddCircleOutlineIcon fontSize="small" />}    label="New Invoice" onClick={() => navigate("/createbill")} />
        <NavItem icon={<ReceiptLongOutlinedIcon fontSize="small" />} label="Invoices"    onClick={() => navigate("/invoices")} />
        <NavItem icon={<InventoryIcon fontSize="small" />}           label="Products"    onClick={() => navigate("/products")} active />
        <NavItem icon={<StorefrontOutlinedIcon fontSize="small" />}  label="Profile"     onClick={() => navigate("/profile")} />
        <Box sx={{ mt: "auto" }}>
          <NavItem icon={<LogoutIcon fontSize="small" />} label="Logout" onClick={handleLogout} />
        </Box>
      </Box>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, p: "32px", overflow: "auto" }}>

        {/* Page header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "28px", flexWrap: "wrap", gap: "16px" }}>
          <Box>
            <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", color: theme.palette.text.primary, lineHeight: 1.2 }}>
              Product Inventory
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: "4px", fontWeight: 500 }}>
              {products.length} products · {products.filter(p => Number(p.Stock) <= 5).length} critical
            </Typography>
          </Box>
          <Button
            startIcon={<AddIcon />}
            onClick={() => { resetFields(); setUpdateData(false); setOpenDialog(true); }}
            variant="contained"
            sx={{
              textTransform: "none", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              borderRadius: "10px", px: "20px", background: theme.palette.primary.main,
              boxShadow: "0 4px 14px rgba(27,110,243,0.35)",
              "&:hover": { background: theme.palette.primary.dark, boxShadow: "0 6px 20px rgba(27,110,243,0.45)" },
            }}
          >
            Add Product
          </Button>
        </Box>

        {/* Stat cards */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(4,1fr)" }, gap: "16px", mb: "24px" }}>
          <StatCard icon={<InventoryIcon fontSize="small" />}            label="Total Products" value={products.length}                                                             bg={theme.palette.primary.light} iconColor={theme.palette.primary.main} />
          <StatCard icon={<CheckCircleOutlineIcon fontSize="small" />}   label="In Stock"       value={products.filter(p => Number(p.Stock) > 20).length}                          bg={theme.palette.success.light} iconColor={theme.palette.success.main} />
          <StatCard icon={<WarningAmberOutlinedIcon fontSize="small" />} label="Low Stock"      value={products.filter(p => Number(p.Stock) <= 20 && Number(p.Stock) > 5).length}  bg={theme.palette.warning.light} iconColor={theme.palette.warning.main} />
          <StatCard icon={<ErrorOutlineIcon fontSize="small" />}         label="Critical"       value={products.filter(p => Number(p.Stock) <= 5).length}                          bg={theme.palette.error.light}   iconColor={theme.palette.error.main} />
        </Box>

        {/* Search + filter bar */}
        <Paper elevation={0} sx={{
          border: `1px solid ${theme.palette.divider}`, borderRadius: "16px", p: "14px 20px",
          background: theme.palette.background.paper, mb: "24px",
          display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap",
        }}>
          <TextField
            size="small" placeholder="Search by name, code or category..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} /></InputAdornment> }}
            sx={{ flex: 1, minWidth: 200, ...inputSx }}
          />
          <Box sx={{ display: "flex", gap: "8px" }}>
            {[
              { key: "all",      label: "All",        bg: theme.palette.primary.light, color: theme.palette.primary.main },
              { key: "low",      label: "Low Stock",  bg: theme.palette.warning.light, color: theme.palette.warning.dark },
              { key: "critical", label: "Critical",   bg: theme.palette.error.light,   color: theme.palette.error.main },
            ].map((f) => (
              <Chip key={f.key} label={f.label} onClick={() => setFilterStock(f.key)} size="small" sx={{
                fontWeight: 700, fontSize: "0.75rem", height: 28, borderRadius: "8px", cursor: "pointer",
                background: filterStock === f.key ? f.bg : theme.palette.background.default,
                color: filterStock === f.key ? f.color : theme.palette.text.secondary,
                border: `1px solid ${filterStock === f.key ? f.color + "44" : theme.palette.divider}`,
                transition: "all 0.15s ease",
              }} />
            ))}
          </Box>
          <Chip label={`${filtered.length} results`} size="small" sx={{
            fontWeight: 700, fontSize: "0.72rem",
            background: theme.palette.primary.light, color: theme.palette.primary.main,
            height: 24, borderRadius: "6px",
          }} />
        </Paper>

        {/* Cards grid */}
        {loading ? (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3,1fr)", xl: "repeat(4,1fr)" }, gap: "20px" }}>
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: "center", py: "80px", border: `2px dashed ${theme.palette.divider}`, borderRadius: "20px", background: theme.palette.background.paper }}>
            <Box sx={{ width: 72, height: 72, borderRadius: "20px", background: theme.palette.primary.light, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: "16px" }}>
              <InventoryIcon sx={{ fontSize: 34, color: theme.palette.primary.main }} />
            </Box>
            <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.15rem", color: theme.palette.text.primary }}>
              No products yet
            </Typography>
            <Typography sx={{ fontSize: "0.875rem", color: theme.palette.text.secondary, mt: "6px", mb: "24px" }}>
              Start building your catalogue by adding your first product
            </Typography>
            <Button startIcon={<AddIcon />} onClick={() => { resetFields(); setUpdateData(false); setOpenDialog(true); }} variant="contained" sx={{
              textTransform: "none", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              borderRadius: "10px", px: "24px", background: theme.palette.primary.main,
              boxShadow: "0 4px 14px rgba(27,110,243,0.30)",
            }}>
              Add First Product
            </Button>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: "64px" }}>
            <Typography sx={{ color: theme.palette.text.disabled, fontSize: "0.9rem" }}>No products match your search or filter</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3,1fr)", xl: "repeat(4,1fr)" }, gap: "20px" }}>
            {filtered.map((p) => (
              <ProductCard key={p._id} p={p} onEdit={handleUpdate} onDelete={handleDelete} maxStock={maxStock} />
            ))}
          </Box>
        )}
      </Box>

      {/* ── ADD / EDIT PRODUCT DIALOG ────────────────────────────────────── */}
      <Dialog
        open={openDialog}
        onClose={() => { setOpenDialog(false); resetFields(); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
            boxShadow: "0 24px 64px rgba(15,28,46,0.16)",
          },
        }}
      >
        {/* ── Dialog Header ── */}
        <Box sx={{
          background: `linear-gradient(120deg, ${theme.palette.primary.main} 0%, #60A5FA 100%)`,
          px: "28px", pt: "28px", pb: "24px",
          position: "relative",
        }}>
          {/* Decorative circles */}
          <Box sx={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
          <Box sx={{ position: "absolute", bottom: -20, left: "40%", width: 80, height: 80, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* Avatar — shows first letter of product name if editing */}
              <Avatar sx={{
                width: 52, height: 52, borderRadius: "14px",
                bgcolor: "rgba(255,255,255,0.2)",
                border: "1.5px solid rgba(255,255,255,0.35)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 900, fontSize: "1.4rem", color: "#fff",
              }}>
                {productName ? productName[0].toUpperCase() : <AddIcon sx={{ fontSize: 26 }} />}
              </Avatar>
              <Box>
                <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#fff", lineHeight: 1.2 }}>
                  {updateData ? "Edit Product" : "Add New Product"}
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.72)", mt: "3px" }}>
                  {updateData ? "Update the details below and save" : "Fill in all details to add to catalogue"}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => { setOpenDialog(false); resetFields(); }}
              size="small"
              sx={{ color: "rgba(255,255,255,0.75)", bgcolor: "rgba(255,255,255,0.12)", borderRadius: "10px", "&:hover": { bgcolor: "rgba(255,255,255,0.22)", color: "#fff" } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* ── Dialog Body ── */}
        <DialogContent sx={{ px: "28px", py: "24px", background: theme.palette.background.paper }}>

          {/* ── Section 1: Product Identity ── */}
          <GroupLabel
            icon={<QrCodeOutlinedIcon sx={{ fontSize: 16 }} />}
            label="Product Identity"
            color={theme.palette.primary.main}
            bg={theme.palette.primary.light}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", mb: "24px" }}>
            <TextField
              label="Item Code" fullWidth size="small" value={productItemCode}
              onChange={(e) => setProductItemCode(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><QrCodeOutlinedIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} /></InputAdornment> }}
              sx={inputSx}
            />
            <TextField
              label="Product Name" fullWidth size="small" value={productName}
              onChange={(e) => setProductName(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><InventoryIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} /></InputAdornment> }}
              sx={inputSx}
            />
            <TextField
              label="Category" fullWidth size="small" value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><CategoryOutlinedIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} /></InputAdornment> }}
              sx={inputSx}
            />
            <TextField
              label="HSN Code" fullWidth size="small" value={productHSN}
              onChange={(e) => setProductHSN(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><ReceiptLongOutlinedIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} /></InputAdornment> }}
              sx={inputSx}
            />
          </Box>

          {/* ── Section 2: Pricing ── */}
          <GroupLabel
            icon={<CurrencyRupeeIcon sx={{ fontSize: 16 }} />}
            label="Pricing & Tax"
            color={theme.palette.success.dark}
            bg={theme.palette.success.light}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", mb: "24px" }}>
            <TextField
              label="Price (₹)" fullWidth size="small" value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><CurrencyRupeeIcon sx={{ fontSize: 16, color: theme.palette.success.dark }} /></InputAdornment> }}
              sx={inputSx}
            />
            <TextField
              label="Profit (₹)" fullWidth size="small" value={productProfit}
              onChange={(e) => setProductProfit(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><TrendingUpIcon sx={{ fontSize: 16, color: theme.palette.success.dark }} /></InputAdornment> }}
              sx={inputSx}
            />
            <TextField
              label="GST (%)" fullWidth size="small" value={productGST}
              onChange={(e) => setProductGST(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><PercentIcon sx={{ fontSize: 16, color: theme.palette.success.dark }} /></InputAdornment> }}
              sx={inputSx}
            />
          </Box>

          {/* ── Section 3: Stock ── */}
          <GroupLabel
            icon={<LayersOutlinedIcon sx={{ fontSize: 16 }} />}
            label="Inventory"
            color={theme.palette.warning.dark}
            bg={theme.palette.warning.light}
          />
          <TextField
            label="Stock Quantity" fullWidth size="small" value={productStock}
            onChange={(e) => setProductStock(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><LayersOutlinedIcon sx={{ fontSize: 16, color: theme.palette.warning.dark }} /></InputAdornment> }}
            sx={inputSx}
          />


          {/* ── Section 4: Barcode ── */}
          <GroupLabel
            icon={<QrCodeOutlinedIcon sx={{ fontSize: 16 }} />}
            label="Barcode"
            color="#7C3AED"
            bg="#EDE9FE"
          />
          <Box sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "14px",
            overflow: "hidden",
            mb: "20px",
          }}>
            {/* Barcode canvas area */}
            <Box sx={{
              bgcolor: barcodeGenerated ? "#fff" : theme.palette.background.default,
              display: "flex", alignItems: "center", justifyContent: "center",
              minHeight: 110, py: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              transition: "background 0.2s ease",
            }}>
              {barcodeGenerated ? (
                <Box component="canvas" ref={barcodeRef} sx={{ maxWidth: "100%", display: "block" }} />
              ) : (
                <Box sx={{ textAlign: "center" }}>
                  <Box component="canvas" ref={barcodeRef} sx={{ display: "none" }} />
                  <Box sx={{
                    display: "flex", gap: "3px", justifyContent: "center", mb: 1,
                    opacity: 0.25,
                  }}>
                    {[3,6,2,8,4,7,2,5,9,3,6,4,8,2,5,7,3,6].map((h, i) => (
                      <Box key={i} sx={{ width: 3, height: h * 6, bgcolor: "#0F1C2E", borderRadius: "1px" }} />
                    ))}
                  </Box>
                  <Typography sx={{ fontSize: "0.75rem", color: theme.palette.text.disabled, fontWeight: 600 }}>
                    {productItemCode ? `Ready to generate for "${productItemCode}"` : "Enter Item Code to generate barcode"}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Barcode action row */}
            <Box sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              px: "16px", py: "12px", bgcolor: theme.palette.background.paper,
              flexWrap: "wrap", gap: "10px",
            }}>
              <Box>
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: theme.palette.text.primary }}>
                  {barcodeGenerated ? `Barcode: ${productItemCode}` : "No barcode generated yet"}
                </Typography>
                <Typography sx={{ fontSize: "0.7rem", color: theme.palette.text.secondary }}>
                  {barcodeGenerated ? "CODE128 format · Ready to print or download" : "Click Generate to create barcode from Item Code"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: "8px" }}>
                <Button
                  onClick={generateBarcode}
                  disabled={!productItemCode}
                  startIcon={<QrCodeOutlinedIcon sx={{ fontSize: 15 }} />}
                  size="small"
                  sx={{
                    textTransform: "none", fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem",
                    borderRadius: "8px", px: "14px",
                    bgcolor: "#EDE9FE", color: "#7C3AED",
                    border: "1px solid #DDD6FE",
                    "&:hover": { bgcolor: "#7C3AED", color: "#fff" },
                    "&:disabled": { opacity: 0.45, cursor: "not-allowed" },
                    transition: "all 0.18s ease",
                  }}
                >
                  Generate
                </Button>
                {barcodeGenerated && (
                  <Button
                    onClick={downloadBarcode}
                    startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
                    size="small"
                    sx={{
                      textTransform: "none", fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem",
                      borderRadius: "8px", px: "14px",
                      bgcolor: theme.palette.primary.light, color: theme.palette.primary.main,
                      border: `1px solid ${theme.palette.primary.main}30`,
                      "&:hover": { bgcolor: theme.palette.primary.main, color: "#fff" },
                      transition: "all 0.18s ease",
                    }}
                  >
                    Download
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

          {/* ── Live preview strip ── */}
          {(productName || productPrice || productStock) && (
            <Box sx={{
              mt: "20px", p: "14px 16px", borderRadius: "12px",
              bgcolor: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`,
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px",
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Avatar sx={{ width: 34, height: 34, borderRadius: "10px", bgcolor: `${previewAccent}18`, color: previewAccent, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "0.9rem" }}>
                  {productName?.[0]?.toUpperCase() || "?"}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: theme.palette.text.primary }}>
                    {productName || "Product Name"}
                  </Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: theme.palette.text.secondary }}>
                    {productItemCode || "Code"} · {productCategory || "Category"}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {productPrice && (
                  <Chip label={`₹${productPrice}`} size="small" sx={{ fontWeight: 700, fontSize: "0.72rem", bgcolor: theme.palette.success.light, color: theme.palette.success.dark, borderRadius: "6px", height: 22 }} />
                )}
                {productGST && (
                  <Chip label={`GST ${productGST}%`} size="small" sx={{ fontWeight: 700, fontSize: "0.72rem", bgcolor: theme.palette.primary.light, color: theme.palette.primary.main, borderRadius: "6px", height: 22 }} />
                )}
                {productStock && (
                  <Chip label={`Stock ${productStock}`} size="small" sx={{ fontWeight: 700, fontSize: "0.72rem", bgcolor: theme.palette.warning.light, color: theme.palette.warning.dark, borderRadius: "6px", height: 22 }} />
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        {/* ── Dialog Footer ── */}
        <Box sx={{
          px: "28px", py: "20px",
          borderTop: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.default,
          display: "flex", gap: "12px", justifyContent: "flex-end",
        }}>
          <Button
            onClick={() => { setOpenDialog(false); resetFields(); }}
            sx={{
              textTransform: "none", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              borderRadius: "10px", px: "20px",
              color: theme.palette.text.secondary,
              "&:hover": { bgcolor: theme.palette.background.paper },
            }}
          >
            Cancel
          </Button>
          <Button
            startIcon={<SaveOutlinedIcon />}
            onClick={handleAdd}
            variant="contained"
            sx={{
              textTransform: "none", fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              borderRadius: "10px", px: "28px",
              background: theme.palette.primary.main,
              boxShadow: "0 4px 14px rgba(27,110,243,0.35)",
              "&:hover": { background: theme.palette.primary.dark, boxShadow: "0 6px 20px rgba(27,110,243,0.45)" },
            }}
          >
            {updateData ? "Save Changes" : "Add Product"}
          </Button>
        </Box>
      </Dialog>

      {/* ── Snackbar ─────────────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open} autoHideDuration={3500} onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled" sx={{ borderRadius: "10px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}