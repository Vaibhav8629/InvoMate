// utils/generateDailyReport.js
const PDFDocument = require('pdfkit');
const moment      = require('moment');
const https       = require('https');
const http        = require('http');
const { getInvoicePaymentLabel } = require('./invoicePayment');

module.exports = async function generateDailyReport(res, {
  businessName,
  invoices,
  lowStockItems,
  date,
  signatureUrl,
}) {

  // ── Fetch signature BEFORE starting the PDF stream ──────────────────
  let sigBuffer = null;
  if (signatureUrl) {
    try {
      sigBuffer = await new Promise((resolve, reject) => {
        const lib = signatureUrl.startsWith('https') ? https : http;
        lib.get(signatureUrl, (response) => {
          const chunks = [];
          response.on('data', chunk => chunks.push(chunk));
          response.on('end',  ()    => resolve(Buffer.concat(chunks)));
          response.on('error', reject);
        });
      });
    } catch (e) {
      console.error('Signature fetch failed:', e.message);
      sigBuffer = null;
    }
  }

  // ── Now start the PDF (no await inside here anymore) ─────────────────
  return new Promise((resolve, reject) => {

    const doc = new PDFDocument({ margin: 30, size: 'A4', bufferPages: true });

    doc.on('error', reject);
    res.on('error', reject);
    doc.on('end', resolve);
    doc.pipe(res);

    const W    = 535;
    const LEFT = 30;
    const inr  = n => `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    // ── Computed totals ─────────────────────────────────────────────────
    const totalOrders  = invoices.length;
    const totalRevenue = invoices.reduce((s, i) => s + (i.total  || 0), 0);
    const totalProfit  = invoices.reduce((s, i) => s + (i.profit || 0), 0);
    const totalTax     = invoices.reduce((s, i) => s + (i.tax    || 0), 0);
    const totalItems   = invoices.reduce((s, i) =>
      s + (i.items || []).reduce((si, it) => si + (it.qty || 0), 0), 0);
    const cashTotal    = invoices
      .filter(i => (i.paymode || '').toLowerCase() === 'cash')
      .reduce((s, i) => s + (i.total || 0), 0);
    const upiTotal     = invoices
      .filter(i => (i.paymode || '').toLowerCase() === 'upi')
      .reduce((s, i) => s + (i.total || 0), 0);

    // ── Outer double border ─────────────────────────────────────────────
    doc.rect(25, 25, W + 10, 787).lineWidth(2).stroke('#000000');
    doc.rect(28, 28, W + 4,  781).lineWidth(0.5).stroke('#000000');

    // ── Dark header band ────────────────────────────────────────────────
    doc.rect(LEFT, 32, W, 52).fill('#1a1a2e');
    doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold')
       .text(String(businessName || 'Business'), LEFT, 40, { width: W, align: 'center' });
    doc.fontSize(8).font('Helvetica').fillColor('#aaaacc')
       .text(
         'GSTIN: ' + (invoices[0]?.shopGST || 'N/A') + '   |   ' + (invoices[0]?.shopAddress || ''),
         LEFT, 62, { width: W, align: 'center' }
       );

    // ── Blue title band ─────────────────────────────────────────────────
    doc.rect(LEFT, 84, W, 20).fill('#185FA5');
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
       .text(
         `DAILY SALES REPORT   |   ${moment(date).format('dddd, DD MMMM YYYY')}   |   Generated: ${moment().format('DD/MM/YYYY hh:mm A')}`,
         LEFT, 90, { width: W, align: 'center' }
       );

    // ── Two-column info row ─────────────────────────────────────────────
    const infoY = 108;
    const infoH = 80;

    doc.rect(LEFT, infoY, W / 2, infoH).lineWidth(0.5).stroke('#cccccc');
    doc.fillColor('#000').fontSize(7.5).font('Helvetica-Bold')
       .text('BUSINESS DETAILS', LEFT + 6, infoY + 6);
    doc.moveTo(LEFT + 6, infoY + 16).lineTo(LEFT + W / 2 - 6, infoY + 16).lineWidth(0.5).stroke('#cccccc');

    const shopDetails = [
      ['Shop Name',   invoices[0]?.shopName    || businessName || 'N/A'],
      ['Address',     invoices[0]?.shopAddress || 'N/A'],
      ['GSTIN',       invoices[0]?.shopGST     || 'N/A'],
      ['Report Date', moment(date).format('DD/MM/YYYY')],
    ];
    shopDetails.forEach(([k, v], i) => {
      doc.fillColor('#555555').fontSize(7).font('Helvetica')
         .text(k + ':', LEFT + 6, infoY + 21 + i * 14);
      doc.fillColor('#000000').fontSize(7.5).font('Helvetica-Bold')
         .text(String(v), LEFT + 55, infoY + 21 + i * 14, { width: W / 2 - 65 });
    });

    const rightX = LEFT + W / 2;
    doc.rect(rightX, infoY, W / 2, infoH).lineWidth(0.5).stroke('#cccccc');
    doc.fillColor('#000').fontSize(7.5).font('Helvetica-Bold')
       .text('SUMMARY', rightX + 6, infoY + 6);
    doc.moveTo(rightX + 6, infoY + 16).lineTo(rightX + W / 2 - 6, infoY + 16).lineWidth(0.5).stroke('#cccccc');

    const summaryRows = [
      ['Total Revenue',   inr(totalRevenue), '#185FA5'],
      ['Total Profit',    inr(totalProfit),  '#639922'],
      ['Total Tax (GST)', inr(totalTax),     '#BA7517'],
      ['Total Orders',    String(totalOrders), '#1a1a2e'],
    ];
    summaryRows.forEach(([k, v, color], i) => {
      doc.fillColor('#555555').fontSize(7).font('Helvetica')
         .text(k + ':', rightX + 6, infoY + 21 + i * 14);
      doc.fillColor(color).fontSize(8).font('Helvetica-Bold')
         .text(v, rightX + 90, infoY + 21 + i * 14, { width: W / 2 - 100, align: 'right' });
    });

    // ── Stat boxes row ──────────────────────────────────────────────────
    const statY = infoY + infoH;
    const statW = W / 5;
    const statH = 38;

    const stats = [
      { label: 'ITEMS SOLD',    value: String(totalItems),  bg: '#1a1a2e', vcolor: '#7FC8F8' },
      { label: 'CASH',          value: inr(cashTotal),      bg: '#185FA5', vcolor: '#ffffff' },
      { label: 'UPI',           value: inr(upiTotal),       bg: '#185FA5', vcolor: '#ffffff' },
      { label: 'GROSS PROFIT',  value: inr(totalProfit),    bg: '#2d5a1b', vcolor: '#90EE90' },
      { label: 'TAX COLLECTED', value: inr(totalTax),       bg: '#7a4f00', vcolor: '#FFD700' },
    ];
    stats.forEach((s, i) => {
      const sx = LEFT + i * statW;
      doc.rect(sx, statY, statW, statH).fill(s.bg);
      if (i < 4) {
        doc.moveTo(sx + statW, statY).lineTo(sx + statW, statY + statH)
           .lineWidth(0.5).stroke('#ffffff');
      }
      doc.fillColor('#ffffff').fontSize(6.5).font('Helvetica')
         .text(s.label, sx + 4, statY + 6, { width: statW - 8, align: 'center' });
      doc.fillColor(s.vcolor).fontSize(9.5).font('Helvetica-Bold')
         .text(s.value, sx + 4, statY + 18, { width: statW - 8, align: 'center' });
    });
    doc.rect(LEFT, statY, W, statH).lineWidth(0.5).stroke('#000000');

    // ── Low stock section ───────────────────────────────────────────────
    let y = statY + statH + 6;

    if (lowStockItems.length > 0) {
      doc.rect(LEFT, y, W, 16).fill('#A32D2D');
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
         .text('LOW / CRITICAL STOCK ALERT', LEFT + 6, y + 4);
      y += 16;

      doc.rect(LEFT, y, W, 14).fill('#F7C1C1');
      doc.fillColor('#791F1F').fontSize(7).font('Helvetica-Bold');
      doc.text('ITEM CODE', LEFT + 4,   y + 3, { width: 65 });
      doc.text('ITEM NAME', LEFT + 72,  y + 3, { width: 160 });
      doc.text('CATEGORY',  LEFT + 235, y + 3, { width: 120 });
      doc.text('STOCK QTY', LEFT + 358, y + 3, { width: 80 });
      doc.text('STATUS',    LEFT + 440, y + 3, { width: 90 });
      y += 14;

      lowStockItems.forEach((p, idx) => {
        if (y > 750) { doc.addPage(); y = 40; }
        doc.rect(LEFT, y, W, 13).fill(idx % 2 === 0 ? '#fff5f5' : '#ffffff').stroke('#F7C1C1');
        doc.fillColor('#333333').fontSize(7).font('Helvetica');
        doc.text(String(p.item_code || ''), LEFT + 4,   y + 3, { width: 65 });
        doc.text(String(p.item      || ''), LEFT + 72,  y + 3, { width: 160 });
        doc.text(String(p.category  || ''), LEFT + 235, y + 3, { width: 120 });
        doc.text(String(p.Stock     || 0),  LEFT + 358, y + 3, { width: 80 });
        const qty = parseInt(p.Stock) || 0;
        doc.fillColor(qty === 0 ? '#A32D2D' : '#BA7517').font('Helvetica-Bold').fontSize(7)
           .text(qty === 0 ? 'OUT OF STOCK' : 'LOW STOCK', LEFT + 440, y + 3, { width: 90 });
        y += 13;
      });

      doc.moveTo(LEFT, y).lineTo(LEFT + W, y).lineWidth(0.5).stroke('#cccccc');
      y += 6;
    }

    // ── Invoice table title ─────────────────────────────────────────────
    if (y > 680) { doc.addPage(); y = 40; }

    doc.rect(LEFT, y, W, 16).fill('#185FA5');
    doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold')
       .text('DETAILED INVOICE REGISTER', LEFT + 6, y + 4);
    doc.fillColor('#B5D4F4').fontSize(7.5).font('Helvetica')
       .text(`Total Invoices: ${totalOrders}`, LEFT + W - 100, y + 5, { width: 94, align: 'right' });
    y += 16;

    // ── Column headers ──────────────────────────────────────────────────
    const C = {
      inv:   LEFT,
      cust:  LEFT + 52,
      items: LEFT + 150,
      mode:  LEFT + 315,
      sub:   LEFT + 355,
      tax:   LEFT + 400,
      total: LEFT + 448,
    };

    doc.rect(LEFT, y, W, 16).fill('#d0d8e8');
    doc.fillColor('#0c2461').fontSize(7).font('Helvetica-Bold');
    doc.text('INVOICE',  C.inv,   y + 4, { width: 50 });
    doc.text('CUSTOMER', C.cust,  y + 4, { width: 97 });
    doc.text('ITEMS',    C.items, y + 4, { width: 163 });
    doc.text('MODE',     C.mode,  y + 4, { width: 38 });
    doc.text('SUBTOTAL', C.sub,   y + 4, { width: 44 });
    doc.text('TAX',      C.tax,   y + 4, { width: 46 });
    doc.text('TOTAL',    C.total, y + 4, { width: W - (C.total - LEFT) });
    [C.cust, C.items, C.mode, C.sub, C.tax, C.total].forEach(cx => {
      doc.moveTo(cx - 1, y).lineTo(cx - 1, y + 16).lineWidth(0.3).stroke('#aaaaaa');
    });
    y += 16;

    // ── Invoice rows ────────────────────────────────────────────────────
    invoices.forEach((inv, idx) => {
      const itemLines = (inv.items || []).map(it =>
        `${it.item || ''} x${it.qty || 0}  @Rs.${it.price || 0}${it.discount ? `  Disc:${it.discount}` : ''}`
      );
      const rowH = Math.max(16, itemLines.length * 11 + 7);

      if (y + rowH > 755) {
        doc.addPage();
        doc.rect(25, 25, W + 10, 787).lineWidth(2).stroke('#000000');
        doc.rect(28, 28, W + 4,  781).lineWidth(0.5).stroke('#000000');
        y = 40;
        doc.rect(LEFT, y, W, 14).fill('#d0d8e8');
        doc.fillColor('#0c2461').fontSize(7).font('Helvetica-Bold');
        doc.text('INVOICE',  C.inv,   y + 3, { width: 50 });
        doc.text('CUSTOMER', C.cust,  y + 3, { width: 97 });
        doc.text('ITEMS',    C.items, y + 3, { width: 163 });
        doc.text('MODE',     C.mode,  y + 3, { width: 38 });
        doc.text('SUBTOTAL', C.sub,   y + 3, { width: 44 });
        doc.text('TAX',      C.tax,   y + 3, { width: 46 });
        doc.text('TOTAL',    C.total, y + 3, { width: 80 });
        y += 14;
      }

      doc.rect(LEFT, y, W, rowH).fill(idx % 2 === 0 ? '#f4f6fb' : '#ffffff').stroke('#cccccc');
      [C.cust, C.items, C.mode, C.sub, C.tax, C.total].forEach(cx => {
        doc.moveTo(cx - 1, y).lineTo(cx - 1, y + rowH).lineWidth(0.3).stroke('#cccccc');
      });

      doc.fillColor('#222222').fontSize(7).font('Helvetica');
      doc.text(String(inv.invoiceNumber || `#${idx + 1}`), C.inv,   y + 4, { width: 50 });
      doc.text(
        `${inv.customerName || 'Walk-in'}${inv.phone ? '\n' + inv.phone : ''}`,
        C.cust, y + 4, { width: 97 }
      );
      doc.text(itemLines.join('\n') || '-', C.items, y + 4, { width: 163 });
      doc.fillColor('#185FA5').font('Helvetica-Bold').fontSize(7)
         .text(String(getInvoicePaymentLabel(inv) || 'N/A').toUpperCase(), C.mode,  y + 4, { width: 38 });
      doc.fillColor('#333333').font('Helvetica').fontSize(7)
         .text(inr(inv.subtotal || 0), C.sub,   y + 4, { width: 44 });
      doc.fillColor('#BA7517').font('Helvetica').fontSize(7)
         .text(inr(inv.tax || 0),      C.tax,   y + 4, { width: 46 });
      doc.fillColor('#185FA5').font('Helvetica-Bold').fontSize(7.5)
         .text(inr(inv.total || 0),    C.total, y + 4, { width: W - (C.total - LEFT) });
      y += rowH;
    });

    // ── Grand totals row ────────────────────────────────────────────────
    if (y > 745) { doc.addPage(); y = 40; }
    doc.rect(LEFT, y, W, 18).fill('#1a1a2e');
    doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold')
       .text('GRAND TOTALS', C.inv, y + 5, { width: 200 });
    doc.text(inr(totalRevenue - totalTax), C.sub,   y + 5, { width: 44 });
    doc.fillColor('#FFD700')
       .text(inr(totalTax),                C.tax,   y + 5, { width: 46 });
    doc.fillColor('#90EE90')
       .text(inr(totalRevenue),            C.total, y + 5, { width: W - (C.total - LEFT) });
    y += 18;

    // ── Bottom double rule ──────────────────────────────────────────────
    doc.moveTo(LEFT, y + 4).lineTo(LEFT + W, y + 4).lineWidth(1).stroke('#185FA5');
    doc.moveTo(LEFT, y + 7).lineTo(LEFT + W, y + 7).lineWidth(0.3).stroke('#185FA5');
    y += 14;

    // ── Signature (sigBuffer already fetched above) ─────────────────────
    if (sigBuffer) {
      if (y > 720) { doc.addPage(); y = 40; }
      doc.image(sigBuffer, LEFT + W - 200, y, { width: 180, height: 55, fit: [180, 55] });
      doc.moveTo(LEFT + W - 200, y + 60).lineTo(LEFT + W - 20, y + 60)
         .lineWidth(0.5).stroke('#000000');
      doc.fillColor('#555555').fontSize(7).font('Helvetica')
         .text('Authorised Signature', LEFT + W - 200, y + 63, { width: 180, align: 'center' });
      y += 72;
    }

    // ── Footer ──────────────────────────────────────────────────────────
    doc.moveTo(LEFT, y + 4).lineTo(LEFT + W, y + 4).lineWidth(0.5).stroke('#cccccc');
    doc.fillColor('#888888').fontSize(7).font('Helvetica')
       .text(
         `This is a computer-generated report. Generated on ${moment().format('DD MMM YYYY, hh:mm A')}   |   ${businessName}`,
         LEFT, y + 8, { width: W, align: 'center' }
       );

    doc.end();
  });
};
