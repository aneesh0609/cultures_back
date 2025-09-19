import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateInvoicePDF = async ({ order, payment, customer }) => {
  const invoicePath = path.join("invoices", `${order._id}.pdf`);
  const doc = new PDFDocument();

  fs.mkdirSync("invoices", { recursive: true });
  doc.pipe(fs.createWriteStream(invoicePath));

  doc.fontSize(20).text("Invoice", { align: "center" }).moveDown();
  doc.fontSize(12).text(`Order ID: ${order._id}`);
  doc.text(`Customer: ${customer.name} (${customer.email})`);
  doc.text(`Payment ID: ${payment.razorpayPaymentId}`);
  doc.text(`Amount Paid: ₹${payment.amount / 100}`);
  doc.text(`Status: ${payment.status}`);
  doc.text(`Date: ${new Date().toLocaleString()}`);

  doc.end();

  return invoicePath;
};
