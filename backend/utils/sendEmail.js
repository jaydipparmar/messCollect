const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for others
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send OTP email for account verification via EmailJS
 */
const sendOtpEmail = async ({ to, name, otp }) => {
  // Calculate time 15 minutes from now for the email text
  const expiryTime = new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const data = {
    service_id: 'service_kiy09v6',
    template_id: 'template_x09z56i',
    user_id: 'YksS4rHcfpmJCbPXE', // Public Key
    accessToken: '9mya4n7FI6GxBBw71g-eh', // Private Key
    template_params: {
      to_email: to,
      to: to,
      email: to,
      user_email: to,
      to_name: name,
      name: name,
      otp: otp,
      OTP: otp,
      time: expiryTime,
      message: `Your OTP is ${otp}`,
      reply_to: 'jaydipparmar2548@gmail.com'
    }
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EmailJS API Error: ${response.status} ${errorText}`);
    }

    console.log(`OTP Email sent successfully to ${to} via EmailJS`);
  } catch (error) {
    console.error('----------------------------------------------------');
    console.error('⚠️ EMAIL SENDING FAILED (EmailJS)');
    console.error('⚠️ ERROR:', error.message);
    console.error('⚠️ MOCKING OTP DELIVERY FOR DEVELOPMENT PURPOSE:');
    console.error(`➡️ YOUR OTP FOR ${to} IS: ${otp}`);
    console.error('----------------------------------------------------');
  }
};

/**
 * Send receipt email after successful payment
 */
const sendReceiptEmail = async ({ to, receiptHtml, studentName, month, year }) => {
  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: `"Mess Collect" <${process.env.EMAIL_USER}>`,
      to,
      subject: `✅ Mess Fee Payment Receipt – ${month} ${year}`,
      html: receiptHtml,
    });
  } catch (error) {
    console.error('----------------------------------------------------');
    console.error('⚠️ RECEIPT EMAIL SENDING FAILED (Likely invalid credentials or offline)');
    console.error('⚠️ ERROR:', error.message);
    console.error('----------------------------------------------------');
  }
};

module.exports = { sendOtpEmail, sendReceiptEmail };
