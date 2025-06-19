// src/utils/otp.ts
import * as nodemailer from "nodemailer";
import { Twilio } from "twilio";
import { ConfigService } from "@nestjs/config";

const config = new ConfigService();

const twilioClient = new Twilio(
  config.get("TWILIO_ACCOUNT_SID"),
  config.get("TWILIO_AUTH_TOKEN"),
);

export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOtpViaSMS = async (
  phone: string,
  otp: string,
): Promise<void> => {
  await twilioClient.messages.create({
    body: `Your OTP is ${otp}`,
    from: config.get("TWILIO_PHONE_NUMBER"),
    to: phone,
  });
};

// export async function sendOtpViaEmail(email: string, otp: string) {
//   const transporter = nodemailer.createTransport({
//     host: config.get("SMTP_HOST"),
//     port: +config.get("SMTP_PORT"),
//     secure: false,
//     auth: {
//       user: config.get("SMTP_USER"),
//       pass: config.get("SMTP_PASS"),
//     },
//   });

//   await transporter.sendMail({
//     from: `"RYPM" <${config.get("SMTP_USER")}>`,
//     to: email,
//     subject: "Your OTP Code",
//     html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
//   });
//}
