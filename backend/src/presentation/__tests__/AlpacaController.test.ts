import "reflect-metadata";
import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';

// Mock tsyringe before importing anything else
const mockResolve = jest.fn();
jest.mock('tsyringe', () => ({
  container: {
    resolve: mockResolve,
    register: jest.fn(),
    registerInstance: jest.fn(),
  },
  injectable: () => (target: any) => target,
  inject: () => (target: any, propertyKey: string | symbol, parameterIndex: number) => {},
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Now import everything else
import { AlpacaController } from '../AlpacaController';
import { BidOnAlpaca } from '../../usecases/BidOnAlpaca';
import { IAlpacaRepository } from '../../core/interfaces/IAlpacaRepository';
import { Alpaca, AccessoryType } from '../../core/domain/Alpaca';
const bcrypt = require('bcryptjs');

describe('Controller: AlpacaController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockUseCase: jest.Mocked<BidOnAlpaca>;
  let mockRepository: jest.Mocked<IAlpacaRepository>;

  beforeEach(() => {
    // Setup request mock
    mockRequest = {
      params: {},
      body: {},
    };

    // Setup response mock
    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
    };

    // Setup next function
    mockNext = jest.fn() as NextFunction;

    // Setup mocks for dependencies
    mockUseCase = {
      execute: jest.fn(),
    } as any;

    mockRepository = {
      getById: jest.fn(),
      save: jest.fn(),
      getAll: jest.fn(),
    } as any;

    // Mock container.resolve
    mockResolve.mockImplementation((token: any) => {
      if (token === BidOnAlpaca || token === 'BidOnAlpaca') {
        return mockUseCase;
      }
      if (token === 'AlpacaRepository') {
        return mockRepository;
      }
      return null;
    });

    // Mock bcrypt
    (bcrypt.compare as any).mockResolvedValue(true);
  });

  describe('bid', () => {
    it('should successfully place a bid', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        amount: 150,
        newOwner: 'TestOwner',
        password: 'securePass123',
      };

      const mockAlpaca = new Alpaca(1, 'Test Alpaca', 'White', AccessoryType.NONE, 150, 'TestOwner');
      mockUseCase.execute.mockResolvedValue(mockAlpaca);

      await AlpacaController.bid(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAlpaca);
      expect(mockUseCase.execute).toHaveBeenCalledWith({
        alpacaId: 1,
        amount: 150,
        newOwner: 'TestOwner',
        newPasswordPlain: 'securePass123',
      });
    });

    it('should return 400 for invalid input - missing amount', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        newOwner: 'TestOwner',
        password: 'pass',
      };

      await AlpacaController.bid(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.anything() })
      );
    });

    it('should return 400 for invalid input - negative amount', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        amount: -100,
        newOwner: 'TestOwner',
        password: 'pass',
      };

      await AlpacaController.bid(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 for invalid input - empty owner name', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        amount: 150,
        newOwner: '',
        password: 'pass',
      };

      await AlpacaController.bid(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 for invalid input - owner name too long', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        amount: 150,
        newOwner: 'a'.repeat(51),
        password: 'pass',
      };

      await AlpacaController.bid(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when alpaca not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = {
        amount: 150,
        newOwner: 'TestOwner',
        password: 'pass',
      };

      mockUseCase.execute.mockRejectedValue(new Error('Alpaca not found'));

      await AlpacaController.bid(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Alpaca not found' })
      );
    });

    it('should return 400 when bid is too low', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        amount: 50,
        newOwner: 'TestOwner',
        password: 'pass',
      };

      mockUseCase.execute.mockRejectedValue(new Error('Bid too low for hostile takeover.'));

      await AlpacaController.bid(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Bid too low for hostile takeover.' })
      );
    });

    it('should return 400 when cooldown is active', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        amount: 150,
        newOwner: 'TestOwner',
        password: 'pass',
      };

      mockUseCase.execute.mockRejectedValue(
        new Error('Asset LOCKED. Cooldown active for another 120 seconds.')
      );

      await AlpacaController.bid(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Asset LOCKED. Cooldown active for another 120 seconds.',
        })
      );
    });

    it('should call next for unhandled errors', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        amount: 150,
        newOwner: 'TestOwner',
        password: 'pass',
      };

      const unexpectedError = new Error('Database connection failed');
      mockUseCase.execute.mockRejectedValue(unexpectedError);

      await AlpacaController.bid(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(unexpectedError);
    });
  });

  describe('getAll', () => {
    it('should return all alpacas successfully', async () => {
      const mockAlpacas = [
        new Alpaca(1, 'Alpaca 1', 'White', AccessoryType.NONE, 100, 'Owner1'),
        new Alpaca(2, 'Alpaca 2', 'Brown', AccessoryType.GOLD_CHAIN, 200, 'Owner2'),
      ];

      mockRepository.getAll.mockResolvedValue(mockAlpacas);

      await AlpacaController.getAll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAlpacas);
    });

    it('should return empty array when no alpacas exist', async () => {
      mockRepository.getAll.mockResolvedValue([]);

      await AlpacaController.getAll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith([]);
    });

    it('should call next on repository error', async () => {
      const error = new Error('Database error');
      mockRepository.getAll.mockRejectedValue(error);

      await AlpacaController.getAll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    it('should update alpaca successfully with valid password', async () => {
      const alpaca = new Alpaca(1, 'Test Alpaca', 'White', AccessoryType.NONE, 100, 'TestOwner');
      alpaca.password = 'hashed_password';

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        password: 'correctPassword',
        name: 'Updated Alpaca',
        color: 'Pink',
        accessory: AccessoryType.GOLD_CHAIN,
      };

      mockRepository.getById.mockResolvedValue(alpaca);
      mockRepository.save.mockResolvedValue(alpaca);
      (bcrypt.compare as any).mockResolvedValue(true);

      await AlpacaController.update(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 when alpaca not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = {
        password: 'pass',
        name: 'New Name',
      };

      mockRepository.getById.mockResolvedValue(null);

      await AlpacaController.update(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Alpaca not found' })
      );
    });

    it('should return 403 when password is missing for non-System DAO owner', async () => {
      const alpaca = new Alpaca(1, 'Test Alpaca', 'White', AccessoryType.NONE, 100, 'TestOwner');
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        name: 'Updated Name',
      };

      mockRepository.getById.mockResolvedValue(alpaca);

      await AlpacaController.update(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Password richiesta' })
      );
    });

    it('should return 403 when password is incorrect', async () => {
      const alpaca = new Alpaca(1, 'Test Alpaca', 'White', AccessoryType.NONE, 100, 'TestOwner');
      alpaca.password = 'hashed_password';

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        password: 'wrongPassword',
        name: 'Updated Name',
      };

      mockRepository.getById.mockResolvedValue(alpaca);
      (bcrypt.compare as any).mockResolvedValue(false);

      await AlpacaController.update(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Password errata! Accesso negato.' })
      );
    });

    it('should allow update without password for System DAO owner', async () => {
      const alpaca = new Alpaca(1, 'Test Alpaca', 'White', AccessoryType.NONE, 100, 'System DAO');

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        name: 'Updated Name',
        color: 'Blue',
      };

      mockRepository.getById.mockResolvedValue(alpaca);
      mockRepository.save.mockResolvedValue(alpaca);

      await AlpacaController.update(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should update stableColor field', async () => {
      const alpaca = new Alpaca(1, 'Test Alpaca', 'White', AccessoryType.NONE, 100, 'System DAO');

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        stableColor: '#FF5733',
      };

      mockRepository.getById.mockResolvedValue(alpaca);
      mockRepository.save.mockResolvedValue(alpaca);

      await AlpacaController.update(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(alpaca.stableColor).toBe('#FF5733');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should update backgroundImage field', async () => {
      const alpaca = new Alpaca(1, 'Test Alpaca', 'White', AccessoryType.NONE, 100, 'System DAO');

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        backgroundImage: 'custom_image.jpg',
      };

      mockRepository.getById.mockResolvedValue(alpaca);
      mockRepository.save.mockResolvedValue(alpaca);

      await AlpacaController.update(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(alpaca.backgroundImage).toBe('custom_image.jpg');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should call next on repository error', async () => {
      const alpaca = new Alpaca(1, 'Test Alpaca', 'White', AccessoryType.NONE, 100, 'System DAO');
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'New Name' };

      mockRepository.getById.mockResolvedValue(alpaca);
      const error = new Error('Database error');
      mockRepository.save.mockRejectedValue(error);

      await AlpacaController.update(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
