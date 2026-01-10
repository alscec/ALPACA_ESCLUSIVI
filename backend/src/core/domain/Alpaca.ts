export enum AccessoryType {
  NONE = 'None',
  GOLD_CHAIN = 'Gold Chain',
  SILK_SCARF = 'Silk Scarf',
  TOP_HAT = 'Top Hat',
  DIAMOND_STUD = 'Diamond Stud'
}

// 1. Definiamo cosa contiene una riga di storico
export interface TransactionHistory {
  timestamp: string;
  previousOwner: string;
  newOwner: string;
  amount: number;
}

export class Alpaca {
  // Proprietà opzionali/extra per sicurezza e UI
  public password?: string;
  public backgroundImage?: string;
  public lastTransactionTimestamp: Date;
  public stableColor?: string;
  
  // 2. AGGIUNTA FONDAMENTALE: L'array per la cronologia
  public history: TransactionHistory[] = [];

  constructor(
    public readonly id: number,
    public name: string,
    public color: string,
    public accessory: AccessoryType,
    public currentValue: number,
    public ownerName: string
  ) {
    // Inizializziamo il timestamp a ORA se è un nuovo oggetto
    this.lastTransactionTimestamp = new Date();
  }

  /**
   * Domain Logic: Validate if a bid is eligible for hostile takeover.
   */
  public isBidValid(amount: number): boolean {
    return amount > this.currentValue;
  }

  public transferOwnership(newOwner: string, newAmount: number, newPasswordHash: string) {
    if (!this.isBidValid(newAmount)) {
      throw new Error("Bid too low for hostile takeover.");
    }
    
    // 3. REGISTRIAMO LA TRANSAZIONE (Prima di resettare i dati!)
    // Inseriamo in cima all'array (unshift) così il più recente è il primo
    this.history.unshift({
      timestamp: new Date().toISOString(),
      previousOwner: this.ownerName, // Il vecchio proprietario
      newOwner: newOwner,            // Il nuovo proprietario
      amount: newAmount
    });

    // Factory Reset (Resetta nome e colori ai valori di default)
    this.name = `Alpaca #${this.id}`;
    this.color = "White"; 
    this.accessory = AccessoryType.NONE;
    this.backgroundImage = undefined;
    
    // Aggiorna dati proprietario e valore
    this.ownerName = newOwner;
    this.currentValue = newAmount;
    
    // Aggiorna il tempo per il cooldown e la password sicura
    this.lastTransactionTimestamp = new Date(); 
    this.password = newPasswordHash; 
  }
}