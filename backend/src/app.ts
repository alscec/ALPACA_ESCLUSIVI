import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { AlpacaController } from "./presentation/AlpacaController";
import logger from "./infrastructure/logger";

const app = express();

// --- LOGGING MIDDLEWARE ---
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// --- SECURITY MIDDLEWARE (Production Ready) ---
// 1. Helmet: Sets various HTTP headers to help protect your app
app.use(helmet());

// 2. CORS: Restrict access to your specific frontend domain
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({ 
  origin: allowedOrigins,
  credentials: true 
}));

// 3. Rate Limiting: Prevent Brute Force / DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use('/api/', limiter);

app.use(express.json());

// --- HEALTH CHECK ENDPOINT ---
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// --- ROUTES ---
app.get("/api/alpaca", (req, res, next) => AlpacaController.getAll(req, res, next));
app.post("/api/alpaca/:id/bid", (req, res, next) => AlpacaController.bid(req, res, next));
app.patch("/api/alpaca/:id", (req, res, next) => AlpacaController.update(req, res, next));

// --- ERROR HANDLING MIDDLEWARE ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;