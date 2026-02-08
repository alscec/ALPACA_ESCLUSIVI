import React from 'react';
import { Alpaca } from '../types';
import { X, Clock, DollarSign } from 'lucide-react';

interface HistoryModalProps {
  alpaca: Alpaca | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ alpaca, isOpen, onClose }) => {
  if (!isOpen || !alpaca) return null;

  const calculateDuration = (currTime: string, prevTime?: string) => {
    if (!prevTime) return "Initial";
    const start = new Date(prevTime).getTime();
    const end = new Date(currTime).getTime();
    const diffMins = Math.floor((end - start) / 60000);
    return diffMins < 60 ? `${diffMins} mins` : `${Math.floor(diffMins/60)} hrs`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-luxury-charcoal border border-gray-700 w-full max-w-2xl p-6 relative shadow-2xl rounded-lg">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-serif text-luxury-gold mb-2">Ledger: Asset #{alpaca.id}</h2>
        <p className="text-gray-400 text-sm mb-6">Historical ownership and valuation data.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-black/50 text-luxury-gold uppercase text-xs">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">New Owner</th>
                <th className="p-3">Valuation</th>
                <th className="p-3">Held For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {alpaca.history?.map((tx, idx) => {
                // Calculate how long previous owner held it before this tx
                const prevTx = alpaca.history?.[idx + 1];
                const duration = calculateDuration(tx.timestamp, prevTx?.timestamp);

                return (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="p-3 font-mono">{new Date(tx.timestamp).toLocaleString()}</td>
                    <td className="p-3 text-white font-bold">{tx.newOwner}</td>
                    <td className="p-3 text-green-400 font-mono">€{tx.amount.toLocaleString()}</td>
                    <td className="p-3 flex items-center gap-1">
                      <Clock size={12} /> {duration}
                    </td>
                  </tr>
                );
              })}
              {(!alpaca.history || alpaca.history.length === 0) && (
                <tr>
                  <td colSpan={4} className="p-4 text-center italic opacity-50">No transactions recorded yet. Owned by System DAO.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};