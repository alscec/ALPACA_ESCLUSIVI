import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { z } from "zod";
import { BidOnAlpaca } from "../usecases/BidOnAlpaca";
import { IAlpacaRepository } from "../core/interfaces/IAlpacaRepository";
import bcrypt from "bcryptjs";

// Input Validation Schema
const BidSchema = z.object({
  amount: z.number().positive(),
  newOwner: z.string().min(1).max(50),
  password: z.string().min(1)
});

export class AlpacaController {
  
  // Nota: ho rimosso i 'Promise<void>' espliciti e i cast (req as any) non necessari
  // se hai configurato bene i tipi, ma se ti danno problemi lasciali pure.
  static async bid(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // 1. Validazione Input
      const validationResult = BidSchema.safeParse(req.body);
      
      if (!validationResult.success) {
         return res.status(400).json({ error: validationResult.error });
      }

      const { amount, newOwner, password } = validationResult.data;
      
      // 2. Risoluzione Dipendenze
      const useCase = container.resolve(BidOnAlpaca);
      
      // 3. Esecuzione (Passiamo la password in chiaro, il UseCase farà l'hash)
      const updatedAlpaca = await useCase.execute({
        alpacaId: Number(id),
        amount,
        newOwner,
        newPasswordPlain: password 
      });

      // 4. Successo
      return res.status(200).json(updatedAlpaca);

    } catch (error) {
      // 5. Gestione Errori
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Errore 404: Alpaca non trovato
      if (errorMessage.includes("not found")) {
        return res.status(404).json({ error: errorMessage });
      }
      
      // Errore 400: Offerta bassa O Cooldown attivo (LOCKED)
      if (errorMessage.includes("Bid too low") || errorMessage.includes("LOCKED")) {
        return res.status(400).json({ error: errorMessage });
      }
      
      // Altri errori (es. Database crash)
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = container.resolve<IAlpacaRepository>("AlpacaRepository");
      const alpacas = await repo.getAll();
      return res.status(200).json(alpacas);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { password, ...updates } = req.body; 

      const repo = container.resolve<IAlpacaRepository>("AlpacaRepository");
      const alpaca = await repo.getById(Number(id));

      if (!alpaca) return res.status(404).json({ error: "Alpaca not found" });

      // 1. SICUREZZA REALE (BCRYPT)
      if (alpaca.ownerName !== 'System DAO') {
          if (!password) return res.status(403).json({ error: "Password richiesta" });
          
          // Confronta la password scritta dall'utente con l'HASH nel DB
          const isMatch = await bcrypt.compare(password, alpaca.password || "");
          
          if (!isMatch) {
              return res.status(403).json({ error: "Password errata! Accesso negato." });
          }
      }

      // 2. APPLICA MODIFICHE (Incluso stableColor)
      if (updates.name) alpaca.name = updates.name;
      if (updates.color) alpaca.color = updates.color;
      if (updates.stableColor) alpaca.stableColor = updates.stableColor;
      if (updates.accessory) alpaca.accessory = updates.accessory;
      if (updates.backgroundImage) alpaca.backgroundImage = updates.backgroundImage;

      await repo.save(alpaca);
      
      return res.status(200).json(alpaca);
    } catch (error) {
      next(error);
    }
  }
}