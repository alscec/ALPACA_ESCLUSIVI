import "reflect-metadata"; // PRIMA RIGA OBBLIGATORIA
import { container } from "tsyringe";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Importazioni interne
import { PrismaAlpacaRepository } from "./infrastructure/PrismaAlpacaRepository";
import app from "./app"; // Import the configured Express app
import logger from "./infrastructure/logger";

// --- 1. SETUP DEPENDENCY INJECTION ---
container.register("AlpacaRepository", { useClass: PrismaAlpacaRepository });

// --- 2. SETUP PORT ---
const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient();

// --- 3. SEEDING (Crea i 10 Alpaca se non esistono) ---
async function seedDatabase() {
  try {
    const count = await prisma.alpaca.count();
    if (count === 0) {
      logger.info("🌱 Database vuoto. Creo i 10 Alpaca...");
      
      // CREIAMO UN HASH VERO PER LA PASSWORD DI DEFAULT "default123"
      const defaultPasswordHash = await bcrypt.hash("default123", 10);

      for (let i = 1; i <= 10; i++) {
        await prisma.alpaca.create({
          data: {
            id: i,
            name: `Alpaca Nº${i}`,
            color: "White",
            stableColor: "#795548",
            accessory: "None",
            currentValue: 100.0,
            ownerName: "System DAO",
            password: defaultPasswordHash,
            backgroundImage: null,
            lastBidAt: new Date(0)
          }
        });
      }
      logger.info("✅ Seeding completato con password criptate.");
    }
  } catch (e) {
    logger.error("⚠️ Errore seeding", { error: e instanceof Error ? e.message : 'Unknown error' });
    // Don't throw - allow server to start even if seeding fails
  }
}

// --- 4. GRACEFUL SHUTDOWN HANDLER ---
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  try {
    await prisma.$disconnect();
    logger.info('Database connections closed.');
    process.exit(0);
  } catch (err) {
    logger.error('Error during graceful shutdown', { error: err instanceof Error ? err.message : 'Unknown error' });
    process.exit(1);
  }
}

// --- 5. PROCESS ERROR HANDLERS ---
process.on('uncaughtException', (error: Error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', {
    reason: reason instanceof Error ? reason.message : String(reason)
  });
  process.exit(1);
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// --- 6. START SERVER ---
const server = app.listen(PORT, async () => {
  logger.info(`🚀 Server listening on port ${PORT}`);
  await seedDatabase();
});

// Handle server errors
server.on('error', (error: Error) => {
  logger.error('Server error', { error: error.message, stack: error.stack });
  process.exit(1);
});

export default server;