import nodemailer from "nodemailer";

export const sendOfferLetterEmail = async (student) => {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
  const htmlContent = `
    <h2>🎉 Congratulations ${student.name}!</h2>

    <p>
      We are pleased to inform you that you have been selected for the
      <b>${student.internshipId.title}</b> internship program.
    </p>

    <div style="background:#fdf2f8;padding:20px;border-radius:8px;margin:20px 0;">
      <p><strong>Application ID:</strong> ${student.applicationId}</p>

      <a href="${student.offerLetterUrl}"
         style="display:inline-block;margin-top:10px;
         padding:12px 24px;background:#620124;color:white;
         border-radius:6px;text-decoration:none;font-weight:bold">
        Download Offer Letter
      </a>
    </div>

    <p>
      Please download your offer letter using the button above.
      This letter is digitally verified and officially issued.
    </p>

    <p>
      We wish you a successful internship journey ahead!
    </p>

    <p>Regards,<br/>
    <strong>Internship Program Team</strong></p>
  `;

  await transporter.sendMail({
    from: `"Internship Team" <${process.env.EMAIL_USERNAME}>`,
    to: student.email,
    subject: "🎉 Internship Offer Letter",
    html: htmlContent,
  });
};