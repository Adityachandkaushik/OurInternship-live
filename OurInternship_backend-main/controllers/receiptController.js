import PDFDocument from "pdfkit";
import path from "path";
import Student from "../models/Student.js";

export const downloadReceipt = async (req, res) => {
  try {
    const { applicationId } = req.params;

const student = await Student.findOne({ applicationId })
  .populate("internshipId");
console.log(student)
    if (!student || student.paymentStatus !== "PAID") {
      return res.status(404).json({ message: "Receipt not available" });
    }

    const doc = new PDFDocument({ size: "A4", margin: 40 });

    // ✅ Unicode Fonts
    const fontRegular = path.join(
      process.cwd(),
      "assets/fonts/DejaVuSans.ttf"
    );
    const fontBold = path.join(
      process.cwd(),
      "assets/fonts/DejaVuSans-Bold.ttf"
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Receipt-${applicationId}.pdf`
    );

    doc.pipe(res);

    /* ================= HEADER ================= */
    const gradient = doc.linearGradient(0, 0, 595, 0);
      gradient.stop(0, "#620124");
      gradient.stop(1, "#231c66");

      doc.rect(0, 0, 595, 110).fill(gradient);

      doc
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .fontSize(22)
        .text("METCONNECT INFOTECH PVT. LTD.", 50, 40);

    doc
      .font(fontRegular)
      .fontSize(11)
      .fillColor("#e5e7eb")
      .text("INTERNSHIP PAYMENT RECEIPT • Powered by Razorpay", 40, 78);

    doc.moveDown(4);
    doc.fillColor("#000");

    /* ================= RECEIPT INFO ================= */
    doc
      .font(fontRegular)
      .fontSize(12)
      .text(`Receipt No: ${student.applicationId}`, 40)
      .text(`Payment ID: ${student.paymentId}`, 40)
      .text(`Date: ${new Date().toLocaleDateString( "en-GB")}`, 40);

    doc.moveDown();

    /* ================= STUDENT BOX ================= */
    const studentBoxTop = doc.y;

    doc.roundedRect(40, studentBoxTop, 515, 120, 8).stroke("#d1d5db");

    doc
      .font(fontBold)
      .fontSize(14)
      .text("Billed To", 50, studentBoxTop + 10);

    doc
      .font(fontRegular)
      .fontSize(12)
      .text(`Name: ${student.name}`, 50, studentBoxTop + 35)
      .text(`Email: ${student.email}`, 50)
      .text(`Contact: ${student.contact}`, 50)
      .text(`College: ${student.college}`, 50);

    doc.moveDown(7);

    /* ================= PAYMENT TABLE ================= */
    const tableTop = doc.y;

    doc.rect(40, tableTop, 515, 30).fill("#f3f4f6");

    doc
      .fillColor("#000")
      .font(fontBold)
      .fontSize(12)
      .text("Description", 50, tableTop + 8)
      .text("Amount", 450, tableTop + 8);

    doc
      .moveTo(40, tableTop + 30)
      .lineTo(555, tableTop + 30)
      .stroke();
    doc
      .font(fontRegular)
      .fontSize(12)
      .text(`${student?.internshipId?.title} Internship Registration`, 50, tableTop + 45)
      .text(`₹ ${student.amount}`, 450, tableTop + 45);
    doc
      .moveTo(40, tableTop + 80)
      .lineTo(555, tableTop + 80)
      .stroke();

    doc
      .font(fontBold)
      .fontSize(13)
      .text("Total Paid", 350, tableTop + 95)
      .text(`₹ ${student.amount}`, 450, tableTop + 95);

    doc.moveDown(6);

    /* ================= PAYMENT STATUS ================= */
    doc.roundedRect(40, doc.y, 515, 40, 8).fill("#ecfdf5");

    doc
      .font(fontBold)
      .fontSize(14)
      .fillColor("#065f46")
      .text("✔ PAYMENT SUCCESSFUL", 50, doc.y + 12);

    doc.moveDown(4);

    /* ================= FOOTER ================= */
    doc
      .font(fontRegular)
      .fontSize(10)
      .fillColor("#6b7280")
      .text(
        "This is a system generated receipt. No signature required.\nFor queries, contact support.",
        40,
        760,
        { align: "center" }
      );

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate receipt" });
  }
};
