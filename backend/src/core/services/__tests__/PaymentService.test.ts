import "reflect-metadata";
import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { PaymentService } from '../PaymentService';
import Stripe from 'stripe';

// Mock Stripe
jest.mock('stripe');

describe('Service: PaymentService', () => {
  let paymentService: PaymentService;
  let mockStripe: jest.Mocked<Stripe>;

  beforeEach(() => {
    // Set environment variable for tests
    process.env.STRIPE_SECRET_KEY = 'sk_test_fake_key_for_testing';

    // Create mock Stripe instance
    mockStripe = {
      paymentIntents: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
    } as any;

    // Mock Stripe constructor
    (Stripe as any).mockImplementation(() => mockStripe);

    paymentService = new PaymentService();
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.STRIPE_SECRET_KEY;
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      const mockClientSecret = 'pi_test_secret_abc123';
      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: mockClientSecret,
        amount: 10000,
        currency: 'eur',
        status: 'requires_payment_method',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent as any);

      const result = await paymentService.createPaymentIntent(100, 'eur');

      expect(result).toBe(mockClientSecret);
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 10000, // 100 EUR * 100
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
      });
    });

    it('should convert amount to cents correctly', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: 'secret_123',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent as any);

      await paymentService.createPaymentIntent(150.50, 'eur');

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 15050, // 150.50 * 100
        })
      );
    });

    it('should use default currency EUR if not specified', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: 'secret_123',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent as any);

      await paymentService.createPaymentIntent(100);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'eur',
        })
      );
    });

    it('should throw error when client_secret is missing', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: null,
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent as any);

      await expect(paymentService.createPaymentIntent(100))
        .rejects
        .toThrow('Impossibile inizializzare il pagamento');
    });

    it('should handle Stripe API errors', async () => {
      mockStripe.paymentIntents.create.mockRejectedValue(
        new Error('Stripe API Error')
      );

      await expect(paymentService.createPaymentIntent(100))
        .rejects
        .toThrow('Impossibile inizializzare il pagamento');
    });

    it('should handle zero amount', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: 'secret_123',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent as any);

      await paymentService.createPaymentIntent(0);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 0,
        })
      );
    });

    it('should round amount correctly for fractional cents', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: 'secret_123',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent as any);

      await paymentService.createPaymentIntent(99.999);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 10000, // Math.round(99.999 * 100) = 10000
        })
      );
    });
  });

  describe('verifyPayment', () => {
    it('should return true when payment succeeded', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        status: 'succeeded',
      };

      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent as any);

      const result = await paymentService.verifyPayment('pi_test_123');

      expect(result).toBe(true);
      expect(mockStripe.paymentIntents.retrieve).toHaveBeenCalledWith('pi_test_123');
    });

    it('should return false when payment is pending', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        status: 'requires_payment_method',
      };

      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent as any);

      const result = await paymentService.verifyPayment('pi_test_123');

      expect(result).toBe(false);
    });

    it('should return false when payment failed', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        status: 'canceled',
      };

      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent as any);

      const result = await paymentService.verifyPayment('pi_test_123');

      expect(result).toBe(false);
    });

    it('should return false when paymentIntentId is empty', async () => {
      const result = await paymentService.verifyPayment('');

      expect(result).toBe(false);
      expect(mockStripe.paymentIntents.retrieve).not.toHaveBeenCalled();
    });

    it('should handle Stripe API errors gracefully', async () => {
      mockStripe.paymentIntents.retrieve.mockRejectedValue(
        new Error('Payment intent not found')
      );

      const result = await paymentService.verifyPayment('pi_invalid_123');

      expect(result).toBe(false);
    });

    it('should handle different payment statuses', async () => {
      const statuses = [
        { status: 'succeeded', expected: true },
        { status: 'processing', expected: false },
        { status: 'requires_payment_method', expected: false },
        { status: 'requires_confirmation', expected: false },
        { status: 'requires_action', expected: false },
        { status: 'canceled', expected: false },
      ];

      for (const { status, expected } of statuses) {
        mockStripe.paymentIntents.retrieve.mockResolvedValue({ 
          id: 'pi_test', 
          status 
        } as any);

        const result = await paymentService.verifyPayment('pi_test');
        expect(result).toBe(expected);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large amounts', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: 'secret_123',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent as any);

      await paymentService.createPaymentIntent(999999);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 99999900,
        })
      );
    });

    it('should handle negative amounts', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: 'secret_123',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent as any);

      await paymentService.createPaymentIntent(-100);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: -10000,
        })
      );
    });
  });
});
