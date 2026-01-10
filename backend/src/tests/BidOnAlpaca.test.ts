import "reflect-metadata";
import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { BidOnAlpaca } from "../usecases/BidOnAlpaca";
import { Alpaca, AccessoryType } from "../core/domain/Alpaca";
import { IAlpacaRepository } from "../core/interfaces/IAlpacaRepository";
import { SecurityService } from "../core/services/SecurityService";
import { PaymentService } from "../core/services/PaymentService";

// Mock Repository
const mockRepo = {
  getById: jest.fn<(id: number) => Promise<Alpaca | null>>(),
  save: jest.fn<(alpaca: Alpaca) => Promise<Alpaca>>(),
  getAll: jest.fn<() => Promise<Alpaca[]>>()
};

// Mock Services
const mockSecurityService = {
  hashPassword: jest.fn<(plainText: string) => Promise<string>>(),
  verifyPassword: jest.fn<(plainText: string, hash: string) => Promise<boolean>>()
};

const mockPaymentService = {
  createPaymentIntent: jest.fn<(amount: number, currency: string) => Promise<string>>(),
  verifyPayment: jest.fn<(paymentId: string) => Promise<boolean>>()
};

describe("UseCase: BidOnAlpaca", () => {
  let useCase: BidOnAlpaca;

  beforeEach(() => {
    useCase = new BidOnAlpaca(
      mockRepo as unknown as IAlpacaRepository,
      mockSecurityService as unknown as SecurityService,
      mockPaymentService as unknown as PaymentService
    );
    jest.clearAllMocks();
  });

  it("should successfully transfer ownership when bid is higher", async () => {
    // Arrange
    const initialAlpaca = new Alpaca(1, "Alpaca 1", "White", AccessoryType.NONE, 100, "User A");
    mockRepo.getById.mockResolvedValue(initialAlpaca);
    mockRepo.save.mockImplementation(async (a: Alpaca) => a);
    mockSecurityService.hashPassword.mockResolvedValue("hashed_secret");

    // Act
    const result = await useCase.execute({ 
      alpacaId: 1, 
      amount: 150, 
      newOwner: "User B",
      newPasswordPlain: "secure123" 
    });

    // Assert
    expect(result.ownerName).toBe("User B");
    expect(result.currentValue).toBe(150);
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it("should throw error when bid is lower or equal", async () => {
    // Arrange
    const initialAlpaca = new Alpaca(1, "Alpaca 1", "White", AccessoryType.NONE, 100, "User A");
    mockRepo.getById.mockResolvedValue(initialAlpaca);

    // Act & Assert
    await expect(useCase.execute({ 
      alpacaId: 1, 
      amount: 50, 
      newOwner: "User B",
      newPasswordPlain: "pass" 
    }))
      .rejects.toThrow("Bid amount 50 must be greater than current value 100");
      
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});