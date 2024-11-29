// emailService.js
const nodemailer = require('nodemailer');

/**
 * Function to send an email
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The body content of the email.
 * @returns {Promise} - Resolves if email is sent, rejects if error occurs.
 */
const sendEmail = async (to, subject, text) => {
  // let subject = 'Slow git activity detected!';
  // let text = 'This is to inform you that there has been a significant slowdown in your git activity.Always try to contribute daily to your git repository to maintain healthy performace KPIs.';
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'vikas.anand@niveussolutions.com',
      pass: 'ioyl vfqn uotr oeqw',
      },
  });

  const mailOptions = {
    from: 'vikas.anand@niveussolutions.com',
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info.response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

module.exports = { sendEmail };
