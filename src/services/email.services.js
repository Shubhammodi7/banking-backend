require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAUTH2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN
  }
});

transporter.verify((err, success) => {
  if(err){
    console.error('Error connecting a email server: ', err);
  }
  else {
    console.log('Email server is ready to send messages');
  }
});

const sendEmail = async (to, subject, text, html) => {
  try{
    const info = await transporter.sendMail({
      from: `"Banking System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    })

    console.log("Message sent to: %s", info.messageId);
    console.log("Preview URL: %s",  nodemailer.getTestMessageUrl(info));
  } catch(err) {
    console.error(`Error sending email: `, err);
  }
}

async function sendRegistrationEmail(userEmail, name) {
  const subject = 'Welcome to SBI Banking System 🎉';

  const text = `Hello ${name},

Welcome to SBI Banking System. Your account has been successfully created.

You can now access all banking features securely.

Best Regards,
SBI Team`;

  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    <table align="center" width="600" style="background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <tr>
        <td style="background: #1a73e8; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">SBI Banking</h1>
          <p style="margin: 5px 0 0;">Secure • Reliable • Fast</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding: 30px;">
          <h2 style="color: #333;">Welcome, ${name} 👋</h2>
          
          <p style="color: #555; line-height: 1.6;">
            We're excited to have you on board! Your account has been successfully created.
          </p>

          <p style="color: #555; line-height: 1.6;">
            You can now explore all features like secure transactions, account management, and more.
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="
              background: #1a73e8;
              color: white;
              padding: 12px 25px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
            ">
              Go to Dashboard
            </a>
          </div>

          <p style="color: #999; font-size: 14px;">
            If you didn’t create this account, please ignore this email.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          © 2026 SBI Banking System. All rights reserved.
        </td>
      </tr>

    </table>
  </div>
  `;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, fromAccount, toAccount, amount) {
  const subject = 'Transaction Alert: Funds Transferred';

  const text = `Hello ${name},

  A transaction of ₹${amount} has been made from your account ${fromAccount} to account ${toAccount}.

  If you did not authorize this transaction, please contact our support team immediately.

  Best Regards,
  SBI Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Hello ${name},</h2>

      <p>
        A transaction of <strong>₹${amount}</strong> has been made from your account 
        <strong>${account}</strong> to <strong>${toAccount}</strong>.
      </p>

      <p style="color:red;">
        If you did not authorize this transaction, contact support immediately.
      </p>

      <p>Best Regards,<br>SBI Team</p>
    </div>
  `;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, account, toAccount, amount) {
  const subject = 'Transaction Failed: Insufficient Funds';
  const text = `Hello ${name},

  We attempted to process a transaction of ₹${amount} from your account ${account} to account ${toAccount}, but it failed due to insufficient funds. Please ensure you have enough balance and try again.

  Best Regards,
  SBI Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Hello ${name},</h2>
      <p>
        We attempted to process a transaction of <strong>₹${amount}</strong> from your account 
        <strong>${account}</strong> to <strong>${toAccount}</strong>, but it failed due to insufficient funds.
      </p>
      <p>
        Please ensure you have enough balance and try again.
      </p>
      <p>Best Regards,<br>SBI Team</p>
    </div>
  `;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail
};