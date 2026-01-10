
/**
 * Represents the core Domain Entity for an Alpaca.
 */
export interface Alpaca {
  id: number;
  name: string;
  color: string;
  
  // MODIFICA 1: Nel DB backend non abbiamo messo 'stableColor'. 
  // Mettiamolo opzionale (?) per non far crashare se manca.
  stableColor?: string; 
  
  backgroundImage?: string;
  accessory: AccessoryType;
  currentValue: number;
  ownerName: string; 
  
  password?: string; 
  
  // MODIFICA 2: Mettiamo opzionale (?) perché se l'alpaca è nuovo non ha storia
  history?: TransactionHistory[]; 
  
  // MODIFICA 3 (CRITICA): Dal server arriva una STRINGA ISO (es. "2023-11-25T..."), non un numero.
  lastTransactionTimestamp: string; 
}

export enum AccessoryType {
  NONE = 'None',
  GOLD_CHAIN = 'Gold Chain',
  SILK_SCARF = 'Silk Scarf',
  TOP_HAT = 'Top Hat',
  DIAMOND_STUD = 'Diamond Stud'
}

export interface TransactionHistory {
  timestamp: string;
  previousOwner: string;
  newOwner: string;
  amount: number;
}

export interface BidRequest {
  alpacaId: number;
  bidAmount: number;
  newOwnerName: string;
  newPassword: string;
}

export interface UpdateRequest {
  alpacaId: number;
  passwordVerify: string; 
  newName?: string;
  newColor?: string;
  newStableColor?: string;
  newBackgroundImage?: string;
  newAccessory?: AccessoryType;
}

export interface AlpacaRecord {
  id: number;
  name: string;
  highestBid: number;
  recordHolder: string;
  longestDurationMs: number;
  longestSteward: string;
}

export interface HallOfFameStats {
  tycoon: { name: string; totalSpent: number };
  steward: { name: string; totalDurationMs: number };
  alpacaRecords: AlpacaRecord[];
}
