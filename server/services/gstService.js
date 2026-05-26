const round2 = (value) => {
  const num = Number(value) || 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const parsed = parseDateValue(value);
  if (!parsed) {
    return "-";
  }

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatCurrency = (value) => `₹ ${round2(value).toLocaleString("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeGstType = (gstType) => {
  return String(gstType || "INTRA").toUpperCase() === "INTER" ? "INTER" : "INTRA";
};

const parseDateValue = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string") {
    const ddmmyyyy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      const parsed = new Date(Number(year), Number(month) - 1, Number(day));
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (yyyymmdd) {
      const [, year, month, day] = yyyymmdd;
      const parsed = new Date(Number(year), Number(month) - 1, Number(day));
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }

  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const computeItemGST = (item = {}, product = {}) => {
  const quantity = toNumber(item.quantity ?? item.qty, 0);
  const price = toNumber(item.price, 0);
  const taxableAmount = round2(price * quantity);

  const gstRate = toNumber(product.GST ?? item.gstRate ?? item.GST, 0);
  const totalGST = round2((taxableAmount * gstRate) / 100);

  const gstType = normalizeGstType(item.gstType);

  const cgst = gstType === "INTRA" ? round2(totalGST / 2) : 0;
  const sgst = gstType === "INTRA" ? round2(totalGST / 2) : 0;
  const igst = gstType === "INTER" ? totalGST : 0;

  return {
    productId: item.productId || item._id || product._id || undefined,
    item_code: item.item_code || product.item_code || "",
    item: item.item || product.item || "",
    HSN: item.HSN || product.HSN || "",
    GST: gstRate,
    price: round2(price),
    qty: quantity,
    quantity,
    discount: toNumber(item.discount, 0),
    taxableAmount,
    gstRate,
    gstType,
    cgst,
    sgst,
    igst,
    totalGST,
    grandTotal: round2(taxableAmount + totalGST)
  };
};

const computeInvoiceGST = (invoice = {}, products = []) => {
  const productMapById = new Map();
  const productMapByCode = new Map();

  products.forEach((product) => {
    if (product?._id) {
      productMapById.set(String(product._id), product);
    }
    if (product?.item_code) {
      productMapByCode.set(String(product.item_code), product);
    }
  });

  const items = Array.isArray(invoice.items) ? invoice.items : [];

  const normalizedItems = items.map((item) => {
    const product =
      productMapById.get(String(item.productId || item._id || "")) ||
      productMapByCode.get(String(item.item_code || "")) ||
      {};

    return computeItemGST({ ...item, gstType: item.gstType || invoice.gstType }, product);
  });

  const gstSummary = normalizedItems.reduce(
    (acc, item) => {
      acc.totalTaxableAmount = round2(acc.totalTaxableAmount + item.taxableAmount);
      acc.totalGST = round2(acc.totalGST + item.totalGST);
      acc.cgstTotal = round2(acc.cgstTotal + item.cgst);
      acc.sgstTotal = round2(acc.sgstTotal + item.sgst);
      acc.igstTotal = round2(acc.igstTotal + item.igst);
      return acc;
    },
    {
      totalTaxableAmount: 0,
      totalGST: 0,
      cgstTotal: 0,
      sgstTotal: 0,
      igstTotal: 0
    }
  );

  return {
    items: normalizedItems,
    gstSummary
  };
};

const normalizeLegacyInvoices = (invoice = {}) => {
  const items = Array.isArray(invoice.items) ? invoice.items : [];

  const normalizedItems = items.map((item) => {
    const quantity = toNumber(item.quantity ?? item.qty, 0);
    const price = toNumber(item.price, 0);

    const taxableAmount = round2(
      item.taxableAmount !== undefined ? item.taxableAmount : price * quantity
    );

    const gstRate = toNumber(item.gstRate ?? item.GST, 0);
    const gstType = normalizeGstType(item.gstType);

    const fallbackTotalGST = round2((taxableAmount * gstRate) / 100);
    const totalGST = round2(item.totalGST !== undefined ? item.totalGST : fallbackTotalGST);

    let cgst = toNumber(item.cgst);
    let sgst = toNumber(item.sgst);
    let igst = toNumber(item.igst);

    const missingTaxBreakup = item.cgst === undefined && item.sgst === undefined && item.igst === undefined;
    if (missingTaxBreakup) {
      if (gstType === "INTER") {
        cgst = 0;
        sgst = 0;
        igst = totalGST;
      } else {
        cgst = round2(totalGST / 2);
        sgst = round2(totalGST / 2);
        igst = 0;
      }
    }

    return {
      productId: item.productId,
      item_code: item.item_code,
      item: item.item,
      HSN: item.HSN,
      GST: gstRate,
      price: round2(price),
      qty: quantity,
      quantity,
      discount: toNumber(item.discount, 0),
      taxableAmount,
      gstRate,
      gstType,
      cgst: round2(cgst),
      sgst: round2(sgst),
      igst: round2(igst),
      totalGST,
      grandTotal: round2(taxableAmount + totalGST)
    };
  });

  const gstSummary = normalizedItems.reduce(
    (acc, item) => {
      acc.totalTaxableAmount = round2(acc.totalTaxableAmount + item.taxableAmount);
      acc.totalGST = round2(acc.totalGST + item.totalGST);
      acc.cgstTotal = round2(acc.cgstTotal + item.cgst);
      acc.sgstTotal = round2(acc.sgstTotal + item.sgst);
      acc.igstTotal = round2(acc.igstTotal + item.igst);
      return acc;
    },
    {
      totalTaxableAmount: 0,
      totalGST: 0,
      cgstTotal: 0,
      sgstTotal: 0,
      igstTotal: 0
    }
  );

  const rates = [...new Set(normalizedItems.map((item) => item.gstRate).filter((rate) => rate > 0))];

  const invoiceDateObj = parseDateValue(invoice.createdAt || invoice.date);
  const dateLabel = formatDate(invoiceDateObj || invoice.date);

  const hasInter = normalizedItems.some((item) => item.gstType === "INTER" || item.igst > 0);
  const gstType = hasInter ? "INTER" : "INTRA";

  const taxableAmount = gstSummary.totalTaxableAmount;
  const totalGST = gstSummary.totalGST;
  const cgst = gstSummary.cgstTotal;
  const sgst = gstSummary.sgstTotal;
  const igst = gstSummary.igstTotal;
  const grandTotal = round2(invoice.total ?? taxableAmount + totalGST);

  return {
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    date: dateLabel,
    customerName: invoice.customerName || "Walk-in Customer",
    taxableAmount,
    gstRate: rates.length === 1 ? rates[0] : (rates.length > 1 ? "Mixed" : 0),
    cgst,
    sgst,
    igst,
    totalGST,
    grandTotal,
    gstType,
    createdAt: invoice.createdAt,
    items: normalizedItems,
    formatted: {
      date: dateLabel,
      taxableAmount: formatCurrency(taxableAmount),
      cgst: formatCurrency(cgst),
      sgst: formatCurrency(sgst),
      igst: formatCurrency(igst),
      totalGST: formatCurrency(totalGST),
      grandTotal: formatCurrency(grandTotal)
    }
  };
};

const aggregateGSTReports = (invoices = []) => {
  const normalizedInvoices = invoices.map(normalizeLegacyInvoices);

  const summary = normalizedInvoices.reduce(
    (acc, invoice) => {
      acc.totalInvoices += 1;
      acc.totalRevenue = round2(acc.totalRevenue + invoice.grandTotal);
      acc.totalTaxableAmount = round2(acc.totalTaxableAmount + invoice.taxableAmount);
      acc.totalGST = round2(acc.totalGST + invoice.totalGST);
      acc.cgstTotal = round2(acc.cgstTotal + invoice.cgst);
      acc.sgstTotal = round2(acc.sgstTotal + invoice.sgst);
      acc.igstTotal = round2(acc.igstTotal + invoice.igst);
      return acc;
    },
    {
      totalInvoices: 0,
      totalRevenue: 0,
      totalTaxableAmount: 0,
      totalGST: 0,
      cgstTotal: 0,
      sgstTotal: 0,
      igstTotal: 0
    }
  );

  const monthlyMap = new Map();
  const hsnMap = new Map();

  normalizedInvoices.forEach((invoice) => {
    const dt = parseDateValue(invoice.createdAt || invoice.date);
    if (!dt) {
      return;
    }

    const monthKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        month: monthKey,
        gst: 0,
        taxableAmount: 0,
        revenue: 0
      });
    }

    const row = monthlyMap.get(monthKey);
    row.gst = round2(row.gst + invoice.totalGST);
    row.taxableAmount = round2(row.taxableAmount + invoice.taxableAmount);
    row.revenue = round2(row.revenue + invoice.grandTotal);

    invoice.items.forEach((item) => {
      const hsnKey = String(item.HSN || "N/A");
      if (!hsnMap.has(hsnKey)) {
        hsnMap.set(hsnKey, {
          HSN: hsnKey,
          taxableAmount: 0,
          gst: 0,
          cgst: 0,
          sgst: 0,
          igst: 0
        });
      }

      const hsnRow = hsnMap.get(hsnKey);
      hsnRow.taxableAmount = round2(hsnRow.taxableAmount + item.taxableAmount);
      hsnRow.gst = round2(hsnRow.gst + item.totalGST);
      hsnRow.cgst = round2(hsnRow.cgst + item.cgst);
      hsnRow.sgst = round2(hsnRow.sgst + item.sgst);
      hsnRow.igst = round2(hsnRow.igst + item.igst);
    });
  });

  const hsnSummary = [...hsnMap.values()]
    .sort((a, b) => a.HSN.localeCompare(b.HSN))
    .map((row) => ({
      ...row,
      formatted: {
        taxableAmount: formatCurrency(row.taxableAmount),
        gst: formatCurrency(row.gst),
        cgst: formatCurrency(row.cgst),
        sgst: formatCurrency(row.sgst),
        igst: formatCurrency(row.igst)
      }
    }));

  const totalRevenue = summary.totalRevenue;
  const totalTaxableAmount = summary.totalTaxableAmount;
  const totalGST = summary.totalGST;
  const cgstTotal = summary.cgstTotal;
  const sgstTotal = summary.sgstTotal;
  const igstTotal = summary.igstTotal;

  return {
    ...summary,
    invoices: normalizedInvoices,
    monthlyTrend: [...monthlyMap.values()]
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((row) => ({
        ...row,
        formatted: {
          gst: formatCurrency(row.gst),
          taxableAmount: formatCurrency(row.taxableAmount),
          revenue: formatCurrency(row.revenue)
        }
      })),
    gstSplit: {
      cgst: cgstTotal,
      sgst: sgstTotal,
      igst: igstTotal
    },
    hsnSummary,
    formatted: {
      totalRevenue: formatCurrency(totalRevenue),
      totalTaxableAmount: formatCurrency(totalTaxableAmount),
      totalGST: formatCurrency(totalGST),
      cgstTotal: formatCurrency(cgstTotal),
      sgstTotal: formatCurrency(sgstTotal),
      igstTotal: formatCurrency(igstTotal)
    }
  };
};

module.exports = {
  formatDate,
  formatCurrency,
  computeItemGST,
  computeInvoiceGST,
  normalizeLegacyInvoices,
  aggregateGSTReports
};
