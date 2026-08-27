const dotenv = require('dotenv');
const amqp = require('amqplib');
const { sendBorrowEmail } = require('./services/emailService');
const app = require('./app');

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq';

const connectQueue = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue('notification_queue', { durable: true });
    channel.prefetch(1);

    console.log('📬 Waiting for messages in notification_queue...');

    channel.consume('notification_queue', async (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        console.log('📩 Received message:', data);

        try {
          if (data.type === 'BOOK_BORROWED') {
            await sendBorrowEmail(data.email, data.userName, data.bookTitle, data.dueDate);
            console.log('✅ Email sent to:', data.email);
          }
          channel.ack(msg);
        } catch (err) {
          console.error('❌ Email failed:', err.message);
          channel.nack(msg, false, true);
        }
      }
    });
  } catch (err) {
    console.error('RabbitMQ connection error:', err.message);
    console.log('Retrying in 5 seconds...');
    setTimeout(connectQueue, 5000);
  }
};

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
  connectQueue();
});