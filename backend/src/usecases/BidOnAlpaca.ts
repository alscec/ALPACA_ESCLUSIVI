import { injectable, inject } from "tsyringe";
import bcrypt from "bcryptjs"; // <--- FONDAMENTALE PER LA POLICY GOOGLE
import { IAlpacaRepository } from "../core/interfaces/IAlpacaRepository";
import { Alpaca } from "../core/domain/Alpaca";

// Interface per i dati in ingresso (dal Controller)
export interface BidRequest {
  alpacaId: number;
  amount: number;
  newOwner: string;
  newPasswordPlain: string; // La password in chiaro che arriva dal frontend
  paymentToken?: string;    // Per il futuro (Stripe)
}

@injectable()
export class BidOnAlpaca {
  constructor(
    @inject("AlpacaRepository") private repository: IAlpacaRepository
    // @inject(PaymentService) private paymentService: PaymentService // Scommenta quando integriamo Stripe
  ) {}

  async execute(request: BidRequest): Promise<Alpaca> {
    // 1. RECUPERA L'ASSET
    const alpaca = await this.repository.getById(request.alpacaId);
    
    if (!alpaca) {
      throw new Error("Alpaca not found");
    }

    // 2. VALIDAZIONE LOGICA (Prezzo)
    if (!alpaca.isBidValid(request.amount)) {
      throw new Error(`Bid amount ${request.amount} must be greater than current value ${alpaca.currentValue}`);
    }

    // 3. LOGICA COOLDOWN (Sicurezza Gioco)
    // Se l'ultima transazione è avvenuta meno di 5 minuti fa, blocca tutto.
    const COOLDOWN_MS = 5 * 60 * 1000;
    const now = Date.now();
    const timeDiff = now - new Date(alpaca.lastTransactionTimestamp).getTime();
    
    if (timeDiff < COOLDOWN_MS) {
       const remainingSeconds = Math.ceil((COOLDOWN_MS - timeDiff) / 1000);
       throw new Error(`Asset LOCKED. Cooldown active for another ${remainingSeconds} seconds.`);
    }

    // 4. VERIFICA PAGAMENTO (Placeholder per Stripe)
    // Qui in futuro chiameremo: await this.paymentService.verify(request.paymentToken);
    if (request.amount > 1000000) {
        // Esempio: limite di sicurezza per test senza Stripe
        throw new Error("Amount too high for beta testing without Stripe."); 
    }

    // 5. SICUREZZA: HASHING DELLA PASSWORD (Policy Google)
    // Trasformiamo "pippo123" in un hash indecifrabile.
    // 10 è il "salt rounds" (costo computazionale standard)
    const hashedPassword = await bcrypt.hash(request.newPasswordPlain, 10);

    // 6. CAMBIO DI PROPRIETÀ
    // Passiamo l'hash, NON la password in chiaro!
    alpaca.transferOwnership(request.newOwner, request.amount, hashedPassword);

    // 7. SALVATAGGIO SU DB
    return await this.repository.save(alpaca);
  }
}