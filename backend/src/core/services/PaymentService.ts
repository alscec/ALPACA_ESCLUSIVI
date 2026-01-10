import { injectable } from "tsyringe";
import Stripe from "stripe";

@injectable()
export class PaymentService {
  // Inizializza Stripe con la chiave segreta dal .env
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-11-17.clover", // Usa una versione recente e stabile
    typescript: true,
  });

  /**
   * Crea l'intento di pagamento e restituisce il "Client Secret".
   * Il frontend userà questo segreto per mostrare il modulo della carta.
   */
  async createPaymentIntent(amount: number, currency: string = 'eur'): Promise<string> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe vuole i centesimi (10€ = 1000)
        currency: currency,
        automatic_payment_methods: { enabled: true },
      });

      if (!paymentIntent.client_secret) {
        throw new Error("Errore critico: Stripe non ha restituito il client_secret");
      }

      return paymentIntent.client_secret;
    } catch (error: any) {
      console.error("Stripe Create Error:", error);
      throw new Error("Impossibile inizializzare il pagamento");
    }
  }

  /**
   * Verifica se il pagamento è andato realmente a buon fine.
   * Chiamiamo Stripe per chiedere: "Hey, questo ID ha pagato davvero?"
   */
  async verifyPayment(paymentIntentId: string): Promise<boolean> {
    try {
      if (!paymentIntentId) return false;
      
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      // Il pagamento è valido solo se lo stato è 'succeeded'
      return paymentIntent.status === 'succeeded';
    } catch (error) {
      console.error("Stripe Verify Error:", error);
      return false;
    }
  }
}