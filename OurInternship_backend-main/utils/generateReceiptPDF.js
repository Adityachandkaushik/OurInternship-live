import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);   

// Font paths
const FONT_REGULAR = path.join(
  __dirname,
  "../assets/fonts/DejaVuSans.ttf"
);
const FONT_BOLD = path.join(
  __dirname,
  "../assets/fonts/DejaVuSans-Bold.ttf"
);

export const generateReceiptPDF = (student) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const stream = new PassThrough();
      const buffers = [];

      stream.on("data", (chunk) => buffers.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(buffers)));
      stream.on("error", reject);

      doc.pipe(stream);

      /* ================= HEADER (GRADIENT) ================= */
      const gradient = doc.linearGradient(0, 0, 595, 0);
      gradient.stop(0, "#620124");
      gradient.stop(1, "#231c66");

      doc.rect(0, 0, 595, 110).fill(gradient);

      doc
        .fillColor("#ffffff")
        .font(FONT_BOLD)
        .fontSize(22)
        .text("METCONNECT INFOTECH PVT. LTD.", 50, 40);

      doc
        .fontSize(12)
        .fillColor("#e5e7eb")
        .text("INTERNSHIP PAYMENT RECEIPT", 50, 75);

      doc.moveDown(6);
      doc.fillColor("#000");

      /* ================= META INFO ================= */
      doc
        .font(FONT_REGULAR)
        .fontSize(11)
        .text(`Receipt No: ${student.applicationId}`)
        .text(`Payment ID: ${student.paymentId}`)
        .text(`Date: ${new Date().toLocaleDateString( "en-GB")}`);

      doc.moveDown(1.5);

      /* ================= BILLED TO ================= */
      doc
        .font(FONT_BOLD)
        .fontSize(14)
        .text("Billed To");

      doc.moveDown(0.5);

      doc
        .font(FONT_REGULAR)
        .fontSize(12)
        .text(`Name: ${student.name}`)
        .text(`Email: ${student.email}`)
        .text(`Contact: ${student.contact}`)
        .text(`College: ${student.college}`);

      doc.moveDown(2);

      /* ================= PAYMENT TABLE ================= */
      const tableTop = doc.y;

      doc.rect(50, tableTop, 495, 30).fill("#f3f4f6");

      doc
        .fillColor("#000")
        .font(FONT_BOLD)
        .fontSize(12)
        .text("Description", 60, tableTop + 8)
        .text("Amount", 430, tableTop + 8);

      doc
        .moveTo(50, tableTop + 30)
        .lineTo(545, tableTop + 30)
        .stroke();

      doc
        .font(FONT_REGULAR)
        .fontSize(12)
        .text(`${student?.internshipId?.title} Internship Registration`, 60, tableTop + 45)
        .text(`₹ ${student.amount}`, 430, tableTop + 45);

      doc
        .moveTo(50, tableTop + 80)
        .lineTo(545, tableTop + 80)
        .stroke();

      doc
        .font(FONT_BOLD)
        .fontSize(13)
        .text("Total Paid", 320, tableTop + 95)
        .text(`₹ ${student.amount}`, 430, tableTop + 95);

      doc.moveDown(4);

      /* ================= PAYMENT STATUS ================= */
      doc
        .roundedRect(50, doc.y, 495, 40, 8)
        .fill("#ecfdf5");

      doc
        .fillColor("#065f46")
        .font(FONT_BOLD)
        .fontSize(14)
        .text("✔ PAYMENT SUCCESSFUL", 65, doc.y + 12);

      doc.moveDown(4);

      /* ================= FOOTER ================= */
      doc
        .font(FONT_REGULAR)
        .fontSize(10)
        .fillColor("#6b7280")
        .text(
          "This is a system generated receipt. No signature required.\nFor any queries, please contact support.",
          50,
          760,
          { align: "center" }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
