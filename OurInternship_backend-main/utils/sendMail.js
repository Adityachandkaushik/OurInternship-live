// utils/sendMail.js
import nodemailer from "nodemailer";

export const sendCertificateMail = async (email, pdfUrl, studentName, certificateId, verificationLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const htmlContent = `
    <h2>🎓 Your Internship Certificate is Ready!</h2>
    <p>Dear ${studentName},</p>
    <p>Congratulations! Your internship certificate has been successfully generated and is ready for download.</p>
    
    <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Certificate Details:</strong></p>
      <p>Certificate ID: <code>${certificateId}</code></p>
      <p>
        <a href="${verificationLink}" style="display: inline-block; background: #1e40af; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin-top: 10px;">
          Verify Certificate Online
        </a>
      </p>
      <p>
        <a href="${pdfUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin-top: 10px;">
          Download Certificate
        </a>
      </p>
    </div>
    
    <p>Your certificate is hosted securely online. You can download it from the link above or verify it online using the verification link.</p>
    
    <p>Best regards,<br/>
    Internship Team</p>
  `;

  await transporter.sendMail({
    from: `"Internship Team" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `🎓 Your Internship Certificate is Ready - ${certificateId}`,
    html: htmlContent,
    // Cloudinary URL is included in the email content, no file attachment needed
  });
};

export const sendGenericMail = async (email, subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Internship Team" <${process.env.MAIL_USER}>`,
    to: email,
    subject: subject,
    html: htmlContent,
  });
};
