const PDFDocument = require("pdfkit");
const Invoice = require("../models/Invoice");
const { aggregateGSTReports, formatCurrency, formatDate } = require("../services/gstService");

const escapeCsv = (value) => {
  const output = String(value ?? "");
  if (output.includes(",") || output.includes("\"") || output.includes("\n")) {
    return `"${output.replace(/\"/g, '""')}"`;
  }
  return output;
};

const buildDateQuery = (query = {}) => {
  const { startDate, endDate, month, year } = query;

  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : new Date("1970-01-01");
    const end = endDate ? new Date(endDate) : new Date();

    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { createdAt: { $gte: start, $lte: end } };
    }
  }

  if (month && year) {
    const monthNum = Number(month);
    const yearNum = Number(year);

    if (Number.isFinite(monthNum) && Number.isFinite(yearNum) && monthNum >= 1 && monthNum <= 12) {
      const start = new Date(yearNum, monthNum - 1, 1);
      const end = new Date(yearNum, monthNum, 0);
      end.setHours(23, 59, 59, 999);
      return { createdAt: { $gte: start, $lte: end } };
    }
  }

  if (year) {
    const yearNum = Number(year);
    if (Number.isFinite(yearNum)) {
      const start = new Date(yearNum, 0, 1);
      const end = new Date(yearNum, 11, 31, 23, 59, 59, 999);
      return { createdAt: { $gte: start, $lte: end } };
    }
  }

  return {};
};

const getFilterLabel = (query = {}) => {
  const { startDate, endDate, month, year } = query;

  if (startDate || endDate) {
    return `${startDate || "Beginning"} to ${endDate || "Today"}`;
  }
  if (month && year) {
    return `Month ${month}/${year}`;
  }
  if (year) {
    return `Year ${year}`;
  }
  return "All Time";
};

const fetchGstPayload = async (req) => {
  const dateQuery = buildDateQuery(req.query);

  const invoices = await Invoice.find({
    user: req.user._id,
    ...dateQuery
  }).sort({ createdAt: 1 });

  const report = aggregateGSTReports(invoices);

  return {
    ...report,
    filters: {
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
      month: req.query.month || null,
      year: req.query.year || null,
      label: getFilterLabel(req.query)
    }
  };
};

const getGstReport = async (req, res) => {
  try {
    const payload = await fetchGstPayload(req);
    res.status(200).json(payload);
  } catch (error) {
    console.error("GST report error:", error);
    res.status(500).json({ message: "Unable to generate GST report" });
  }
};

