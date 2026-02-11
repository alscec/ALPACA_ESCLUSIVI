import { describe, expect, it, beforeEach } from '@jest/globals';
import { Alpaca, AccessoryType, TransactionHistory } from '../Alpaca';

describe('Domain: Alpaca', () => {
  let alpaca: Alpaca;

  beforeEach(() => {
    alpaca = new Alpaca(
      1,
      'Test Alpaca',
      'White',
      AccessoryType.NONE,
      100,
      'TestOwner'
    );
  });

  describe('Constructor', () => {
    it('should create an alpaca with correct properties', () => {
      expect(alpaca.id).toBe(1);
      expect(alpaca.name).toBe('Test Alpaca');
      expect(alpaca.color).toBe('White');
      expect(alpaca.accessory).toBe(AccessoryType.NONE);
      expect(alpaca.currentValue).toBe(100);
      expect(alpaca.ownerName).toBe('TestOwner');
      expect(alpaca.history).toEqual([]);
    });

    it('should initialize lastTransactionTimestamp to current time', () => {
      const now = Date.now();
      const alpacaTime = alpaca.lastTransactionTimestamp.getTime();
      expect(alpacaTime).toBeGreaterThanOrEqual(now - 1000); // Within 1 second
      expect(alpacaTime).toBeLessThanOrEqual(now + 1000);
    });

    it('should initialize empty history array', () => {
      expect(alpaca.history).toEqual([]);
      expect(Array.isArray(alpaca.history)).toBe(true);
    });
  });

  describe('isBidValid', () => {
    it('should return true when bid is higher than current value', () => {
      expect(alpaca.isBidValid(101)).toBe(true);
      expect(alpaca.isBidValid(150)).toBe(true);
      expect(alpaca.isBidValid(1000)).toBe(true);
    });

    it('should return false when bid equals current value', () => {
      expect(alpaca.isBidValid(100)).toBe(false);
    });

    it('should return false when bid is lower than current value', () => {
      expect(alpaca.isBidValid(99)).toBe(false);
      expect(alpaca.isBidValid(50)).toBe(false);
      expect(alpaca.isBidValid(0)).toBe(false);
    });

    it('should return false for negative bids', () => {
      expect(alpaca.isBidValid(-1)).toBe(false);
      expect(alpaca.isBidValid(-100)).toBe(false);
    });
  });

  describe('transferOwnership', () => {
    const newOwner = 'NewOwner';
    const newAmount = 150;
    const newPasswordHash = 'hashed_password_123';

    it('should successfully transfer ownership with valid bid', () => {
      const originalName = alpaca.name;
      const originalOwner = alpaca.ownerName;
      const originalValue = alpaca.currentValue;

      alpaca.transferOwnership(newOwner, newAmount, newPasswordHash);

      expect(alpaca.ownerName).toBe(newOwner);
      expect(alpaca.currentValue).toBe(newAmount);
      expect(alpaca.password).toBe(newPasswordHash);
    });

    it('should reset alpaca to factory defaults on transfer', () => {
      alpaca.name = 'Custom Name';
      alpaca.color = 'Pink';
      alpaca.accessory = AccessoryType.GOLD_CHAIN;
      alpaca.backgroundImage = 'custom_bg.jpg';

      alpaca.transferOwnership(newOwner, newAmount, newPasswordHash);

      expect(alpaca.name).toBe('Alpaca #1');
      expect(alpaca.color).toBe('White');
      expect(alpaca.accessory).toBe(AccessoryType.NONE);
      expect(alpaca.backgroundImage).toBeUndefined();
    });

    it('should add transaction to history', () => {
      const originalOwner = alpaca.ownerName;
      alpaca.transferOwnership(newOwner, newAmount, newPasswordHash);

      expect(alpaca.history.length).toBe(1);
      expect(alpaca.history[0].previousOwner).toBe(originalOwner);
      expect(alpaca.history[0].newOwner).toBe(newOwner);
      expect(alpaca.history[0].amount).toBe(newAmount);
      expect(alpaca.history[0].timestamp).toBeDefined();
    });

    it('should add new transactions to the beginning of history', () => {
      alpaca.transferOwnership('Owner1', 150, 'hash1');
      alpaca.transferOwnership('Owner2', 200, 'hash2');
      alpaca.transferOwnership('Owner3', 250, 'hash3');

      expect(alpaca.history.length).toBe(3);
      expect(alpaca.history[0].newOwner).toBe('Owner3'); // Most recent
      expect(alpaca.history[1].newOwner).toBe('Owner2');
      expect(alpaca.history[2].newOwner).toBe('Owner1');
    });

    it('should update lastTransactionTimestamp', () => {
      const beforeTransfer = Date.now();
      alpaca.transferOwnership(newOwner, newAmount, newPasswordHash);
      const afterTransfer = Date.now();

      const timestamp = alpaca.lastTransactionTimestamp.getTime();
      expect(timestamp).toBeGreaterThanOrEqual(beforeTransfer);
      expect(timestamp).toBeLessThanOrEqual(afterTransfer);
    });

    it('should throw error when bid is too low', () => {
      expect(() => {
        alpaca.transferOwnership(newOwner, 50, newPasswordHash);
      }).toThrow('Bid too low for hostile takeover.');
    });

    it('should throw error when bid equals current value', () => {
      expect(() => {
        alpaca.transferOwnership(newOwner, 100, newPasswordHash);
      }).toThrow('Bid too low for hostile takeover.');
    });

    it('should preserve transaction history timestamp format', () => {
      alpaca.transferOwnership(newOwner, newAmount, newPasswordHash);
      
      const transaction = alpaca.history[0];
      expect(transaction.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO format
      expect(() => new Date(transaction.timestamp)).not.toThrow();
    });
  });

  describe('AccessoryType enum', () => {
    it('should have all expected accessory types', () => {
      expect(AccessoryType.NONE).toBe('None');
      expect(AccessoryType.GOLD_CHAIN).toBe('Gold Chain');
      expect(AccessoryType.SILK_SCARF).toBe('Silk Scarf');
      expect(AccessoryType.TOP_HAT).toBe('Top Hat');
      expect(AccessoryType.DIAMOND_STUD).toBe('Diamond Stud');
    });
  });

  describe('Transaction History interface', () => {
    it('should create valid transaction history entries', () => {
      const transaction: TransactionHistory = {
        timestamp: new Date().toISOString(),
        previousOwner: 'OldOwner',
        newOwner: 'NewOwner',
        amount: 200
      };

      expect(transaction.timestamp).toBeDefined();
      expect(transaction.previousOwner).toBe('OldOwner');
      expect(transaction.newOwner).toBe('NewOwner');
      expect(transaction.amount).toBe(200);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large bid amounts', () => {
      const largeBid = 999999999;
      alpaca.transferOwnership('NewOwner', largeBid, 'hash');
      expect(alpaca.currentValue).toBe(largeBid);
    });

    it('should handle empty string owner name', () => {
      alpaca.transferOwnership('', 150, 'hash');
      expect(alpaca.ownerName).toBe('');
    });

    it('should handle special characters in owner name', () => {
      const specialName = '测试用户-123_@#$';
      alpaca.transferOwnership(specialName, 150, 'hash');
      expect(alpaca.ownerName).toBe(specialName);
    });

    it('should handle multiple rapid transfers', () => {
      for (let i = 0; i < 100; i++) {
        alpaca.transferOwnership(`Owner${i}`, 100 + i + 1, `hash${i}`);
      }
      expect(alpaca.history.length).toBe(100);
      expect(alpaca.currentValue).toBe(200); // 100 + 100
    });
  });
});
