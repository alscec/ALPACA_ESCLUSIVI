import { injectable } from "tsyringe";
import Stripe from "stripe";
import logger from "./logger";

/**
 * PaymentGateway - Production-ready Stripe integration
 * 
 * Configuration Requirements:
 * - STRIPE_SECRET_KEY: Your Stripe secret key (from Secret Manager)
 * - STRIPE_WEBHOOK_SECRET: Webhook signing secret for verification
 * 
 * GCP Secret Manager Setup:
 * 1. Create secret: gcloud secrets create stripe-secret-key --data-file=-
 * 2. Create secret: gcloud secrets create stripe-webhook-secret --data-file=-
 * 3. Grant access to Cloud Run service account:
 *    gcloud secrets add-iam-policy-binding stripe-secret-key \
 *      --member="serviceAccount:YOUR_SERVICE_ACCOUNT" \
 *      --role="roles/secretmanager.secretAccessor"
 */
@injectable()
export class PaymentGateway {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    if (!secretKey) {
      logger.error('STRIPE_SECRET_KEY not configured');
      throw new Error('Payment service not configured');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: "2025-11-17.clover",
      typescript: true,
    });

    logger.info('Payment Gateway initialized');
  }

  /**
   * Create a payment intent for the alpaca bid
   * @param amount Amount in EUR (e.g., 100.50)
   * @param metadata Additional metadata for tracking
   */
  async createPaymentIntent(
    amount: number, 
    metadata: { alpacaId: string; bidder: string }
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
        metadata: {
          alpacaId: metadata.alpacaId,
          bidder: metadata.bidder,
          purpose: 'alpaca_hostile_takeover'
        },
      });

      if (!paymentIntent.client_secret) {
        throw new Error("Stripe did not return client_secret");
      }

      logger.info('Payment intent created', {
        paymentIntentId: paymentIntent.id,
        amount,
        alpacaId: metadata.alpacaId
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      logger.error('Failed to create payment intent', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        amount,
        metadata
      });
      throw new Error("Unable to initialize payment");
    }
  }

  /**
   * Verify payment status
   * @param paymentIntentId The payment intent ID to verify
   */
  async verifyPayment(paymentIntentId: string): Promise<boolean> {
    try {
      if (!paymentIntentId) {
        logger.warn('verifyPayment called with empty paymentIntentId');
        return false;
      }
      
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      const isSuccessful = paymentIntent.status === 'succeeded';
      
      logger.info('Payment verification', {
        paymentIntentId,
        status: paymentIntent.status,
        verified: isSuccessful
      });

      return isSuccessful;
    } catch (error) {
      logger.error('Payment verification failed', {
        paymentIntentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Verify webhook signature for secure webhook handling
   * @param payload Raw request body
   * @param signature Stripe signature header
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    if (!this.webhookSecret) {
      logger.error('Webhook secret not configured');
      throw new Error('Webhook verification not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      logger.info('Webhook verified', { 
        eventType: event.type,
        eventId: event.id
      });

      return event;
    } catch (error) {
      logger.error('Webhook verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Refund a payment (for admin purposes or dispute resolution)
   * @param paymentIntentId The payment to refund
   * @param reason Optional reason for the refund
   */
  async refundPayment(
    paymentIntentId: string, 
    reason?: string
  ): Promise<boolean> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (!paymentIntent.latest_charge) {
        throw new Error('No charge found for this payment intent');
      }

      const refund = await this.stripe.refunds.create({
        charge: paymentIntent.latest_charge.toString(),
        reason: reason as Stripe.RefundCreateParams.Reason,
      });

      logger.info('Payment refunded', {
        paymentIntentId,
        refundId: refund.id,
        reason
      });

      return refund.status === 'succeeded';
    } catch (error) {
      logger.error('Refund failed', {
        paymentIntentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }
}
