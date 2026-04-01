const createTransporter = require('../config/notificationConfig');

const sendBorrowEmail = async (to, userName, bookTitle, dueDate) => {
  const transporter = createTransporter();
  
  console.log('Using email:', process.env.EMAIL_USER);
  console.log('Pass length:', process.env.EMAIL_PASS?.length);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Book Borrowed Successfully!',
    html: `
      <h2>Hello ${userName}!</h2>
      <p>You have successfully borrowed <strong>${bookTitle}</strong>.</p>
      <p>Please return it by <strong>${new Date(dueDate).toDateString()}</strong>.</p>
      <p>Thank you for using our Library!</p>
    `
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendBorrowEmail };