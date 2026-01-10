import "reflect-metadata"; // PRIMA RIGA OBBLIGATORIA
import express from "express";
import cors from "cors";
import { container } from "tsyringe";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"; // <--- AGGIUNGI QUESTO IMPORT

// Importazioni interne
import { PrismaAlpacaRepository } from "./infrastructure/PrismaAlpacaRepository";
import { AlpacaController } from "./presentation/AlpacaController";
import { AccessoryType } from "./core/domain/Alpaca";

// --- 1. SETUP DEPENDENCY INJECTION ---
container.register("AlpacaRepository", { useClass: PrismaAlpacaRepository });

// --- 2. SETUP EXPRESS ---
const app = express();
// Usa la porta di Google o 3000 per locale
const PORT = process.env.PORT || 3000; 

app.use(cors()); // Permette al frontend di chiamare
app.use(express.json());

const prisma = new PrismaClient();

// --- 3. SEEDING (Crea i 10 Alpaca se non esistono) ---
// --- SEEDING SICURO ---
async function seedDatabase() {
  try {
    const count = await prisma.alpaca.count();
    if (count === 0) {
      console.log("🌱 Database vuoto. Creo i 10 Alpaca...");
      
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
            password: defaultPasswordHash, // <--- USIAMO L'HASH, NON IL TESTO
            backgroundImage: null,
            lastBidAt: new Date(0)
          }
        });
      }
      console.log("✅ Seeding completato con password criptate.");
    }
  } catch (e) {
    console.error("⚠️ Errore seeding: database error", e);
  }
}

// --- 4. ROTTE ---
// Get All (Usiamo il repository direttamente per semplicità in lettura)
app.get("/api/alpaca", async (req, res) => {
  const repo = container.resolve(PrismaAlpacaRepository);
  const alpacas = await repo.getAll();
  res.json(alpacas);
});

app.get("/api/alpaca", async (req, res) => { /* ... */ });
app.post("/api/alpaca/:id/bid", (req, res, next) => AlpacaController.bid(req, res, next));
app.patch("/api/alpaca/:id", (req, res, next) => AlpacaController.update(req, res, next));
app.get("/", (req, res) => res.send("🦙 Alpaclub Backend Secure and Ready"));

app.listen(PORT, async () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  await seedDatabase();
});