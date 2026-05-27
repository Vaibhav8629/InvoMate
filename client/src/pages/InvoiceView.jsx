import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, Button, Skeleton,
} from "@mui/material";

import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import TagOutlinedIcon from "@mui/icons-material/TagOutlined";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getInvoicePaymentDisplay, getInvoicePaymentStatus } from "../utils/invoicePayment";

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signatureUrl, setSignatureUrl] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/invoice/${id}`, {
        credentials: 'include', // Enable cookies
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setInvoice(data.data);
      setLoading(false);
    };

    const fetchSignature = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/signature`, {
          credentials: 'include',
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) return;

        const data = await res.json();
        setSignatureUrl(data?.signature?.url || "");
      } catch (err) {
        console.error("Error loading signature:", err);
      }
    };

    fetchInvoice();
    fetchSignature();
  }, [id]);

  const handleDownloadPDF = async () => {
    const input = invoiceRef.current;
    const canvas = await html2canvas(input, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
    pdf.save(`Invoice-${invoice?.invoiceNumber ?? id}.pdf`);
  };

  const openWhatsApp = () => {
    if (!invoice?.phone) return;
    const msg = encodeURIComponent(
      `Hi ${invoice.customerName}, your Invoice #${invoice.invoiceNumber} is ready.\nTotal: ₹${invoice.total}\nThank you for shopping with us!`
    );
    window.open(`https://wa.me/91${invoice.phone}?text=${msg}`, "_blank");
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", background: "#F6F8FB", display: "flex" }}>
        {/* Left skeleton */}
        <Box sx={{ flex: 1, p: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <Skeleton variant="rounded" height={44} width={120} sx={{ borderRadius: "10px" }} />
          <Skeleton variant="rounded" height={180} sx={{ borderRadius: "14px" }} />
          <Skeleton variant="rounded" height={120} sx={{ borderRadius: "14px" }} />
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: "14px" }} />
        </Box>
        {/* Right skeleton */}
        <Box sx={{ width: 300, p: "32px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <Skeleton variant="rounded" height={160} sx={{ borderRadius: "14px" }} />
          <Skeleton variant="rounded" height={160} sx={{ borderRadius: "14px" }} />
          <Skeleton variant="rounded" height={100} sx={{ borderRadius: "14px" }} />
        </Box>
      </Box>
    );
  }

  if (!invoice) return null;

  const subtotal = invoice.subtotal ?? invoice.items?.reduce((s, i) => s + i.qty * Number(i.price), 0) ?? 0;
  const tax = invoice.tax ?? 0;
  const total = invoice.total ?? 0;

  const handleExportCSV = () => {
    if (!invoice) return;

    const headers = [
      "Invoice Number",
      "Invoice Date",
      "Customer Name",
      "Customer Phone",
      "Payment Method",
      "Item Sr. No.",
      "Item Name",
      "Item Code",
      "HSN Code",
      "Item Qty",
      "Item Rate",
      "Item Discount",
      "Item GST %",
      "Item Total Amount",
      "Invoice Subtotal (Total Amount)",
      "Invoice GST",
      "Invoice Grand Total"
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '';
      let str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const itemsList = invoice.items || [];
    
    const rows = itemsList.map((item, idx) => {
      const itemAmount = (item.qty * Number(item.price) - (item.discount || 0));
      return [
        invoice.invoiceNumber || '',
        invoice.date || '',
        invoice.customerName || '',
        invoice.phone || '',
        invoice.paymode || '',
        idx + 1,
        item.item || '',
        item.item_code || '',
        item.HSN || '',
        item.qty || 0,
        item.price || 0,
        item.discount || 0,
        item.GST || 0,
        itemAmount,
        subtotal,
        tax,
        total
      ];
    });

    if (rows.length === 0) {
      rows.push([
        invoice.invoiceNumber || '',
        invoice.date || '',
        invoice.customerName || '',
        invoice.phone || '',
        invoice.paymode || '',
        '', '', '', '', '', '', '', '', '',
        subtotal,
        tax,
        total
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\r\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `invoice-${invoice.invoiceNumber || id}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const payChip = {
    Cash:   { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
    Online: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
    PENDING: { bg: "#FFF7ED", color: "#D97706", border: "#FCD34D" },
    default:{ bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
  };
  const paymentStatus = getInvoicePaymentStatus(invoice);
  const paymentDisplay = getInvoicePaymentDisplay(invoice);
  const pm = paymentStatus === "PENDING" ? payChip.PENDING : payChip[invoice.paymode] || payChip.default;

  return (
    <Box sx={{ minHeight: "100vh", background: "#F6F8FB", fontFamily: "'DM Sans', sans-serif", display: "flex" }}>

      {/* ══════════════════════════════════════════
          LEFT — printable invoice
      ══════════════════════════════════════════ */}
      <Box sx={{
        flex: 1, overflowY: "auto", p: "32px 24px 48px 32px",
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-thumb": { background: "#CBD5E1", borderRadius: "2px" },
      }}>

        {/* Back button */}
        <Button
          startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: "15px !important" }} />}
          onClick={() => navigate(-1)}
          sx={{
            textTransform: "none", fontWeight: 600, fontSize: "0.8rem",
            fontFamily: "'DM Sans', sans-serif",
            borderRadius: "9px", px: "14px", height: 36, mb: "24px",
            color: "#64748B", background: "#fff",
            border: "1px solid #E2E8F0",
            "&:hover": { background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" },
            transition: "all 0.15s",
          }}
        >
          Back
        </Button>

        {/* ── INVOICE CARD ── */}
        <Box
          ref={invoiceRef}
          sx={{
            background: "#FFFFFF",
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            overflow: "hidden",
          }}
        >
          {/* ── TOP: Shop + Invoice identity ── */}
          <Box sx={{ p: "32px 32px 28px 32px" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>

              {/* Shop block */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <Box sx={{
                  width: 52, height: 52, borderRadius: "13px", flexShrink: 0,
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 6px 18px rgba(37,99,235,0.28)",
                }}>
                  <StorefrontOutlinedIcon sx={{ color: "#fff", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{
                    fontFamily: "'Sora', sans-serif", fontWeight: 800,
                    fontSize: "1.15rem", color: "#0F172A", lineHeight: 1.2,
                  }}>
                    {invoice.shopName}
                  </Typography>
                  <Typography sx={{ fontSize: "0.775rem", color: "#64748B", mt: "4px", maxWidth: 280, lineHeight: 1.5 }}>
                    {invoice.shopAddress}
                  </Typography>
                  {invoice.shopGST && (
                    <Box sx={{
                      display: "inline-flex", alignItems: "center", gap: "5px", mt: "6px",
                      px: "8px", py: "2px", borderRadius: "6px",
                      background: "#F1F5F9", border: "1px solid #E2E8F0",
                    }}>
                      <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#475569", fontFamily: "'Sora', sans-serif", letterSpacing: "0.04em" }}>
                        GSTIN: {invoice.shopGST}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Invoice identity */}
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{
                  fontFamily: "'Sora', sans-serif", fontWeight: 900,
                  fontSize: "2rem", color: "#2563EB",
                  letterSpacing: "0.14em", lineHeight: 1,
                }}>
                  INVOICE
                </Typography>
                <Box sx={{
                  mt: "10px", display: "inline-flex", flexDirection: "column",
                  alignItems: "flex-end", gap: "5px",
                }}>
                  <Box sx={{
                    display: "flex", alignItems: "center", gap: "6px",
                    px: "10px", py: "4px", borderRadius: "7px",
                    background: "#EFF6FF", border: "1px solid #BFDBFE",
                  }}>
                    <TagOutlinedIcon sx={{ fontSize: 12, color: "#2563EB" }} />
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color: "#1D4ED8", fontFamily: "'Sora', sans-serif" }}>
                      {invoice.invoiceNumber}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: "#94A3B8" }} />
                    <Typography sx={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 500 }}>{invoice.date}</Typography>
                  </Box>
                  {invoice.time && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <AccessTimeOutlinedIcon sx={{ fontSize: 11, color: "#94A3B8" }} />
                      <Typography sx={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 500 }}>{invoice.time}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Accent rule */}
            <Box sx={{
              mt: "24px", height: "2px", borderRadius: "2px",
              background: "linear-gradient(90deg, #2563EB 0%, #7C3AED 40%, #E2E8F0 100%)",
            }} />
          </Box>

          {/* ── BILL TO STRIP ── */}
          <Box sx={{
            mx: "32px", mb: "28px",
            borderRadius: "12px", border: "1px solid #E2E8F0",
            background: "#F8FAFC",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            overflow: "hidden",
          }}>
            {[
              {
                icon: <PersonOutlinedIcon sx={{ fontSize: 14 }} />,
                label: "Billed To",
                value: invoice.customerName,
                accent: "#2563EB",
              },
              {
                icon: <PhoneOutlinedIcon sx={{ fontSize: 14 }} />,
                label: "Phone",
                value: invoice.phone || "—",
                accent: "#7C3AED",
              },
              {
                icon: <PaymentOutlinedIcon sx={{ fontSize: 14 }} />,
                label: "Payment",
                value: paymentDisplay,
                isChip: true,
                accent: "#10B981",
              },
            ].map((info, i) => (
              <Box key={info.label} sx={{
                px: "20px", py: "16px",
                borderRight: i < 2 ? "1px solid #E2E8F0" : "none",
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "5px", mb: "6px" }}>
                  <Box sx={{ color: info.accent }}>{info.icon}</Box>
                  <Typography sx={{
                    fontSize: "0.62rem", fontWeight: 700, color: "#94A3B8",
                    textTransform: "uppercase", letterSpacing: "0.1em",
                  }}>
                    {info.label}
                  </Typography>
                </Box>
                {info.isChip ? (
                  <Box sx={{
                    display: "inline-flex", alignItems: "center",
                    px: "10px", py: "3px", borderRadius: "7px",
                    background: pm.bg, border: `1px solid ${pm.border}`,
                  }}>
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: pm.color }}>
                      {info.value}
                    </Typography>
                  </Box>
                ) : (
                  <Typography sx={{
                    fontFamily: "'Sora', sans-serif", fontSize: "0.9rem",
                    fontWeight: 700, color: "#0F172A",
                  }}>
                    {info.value}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>

          {/* ── ITEMS TABLE ── */}
          <Box sx={{ px: "32px", pb: "28px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "14px" }}>
              <Box sx={{
                width: 28, height: 28, borderRadius: "7px", background: "#EFF6FF",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ReceiptOutlinedIcon sx={{ fontSize: 14, color: "#2563EB" }} />
              </Box>
              <Typography sx={{
                fontFamily: "'Sora', sans-serif", fontWeight: 700,
                fontSize: "0.85rem", color: "#0F172A",
              }}>
                Order Summary
              </Typography>
              <Box sx={{
                ml: "auto", px: "8px", py: "2px", borderRadius: "6px",
                background: "#F1F5F9",
              }}>
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748B" }}>
                  {invoice.items?.length ?? 0} items
                </Typography>
              </Box>
            </Box>

            <Box sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: "#F8FAFC" }}>
                    {["#", "Item", "HSN", "GST", "Qty", "Rate", "Disc.", "Amount"].map((h) => (
                      <TableCell key={h} sx={{
                        fontSize: "0.62rem", fontWeight: 700, color: "#94A3B8",
                        textTransform: "uppercase", letterSpacing: "0.08em",
                        borderBottom: "1px solid #E2E8F0",
                        py: "10px", whiteSpace: "nowrap",
                      }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.items?.map((item, i) => (
                    <TableRow key={i} sx={{
                      "&:hover": { background: "#F8FAFF" },
                      "& td": { borderBottom: "1px solid #F1F5F9" },
                      "&:last-child td": { borderBottom: 0 },
                      transition: "background 0.1s",
                    }}>
                      <TableCell sx={{ color: "#CBD5E1", fontSize: "0.75rem", py: "12px", width: 28 }}>
                        {i + 1}
                      </TableCell>

                      <TableCell sx={{ py: "12px" }}>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.845rem", color: "#0F172A", lineHeight: 1.3 }}>
                          {item.item}
                        </Typography>
                        {item.item_code && (
                          <Typography sx={{
                            fontSize: "0.65rem", color: "#94A3B8",
                            fontFamily: "'Sora', monospace", mt: "2px",
                          }}>
                            {item.item_code}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell sx={{ fontSize: "0.775rem", color: "#64748B", py: "12px" }}>
                        {item.HSN || "—"}
                      </TableCell>

                      <TableCell sx={{ py: "12px" }}>
                        {item.GST ? (
                          <Box sx={{
                            display: "inline-flex", px: "6px", py: "1px",
                            borderRadius: "5px", background: "#EFF6FF",
                          }}>
                            <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#2563EB" }}>
                              {item.GST}%
                            </Typography>
                          </Box>
                        ) : "—"}
                      </TableCell>

                      <TableCell sx={{ py: "12px" }}>
                        <Box sx={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          minWidth: 28, height: 24, px: "6px",
                          background: "#F1F5F9", borderRadius: "6px",
                          fontWeight: 700, fontSize: "0.775rem", color: "#374151",
                        }}>
                          {item.qty}
                        </Box>
                      </TableCell>

                      <TableCell sx={{ fontSize: "0.845rem", fontWeight: 600, color: "#1E293B", py: "12px" }}>
                        ₹{Number(item.price).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell sx={{ py: "12px" }}>
                        {item.discount ? (
                          <Typography sx={{ color: "#EF4444", fontWeight: 700, fontSize: "0.775rem" }}>
                            −₹{item.discount}
                          </Typography>
                        ) : (
                          <Typography sx={{ color: "#CBD5E1", fontSize: "0.775rem" }}>—</Typography>
                        )}
                      </TableCell>

                      <TableCell sx={{ py: "12px" }}>
                        <Typography sx={{
                          fontWeight: 800, fontSize: "0.9rem",
                          color: "#10B981", fontFamily: "'Sora', sans-serif",
                        }}>
                          ₹{(item.qty * Number(item.price) - (item.discount || 0)).toLocaleString("en-IN")}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>

          {/* ── FOOTER STRIP ── */}
          <Box sx={{
            mx: "32px", mb: "32px",
            borderRadius: "12px", border: "1px solid #E2E8F0",
            background: "#F8FAFC",
            px: "24px", py: "18px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <Box>
              <Typography sx={{ fontSize: "0.67rem", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em", mb: "10px" }}>
                Authorized Signature
              </Typography>
              {signatureUrl ? (
                <Box
                  component="img"
                  src={signatureUrl}
                  alt="Authorized Signature"
                  crossOrigin="anonymous"
                  sx={{ width: 150, height: 72, objectFit: "contain", display: "block" }}
                />
              ) : (
                <Box sx={{ width: 150, height: 72 }} />
              )}
              <Box sx={{ width: 150, borderBottom: "1.5px solid #CBD5E1", mt: "4px" }} />
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{
                fontFamily: "'Sora', sans-serif", fontWeight: 800,
                fontSize: "0.9rem", color: "#2563EB",
              }}>
                {invoice.shopName}
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", mt: "3px" }}>
                Thank you for your business 🙏
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════
          RIGHT — summary sidebar
      ══════════════════════════════════════════ */}
      <Box sx={{
        width: 280, flexShrink: 0,
        height: "100vh", position: "sticky", top: 0,
        overflowY: "auto",
        background: "#FFFFFF",
        borderLeft: "1px solid #E2E8F0",
        display: "flex", flexDirection: "column",
        "&::-webkit-scrollbar": { width: "3px" },
        "&::-webkit-scrollbar-thumb": { background: "#E2E8F0", borderRadius: "2px" },
      }}>
        {/* Sidebar header */}
        <Box sx={{
          px: "20px", pt: "28px", pb: "20px",
          borderBottom: "1px solid #F1F5F9",
        }}>
          <Typography sx={{
            fontFamily: "'Sora', sans-serif", fontWeight: 800,
            fontSize: "0.9rem", color: "#0F172A",
          }}>
            Invoice Summary
          </Typography>
          <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", mt: "2px" }}>
            #{invoice.invoiceNumber}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, px: "16px", py: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>

          {/* Totals card */}
          <Box sx={{
            borderRadius: "12px", border: "1px solid #E2E8F0",
            overflow: "hidden",
          }}>
            <Box sx={{ px: "16px", py: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Subtotal", value: `₹${Number(subtotal).toLocaleString("en-IN")}`, color: "#475569" },
                { label: "Tax (GST)", value: `₹${Number(tax).toLocaleString("en-IN")}`, color: "#F59E0B" },
              ].map((row) => (
                <Box key={row.label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography sx={{ fontSize: "0.78rem", color: "#64748B" }}>{row.label}</Typography>
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: row.color }}>{row.value}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{
              px: "16px", py: "12px",
              background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
                Total
              </Typography>
              <Typography sx={{
                fontFamily: "'Sora', sans-serif", fontSize: "1.25rem",
                fontWeight: 900, color: "#fff", letterSpacing: "-0.02em",
              }}>
                ₹{Number(total).toLocaleString("en-IN")}
              </Typography>
            </Box>
          </Box>

          {/* Customer card */}
          <Box sx={{
            borderRadius: "12px", border: "1px solid #E2E8F0",
            background: "#F8FAFC", p: "14px",
            display: "flex", flexDirection: "column", gap: "10px",
          }}>
            <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Customer
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: "10px",
                background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
                border: "1px solid #BFDBFE",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 800, color: "#2563EB" }}>
                  {invoice.customerName?.[0]?.toUpperCase() ?? "?"}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "'Sora', sans-serif", fontSize: "0.84rem", fontWeight: 700, color: "#0F172A" }}>
                  {invoice.customerName}
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#64748B", mt: "1px" }}>
                  {invoice.phone || "No phone"}
                </Typography>
              </Box>
            </Box>
            {paymentDisplay && (
              <Box sx={{
                display: "inline-flex", alignItems: "center",
                px: "10px", py: "4px", borderRadius: "7px",
                background: pm.bg, border: `1px solid ${pm.border}`,
                alignSelf: "flex-start",
              }}>
                <PaymentOutlinedIcon sx={{ fontSize: 11, color: pm.color, mr: "4px" }} />
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: pm.color }}>
                  {paymentDisplay}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Date/time card */}
          <Box sx={{
            borderRadius: "12px", border: "1px solid #E2E8F0",
            background: "#F8FAFC", p: "14px",
            display: "flex", flexDirection: "column", gap: "8px",
          }}>
            <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Date & Time
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: "#2563EB" }} />
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#1E293B" }}>{invoice.date}</Typography>
            </Box>
            {invoice.time && (
              <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <AccessTimeOutlinedIcon sx={{ fontSize: 13, color: "#7C3AED" }} />
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#1E293B" }}>{invoice.time}</Typography>
              </Box>
            )}
          </Box>

          {/* Items mini list */}
          <Box sx={{ borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
            <Box sx={{ px: "14px", py: "10px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Items ({invoice.items?.length ?? 0})
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {invoice.items?.map((item, i) => (
                <Box key={i} sx={{
                  px: "14px", py: "9px",
                  borderBottom: i < invoice.items.length - 1 ? "1px solid #F1F5F9" : "none",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  "&:hover": { background: "#F8FAFF" },
                }}>
                  <Box>
                    <Typography sx={{ fontSize: "0.775rem", fontWeight: 600, color: "#1E293B", lineHeight: 1.3 }}>
                      {item.item}
                    </Typography>
                    <Typography sx={{ fontSize: "0.65rem", color: "#94A3B8" }}>
                      qty {item.qty} × ₹{item.price}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#10B981", fontFamily: "'Sora', sans-serif", flexShrink: 0, ml: 1 }}>
                    ₹{(item.qty * Number(item.price) - (item.discount || 0)).toLocaleString("en-IN")}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Action buttons — pinned to bottom */}
        <Box sx={{
          px: "16px", py: "16px",
          borderTop: "1px solid #F1F5F9",
          display: "flex", flexDirection: "column", gap: "8px",
          background: "#fff",
        }}>
          <Button
            fullWidth
            startIcon={<WhatsAppIcon sx={{ fontSize: "16px !important", color: "#16A34A" }} />}
            onClick={openWhatsApp}
            sx={{
              textTransform: "none", fontWeight: 700, fontSize: "0.82rem",
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: "10px", height: 40,
              background: "#F0FDF4", color: "#16A34A",
              border: "1px solid #BBF7D0",
              "&:hover": { background: "#DCFCE7", borderColor: "#86EFAC" },
              transition: "all 0.15s",
            }}
          >
            Send on WhatsApp
          </Button>
          <Button
            fullWidth
            startIcon={<PictureAsPdfOutlinedIcon sx={{ fontSize: "16px !important" }} />}
            onClick={handleDownloadPDF}
            sx={{
              textTransform: "none", fontWeight: 700, fontSize: "0.82rem",
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: "10px", height: 40,
              background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
              color: "#fff",
              boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
              "&:hover": { boxShadow: "0 6px 20px rgba(37,99,235,0.4)", transform: "translateY(-1px)" },
              transition: "all 0.18s ease",
            }}
          >
            Download PDF
          </Button>
          <Button
            fullWidth
            startIcon={<ReceiptOutlinedIcon sx={{ fontSize: "16px !important" }} />}
            onClick={handleExportCSV}
            sx={{
              textTransform: "none", fontWeight: 700, fontSize: "0.82rem",
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: "10px", height: 40,
              background: "#F8FAFC",
              color: "#475569",
              border: "1px solid #E2E8F0",
              "&:hover": { background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" },
              transition: "all 0.15s",
            }}
          >
            Export CSV
          </Button>
        </Box>
      </Box>
    </Box>
  );
}