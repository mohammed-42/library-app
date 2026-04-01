const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('User Service is running');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});