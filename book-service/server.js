const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redisClient');
const app = require('./app');

dotenv.config();
connectDB();
connectRedis();

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Book Service running on port ${PORT}`);
});