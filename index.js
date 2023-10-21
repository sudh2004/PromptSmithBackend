const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const app = express()
const dotenv = require('dotenv')
dotenv.config()
const port = process.env.port
const mongodburl = process.env.mongodburl
const useremail = process.env.useremail
const userpassword = process.env.userpassword
const promptsModel = require('./prompt')
const authModel = require('./auth')
// const nodemailer = require('nodemailer');
// const crypto = require('crypto');
// const bodyParser = require('body-parser');
app.use(cors())
app.use(express.json())

mongoose.connect(mongodburl,{useNewUrlParser:true,useUnifiedTopology:true}) 
.then(()=>console.log("Connect"))
.catch((err)=>console.log(err))

app.get('/api/response/prompt', async (req, res) => {
  const searchText = req.query.text || '';

  try {
    // Use a regular expression to perform a case-insensitive search on the Description field
    const regex = new RegExp(searchText, 'i');
    const suggestions = await promptsModel.find({ Description: regex });

    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await authModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new authModel({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create a JWT
    const token = jwt.sign({ userId: user._id, email: user.email }, 'Algohype-PromptSmith', {
      expiresIn: '240h', // Token expiration time
    });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware for JWT validation
function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  jwt.verify(token, 'Algohype-PromptSmith', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userData = decoded;
    next();
  });
}



app.get('/check-auth', (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.json({ isAuthenticated: false });
  }

  const secretKey = 'Algohype-PromptSmith'; 
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.json({ isAuthenticated: false });
    }
  
    return res.json({ isAuthenticated: true });
  });
});



// Protected Route Example
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route' });
});




app.listen(port,()=>{
    console.log("Connect To database",port)
})