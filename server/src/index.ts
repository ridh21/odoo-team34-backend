import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import farmerRoutes from './routes/farmerRoutes';
import authRoutes from './routes/authRoutes';
// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 8000;

// Middleware

// Allowed domains
app.use(cors(
  {
    origin: 'http://localhost:3000'
  }
));

// Enable JSON parsing
app.use(express.json());

// Routes
app.use('/api/farmers', farmerRoutes);

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;