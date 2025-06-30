// Test email service
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  console.log('🔍 Testing email configuration...');
  
  // Check environment variables
  console.log('📧 SMTP Config:');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);
  console.log('Pass:', process.env.SMTP_PASS ? '***set***' : 'NOT_SET');
  console.log('From:', process.env.SMTP_FROM);
  
  try {
    const nodemailer = require('nodemailer');
    console.log('📦 Nodemailer object:', Object.keys(nodemailer));
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Test connection
    console.log('🔄 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful');

    // Test send email
    console.log('📤 Sending test email...');
    const result = await transporter.sendMail({
      from: `${process.env.SMTP_NAME} <${process.env.SMTP_FROM}>`,
      to: process.env.SMTP_USER, // Send to ourselves
      subject: `Test Email - ${new Date().toISOString()}`,
      text: 'This is a test email from DMG system.',
      html: '<p>This is a test email from DMG system.</p>'
    });

    console.log('✅ Email sent successfully:', result.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.response) {
      console.error('Server response:', error.response);
    }
  }
}

testEmail();
