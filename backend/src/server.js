import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Production Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'FRONTEND_URL' : '*',
  optionsSuccessStatus: 200
}));

// 2. Rate Limiting (Prevents DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// 3. Parsing Middleware
app.use(express.json({ limit: '10kb' })); // Prevents large payload attacks

// 4. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Production Database Connected'))
  .catch((err) => {
    console.error('❌ Database Connection Error:', err.message);
    process.exit(1); // Shut down if DB connection fails
  });

// 5. Sample Route & Error Handling
app.get('/', (req, res) => {
  res.send('Welcome to the Intelligent Problem Analyser API');
});
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', environment: process.env.NODE_ENV });
});

// Global Centralised Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 6. Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
