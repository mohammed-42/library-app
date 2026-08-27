const express = require('express');
const cors = require('cors');
const rentalRoutes = require('./routes/rentalRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/rentals', rentalRoutes);

app.get('/', (req, res) => {
  res.send('Rental Service is running');
});

module.exports = app;