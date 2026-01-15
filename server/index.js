const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
//-------------------------Middleware-----------------------------------
app.use(express.json()); // Parse JSON bodies
app.use(cors({ 
  origin: 'http://localhost:5173', //React frontend
  credentials: true 
}));
app.use(cookieParser());

//-------------------------Database Connection---------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

//-------------------------Routes-----------------------------------------
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

//-------------------------Simple Check------------------------------------
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

//--------------------------Global error handler----------------------------
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);

  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
    // Show stack only in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

//-------------------------Start Server-------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

