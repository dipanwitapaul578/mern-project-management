const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

//--------------------------Register----------------------------------------
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      const err = new Error('Name, email and password are required');
      err.statusCode = 400;
      return next(err);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const err = new Error('Email already in use');
      err.statusCode = 400;
      return next(err);
    }

    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    next(err);   // ← send real error to global handler
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if(!email || !password){
      const err = new Error('Email and password are required');
      err.statusCode = 400;
      return next(err);
    }

    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error('Invalid Credentials');
      err.statusCode = 401;
      return next(err);
    }

    const isMatch = await user.comparePassword(password);
    if(!isMatch){
      const err = new Error('Invalid Credentials');
      err.statusCode = 401;
      return next(err);
    }

    //----------------------------------JWT-------------------------------------------
    const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' });

    //----------------------------------httpOnly cookie--------------------------------
    res.cookie('token', token, {
      httpOnly: true
    });
    res.json({ message: 'Logged in successfully', 
      user: { 
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (err){
    next(err);
  }
});

//----------------------------------Get Current User-----------------------------------
router.get('/me', (req, res, next) => {
  const token = req.cookies.token;

  if (!token){
    const err = new Error('No token provided');
    err.statusCode = 401;
    return (err);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ userId: decoded.userId });
  } catch (err) {
    err.statusCode = 401;
    next(err);
  }
});

module.exports = router;