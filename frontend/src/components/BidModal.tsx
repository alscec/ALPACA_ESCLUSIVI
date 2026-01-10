import React, { useState } from 'react';
import { Alpaca } from '../types';
import { DollarSign, X, Lock, Key, ShieldAlert } from 'lucide-react';

interface BidModalProps {
  alpaca: Alpaca | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, owner: string, pass: string) => void;
}

export const BidModal: React.FC<BidModalProps> = ({ alpaca, isOpen, onClose, onSubmit }) => {
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [ownerName, setOwnerName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    if (alpaca) {
      setBidAmount(alpaca.currentValue + 50); // Default suggestion
      setOwnerName('');
      setPassword('');
      setError('');
    }
  }, [alpaca]);

  if (!isOpen || !alpaca) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bidAmount <= alpaca.currentValue) {
      setError(`Bid must strictly exceed current value of €${alpaca.currentValue}`);
      return;
    }
    if (!ownerName.trim()) {
      setError("Please enter your name for the title deed.");
      return;
    }
    if (!password.trim()) {
      setError("Set a Security PIN to protect your asset configuration.");
      return;
    }
    onSubmit(bidAmount, ownerName, password);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-luxury-charcoal border border-luxury-gold w-full max-w-md p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X size={24} />
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-serif text-luxury-gold mb-2">Hostile Takeover</h2>
          <p className="text-gray-400 text-sm">Acquiring asset <span className="text-white font-bold">{alpaca.name}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Current Price Display */}
          <div className="bg-black/50 p-3 rounded text-center border border-gray-800">
            <span className="text-gray-500 text-xs uppercase tracking-widest">Current Valuation</span>
            <div className="text-2xl font-mono text-white mt-1">€{alpaca.currentValue.toLocaleString()}</div>
          </div>

          {/* Bid Input */}
          <div className="space-y-1">
            <label className="block text-xs uppercase tracking-widest text-luxury-gold">Your Offer (€)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="number" 
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                className="w-full bg-luxury-black border border-gray-700 focus:border-luxury-gold text-white pl-10 p-3 outline-none transition-colors font-mono"
              />
            </div>
          </div>

          {/* Owner Name Input */}
          <div className="space-y-1">
            <label className="block text-xs uppercase tracking-widest text-luxury-gold">New Owner Name</label>
            <input 
              type="text" 
              placeholder="e.g. Baron Von Crypto"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full bg-luxury-black border border-gray-700 focus:border-luxury-gold text-white p-3 outline-none transition-colors"
            />
          </div>

          {/* Password Input - ANTI PHISHING LABELS */}
          <div className="space-y-1">
            <label className="block text-xs uppercase tracking-widest text-luxury-gold flex items-center gap-1">
               <Key size={12} /> Create Asset PIN
            </label>
            <input 
              type="password" 
              placeholder="Create a specific PIN for this game"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-luxury-black border border-gray-700 focus:border-luxury-gold text-white p-3 outline-none transition-colors"
            />
             <div className="flex items-start gap-1 mt-1 text-[10px] text-gray-500">
                <ShieldAlert size={10} className="mt-0.5" />
                <span>Security Notice: Do NOT use your email or banking password. This is only for in-game asset configuration.</span>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="pt-4 border-t border-gray-800">
             <p className="text-xs text-gray-500 mb-4 text-center">
               Payment processed via Stripe/PayPal Secure Gateway. <br/>
             </p>
             <button 
               type="submit"
               className="w-full bg-luxury-gold hover:bg-white text-black font-bold py-3 uppercase tracking-widest transition-all flex items-center justify-center gap-2"
             >
               <Lock size={16} /> Pay & Transfer Title
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};