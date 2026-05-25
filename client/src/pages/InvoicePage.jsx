import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, TextField, Divider,
  Table, TableHead, TableRow, TableCell, TableBody,
  Card, CardContent, Chip, InputAdornment, Stack, Paper,
  Dialog, DialogContent, DialogTitle, IconButton,
  FormControl, Select, MenuItem, Avatar,
  useTheme,
} from "@mui/material";

import { Snackbar, Alert } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SearchIcon from "@mui/icons-material/Search";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import CloseIcon from "@mui/icons-material/Close";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import Sidebar, { SIDEBAR_WIDTH } from "../components/Sidebar";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Scanner from "../components/Scanner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";

const InvoicePage = () => {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const [signatureUrl, setSignatureUrl] = useState("");
  const [openScanner, setOpenScanner] = useState(false);
  const [totalAmt, setTotalAmount] = useState(0.0);
  const [invoiceNum, setInvoiceNum] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [address, setAddress] = useState("");
  const [GST, setGST] = useState("");
  const [products, setProducts] = useState([]);
  const [itemsBuy, setItemsBuy] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [isPdf, setIsPdf] = useState(false);
  const [searchItem, setSearchItem] = useState("");
  const [profit, setProfit] = useState(0);
  const [openSuccess, setOpenSuccess] = useState(false);

  const today = new Date();
  const time = new Date().toLocaleTimeString();
  const date = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = String(today.getFullYear());
  const formattedDate = `${date}-${month}-${year}`;

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.875rem",
      borderRadius: "10px",
      backgroundColor: "#FAFBFC",
      "& fieldset": { borderColor: "#E2E8F0" },
      "&:hover fieldset": { borderColor: "#93C5FD" },
      "&.Mui-focused fieldset": { borderColor: "#2563EB", borderWidth: "1.5px" },
    },
    "& .MuiInputLabel-root": { fontFamily: "'DM Sans', sans-serif", color: "#64748B", fontSize: "0.875rem" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#2563EB" },
  };

  const smallInputSx = {
    "& .MuiOutlinedInput-root": {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.8125rem", borderRadius: "8px",
      backgroundColor: "#F8FAFC",
      "& fieldset": { borderColor: "#E2E8F0" },
      "&.Mui-focused fieldset": { borderColor: "#2563EB", borderWidth: "1.5px" },
    },
  };

  const handleLogout = () => { logoutUser(); navigate("/login"); };

  const openWhatsApp = (billNo) => {
    const message = encodeURIComponent(`Invoice ${billNo} is ready.`);
    window.open(`https://wa.me/91${phone}?text=${message}`, "_blank");
  };

  const downloadPDF = async () => {
    setIsPdf(true);
    await new Promise((r) => setTimeout(r, 200));
    const input = document.getElementById("invoice");
    const canvas = await html2canvas(input, {
      scale: 1.5,
      useCORS: true,    // 👈 ADD THIS
      allowTaint: false,   // 👈 ADD THIS
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.7);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
    pdf.save(`invoice${invoiceNum}.pdf`);
    setIsPdf(false);
  };

  const handleBarcodeScan = async (barcode) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/product/barcode/${barcode}`, {
      credentials: 'include', // Enable cookies
      headers: { "Content-Type": "application/json" },
    });
    const product = await res.json();
    if (product) handleAddToBill(product.item_code);
    setOpenScanner(false);
  };

  const handleSaveBill = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/saveinvoice`, {
        method: "POST",
        credentials: 'include', // Enable cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber: invoiceNum, customerName, shopName: name,
          shopAddress: address, shopGST: GST, items: itemsBuy,
          subtotal: Number(subtotal.toFixed(2)), tax: Number(tax.toFixed(2)),
          total: Number(totalAmt.toFixed(2)), date: formattedDate, time,
          phone, paymode: paymentMode, profit,
        }),
      });
      for (const item of itemsBuy) {
        try {
          await fetch(`${import.meta.env.VITE_API_URL}/api/auth/updateproduct`, {
            method: "PUT",
            credentials: 'include', // Enable cookies
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _id: item._id, Stock: item.Stock - item.qty }),
          });
        } catch (err) { console.error("Error updating product:", item.name, err); }
      }
      setInvoiceNum(""); setCustomerName(""); setPhone("");
      setPaymentMode(""); setItemsBuy([]); setSubtotal(0);
      setTax(0); setTotalAmount(0); setOpenSuccess(true);
    } catch (err) { console.error(err); }
  };

  const fetchProfileData = async () => {
    const [profileRes, userRes, sigRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/auth/findprofile`, {
        credentials: 'include', // Enable cookies
        headers: { "Content-Type": "application/json" },
      }),
      fetch(`${import.meta.env.VITE_API_URL}/api/auth/user`, {
        credentials: 'include', // Enable cookies
        headers: { "Content-Type": "application/json" },
      }),
      fetch(`${import.meta.env.VITE_API_URL}/api/signature`, {
        credentials: 'include', // Enable cookies
        headers: { "Content-Type": "application/json" },
      }),
    ]);

    const profileData = await profileRes.json();
    const userData = await userRes.json();
    const sigData = await sigRes.json();

    setName(profileData?.ShopName || "");
    setGST(profileData?.GSTNumber || "");
    setAddress(profileData?.Address || "");

    const resolvedSignature = sigData?.signature?.url || userData?.signature?.url || "";
    setSignatureUrl(resolvedSignature);
  };

  const fetchProductData = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/getproducts`, {
      credentials: 'include', // Enable cookies
      headers: { "Content-Type": "application/json" },
    });
    setProducts(await res.json());
  };

  const handleItemsSearch = async () => {
    if (searchItem === "") fetchProductData();
    else setProducts((prev) =>
      prev.filter((x) => x.item.toLowerCase().startsWith(searchItem.toLowerCase()))
    );
  };

  const handleAddToBill = (code) => {
    const newItem = products.find((x) => x.item_code === code);
    if (!newItem || Number(newItem.Stock) <= 0) return;
    setItemsBuy((prev) => [...prev, { ...newItem, qty: 1, discount: 0 }]);
    setTotalAmount((prev) => prev + Number(newItem.price));
    const base = (100 * Number(newItem.price)) / (100 + Number(newItem.GST));
    setSubtotal((prev) => prev + base);
    setProfit((prev) => prev + Number(newItem.profit));
    setTax((prev) => prev + (Number(newItem.price) - base));
    setSearchItem("");
  };

  const handleQtyChange = (index, value) => {
    const updated = [...itemsBuy];
    const item = updated[index];
    const price = Number(item.price), gst = Number(item.GST);
    const profitPerUnit = Number(item.profit || 0);
    const discount = Number(item.discount || 0);
    const oldTotal = item.qty * price;
    const oldBase = (100 * oldTotal) / (100 + gst);
    const oldProfit = item.qty * profitPerUnit - discount;
    item.qty = value;
    const newTotal = item.qty * price;
    const newBase = (100 * newTotal) / (100 + gst);
    const newProfit = item.qty * profitPerUnit - discount;
    setItemsBuy(updated);
    setSubtotal((prev) => prev + (newBase - oldBase));
    setTax((prev) => prev + ((newTotal - newBase) - (oldTotal - oldBase)));
    setTotalAmount((prev) => prev + (newTotal - oldTotal));
    setProfit((prev) => prev + (newProfit - oldProfit));
  };

  const handleDiscountChange = (index, value) => {
    const updated = [...itemsBuy];
    const item = updated[index];
    const price = Number(item.price), gst = Number(item.GST);
    const profitPerUnit = Number(item.profit || 0);
    const oldDiscount = Number(item.discount || 0);
    const oldTotal = item.qty * price - oldDiscount;
    const oldBase = (100 * oldTotal) / (100 + gst);
    const oldProfit = item.qty * profitPerUnit - oldDiscount;
    item.discount = value;
    const newTotal = item.qty * price - item.discount;
    const newBase = (100 * newTotal) / (100 + gst);
    const newProfit = item.qty * profitPerUnit - item.discount;
    setItemsBuy(updated);
    setSubtotal((prev) => prev + (newBase - oldBase));
    setTax((prev) => prev + ((newTotal - newBase) - (oldTotal - oldBase)));
    setTotalAmount((prev) => prev + (newTotal - oldTotal));
    setProfit((prev) => prev + (newProfit - oldProfit));
  };

  useEffect(() => { fetchProfileData(); fetchProductData(); }, []);
  useEffect(() => { handleItemsSearch(); }, [searchItem]);

  return (
    <Box sx={{ height: "100vh", overflow: "hidden", background: "#F6F8FB", fontFamily: "'DM Sans', sans-serif", pl: `${SIDEBAR_WIDTH}px` }}>
      <Sidebar onLogout={handleLogout} />

      {/* ── MAIN AREA ────────────────────────────────────────────────────────── */}
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── TOP NAV ── */}
        <Box sx={{
          px: "28px", py: "14px", background: "#FFFFFF",
          borderBottom: "1px solid #E8ECF0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 100, flexShrink: 0,
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 34, height: 34, borderRadius: "9px", background: "#EFF6FF",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ReceiptOutlinedIcon sx={{ color: "#2563EB", fontSize: 17 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#0F172A", fontFamily: "'Sora', sans-serif", lineHeight: 1.2 }}>
                New Invoice
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>{formattedDate} · {time}</Typography>
            </Box>
          </Box>

          {/* Action buttons */}
          {!isPdf && (
            <Box sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Button
                startIcon={<QrCodeScannerIcon sx={{ fontSize: "15px !important" }} />}
                onClick={() => setOpenScanner(true)}
                sx={{
                  textTransform: "none", fontWeight: 600, fontSize: "0.8rem",
                  fontFamily: "'DM Sans', sans-serif",
                  borderRadius: "9px", px: "14px", height: 36,
                  background: "#FFFBEB", color: "#D97706",
                  border: "1px solid #FDE68A",
                  "&:hover": { background: "#FEF3C7", borderColor: "#F59E0B" },
                }}>
                Scan
              </Button>
              <Button
                startIcon={<WhatsAppIcon sx={{ fontSize: "15px !important", color: "#16A34A" }} />}
                onClick={() => openWhatsApp(invoiceNum)}
                sx={{
                  textTransform: "none", fontWeight: 600, fontSize: "0.8rem",
                  fontFamily: "'DM Sans', sans-serif",
                  borderRadius: "9px", px: "14px", height: 36,
                  background: "#F0FDF4", color: "#16A34A",
                  border: "1px solid #BBF7D0",
                  "&:hover": { background: "#DCFCE7", borderColor: "#86EFAC" },
                }}>
                WhatsApp
              </Button>
              <Button
                startIcon={<PictureAsPdfOutlinedIcon sx={{ fontSize: "15px !important" }} />}
                onClick={downloadPDF}
                sx={{
                  textTransform: "none", fontWeight: 600, fontSize: "0.8rem",
                  fontFamily: "'DM Sans', sans-serif",
                  borderRadius: "9px", px: "14px", height: 36,
                  background: "#FEF2F2", color: "#EF4444",
                  border: "1px solid #FECACA",
                  "&:hover": { background: "#FEE2E2", borderColor: "#FCA5A5" },
                }}>
                PDF
              </Button>
              <Button
                startIcon={<SaveOutlinedIcon sx={{ fontSize: "15px !important" }} />}
                onClick={handleSaveBill}
                variant="contained"
                sx={{
                  textTransform: "none", fontWeight: 700, fontSize: "0.8rem",
                  fontFamily: "'DM Sans', sans-serif",
                  borderRadius: "9px", px: "18px", height: 36,
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                  "&:hover": { boxShadow: "0 6px 20px rgba(37,99,235,0.4)", transform: "translateY(-1px)" },
                  transition: "all 0.18s ease",
                }}>
                Save Bill
              </Button>
            </Box>
          )}
        </Box>

        {/* ── TWO-COLUMN BODY ── */}
        <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* ════════════════ LEFT: Invoice Panel ════════════════ */}
          <Box sx={{
            flex: 1, overflowY: "auto", p: "24px 20px 24px 24px",
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-thumb": { background: "#CBD5E1", borderRadius: "2px" },
          }}>
            <Paper
              id="invoice"
              elevation={0}
              sx={{
                borderRadius: "16px",
                border: "1px solid #E8ECF0",
                background: "#FFFFFF",
                overflow: "hidden",
              }}
            >
              {/* Invoice Header */}
              <Box sx={{ p: "28px 28px 0 28px" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "24px" }}>
                  {/* Shop Info */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <Box sx={{
                      width: 48, height: 48, borderRadius: "12px",
                      background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                    }}>
                      <StorefrontOutlinedIcon sx={{ color: "#fff", fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography sx={{
                        fontFamily: "'Sora', sans-serif", fontSize: "1.1rem", fontWeight: 800,
                        color: "#0F172A", lineHeight: 1.2,
                      }}>
                        {name}
                      </Typography>
                      <Typography sx={{ fontSize: "0.775rem", color: "#64748B", mt: "3px", maxWidth: 260 }}>
                        {address}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: "4px" }}>
                        <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>GST:</Typography>
                        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#1E293B", fontFamily: "'Sora', sans-serif" }}>{GST}</Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Invoice Label + Number */}
                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{
                      fontFamily: "'Sora', sans-serif", fontSize: "1.8rem", fontWeight: 900,
                      color: "#2563EB", letterSpacing: "0.12em", lineHeight: 1,
                    }}>
                      INVOICE
                    </Typography>
                    <Box sx={{ mt: "10px", display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>No:</Typography>
                        {isPdf ? (
                          <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0F172A", fontFamily: "'Sora', sans-serif" }}>{invoiceNum}</Typography>
                        ) : (
                          <TextField size="small" placeholder="INV-001" value={invoiceNum}
                            onChange={(e) => setInvoiceNum(e.target.value)}
                            sx={{ width: 110, ...smallInputSx }} />
                        )}
                      </Box>
                      <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>
                        <Box component="span" sx={{ color: "#94A3B8" }}>Date: </Box>
                        <Box component="span" sx={{ fontWeight: 700, color: "#1E293B" }}>{formattedDate}</Box>
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>
                        <Box component="span" sx={{ color: "#94A3B8" }}>Time: </Box>
                        <Box component="span" sx={{ fontWeight: 700, color: "#1E293B" }}>{time}</Box>
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Gradient rule */}
                <Box sx={{
                  height: "2px",
                  background: "linear-gradient(90deg, #2563EB 0%, #7C3AED 50%, transparent 100%)",
                  borderRadius: 2, mb: "24px",
                }} />

                {/* Bill To */}
                <Box sx={{
                  background: "#F8FAFC", border: "1px solid #E8ECF0",
                  borderRadius: "12px", p: "18px", mb: "24px",
                }}>
                  <Typography sx={{
                    fontSize: "0.65rem", fontWeight: 800, color: "#94A3B8",
                    letterSpacing: "0.14em", textTransform: "uppercase", mb: "12px",
                  }}>
                    Bill To
                  </Typography>
                  {isPdf ? (
                    <>
                      <Typography sx={{ fontSize: "0.9375rem", fontWeight: 700, color: "#0F172A" }}>{customerName}</Typography>
                      <Typography sx={{ fontSize: "0.8125rem", color: "#64748B", mt: "2px" }}>{phone}</Typography>
                    </>
                  ) : (
                    <Box sx={{ display: "flex", gap: "12px" }}>
                      <TextField fullWidth placeholder="Customer Name" value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)} size="small" sx={inputSx} />
                      <TextField fullWidth placeholder="Phone Number" value={phone}
                        onChange={(e) => setPhone(e.target.value)} size="small" sx={inputSx} />
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Items Table */}
              <Box sx={{ px: "28px", pb: "0" }}>
                <Box sx={{ border: "1px solid #E8ECF0", borderRadius: "12px", overflow: "hidden" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: "#F8FAFC" }}>
                        {["#", "Code", "Product", "HSN", "GST", "Qty", "Rate", "Disc.", "Amount"].map((col) => (
                          <TableCell key={col} sx={{
                            fontWeight: 700, fontSize: "0.65rem", color: "#94A3B8",
                            letterSpacing: "0.08em", textTransform: "uppercase",
                            borderBottom: "1px solid #E8ECF0",
                            py: "11px", whiteSpace: "nowrap",
                          }}>
                            {col}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {itemsBuy.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} sx={{ textAlign: "center", py: "40px", border: 0 }}>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                              <Box sx={{ fontSize: "1.6rem" }}>🛒</Box>
                              <Typography sx={{ color: "#94A3B8", fontSize: "0.825rem", fontWeight: 500 }}>
                                No items added yet
                              </Typography>
                              <Typography sx={{ color: "#CBD5E1", fontSize: "0.75rem" }}>
                                Search and add products from the panel →
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        itemsBuy.map((item, index) => (
                          <TableRow key={index} sx={{
                            "&:hover": { background: "#F8FAFF" },
                            "& td": { borderBottom: "1px solid #F1F5F9" },
                            "&:last-child td": { borderBottom: 0 },
                          }}>
                            <TableCell sx={{ color: "#94A3B8", fontSize: "0.775rem", py: "12px", width: 28 }}>
                              {index + 1}
                            </TableCell>
                            <TableCell sx={{ py: "12px" }}>
                              <Box sx={{
                                background: "#EFF6FF", color: "#2563EB",
                                fontFamily: "'Sora', monospace",
                                fontSize: "0.67rem", fontWeight: 700,
                                px: "8px", py: "2px", borderRadius: "5px",
                                display: "inline-block", whiteSpace: "nowrap",
                              }}>
                                {item.item_code}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem", color: "#1E293B", py: "12px", maxWidth: 130 }}>
                              {item.item}
                            </TableCell>
                            <TableCell sx={{ fontSize: "0.775rem", color: "#64748B", py: "12px" }}>{item.HSN}</TableCell>
                            <TableCell sx={{ py: "12px" }}>
                              {isPdf ? (
                                <Typography sx={{ fontSize: "0.775rem", fontWeight: 700, color: "#0F172A" }}>{item.GST}%</Typography>
                              ) : (
                                <Box sx={{
                                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                                  background: "#EFF6FF", color: "#2563EB",
                                  fontSize: "0.67rem", fontWeight: 700,
                                  px: "7px", py: "2px", borderRadius: "5px",
                                }}>
                                  {item.GST}%
                                </Box>
                              )}
                            </TableCell>
                            <TableCell sx={{ py: "12px" }}>
                              {isPdf ? (
                                <Typography sx={{ fontSize: "0.775rem", fontWeight: 600 }}>{item.qty}</Typography>
                              ) : (
                                <TextField size="small" value={item.qty}
                                  onChange={(e) => handleQtyChange(index, Number(e.target.value))}
                                  sx={{ width: 62, ...smallInputSx }}
                                  inputProps={{ style: { textAlign: "center", padding: "5px 8px" } }}
                                />
                              )}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#1E293B", py: "12px" }}>
                              ₹{item.price}
                            </TableCell>
                            <TableCell sx={{ py: "12px" }}>
                              {isPdf ? (
                                <Typography sx={{ fontSize: "0.775rem" }}>{item.discount}</Typography>
                              ) : (
                                <TextField size="small" value={item.discount}
                                  onChange={(e) => handleDiscountChange(index, Number(e.target.value))}
                                  sx={{ width: 72, ...smallInputSx }}
                                  inputProps={{ style: { padding: "5px 8px" } }}
                                />
                              )}
                            </TableCell>
                            <TableCell sx={{ py: "12px" }}>
                              <Typography sx={{ fontSize: "0.875rem", fontWeight: 800, color: "#10B981", fontFamily: "'Sora', sans-serif" }}>
                                ₹{(item.qty * item.price - item.discount).toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Box>

              {/* Totals + Payment */}
              <Box sx={{ p: "20px 28px 28px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>

                {/* ── Authorised Signature bottom left ── */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
                  <Box sx={{
                    width: 180,
                    minHeight: 96,
                    borderRadius: "10px",
                    border: "1px solid #E2E8F0",
                    background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    px: "8px",
                    py: "10px",
                  }}>
                    {signatureUrl ? (
                      <Box
                        component="img"
                        src={signatureUrl}
                        alt="Authorised Signature"
                        crossOrigin="anonymous"
                        sx={{
                          width: "100%",
                          maxWidth: 160,
                          maxHeight: 72,
                          objectFit: "contain",
                          display: "block",
                        }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 600 }}>
                        No signature uploaded
                      </Typography>
                    )}
                  </Box>
                  <Typography sx={{
                    fontSize: "0.7rem", color: "#94A3B8",
                    fontWeight: 600, letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}>
                    Authorised Signature
                  </Typography>
                </Box>

                <Box sx={{
                  width: 300, borderRadius: "14px", overflow: "hidden",
                  border: "1px solid #E8ECF0",
                }}>
                  <Box sx={{ px: "20px", py: "16px", background: "#F8FAFC", display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[
                      { label: "Subtotal", value: `₹${subtotal.toFixed(2)}`, color: "#475569" },
                      { label: "Tax (GST)", value: `₹${tax.toFixed(2)}`, color: "#F59E0B" },
                    ].map((row) => (
                      <Box key={row.label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography sx={{ fontSize: "0.825rem", color: "#64748B" }}>{row.label}</Typography>
                        <Typography sx={{ fontSize: "0.825rem", fontWeight: 700, color: row.color }}>{row.value}</Typography>
                      </Box>
                    ))}
                    <Divider sx={{ borderColor: "#E8ECF0" }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography sx={{ fontSize: "0.825rem", color: "#64748B" }}>Payment</Typography>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={paymentMode} displayEmpty
                          onChange={(e) => setPaymentMode(e.target.value)}
                          sx={{
                            fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", borderRadius: "8px",
                            background: "#fff",
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#93C5FD" },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2563EB" },
                          }}
                        >
                          <MenuItem value="" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem" }}>Select</MenuItem>
                          <MenuItem value="Cash" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem" }}>Cash</MenuItem>
                          <MenuItem value="Online" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem" }}>Online</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                  {/* Total bar */}
                  <Box sx={{
                    px: "20px", py: "14px",
                    background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                      Total Amount
                    </Typography>
                    <Typography sx={{ fontFamily: "'Sora', sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                      ₹{totalAmt.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* ════════════════ RIGHT: Product Panel ════════════════ */}
          <Box sx={{
            width: 320, flexShrink: 0,
            height: "100%",
            background: "#FFFFFF",
            borderLeft: "1px solid #E8ECF0",
            display: "flex", flexDirection: "column",
            overflow: "hidden",
          }}>
            {/* Panel Header */}
            <Box sx={{
              px: "16px", pt: "18px", pb: "14px",
              borderBottom: "1px solid #F1F5F9", flexShrink: 0,
            }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "12px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <Box sx={{
                    width: 32, height: 32, borderRadius: "8px", background: "#EFF6FF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Inventory2OutlinedIcon sx={{ fontSize: 16, color: "#2563EB" }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: "'Sora', sans-serif", fontSize: "0.85rem", fontWeight: 700, color: "#0F172A" }}>
                      Products
                    </Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8" }}>Tap to add to bill</Typography>
                  </Box>
                </Box>
                <Box sx={{
                  px: 1, py: 0.25, borderRadius: "6px",
                  background: "#EFF6FF", color: "#2563EB",
                  fontSize: "0.68rem", fontWeight: 700,
                }}>
                  {products.length}
                </Box>
              </Box>

              {/* Search */}
              <TextField
                fullWidth placeholder="Search products…"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 15, color: "#94A3B8" }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />
            </Box>

            {/* Product List */}
            <Box sx={{
              flex: 1, overflowY: "auto", px: "12px", py: "10px",
              display: "flex", flexDirection: "column", gap: "8px",
              "&::-webkit-scrollbar": { width: "3px" },
              "&::-webkit-scrollbar-thumb": { background: "#CBD5E1", borderRadius: "2px" },
            }}>
              {products.length === 0 && (
                <Box sx={{ textAlign: "center", py: "48px" }}>
                  <Typography sx={{ fontSize: "0.825rem", color: "#94A3B8" }}>No products found</Typography>
                </Box>
              )}
              {products.map((product, index) => (
                <Box key={product._id || index} sx={{
                  borderRadius: "12px", border: "1px solid #E8ECF0",
                  background: "#FAFBFC", p: "13px",
                  transition: "all 0.16s ease", cursor: "pointer",
                  "&:hover": {
                    borderColor: "#93C5FD", background: "#fff",
                    boxShadow: "0 4px 14px rgba(37,99,235,0.1)",
                    transform: "translateY(-1px)",
                  },
                }}>
                  {/* Name + Price */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "10px" }}>
                    <Typography sx={{
                      fontFamily: "'Sora', sans-serif", fontSize: "0.82rem", fontWeight: 700,
                      color: "#0F172A", flex: 1, pr: 1, lineHeight: 1.3,
                    }}>
                      {product.item}
                    </Typography>
                    <Box sx={{
                      background: "#F0FDF4", border: "1px solid #BBF7D0",
                      borderRadius: "7px", px: "8px", py: "2px", flexShrink: 0,
                    }}>
                      <Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color: "#16A34A", fontFamily: "'Sora', sans-serif" }}>
                        ₹{product.price}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Meta */}
                  <Box sx={{
                    display: "grid", gridTemplateColumns: "1fr 1fr",
                    gap: "4px 8px", mb: "11px",
                    background: "#F1F5F9", borderRadius: "8px", p: "8px 10px",
                  }}>
                    {[
                      { label: "Code", value: product.item_code },
                      { label: "GST", value: `${product.GST}%` },
                      { label: "HSN", value: product.HSN },
                      { label: "Stock", value: product.Stock },
                    ].map((row) => (
                      <Box key={row.label} sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        <Typography sx={{ fontSize: "0.67rem", color: "#94A3B8", fontWeight: 600, flexShrink: 0 }}>
                          {row.label}:
                        </Typography>
                        <Typography sx={{
                          fontSize: "0.67rem", fontWeight: 700,
                          color: row.label === "Stock" && Number(row.value) <= 5 ? "#EF4444" : "#374151",
                        }}>
                          {row.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Add to Bill */}
                  {Number(product.Stock) <= 0 && (
                    <Typography sx={{ fontSize: "0.7rem", color: "#EF4444", fontWeight: 700, mb: 0.75 }}>
                      Out of stock
                    </Typography>
                  )}
                  <Button
                    fullWidth
                    startIcon={<ShoppingCartIcon sx={{ fontSize: "14px !important" }} />}
                    disabled={Number(product.Stock) <= 0}
                    onClick={() => handleAddToBill(product.item_code)}
                    sx={{
                      fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                      fontSize: "0.775rem", textTransform: "none",
                      borderRadius: "8px", py: "6px",
                      background: "#EFF6FF", color: "#2563EB",
                      border: "1px solid #BFDBFE",
                      "&:hover": {
                        background: "#2563EB", color: "#fff",
                        borderColor: "#2563EB",
                        boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                      },
                      "&.Mui-disabled": {
                        background: "#E2E8F0",
                        color: "#94A3B8",
                        borderColor: "#CBD5E1",
                      },
                      transition: "all 0.15s ease",
                    }}
                  >
                    Add to Bill
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Scanner Dialog ─────────────────────────────────────────────────── */}
      <Dialog
        open={openScanner} onClose={() => setOpenScanner(false)}
        maxWidth="md" fullWidth
        PaperProps={{
          sx: { borderRadius: "16px", border: "1px solid #E8ECF0", overflow: "hidden" },
        }}
      >
        <DialogTitle sx={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontFamily: "'Sora', sans-serif", fontWeight: 700,
          color: "#0F172A", borderBottom: "1px solid #F1F5F9",
          py: "14px", px: "20px",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: "8px", background: "#FFFBEB",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid #FDE68A",
            }}>
              <QrCodeScannerIcon sx={{ fontSize: 16, color: "#D97706" }} />
            </Box>
            <Typography sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>
              Scan Product Barcode
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenScanner(false)} size="small" sx={{
            color: "#64748B", background: "#F1F5F9", borderRadius: "8px", width: 30, height: 30,
            "&:hover": { background: "#FEE2E2", color: "#EF4444" },
          }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: "20px" }}>
          <Scanner onScan={handleBarcodeScan} />
        </DialogContent>
      </Dialog>

      {/* ── Success Snackbar ────────────────────────────────────────────────── */}
      <Snackbar
        open={openSuccess} autoHideDuration={3000}
        onClose={() => setOpenSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setOpenSuccess(false)}
          icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
          sx={{
            borderRadius: "12px", background: "#ECFDF5",
            color: "#065F46", fontWeight: 600, fontSize: "0.875rem",
            fontFamily: "'DM Sans', sans-serif",
            border: "1px solid #A7F3D0",
            boxShadow: "0 8px 24px rgba(16,185,129,0.2)",
          }}
        >
          Invoice saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InvoicePage;