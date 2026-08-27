const dotenv = require('dotenv');
const connectDB = require('./config/db');
const app = require('./app');

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Rental Service running on port ${PORT}`);
});