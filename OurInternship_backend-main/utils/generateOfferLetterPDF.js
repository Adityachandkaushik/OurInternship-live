import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import { uploadPDFToCloudinary } from "./cloudinary.js";

export const generateOfferLetterPDF = async (student) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  const qr = await QRCode.toDataURL(
    `${process.env.BASE_URL}/api/offers/verify/${student.applicationId}`
  );

  const html = fs
    .readFileSync("templates/offer-letter.html", "utf8")
    .replace("{{name}}", student.name)
    .replace("{{mode}}", student.internshipId.mode)
    .replace("{{duration}}", student.internshipId.duration)
    .replace("{{ref}}", `MIPL/INT/${student.applicationId}`)
    .replace("{{date}}", new Date().toLocaleDateString("en-GB"))
    .replace("{{qr}}", qr)
    .replace("{{logo}}", `file://${process.cwd()}/img/metconnect.png`);

  await page.setContent(html, { waitUntil: "networkidle0" });

  const filePath = path.join(
    process.cwd(),
    "temp",
    `${student.applicationId}.pdf`
  );

  await page.pdf({
    path: filePath,
    format: "A4",
    printBackground: true
  });

  await browser.close();

  return await uploadPDFToCloudinary(
    filePath,
    student.applicationId,
    "offer_letters"
  );
};
