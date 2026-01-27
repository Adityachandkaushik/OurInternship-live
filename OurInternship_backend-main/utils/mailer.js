import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/* ================= SMTP TRANSPORT ================= */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,          // e.g. smtp.gmail.com
  port: Number(process.env.EMAIL_PORT), // 587
  secure: false,                         // true only for 465
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/* ================= VERIFY SMTP (OPTIONAL BUT RECOMMENDED) ================= */
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP connection failed:", err);
  } else {
    console.log("✅ SMTP server ready");
  }
});

/* ================= SEND PAYMENT EMAIL ================= */
export const sendPaymentEmail = async (student, pdfBuffer) => {
  const {
    name,
    email,
    applicationId,
    paymentId,
    amount,
  } = student;

  const mailOptions = {
    from: `"MetConnect Infotech Pvt. Ltd." <${process.env.EMAIL_USERNAME}>`,
    to: email,
    subject: `Payment Receipt | ${student.internshipId.title} Internship`,
    html: `
      <div style="font-family: Arial, sans-serif; background:#f6f8fb; padding:20px">
        <div style="max-width:600px; margin:auto; background:#ffffff; padding:25px; border-radius:8px">

          <h2 style="color:#231c66; margin-bottom:10px">
            Payment Successful 🎉
          </h2>

          <p>Hello <b>${name}</b>,</p>

          <p>
            Thank you for registering for the 
            <b>${student.internshipId.title} Internship Program</b>.
            Your payment has been received successfully.
          </p>

          <hr style="margin:20px 0"/>

          <h3 style="color:#620124">Invoice Details</h3>

          <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse:collapse">
            <tr>
              <td><b>Application ID</b></td>
              <td>${applicationId}</td>
            </tr>
            <tr>
              <td><b>Payment ID</b></td>
              <td>${paymentId}</td>
            </tr>
            <tr>
              <td><b>Amount Paid</b></td>
              <td>₹ ${amount}</td>
            </tr>
            <tr>
              <td><b>Date</b></td>
              <td>${new Date().toLocaleString()}</td>
            </tr>
          </table>

          <p style="margin-top:20px">
            📎 Your official payment receipt is attached as a PDF.
          </p>

          <p style="margin-top:30px">
            Regards,<br/>
            <b>MetConnect Infotech Pvt. Ltd.</b>
          </p>

        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Receipt-${applicationId}.pdf`,
        content: pdfBuffer,              // ✅ BUFFER (IMPORTANT)
        contentType: "application/pdf",
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};
