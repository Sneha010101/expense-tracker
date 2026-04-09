const PDFDocument = require("pdfkit");

const generatePDF = (expenses, res, range) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=expense-report.pdf"
  );

  doc.pipe(res);

  // === HEADER ===
  doc
    .fontSize(24)
    .fillColor("#4a00e0")
    .text("Expense Report", { align: "center" });

  doc.moveDown(0.3);

  // Date range label
  const rangeLabels = {
    week: "Last 7 Days",
    month: "Last Month",
    "3month": "Last 3 Months",
    "6month": "Last 6 Months",
    year: "Last Year",
  };

  doc
    .fontSize(12)
    .fillColor("#666")
    .text(`Period: ${rangeLabels[range] || range}`, { align: "center" });

  doc
    .text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, {
      align: "center",
    });

  doc.moveDown(1);

  // === SUMMARY ===
  const total = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);

  doc
    .fontSize(14)
    .fillColor("#333")
    .text(`Total Expenses: `, { continued: true })
    .fillColor("#e63946")
    .text(`₹${total.toLocaleString("en-IN")}`)
    .fillColor("#333")
    .text(`Number of Transactions: ${expenses.length}`);

  doc.moveDown(1);

  // === TABLE HEADER ===
  const tableTop = doc.y;
  const col1 = 50;   // Title
  const col2 = 200;  // Category
  const col3 = 320;  // Amount
  const col4 = 420;  // Date

  // Header background
  doc
    .rect(col1 - 5, tableTop - 5, 500, 22)
    .fill("#4a00e0");

  doc
    .fontSize(11)
    .fillColor("#fff")
    .text("Title", col1, tableTop, { width: 140 })
    .text("Category", col2, tableTop, { width: 110 })
    .text("Amount (₹)", col3, tableTop, { width: 90 })
    .text("Date", col4, tableTop, { width: 100 });

  doc.moveDown(0.5);

  // === TABLE ROWS ===
  let y = doc.y + 5;

  expenses.forEach((exp, index) => {
    // Check if we need a new page
    if (y > 700) {
      doc.addPage();
      y = 50;
    }

    // Alternating row background
    if (index % 2 === 0) {
      doc
        .rect(col1 - 5, y - 3, 500, 20)
        .fill("#f0f0f5");
    }

    doc
      .fontSize(10)
      .fillColor("#333")
      .text(exp.title || "-", col1, y, { width: 140 })
      .text(exp.category || "-", col2, y, { width: 110 })
      .text(`₹${(exp.amount || 0).toLocaleString("en-IN")}`, col3, y, { width: 90 })
      .text(
        exp.date ? new Date(exp.date).toLocaleDateString("en-IN") : "-",
        col4,
        y,
        { width: 100 }
      );

    y += 22;
  });

  // === TOTAL ROW ===
  y += 10;
  doc
    .rect(col1 - 5, y - 3, 500, 22)
    .fill("#4a00e0");

  doc
    .fontSize(11)
    .fillColor("#fff")
    .text("TOTAL", col1, y, { width: 140 })
    .text("", col2, y, { width: 110 })
    .text(`₹${total.toLocaleString("en-IN")}`, col3, y, { width: 90 })
    .text(`${expenses.length} items`, col4, y, { width: 100 });

  // === FOOTER ===
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(8)
      .fillColor("#999")
      .text(
        `Page ${i + 1} of ${pageCount} | Expense Tracker`,
        50,
        doc.page.height - 40,
        { align: "center", width: doc.page.width - 100 }
      );
  }

  doc.end();
};

module.exports = generatePDF;