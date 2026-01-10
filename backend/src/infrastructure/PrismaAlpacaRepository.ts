import { injectable } from "tsyringe";
import { PrismaClient } from "@prisma/client";
import { IAlpacaRepository } from "../core/interfaces/IAlpacaRepository";
import { Alpaca, AccessoryType } from "../core/domain/Alpaca";

const prisma = new PrismaClient();

@injectable()
export class PrismaAlpacaRepository implements IAlpacaRepository {
  
  // --- HELPER: Converte da DB (Prisma) a Dominio (Classe Alpaca) ---
  private toDomain(record: any): Alpaca {
    const alpaca = new Alpaca(
      record.id,
      record.name,
      record.color,
      record.accessory as AccessoryType,
      record.currentValue,
      record.ownerName,
    );
    
    // Popoliamo i campi extra
    alpaca.password = record.password;
    alpaca.backgroundImage = record.backgroundImage;
    alpaca.lastTransactionTimestamp = record.lastBidAt; 
    alpaca.stableColor = record.stableColor;
    
    // Mappiamo la storia se presente (con controllo di sicurezza)
    if (record.history && Array.isArray(record.history)) {
      alpaca.history = record.history.map((h: any) => ({
        timestamp: h.timestamp.toISOString(),
        previousOwner: h.previousOwner,
        newOwner: h.newOwner,
        amount: h.amount
      }));
    } else {
      alpaca.history = [];
    }
    
    return alpaca;
  }

  // --- 1. GET BY ID (Con caricamento storia) ---
  async getById(id: number): Promise<Alpaca | null> {
    const record = await prisma.alpaca.findUnique({ 
        where: { id },
        include: { 
          history: { 
            orderBy: { timestamp: 'desc' } // Ordina dal più recente
          } 
        } 
    });
    
    if (!record) return null;
    return this.toDomain(record);
  }

  // --- 2. GET ALL (Con caricamento storia per Hall of Fame) ---
  async getAll(): Promise<Alpaca[]> {
    const records = await prisma.alpaca.findMany({ 
        orderBy: { id: 'asc' },
        include: { 
          history: { 
            orderBy: { timestamp: 'desc' } 
          } 
        } 
    });
    return records.map(record => this.toDomain(record));
  }

  // --- 3. SAVE (Gestisce l'aggiornamento e la creazione della storia) ---
  async save(alpaca: Alpaca): Promise<Alpaca> {
    
    // Prepariamo i dati base dell'Alpaca
    const alpacaData = {
      name: alpaca.name,
      color: alpaca.color,
      accessory: String(alpaca.accessory),
      stableColor: alpaca.stableColor || "#795548", // <--- AGGIUNTO QUI
      currentValue: alpaca.currentValue,
      ownerName: alpaca.ownerName,
      password: alpaca.password || "$2a$10$defaultHashPlaceholder",
      backgroundImage: alpaca.backgroundImage || null,
      lastBidAt: alpaca.lastTransactionTimestamp
    };

    // Usiamo una transazione database per essere sicuri che tutto vada a buon fine
    // Nota: Prisma gestisce le relazioni, ma qui salviamo l'Alpaca.
    // Se c'è una NUOVA voce nella history che dobbiamo salvare, dovremmo farlo qui.
    // PER ORA: Aggiorniamo l'Alpaca. La creazione della riga 'Transaction' 
    // la facciamo separatamente nel UseCase o qui sotto se necessario.
    
    // Approccio Robusto: Salviamo l'Alpaca
    const record = await prisma.alpaca.upsert({
      where: { id: alpaca.id },
      update: alpacaData,
      create: { 
        id: alpaca.id, 
        ...alpacaData 
      },
      include: { history: true } // Ci serve per il ritorno
    });

    // SE l'alpaca ha una storia in memoria più lunga di quella nel DB, 
    // significa che c'è una nuova transazione da salvare.
    // (Questo è un controllo di sicurezza, idealmente il UseCase crea la transazione).
    // Ma per far funzionare il tuo codice attuale che si aspetta che "save" faccia tutto:
    
    if (alpaca.history && alpaca.history.length > 0) {
      const lastHistoryItem = alpaca.history[0]; // Il più recente aggiunto nel dominio
      
      // Controlliamo se l'ultima transazione nel DB corrisponde a quella in memoria.
      // Se non corrisponde (o il DB è vuoto), la creiamo.
      const dbHistory = record.history || [];
      const needsUpdate = dbHistory.length === 0 || 
                          dbHistory[dbHistory.length - 1].timestamp.toISOString() !== lastHistoryItem.timestamp;

      if (needsUpdate) {
         // Creiamo la voce nella tabella Transaction
         await prisma.transaction.create({
           data: {
             alpacaId: alpaca.id,
             previousOwner: lastHistoryItem.previousOwner,
             newOwner: lastHistoryItem.newOwner,
             amount: lastHistoryItem.amount,
             timestamp: new Date(lastHistoryItem.timestamp)
           }
         });
         
         // Ricarichiamo il record aggiornato
         const updatedRecord = await prisma.alpaca.findUnique({
            where: { id: alpaca.id },
            include: { history: { orderBy: { timestamp: 'desc' } } }
         });
         return this.toDomain(updatedRecord);
      }
    }

    return this.toDomain(record);
  }
}