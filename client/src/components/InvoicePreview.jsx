// src/components/InvoicePreview.jsx
import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import InvoiceTemplateRenderer from "./invoices/InvoiceTemplateRenderer";

// npm install html2pdf.js
// import html2pdf from "html2pdf.js";  ← uncomment when installed

export default function InvoicePreview({ invoice, templateId = "classic" }) {
  const previewRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      // Dynamic import so it doesn't break SSR
      const html2pdf = (await import("html2pdf.js")).default;

      await html2pdf()
        .set({
          margin:      [0, 0, 0, 0],
          filename:    `Invoice-${invoice.billNumber}.pdf`,
          image:       { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF:       { unit: "px", format: [794, 1123], orientation: "portrait" },
        })
        .from(previewRef.current)
        .save();
    } catch (err) {
      console.error("PDF export error:", err);
      alert("PDF export failed. Make sure html2pdf.js is installed.");
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <Box>
      {/* ── Action bar ─────────────────────────────────────────────────── */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2, px: 1 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "primary.main" }} />
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "text.secondary" }}>
            Template: <Box component="span" sx={{ color: "text.primary" }}>{templateId}</Box>
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          {/* Print */}
          <Tooltip title="Print invoice">
            <Button
              variant="outlined"
              size="small"
              onClick={handlePrint}
              startIcon={
                <Box component="svg" width={15} height={15} viewBox="0 0 24 24" fill="currentColor" sx={{ display: "block" }}>
                  <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
                </Box>
              }
              sx={{ borderRadius: "8px", borderColor: "divider", color: "text.primary", fontSize: "12px", "&:hover": { borderColor: "primary.main", color: "primary.main", bgcolor: "primary.light" } }}
            >
              Print
            </Button>
          </Tooltip>

          {/* Export PDF */}
          <Button
            variant="contained"
            size="small"
            onClick={handleExportPDF}
            disabled={exporting}
            startIcon={exporting
              ? <CircularProgress size={14} color="inherit" />
              : (
                <Box component="svg" width={15} height={15} viewBox="0 0 24 24" fill="currentColor" sx={{ display: "block" }}>
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                </Box>
              )
            }
            sx={{ borderRadius: "8px", fontWeight: 700, fontSize: "12px", px: 2, boxShadow: "0 4px 12px rgba(27,110,243,0.3)", "&:hover": { boxShadow: "0 6px 16px rgba(27,110,243,0.4)" } }}
          >
            {exporting ? "Exporting…" : "Export PDF"}
          </Button>
        </Stack>
      </Stack>

      {/* ── Invoice preview ────────────────────────────────────────────── */}
      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
          bgcolor: "#E4E9F0",
          borderRadius: 3,
          p: { xs: 1.5, md: 3 },
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Shadow wrapper */}
        <Box
          sx={{
            boxShadow: "0 8px 40px rgba(15,28,46,0.18)",
            borderRadius: 1,
            overflow: "hidden",
            transformOrigin: "top center",
            // Responsive scale down on small screens
            transform: { xs: "scale(0.45)", sm: "scale(0.65)", md: "scale(0.80)", lg: "scale(1)" },
            mb: { xs: "-300px", sm: "-200px", md: "-100px", lg: 0 },
          }}
        >
          <Box ref={previewRef} id="invoice-content">
            <InvoiceTemplateRenderer invoice={{ ...invoice, templateId }} />
          </Box>
        </Box>
      </Box>

      {/* Print styles — hides everything except invoice */}
      <Box
        component="style"
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body > * { display: none !important; }
              #invoice-content { display: block !important; }
            }
          `,
        }}
      />
    </Box>
  );
}