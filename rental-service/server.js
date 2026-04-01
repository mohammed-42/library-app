const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const rentalRoutes = require('./routes/rentalRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/rentals', rentalRoutes);

app.get('/', (req, res) => {
  res.send('Rental Service is running');
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Rental Service running on port ${PORT}`);
});