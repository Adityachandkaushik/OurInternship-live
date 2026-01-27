import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";

export const generateCertificate = async (
  student,
  certificateId,
  verificationUrl
) => {
  const certificatesDir = path.join(process.cwd(), "certificates");
  if (!fs.existsSync(certificatesDir)) {
    fs.mkdirSync(certificatesDir, { recursive: true });
  }

  const filePath = path.join(certificatesDir, `${certificateId}.pdf`);

  return new Promise(async (resolve, reject) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        margin: 1,
      });

      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 0,
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      const { width, height } = doc.page;

      /* ===============================
         BACKGROUND & LEFT PANEL
      =============================== */

      // Background
      doc.rect(0, 0, width, height).fill("#f8fafc");

      // Dark left diagonal panel
      doc
        .moveTo(0, 0)
        .lineTo(280, 0)
        .lineTo(120, height)
        .lineTo(0, height)
        .closePath()
        .fill("#2f2f44");

      // Inner light diagonal
      doc
        .moveTo(0, 0)
        .lineTo(230, 0)
        .lineTo(95, height)
        .lineTo(0, height)
        .closePath()
        .fill("#4b5563");

      /* ===============================
         TOP META INFO
      =============================== */

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#111827")
        .text(`INTERN ID: ${student.applicationId || "N/A"}`, 300, 30);

      doc
        .font("Helvetica")
        .fontSize(10)
        .text("info@metconnect.com", width - 240, 30);

      /* ===============================
         MAIN HEADING
      =============================== */

      doc
        .font("Helvetica-Bold")
        .fontSize(38)
        .fillColor("#111827")
        .text("CERTIFICATE", 300, 90, {
          characterSpacing: 6,
        });

      doc
        .moveDown(0.2)
        .font("Helvetica")
        .fontSize(18)
        .fillColor("#374151")
        .text("OF INTERNSHIP 2025", {
          characterSpacing: 2,
        });

      // Divider line
      doc
        .moveTo(300, 155)
        .lineTo(width - 60, 155)
        .lineWidth(1)
        .strokeColor("#9ca3af")
        .stroke();

      /* ===============================
         BODY CONTENT
      =============================== */

      doc
        .font("Helvetica")
        .fontSize(14)
        .fillColor("#374151")
        .text(
          "This certificate of internship is proudly presented to",
          300,
          185
        );

      doc
        .moveDown(0.6)
        .font("Helvetica-Bold")
        .fontSize(28)
        .fillColor("#111827")
        .text(student.name);

      doc
        .moveDown(0.8)
        .font("Helvetica")
        .fontSize(13)
        .fillColor("#374151")
        .text(
          `For successfully completing `,
          { continued: true }
        )
        .font("Helvetica-Bold")
        .text(`${student?.internshipId?.title || "Internship Training"}`, {
          continued: true,
        })
        .font("Helvetica")
        .text(
          ` at MetConnect Pvt. Ltd. from ${formatDate(
            student.startDate
          )} to ${formatDate(student.endDate)}.`
        );

      doc
        .moveDown(0.5)
        .text(
          "We wish you good luck in all your future endeavors."
        );

      /* ===============================
         SIGNATURE
      =============================== */

      const signY = height - 190;

      doc
        .moveTo(330, signY)
        .lineTo(550, signY)
        .strokeColor("#111827")
        .stroke();

      try {
        const scriptFont = path.join(
          process.cwd(),
          "assets/fonts/GreatVibes-Regular.ttf"
        );
        if (fs.existsSync(scriptFont)) {
          doc
            .font(scriptFont)
            .fontSize(24)
            .text("MetConnect Authority", 340, signY - 30);
        }
      } catch {}

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("Director", 330, signY + 10);

      /* ===============================
         QR CODE (BOTTOM LEFT)
      =============================== */

      doc.image(qrCodeDataUrl, 40, height - 170, { width: 110 });

      /* ===============================
         ISO BADGE (PLACEHOLDER)
      =============================== */

      doc
        .circle(width - 100, height - 110, 45)
        .lineWidth(2)
        .strokeColor("#2563eb")
        .stroke();

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#2563eb")
        .text("ISO", width - 118, height - 125);

      doc
        .fontSize(8)
        .text("CERTIFIED", width - 132, height - 110);

      /* ===============================
         FOOTER
      =============================== */

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#374151")
        .text(
          `CIN: U85499UP2025PTC221346`,
          width - 350,
          height - 40
        );

      doc.end();

      writeStream.on("finish", () => resolve(filePath));
      writeStream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
};

function formatDate(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};


/* -------------------------------
   QR GENERATOR
-------------------------------- */
export const generateQRCode = async (data) => {
  return QRCode.toDataURL(data);
};

