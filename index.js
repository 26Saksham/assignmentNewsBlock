

import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';
// import admin = require('firebase-admin');
import admin from 'firebase-admin';

import * as dotenv from "dotenv";
import bcrypt from 'bcrypt'
import  credential  from './new-app-7595f-firebase-adminsdk-25bi1-f3b41cfc32.js';
dotenv.config();

const app = express()
app.use(cors({origin: true, credentials: true}));
app.use(bodyParser.json({extended:false}));
app.use(bodyParser.urlencoded({extended:false}))
app.use(express.json());
app.use(cors({
    origin:"http://localhost:3000"
}))
const port=process.env.PORT||5000;










admin.initializeApp({
  credential: admin.credential.cert(credential),
  databaseURL: 'https://new-app-7595f.firebaseio.com',
});

const isAuthenticated = (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - Missing Token' });
  }

  // Verify the Firebase ID token
  admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      req.user = decodedToken;
      next();
    })
    .catch((error) => {
      console.error('Error verifying token:', error);
      return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
    });
};

// Route to register a new user
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hash the user's password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
     email:email,
      passwordHash:hashedPassword,
      displayName:hashedPassword
    });

    return res.status(201).json({ success:true,message: 'User registered successfully', uid: userRecord.uid });
  } catch (error) {
    console.error('Error registering user:', error.message);
    return res.status(500).json({ success:false, error:error.message });
  }
});

// Route to authenticate a user
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Retrieve the user document by email
    const userRecord = await admin.auth().getUserByEmail(email);

    // Compare the provided password with the stored hash
    const passwordMatch = await bcrypt.compare(password, userRecord.displayName);
console.log(passwordMatch)
    if (!passwordMatch) {
      console.log("asdjh")
      return res.status(401).json({ success:false,error: 'Incorrect password' });
    }

    // Create a Firebase custom token for the authenticated user
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
  

    return res.status(200).json({ success:true,message: 'Login successful', token: customToken });
  } catch (error) {
    console.error('Error logging in:', error.message);
    return res.status(401).json({success:false, error: 'Login failed' });
  }
});
app.post('/favorites',isAuthenticated, async (req, res) => {
  const { userId, articles } = req.body;

  try {
    await db.collection('favorites').doc(userId).set({ articles });
    res.status(200).send('Favorites updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});






app.listen(port,()=>console.log('server is started at port no.'+port));

