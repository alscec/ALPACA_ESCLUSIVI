import { Alpaca } from "../domain/Alpaca";

export interface IAlpacaRepository {
  getById(id: number): Promise<Alpaca | null>;
  save(alpaca: Alpaca): Promise<Alpaca>;
  getAll(): Promise<Alpaca[]>;
}