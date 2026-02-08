import "reflect-metadata";
import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { BidOnAlpaca } from "../usecases/BidOnAlpaca";
import { Alpaca, AccessoryType } from "../core/domain/Alpaca";
import { IAlpacaRepository } from "../core/interfaces/IAlpacaRepository";

// Mock Repository
const mockRepo = {
  getById: jest.fn<(id: number) => Promise<Alpaca | null>>(),
  save: jest.fn<(alpaca: Alpaca) => Promise<Alpaca>>(),
  getAll: jest.fn<() => Promise<Alpaca[]>>()
};

describe("UseCase: BidOnAlpaca", () => {
  let useCase: BidOnAlpaca;

  beforeEach(() => {
    useCase = new BidOnAlpaca(
      mockRepo as unknown as IAlpacaRepository
    );
    jest.clearAllMocks();
  });

  it("should successfully transfer ownership when bid is higher", async () => {
    // Arrange
    const initialAlpaca = new Alpaca(1, "Alpaca 1", "White", AccessoryType.NONE, 100, "User A");
    // Set timestamp to 10 minutes ago to bypass cooldown
    initialAlpaca.lastTransactionTimestamp = new Date(Date.now() - 10 * 60 * 1000);
    mockRepo.getById.mockResolvedValue(initialAlpaca);
    mockRepo.save.mockImplementation(async (a: Alpaca) => a);

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