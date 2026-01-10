import "reflect-metadata";
import express from "express";
// import helmet from "helmet"; // npm install helmet
// import cors from "cors";     // npm install cors
// import rateLimit from "express-rate-limit"; // npm install express-rate-limit
import { AlpacaController } from "./presentation/AlpacaController";

const app = express();

// --- SECURITY MIDDLEWARE (Uncomment for Production) ---
// 1. Helmet: Sets various HTTP headers to help protect your app
// app.use(helmet()); 

// 2. CORS: Restrict access to your specific frontend domain
// app.use(cors({ origin: 'https://www.alpacaesclusivi.com' }));

// 3. Rate Limiting: Prevent Brute Force / DDoS
/*
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
*/

app.use(express.json());

// --- ROUTES ---
app.post("/api/alpaca/:id/bid", (req, res, next) => AlpacaController.bid(req, res, next));
// app.post("/api/alpaca/:id/customize", AlpacaController.customize);

export default app;