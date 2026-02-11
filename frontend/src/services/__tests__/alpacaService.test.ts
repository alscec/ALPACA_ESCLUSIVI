import { describe, it, expect, beforeEach, vi } from 'vitest';
import { alpacaService } from '../../services/alpacaService';
import { Alpaca, BidRequest, UpdateRequest, AccessoryType } from '../../types';

// Mock fetch globally
global.fetch = vi.fn();

describe('alpacaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    (global.fetch as any).mockClear();
  });

  describe('getAll', () => {
    it('should fetch all alpacas successfully', async () => {
      const mockAlpacas: Alpaca[] = [
        {
          id: 1,
          name: 'Alpaca 1',
          color: 'White',
          accessory: AccessoryType.NONE,
          currentValue: 100,
          ownerName: 'Owner1',
          lastTransactionTimestamp: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Alpaca 2',
          color: 'Brown',
          accessory: AccessoryType.GOLD_CHAIN,
          currentValue: 200,
          ownerName: 'Owner2',
          lastTransactionTimestamp: new Date().toISOString(),
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlpacas,
      });

      const result = await alpacaService.getAll();

      expect(result).toEqual(mockAlpacas);
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/alpaca'));
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(alpacaService.getAll()).rejects.toThrow('Errore server: Internal Server Error');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(alpacaService.getAll()).rejects.toThrow('Network error');
    });

    it('should use correct API URL', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await alpacaService.getAll();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/alpaca$/)
      );
    });
  });

  describe('placeBid', () => {
    it('should place a bid successfully', async () => {
      const bidRequest: BidRequest = {
        alpacaId: 1,
        bidAmount: 150,
        newOwnerName: 'NewOwner',
        newPassword: 'securePass123',
      };

      const mockResponse: Alpaca = {
        id: 1,
        name: 'Alpaca #1',
        color: 'White',
        accessory: AccessoryType.NONE,
        currentValue: 150,
        ownerName: 'NewOwner',
        lastTransactionTimestamp: new Date().toISOString(),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await alpacaService.placeBid(bidRequest);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/alpaca/1/bid'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: bidRequest.bidAmount,
            newOwner: bidRequest.newOwnerName,
            password: bidRequest.newPassword,
          }),
        })
      );
    });

    it('should throw error for invalid bid', async () => {
      const bidRequest: BidRequest = {
        alpacaId: 1,
        bidAmount: 50,
        newOwnerName: 'NewOwner',
        newPassword: 'pass',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Bid too low' }),
      });

      await expect(alpacaService.placeBid(bidRequest)).rejects.toThrow('Bid too low');
    });

    it('should handle cooldown errors', async () => {
      const bidRequest: BidRequest = {
        alpacaId: 1,
        bidAmount: 150,
        newOwnerName: 'NewOwner',
        newPassword: 'pass',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Asset LOCKED. Cooldown active.' }),
      });

      await expect(alpacaService.placeBid(bidRequest)).rejects.toThrow('LOCKED');
    });

    it('should handle not found errors', async () => {
      const bidRequest: BidRequest = {
        alpacaId: 999,
        bidAmount: 150,
        newOwnerName: 'NewOwner',
        newPassword: 'pass',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Alpaca not found' }),
      });

      await expect(alpacaService.placeBid(bidRequest)).rejects.toThrow('Alpaca not found');
    });

    it('should use generic error message when no error provided', async () => {
      const bidRequest: BidRequest = {
        alpacaId: 1,
        bidAmount: 150,
        newOwnerName: 'NewOwner',
        newPassword: 'pass',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(alpacaService.placeBid(bidRequest)).rejects.toThrow('Transazione fallita');
    });
  });

  describe('customize', () => {
    it('should customize alpaca successfully', async () => {
      const updateRequest: UpdateRequest = {
        alpacaId: 1,
        passwordVerify: 'correctPassword',
        newName: 'My Custom Alpaca',
        newColor: 'Pink',
        newAccessory: AccessoryType.TOP_HAT,
      };

      const mockResponse: Alpaca = {
        id: 1,
        name: 'My Custom Alpaca',
        color: 'Pink',
        accessory: AccessoryType.TOP_HAT,
        currentValue: 150,
        ownerName: 'Owner1',
        lastTransactionTimestamp: new Date().toISOString(),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await alpacaService.customize(updateRequest);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/alpaca/1'),
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should include all customization fields in request', async () => {
      const updateRequest: UpdateRequest = {
        alpacaId: 1,
        passwordVerify: 'pass',
        newName: 'Name',
        newColor: 'Color',
        newStableColor: '#FF5733',
        newBackgroundImage: 'bg.jpg',
        newAccessory: AccessoryType.DIAMOND_STUD,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await alpacaService.customize(updateRequest);

      const callArgs = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body).toEqual({
        password: 'pass',
        name: 'Name',
        color: 'Color',
        stableColor: '#FF5733',
        backgroundImage: 'bg.jpg',
        accessory: AccessoryType.DIAMOND_STUD,
      });
    });

    it('should throw error for incorrect password', async () => {
      const updateRequest: UpdateRequest = {
        alpacaId: 1,
        passwordVerify: 'wrongPassword',
        newName: 'New Name',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Password errata! Accesso negato.' }),
      });

      await expect(alpacaService.customize(updateRequest)).rejects.toThrow('Password errata');
    });

    it('should throw error for missing password', async () => {
      const updateRequest: UpdateRequest = {
        alpacaId: 1,
        passwordVerify: '',
        newName: 'New Name',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Password richiesta' }),
      });

      await expect(alpacaService.customize(updateRequest)).rejects.toThrow('Password richiesta');
    });

    it('should use generic error message when no error provided', async () => {
      const updateRequest: UpdateRequest = {
        alpacaId: 1,
        passwordVerify: 'pass',
        newName: 'Name',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(alpacaService.customize(updateRequest)).rejects.toThrow('Modifica fallita');
    });

    it('should handle not found errors', async () => {
      const updateRequest: UpdateRequest = {
        alpacaId: 999,
        passwordVerify: 'pass',
        newName: 'Name',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Alpaca not found' }),
      });

      await expect(alpacaService.customize(updateRequest)).rejects.toThrow('Alpaca not found');
    });
  });

  describe('getHallOfFame', () => {
    it('should return placeholder hall of fame data', async () => {
      const result = await alpacaService.getHallOfFame();

      expect(result).toEqual({
        tycoon: { name: 'N/A', totalSpent: 0 },
        steward: { name: 'N/A', totalDurationMs: 0 },
        alpacaRecords: [],
      });
    });

    it('should not make any API calls', async () => {
      await alpacaService.getHallOfFame();

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty response body', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      });

      const result = await alpacaService.getAll();
      expect(result).toBeNull();
    });

    it('should handle malformed JSON response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(alpacaService.getAll()).rejects.toThrow('Invalid JSON');
    });

    it('should handle very large alpaca IDs', async () => {
      const bidRequest: BidRequest = {
        alpacaId: 999999999,
        bidAmount: 150,
        newOwnerName: 'Owner',
        newPassword: 'pass',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await alpacaService.placeBid(bidRequest);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/alpaca/999999999/bid'),
        expect.anything()
      );
    });

    it('should handle special characters in owner name', async () => {
      const bidRequest: BidRequest = {
        alpacaId: 1,
        bidAmount: 150,
        newOwnerName: '测试用户-123_@#$',
        newPassword: 'pass',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await alpacaService.placeBid(bidRequest);

      const callArgs = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.newOwner).toBe('测试用户-123_@#$');
    });
  });
});
