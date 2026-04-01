const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redisClient');
const bookRoutes = require('./routes/bookRoutes');

dotenv.config();
connectDB();
connectRedis();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/books', bookRoutes);

app.get('/', (req, res) => {
  res.send('Book Service is running');
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Book Service running on port ${PORT}`);
});