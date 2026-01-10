
import { Alpaca, BidRequest, UpdateRequest, HallOfFameStats, AlpacaRecord } from '../types';

const API_URL = "http://localhost:3000"; // O vuoto per prod

class ApiBackendService {

  async getAll(): Promise<Alpaca[]> {
    const response = await fetch(`${API_URL}/api/alpaca`);
    if (!response.ok) throw new Error(`Errore server: ${response.statusText}`);
    return await response.json();
  }

  async placeBid(request: BidRequest): Promise<Alpaca> {
    const response = await fetch(`${API_URL}/api/alpaca/${request.alpacaId}/bid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: request.bidAmount,
        newOwner: request.newOwnerName,
        password: request.newPassword
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Transazione fallita");
    return result;
  }

  async customize(request: UpdateRequest): Promise<Alpaca> {
    const response = await fetch(`${API_URL}/api/alpaca/${request.alpacaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: request.passwordVerify, // Questa va al backend per il controllo
        name: request.newName,
        color: request.newColor,
        stableColor: request.newStableColor, // <--- ORA LO MANDIAMO
        backgroundImage: request.newBackgroundImage,
        accessory: request.newAccessory
      })
    });

    const result = await response.json();
    // 🛑 SE IL BACKEND DICE 403 (Password Errata), LANCIAMO ERRORE QUI
    if (!response.ok) throw new Error(result.error || "Modifica fallita");
    
    return result;
  }


  // ... dentro la classe ApiBackendService ...

  // VERSIONE LEGGERA (Tanto c'è il banner Coming Soon)
  async getHallOfFame(): Promise<HallOfFameStats> {
    return {
      tycoon: { name: 'N/A', totalSpent: 0 },
      steward: { name: 'N/A', totalDurationMs: 0 },
      alpacaRecords: []
    };
  }


  // --- LOGICA HALL OF FAME REINTEGRATA ---
  /*async getHallOfFame(): Promise<HallOfFameStats> {
    // 1. Scarichiamo dati freschi dal server (inclusa la history)
    const alpacas = await this.getAll();
    
    const spendingMap = new Map<string, number>();
    const durationMap = new Map<string, number>();
    const alpacaRecords: AlpacaRecord[] = [];

    alpacas.forEach(alpaca => {
      // Calcolo Spesa Totale (Tycoon)
      if (alpaca.history) {
        alpaca.history.forEach((tx: any) => {
          const current = spendingMap.get(tx.newOwner) || 0;
          spendingMap.set(tx.newOwner, current + tx.amount);
        });
      }

      // Calcolo Durata (Steward) - Semplificato per brevità
      // (Per farlo preciso dovresti iterare la history e fare le differenze di tempo)
      // Qui calcoliamo chi ha l'alpaca ADESSO e da quanto tempo
      const currentOwner = alpaca.ownerName;
      if (currentOwner !== 'System DAO') {
         const duration = Date.now() - new Date(alpaca.lastTransactionTimestamp).getTime();
         durationMap.set(currentOwner, (durationMap.get(currentOwner) || 0) + duration);
      }

      // Record per Singolo Alpaca
      let maxBid = alpaca.currentValue;
      let recordHolder = alpaca.ownerName;
      let longestSteward = 'N/A'; // Placeholder per logica complessa history
      
      // Cerchiamo il bid più alto nella storia
      if (alpaca.history) {
          alpaca.history.forEach(h => {
              if (h.amount > maxBid) {
                  maxBid = h.amount;
                  recordHolder = h.newOwner;
              }
          });
      }

      alpacaRecords.push({
        id: alpaca.id,
        name: alpaca.name,
        highestBid: maxBid,
        recordHolder: recordHolder,
        longestDurationMs: 0, 
        longestSteward: longestSteward
      });
    });

    // Trova i vincitori globali
    let tycoon = { name: 'None', totalSpent: 0 };
    spendingMap.forEach((val, key) => {
      if (val > tycoon.totalSpent && key !== 'System DAO') tycoon = { name: key, totalSpent: val };
    });

    let steward = { name: 'None', totalDurationMs: 0 };
    durationMap.forEach((val, key) => {
      if (val > steward.totalDurationMs && key !== 'System DAO') steward = { name: key, totalDurationMs: val };
    });

    return { tycoon, steward, alpacaRecords };
  }*/
}

export const alpacaService = new ApiBackendService();
