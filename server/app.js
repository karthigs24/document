const express = require('express');
const passport = require('./config/passport');
const session = require('express-session');
const { createClient } = require('redis'); // Import createClient
const { RedisStore } = require('connect-redis'); // Correct import for RedisStore
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const authController = require('./controllers/authController');
const admin = require('firebase-admin'); // Import admin from firebase-admin
const { registerSchema } = require('./validationSchemas'); // Import Zod validation schema

const app = express();

// Initialize Redis client
const redisClient = createClient();

// Handle Redis client errors
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// Connect to Redis
redisClient.connect().catch(console.error);

// Instantiate RedisStore
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'session:', // Optional: Add a prefix to your session keys
  ttl: 86400, // Optional: Set time to live for sessions (in seconds)
});

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet());

// Configure session middleware
app.use(
  session({
    store: redisStore, // Use the instance of RedisStore
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set secure to true if using HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Initialize Firebase Admin only if it hasn't been initialized already
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// Middleware to verify Firebase token
app.use(async (req, res, next) => {
  const idToken = req.headers.authorization;
  if (!idToken) return res.status(401).send('Unauthorized');

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
});

// Input validation for /register route using Zod
app.post('/register', async (req, res) => {
  try {
    registerSchema.parse(req.body);
    authController.register(req, res);
  } catch (e) {
    res.status(400).json({ errors: e.errors });
  }
});

// Use auth routes
app.use('/api/auth', authRoutes);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
