const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log("No token provided");
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token verification failed:", err);
      return res.sendStatus(403); // Forbidden
    }
    console.log("Token verified, user:", user);
    req.user = user;
    next();
  });
};

// User registration 
app.post('/signup', async (req, res) => {
  const userSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8)
  });

  try {
    const validatedData = userSchema.parse(req.body);
    console.log("Validated signup data:", validatedData);
    const existingUser = await prisma.user.findUnique({ where: { email: validatedData.email } });

    if (existingUser) {
      console.log("User already exists:", existingUser);
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        passwordHistory: [hashedPassword]
      }
    });

    console.log("User created:", user);
    res.status(201).json({ message: 'User created successfully', username: user.name });
  } catch (err) {
    console.log("Signup error:", err);
    res.status(400).json({ error: err.errors });
  }
});

// User login
app.post('/login', async (req, res) => {
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
  });

  try {
    const validatedData = loginSchema.parse(req.body);
    console.log("Validated login data:", validatedData);
    const user = await prisma.user.findUnique({ where: { email: validatedData.email } });

    if (!user || !(await bcrypt.compare(validatedData.password, user.password))) {
      console.log("Invalid credentials for email:", validatedData.email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("User logged in, token generated:", token);
    res.json({ token, username: user.name });
  } catch (err) {
    console.log("Login error:", err);
    res.status(400).json({ error: err.errors });
  }
});

// Add Applicant
app.post('/add-applicant', authenticateToken, async (req, res) => {
  const applicantSchema = z.object({
    name: z.string()
  });

  try {
    const validatedData = applicantSchema.parse(req.body);
    console.log("Validated applicant data:", validatedData);

    const applicant = await prisma.applicant.create({
      data: {
        name: validatedData.name,
        userId: req.user.userId
      }
    });

    console.log("Applicant added:", applicant);
    res.status(201).json({ message: 'Applicant added successfully', applicant });
  } catch (err) {
    console.log("Add applicant error:", err);
    res.status(400).json({ error: err.errors });
  }
});

// Get all applicants for the authenticated user
app.get('/applicants', authenticateToken, async (req, res) => {
  try {
    console.log("Fetching applicants for user:", req.user.userId);
    const applicants = await prisma.applicant.findMany({
      where: {
        userId: req.user.userId
      }
    });
    console.log("Applicants fetched:", applicants);
    res.json(applicants);
  } catch (err) {
    console.log("Get applicants error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add Document Name
app.post('/add-document-name', authenticateToken, async (req, res) => {
  const documentNameSchema = z.object({
    name: z.string(),
    applicantId: z.number()
  });

  try {
    console.log("Request body:", req.body);
    const validatedData = documentNameSchema.parse({
      ...req.body,
      applicantId: parseInt(req.body.applicantId, 10) // Ensure applicantId is parsed as a number
    });
    console.log("Validated document name data:", validatedData);

    const documentName = await prisma.documentName.create({
      data: {
        name: validatedData.name,
        applicantId: validatedData.applicantId
      }
    });

    console.log("Document name added:", documentName);
    res.status(201).json({ message: 'Document name added successfully', documentName });
  } catch (err) {
    console.log("Add document name error:", err);
    res.status(400).json({ error: err.errors });
  }
});

// Get Documents for Applicant
app.get('/applicants/:id/documents', authenticateToken, async (req, res) => {
  const applicantId = parseInt(req.params.id);

  try {
    console.log("Fetching documents for applicant:", applicantId);
    const documents = await prisma.document.findMany({
      where: {
        applicantId: applicantId
      }
    });
    console.log("Documents fetched:", documents);
    res.json(documents);
  } catch (err) {
    console.log("Get documents error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Specific Document by ID
app.get('/documents/:id', authenticateToken, async (req, res) => {
  const documentId = parseInt(req.params.id);

  try {
    console.log("Fetching document with ID:", documentId);
    const document = await prisma.document.findUnique({
      where: {
        id: documentId
      }
    });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    console.log("Document fetched:", document);
    res.json(document);
  } catch (err) {
    console.log("Get document error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add Document
app.post('/add-document', authenticateToken, upload.single('file'), async (req, res) => {
  const documentSchema = z.object({
    name: z.string(),
    type: z.string(),
    documentNameId: z.number()
  });

  try {
    console.log("Request body:", req.body);

    // Ensure documentNameId is correctly parsed as a number
    const parsedDocumentNameId = parseInt(req.body.documentNameId, 10);
    if (isNaN(parsedDocumentNameId)) {
      throw new Error("Invalid documentNameId: Expected a number");
    }

    const validatedData = documentSchema.parse({
      ...req.body,
      documentNameId: parsedDocumentNameId
    });

    console.log("Validated document data:", validatedData);

    const document = await prisma.document.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        url: req.file.path,
        documentNameId: validatedData.documentNameId,
        applicantId: req.user.userId // Use applicantId from the authenticated user
      }
    });

    console.log("Document added:", document);
    res.status(201).json({ message: 'Document added successfully', document });
  } catch (err) {
    console.log("Add document error:", err);
    res.status(400).json({ error: err.message });
  }
});

//delete applicant
app.delete('/applicants/:id', authenticateToken, async (req, res) => {
  const applicantId = parseInt(req.params.id);

  try {
    console.log("Deleting applicant with ID:", applicantId);

    // Delete the applicant
    const deletedApplicant = await prisma.applicant.delete({
      where: {
        id: applicantId
      }
    });

    console.log("Applicant deleted:", deletedApplicant);
    res.json({ message: 'Applicant deleted successfully', applicant: deletedApplicant });
  } catch (err) {
    console.log("Delete applicant error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//delete document 
app.delete('/documents/:id', authenticateToken, async (req, res) => {
  const documentId = parseInt(req.params.id);

  try {
    console.log("Deleting document with ID:", documentId);

    // Delete the document
    const deletedDocument = await prisma.document.delete({
      where: {
        id: documentId
      }
    });

    console.log("Document deleted:", deletedDocument);
    res.json({ message: 'Document deleted successfully', document: deletedDocument });
  } catch (err) {
    console.log("Delete document error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
