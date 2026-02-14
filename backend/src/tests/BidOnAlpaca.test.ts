import "reflect-metadata";
import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { BidOnAlpaca } from "../usecases/BidOnAlpaca";
import { Alpaca, AccessoryType } from "../core/domain/Alpaca";
import { IAlpacaRepository } from "../core/interfaces/IAlpacaRepository";
import bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs');

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
    
    // Setup bcrypt mock
    (bcrypt.hash as any).mockImplementation(async (plain: string) => `hashed_${plain}`);
  });

  describe("Successful Bids", () => {
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

    it("should hash password before transfer", async () => {
      const alpaca = new Alpaca(1, "Alpaca 1", "White", AccessoryType.NONE, 100, "User A");
      alpaca.lastTransactionTimestamp = new Date(Date.now() - 10 * 60 * 1000);
      mockRepo.getById.mockResolvedValue(alpaca);
      mockRepo.save.mockImplementation(async (a: Alpaca) => a);

      await useCase.execute({ 
        alpacaId: 1, 
        amount: 150, 
        newOwner: "User B",
        newPasswordPlain: "myPassword123" 
      });

      expect(bcrypt.hash).toHaveBeenCalledWith("myPassword123", 10);
    });

    it("should handle minimum valid bid (current value + 1)", async () => {
      const alpaca = new Alpaca(1, "Alpaca 1", "White", AccessoryType.NONE, 100, "User A");
      alpaca.lastTransactionTimestamp = new Date(Date.now() - 10 * 60 * 1000);
      mockRepo.getById.mockResolvedValue(alpaca);
      mockRepo.save.mockImplementation(async (a: Alpaca) => a);

      const result = await useCase.execute({ 
        alpacaId: 1, 
        amount: 101, 
        newOwner: "User B",
        newPasswordPlain: "pass" 
      });

      expect(result.currentValue).toBe(101);
    });

    it("should handle very large bid amounts", async () => {
      const alpaca = new Alpaca(1, "Alpaca 1", "White", AccessoryType.NONE, 100, "User A");
      alpaca.lastTransactionTimestamp = new Date(Date.now() - 10 * 60 * 1000);
      mockRepo.getById.mockResolvedValue(alpaca);
      mockRepo.save.mockImplementation(async (a: Alpaca) => a);

      const result = await useCase.execute({ 
        alpacaId: 1, 
        amount: 999999, 
        newOwner: "User B",
        newPasswordPlain: "pass" 
      });

      expect(result.currentValue).toBe(999999);
    });
  });

  describe("Bid Validation Failures", () => {
    it("should throw error when bid is lower than current value", async () => {
      const alpaca = new Alpaca(1, "Alpaca 1", "White", AccessoryType.NONE, 100, "User A");
      mockRepo.getById.mockResolvedValue(alpaca);

      await expect(useCase.execute({ 
        alpacaId: 1, 
        amount: 50, 
        newOwner: "User B",
        newPasswordPlain: "pass" 
      }))
        .rejects.toThrow("Bid amount 50 must be greater than current value 100");
        
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it("should throw error when bid equals current value", async () => {
      const alpaca = new Alpaca(1, "Alpaca 1", "White", AccessoryType.NONE, 100, "User A");
      mockRepo.getById.mockResolvedValue(alpaca);

      await expect(useCase.execute({ 
        alpacaId: 1, 
        amount: 100, 
        newOwner: "User B",
        newPasswordPlain: "pass" 
      }))
        .rejects.toThrow("Bid amount 100 must be greater than current value 100");
        
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it("should throw error when alpaca not found", async () => {
      mockRepo.getById.mockResolvedValue(null);

      await expect(useCase.execute({ 
        alpacaId: 999, 
        amount: 150, 
        newOwner: "User B",
        newPasswordPlain: "pass" 
      }))
        .rejects.toThrow("Alpaca not found");
    });

    it("should throw error when amount exceeds test limit without Stripe", async () => {
      const alpaca = new Alpaca(1, "Alpaca 1", "White", AccessoryType.NONE, 100, "User A");
      alpaca.lastTransactionTimestamp = new Date(Date.now() - 10 * 60 * 1000);
      mockRepo.getById.mockResolvedValue(alpaca);

      await expect(useCase.execute({ 
        alpacaId: 1, 
        amount: 1000001, 
        newOwner: "User B",
        newPasswordPlain: "pass" 
      }))
        .rejects.toThrow("Amount too high for beta testing without Stripe.");
    });
  });

  describe("Cooldown Logic", () => {
    it("should enforce cooldown when last transaction was recent", async () => {
      const alpaca = new Alpaca(1, "Alpaca 1", "White", AccessoryType.NONE, 100, "User A");
      // Set timestamp to 1 minute ago (within 5 minute cooldown)
      alpaca.lastTransactionTimestamp = new Date(Date.now() - 1 * 60 * 1000);
      mockRepo.getById.mockResolvedValue(alpaca);

      await expect(useCase.execute({ 
        alpacaId: 1, 
        amount: 150, 
        newOwner: "User B",
        newPasswordPlain: "pass" 
      }))
        .rejects.toThrow(/LOCKED.*Cooldown active/);
        
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it("should allow bid when exactly 5 minutes have passed", async () => {
      const alpaca = new Alpaca(1, "Alpaca 1", "White", AccessoryType.NONE, 100, "User A");
      // Set timestamp to exactly 5 minutes ago
      alpaca.lastTransactionTimestamp = new Date(Date.now() - 5 * 60 * 1000);
      mockRepo.getById.mockResolvedValue(alpaca);
      mockRepo.save.mockImplementation(async (a: Alpaca) => a);

      const result = await useCase.execute({ 
        alpacaId: 1, 
        amount: 150, 
        newOwner: "User B",
        newPasswordPlain: "pass" 
      });

      expect(result.ownerName).toBe("User B");
    });

    it("should calculate remaining cooldown time correctly", async () => {
      const alpaca = new Alpaca(1, "Alpaca 1", "White", AccessoryType.NONE, 100, "User A");
      // Set timestamp to 3 minutes ago (2 minutes remaining)
      alpaca.lastTransactionTimestamp = new Date(Date.now() - 3 * 60 * 1000);
      mockRepo.getById.mockResolvedValue(alpaca);

      try {
        await useCase.execute({ 
          alpacaId: 1, 
          amount: 150, 
          newOwner: "User B",
          newPasswordPlain: "pass" 
        });
        fail('Should have thrown cooldown error');
      } catch (error: any) {
        // Error should mention seconds remaining (around 120)
        expect(error.message).toMatch(/\d+ seconds/);
        const match = error.message.match(/(\d+) seconds/);
        if (match) {
          const seconds = parseInt(match[1]);
          expect(seconds).toBeGreaterThan(100);
          expect(seconds).toBeLessThanOrEqual(120);
        }
      }
    });

    it("should allow bid when cooldown has passed", async () => {
      const alpaca = new Alpaca(1, "Alpaca 1", "White", AccessoryType.NONE, 100, "User A");
      // Set timestamp to 10 minutes ago (well past cooldown)
      alpaca.lastTransactionTimestamp = new Date(Date.now() - 10 * 60 * 1000);
      mockRepo.getById.mockResolvedValue(alpaca);
      mockRepo.save.mockImplementation(async (a: Alpaca) => a);

      const result = await useCase.execute({ 
        alpacaId: 1, 
        amount: 150, 
        newOwner: "User B",
        newPasswordPlain: "pass" 
      });

      expect(result.ownerName).toBe("User B");
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty owner name", async () => {
      const alpaca = new Alpaca(1, "Alpaca 1", "White", AccessoryType.NONE, 100, "User A");
      alpaca.lastTransactionTimestamp = new Date(Date.now() - 10 * 60 * 1000);
      mockRepo.getById.mockResolvedValue(alpaca);
      mockRepo.save.mockImplementation(async (a: Alpaca) => a);

      const result = await useCase.execute({ 
        alpacaId: 1, 
        amount: 150, 
        newOwner: "",
        newPasswordPlain: "pass" 
      });

      expect(result.ownerName).toBe("");
    });

    it("should handle special characters in owner name", async () => {
      const alpaca = new Alpaca(1, "Alpaca 1", "White", AccessoryType.NONE, 100, "User A");
      alpaca.lastTransactionTimestamp = new Date(Date.now() - 10 * 60 * 1000);
      mockRepo.getById.mockResolvedValue(alpaca);
      mockRepo.save.mockImplementation(async (a: Alpaca) => a);

      const result = await useCase.execute({ 
        alpacaId: 1, 
        amount: 150, 
        newOwner: "用户@#$123",
        newPasswordPlain: "pass" 
      });

      expect(result.ownerName).toBe("用户@#$123");
    });

    it("should handle repository save errors", async () => {
      const alpaca = new Alpaca(1, "Alpaca 1", "White", AccessoryType.NONE, 100, "User A");
      alpaca.lastTransactionTimestamp = new Date(Date.now() - 10 * 60 * 1000);
      mockRepo.getById.mockResolvedValue(alpaca);
      mockRepo.save.mockRejectedValue(new Error("Database error"));

      await expect(useCase.execute({ 
        alpacaId: 1, 
        amount: 150, 
        newOwner: "User B",
        newPasswordPlain: "pass" 
      }))
        .rejects.toThrow("Database error");
    });

    it("should handle very old transaction timestamps", async () => {
      const alpaca = new Alpaca(1, "Alpaca 1", "White", AccessoryType.NONE, 100, "User A");
      // Set timestamp to 1 year ago
      alpaca.lastTransactionTimestamp = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      mockRepo.getById.mockResolvedValue(alpaca);
      mockRepo.save.mockImplementation(async (a: Alpaca) => a);

      const result = await useCase.execute({ 
        alpacaId: 1, 
        amount: 150, 
        newOwner: "User B",
        newPasswordPlain: "pass" 
      });

      expect(result.ownerName).toBe("User B");
    });
  });

  describe("Password Security", () => {
    it("should never save plain text password", async () => {
      const alpaca = new Alpaca(1, "Alpaca 1", "White", AccessoryType.NONE, 100, "User A");
      alpaca.lastTransactionTimestamp = new Date(Date.now() - 10 * 60 * 1000);
      mockRepo.getById.mockResolvedValue(alpaca);
      
      let savedAlpaca: Alpaca;
      mockRepo.save.mockImplementation(async (a: Alpaca) => {
        savedAlpaca = a;
        return a;
      });

      await useCase.execute({ 
        alpacaId: 1, 
        amount: 150, 
        newOwner: "User B",
        newPasswordPlain: "mySecretPassword123" 
      });

      expect(savedAlpaca!.password).not.toBe("mySecretPassword123");
      expect(savedAlpaca!.password).toBe("hashed_mySecretPassword123");
    });

    it("should use bcrypt with correct salt rounds", async () => {
      const alpaca = new Alpaca(1, "Alpaca 1", "White", AccessoryType.NONE, 100, "User A");
      alpaca.lastTransactionTimestamp = new Date(Date.now() - 10 * 60 * 1000);
      mockRepo.getById.mockResolvedValue(alpaca);
      mockRepo.save.mockImplementation(async (a: Alpaca) => a);

      await useCase.execute({ 
        alpacaId: 1, 
        amount: 150, 
        newOwner: "User B",
        newPasswordPlain: "password" 
      });

      expect(bcrypt.hash).toHaveBeenCalledWith("password", 10);
    });
  });
});