const exportGstCsv = async (req, res) => {
  try {
    const payload = await fetchGstPayload(req);

    const round2 = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

    const parseDateToYyyyMmDd = (value) => {
      if (!value) return "";

      if (typeof value === "string") {
        const ddmmyyyy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
        if (ddmmyyyy) {
          const [, dd, mm, yyyy] = ddmmyyyy;
          return `${yyyy}-${mm}-${dd}`;
        }

        const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
        if (yyyymmdd) {
          return value;
        }
      }

      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return "";

      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, "0");
      const dd = String(parsed.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    const normalizeInvoiceId = (value) => {
      const raw = String(value ?? "").trim();
      if (!raw) return "";
      return raw.toUpperCase().startsWith("INV-") ? raw : `INV-${raw}`;
    };

    const usedIds = new Set();
    const ensureUniqueInvoiceId = (normalizedId) => {
      let candidate = normalizedId;
      let index = 2;
      while (usedIds.has(candidate)) {
        candidate = `${normalizedId}-${index}`;
        index += 1;
      }
      usedIds.add(candidate);
      return candidate;
    };

    const toSafeNumber = (value, fallback = 0) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const buildValidatedCsvRow = (invoice) => {
      const baseId = normalizeInvoiceId(invoice.invoiceNumber || invoice.invoiceId);
      if (!baseId) return null;

      const invoiceId = ensureUniqueInvoiceId(baseId);
      const date = parseDateToYyyyMmDd(invoice.date || invoice.createdAt);
      if (!date) return null;

      const customerName = String(invoice.customerName || "").trim();
      if (!customerName) return null;

      const taxableAmount = round2(toSafeNumber(invoice.taxableAmount, NaN));
      if (!Number.isFinite(taxableAmount) || taxableAmount < 0) return null;

      const gstType = String(invoice.gstType || "INTRA").toUpperCase() === "INTER" ? "INTER" : "INTRA";

      const existingComponentGst = round2(
        toSafeNumber(invoice.cgst) + toSafeNumber(invoice.sgst) + toSafeNumber(invoice.igst)
      );

      let gstRate = toSafeNumber(invoice.gstRate, NaN);
      if (!Number.isFinite(gstRate) && taxableAmount > 0 && existingComponentGst >= 0) {
        gstRate = round2((existingComponentGst * 100) / taxableAmount);
      }

      if (!Number.isFinite(gstRate) || gstRate < 0 || gstRate > 28) return null;

      const totalGst = round2((taxableAmount * gstRate) / 100);

      const cgst = gstType === "INTRA" ? round2(totalGst / 2) : 0;
      const sgst = gstType === "INTRA" ? round2(totalGst / 2) : 0;
      const igst = gstType === "INTER" ? totalGst : 0;

      const total = round2(taxableAmount + cgst + sgst + igst);

      return {
        invoiceId,
        date,
        customerName,
        gstType,
        taxableAmount: taxableAmount.toFixed(2),
        gstRate: gstRate.toFixed(2),
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        igst: igst.toFixed(2),
        total: total.toFixed(2)
      };
    };

    const headers = [
      "Invoice ID",
      "Date",
      "Customer",
      "GST Type",
      "Taxable Amount",
      "GST Rate",
      "CGST",
      "SGST",
      "IGST",
      "Total"
    ];

    const lines = [headers.join(",")];
    const validRows = [];

    payload.invoices.forEach((invoice) => {
      const row = buildValidatedCsvRow(invoice);
      if (row) {
        validRows.push(row);
      }
    });

    if (validRows.length === 0) {
      return res.status(422).json({ message: "No valid invoice rows available for CSV export" });
    }

    validRows.forEach((row) => {
      lines.push([
        escapeCsv(row.invoiceId),
        escapeCsv(row.date),
        escapeCsv(row.customerName),
        escapeCsv(row.gstType),
        escapeCsv(row.taxableAmount),
        escapeCsv(row.gstRate),
        escapeCsv(row.cgst),
        escapeCsv(row.sgst),
        escapeCsv(row.igst),
        escapeCsv(row.total)
      ].join(","));
    });

    if (payload.hsnSummary?.length) {
      lines.push("");
      lines.push("HSN Summary");
      lines.push(["HSN", "Taxable Value", "GST", "CGST", "SGST", "IGST"].join(","));

      payload.hsnSummary.forEach((row) => {
        lines.push([
          escapeCsv(row.HSN),
          escapeCsv(Number(row.taxableAmount || 0).toFixed(2)),
          escapeCsv(Number(row.gst || 0).toFixed(2)),
          escapeCsv(Number(row.cgst || 0).toFixed(2)),
          escapeCsv(Number(row.sgst || 0).toFixed(2)),
          escapeCsv(Number(row.igst || 0).toFixed(2))
        ].join(","));
      });
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=\"gst-report.csv\"");
    return res.status(200).send(lines.join("\n"));
  } catch (error) {
    console.error("GST CSV export error:", error);
    res.status(500).json({ message: "Unable to export GST CSV" });
  }
};

const exportGstPdf = async (req, res) => {
  try {
    const payload = await fetchGstPayload(req);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=\"gst-report.pdf\"");

    const doc = new PDFDocument({ margin: 36, size: "A4" });
    doc.pipe(res);

    const rightEdge = 559;
    const drawTableHeader = (columns, y) => {
      doc.rect(36, y - 2, rightEdge - 36, 16).fill("#f1f5f9");
      doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(8);

      columns.forEach((column) => {
        doc.text(column.label, column.x, y + 2, {
          width: column.width,
          align: column.align
        });
      });

      doc.moveTo(36, y + 14).lineTo(rightEdge, y + 14).stroke("#cbd5e1");
      return y + 18;
    };

    const ensureSpace = (y, minSpace) => {
      if (y + minSpace <= 790) {
        return y;
      }

      doc.addPage();
      return 42;
    };

    doc.fontSize(18).font("Helvetica-Bold").fillColor("#0f172a").text("GST Report", 36, 40, { align: "left" });
    doc.fontSize(10).font("Helvetica").fillColor("#475569").text(`Date Range: ${payload.filters.label}`, 36, 64, { align: "left" });
    doc.text(`Generated: ${formatDate(new Date())} ${new Date().toLocaleTimeString("en-IN")}`, 36, 78, { align: "left" });

    let y = 106;

    doc.font("Helvetica-Bold").fontSize(12).fillColor("#0f172a").text("GST Summary", 36, y);
    y += 18;

    const summaryRows = [
      ["Total Invoices", String(payload.totalInvoices)],
      ["Total Revenue", payload.formatted?.totalRevenue || formatCurrency(payload.totalRevenue)],
      ["Total Taxable Amount", payload.formatted?.totalTaxableAmount || formatCurrency(payload.totalTaxableAmount)],
      ["Total GST", payload.formatted?.totalGST || formatCurrency(payload.totalGST)],
      ["CGST", payload.formatted?.cgstTotal || formatCurrency(payload.cgstTotal)],
      ["SGST", payload.formatted?.sgstTotal || formatCurrency(payload.sgstTotal)],
      ["IGST", payload.formatted?.igstTotal || formatCurrency(payload.igstTotal)]
    ];

    summaryRows.forEach(([label, value], idx) => {
      const isEven = idx % 2 === 0;
      doc.rect(36, y - 1, rightEdge - 36, 15).fill(isEven ? "#ffffff" : "#f8fafc");
      doc.fillColor("#334155").font("Helvetica-Bold").fontSize(9).text(label, 42, y + 3, { width: 220, align: "left" });
      doc.fillColor("#0f172a").font("Helvetica").text(value, 270, y + 3, { width: rightEdge - 276, align: "right" });
      y += 15;
    });

    y += 14;
    y = ensureSpace(y, 120);

    doc.font("Helvetica-Bold").fontSize(12).fillColor("#0f172a").text("Invoice Breakdown", 36, y);
    y += 16;

    const invoiceColumns = [
      { key: "invoice", label: "Invoice", x: 36, width: 52, align: "left" },
      { key: "date", label: "Date", x: 88, width: 62, align: "left" },
      { key: "customer", label: "Customer", x: 150, width: 96, align: "left" },
      { key: "gstType", label: "Type", x: 246, width: 40, align: "left" },
      { key: "taxable", label: "Taxable", x: 286, width: 56, align: "right" },
      { key: "cgst", label: "CGST", x: 342, width: 46, align: "right" },
      { key: "sgst", label: "SGST", x: 388, width: 46, align: "right" },
      { key: "igst", label: "IGST", x: 434, width: 46, align: "right" },
      { key: "total", label: "Total", x: 480, width: 79, align: "right" }
    ];

    y = drawTableHeader(invoiceColumns, y);

    payload.invoices.forEach((invoice, index) => {
      y = ensureSpace(y, 18);
      if (y === 42) {
        y += 8;
        y = drawTableHeader(invoiceColumns, y);
      }

      doc.rect(36, y - 2, rightEdge - 36, 15).fill(index % 2 === 0 ? "#ffffff" : "#f8fafc");

      const row = {
        invoice: String(invoice.invoiceNumber || String(invoice.invoiceId).slice(-6)),
        date: invoice.formatted?.date || formatDate(invoice.date),
        customer: invoice.customerName || "-",
        gstType: invoice.gstType || "INTRA",
        taxable: invoice.formatted?.taxableAmount || formatCurrency(invoice.taxableAmount),
        cgst: invoice.formatted?.cgst || formatCurrency(invoice.cgst),
        sgst: invoice.formatted?.sgst || formatCurrency(invoice.sgst),
        igst: invoice.formatted?.igst || formatCurrency(invoice.igst),
        total: invoice.formatted?.grandTotal || formatCurrency(invoice.grandTotal)
      };

      doc.fillColor("#1e293b").font("Helvetica").fontSize(7.6);
      invoiceColumns.forEach((column) => {
        doc.text(row[column.key], column.x, y + 2, {
          width: column.width,
          align: column.align,
          ellipsis: true
        });
      });

      y += 15;
    });

    y += 10;
    y = ensureSpace(y, 90);

    if (payload.hsnSummary?.length) {
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#0f172a").text("HSN Summary", 36, y);
      y += 16;

      const hsnColumns = [
        { key: "HSN", label: "HSN", x: 36, width: 90, align: "left" },
        { key: "taxable", label: "Taxable Value", x: 126, width: 108, align: "right" },
        { key: "gst", label: "GST", x: 234, width: 81, align: "right" },
        { key: "cgst", label: "CGST", x: 315, width: 81, align: "right" },
        { key: "sgst", label: "SGST", x: 396, width: 81, align: "right" },
        { key: "igst", label: "IGST", x: 477, width: 82, align: "right" }
      ];

      y = drawTableHeader(hsnColumns, y);

      payload.hsnSummary.forEach((row, index) => {
        y = ensureSpace(y, 18);
        if (y === 42) {
          y += 8;
          y = drawTableHeader(hsnColumns, y);
        }

        doc.rect(36, y - 2, rightEdge - 36, 15).fill(index % 2 === 0 ? "#ffffff" : "#f8fafc");

        const cells = {
          HSN: row.HSN,
          taxable: row.formatted?.taxableAmount || formatCurrency(row.taxableAmount),
          gst: row.formatted?.gst || formatCurrency(row.gst),
          cgst: row.formatted?.cgst || formatCurrency(row.cgst),
          sgst: row.formatted?.sgst || formatCurrency(row.sgst),
          igst: row.formatted?.igst || formatCurrency(row.igst)
        };

        doc.fillColor("#1e293b").font("Helvetica").fontSize(7.8);
        hsnColumns.forEach((column) => {
          doc.text(cells[column.key], column.x, y + 2, {
            width: column.width,
            align: column.align,
            ellipsis: true
          });
        });

        y += 15;
      });
    }

    const footerText = "This is a system generated GST report";
    doc.fontSize(9).font("Helvetica").fillColor("#64748b");
    doc.text(footerText, 36, 810, { align: "center", width: rightEdge - 36 });

    doc.end();
  } catch (error) {
    console.error("GST PDF export error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Unable to export GST PDF" });
    }
  }
};

module.exports = {
  getGstReport,
  exportGstCsv,
  exportGstPdf
};
