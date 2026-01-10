import React from 'react';
import { X, Share2, Copy, Twitter } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  alpacaName: string;
  alpacaId: number;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ isOpen, onClose, alpacaName, alpacaId }) => {
  if (!isOpen) return null;

  const shareText = `I am the new owner of Alpaca #${alpacaId} '${alpacaName}' on AlpacaEsclusivi. Try to take it from me! 🦙💰 #Luxury #Crypto`;
  const shareUrl = "https://www.google.com/search?q=AlpacaEsclusivi.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    alert("Copied to clipboard for Instagram!");
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-luxury-gold/20 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="bg-black border-2 border-luxury-gold w-full max-w-md p-8 text-center shadow-[0_0_50px_rgba(212,175,55,0.3)] relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-4xl font-serif text-luxury-gold mb-2 uppercase animate-pulse-slow">Hostile Takeover Successful</h2>
        <p className="text-white mb-8">You now own <span className="font-bold text-luxury-gold">{alpacaName}</span>.</p>

        <div className="space-y-3">
          <button onClick={handleTwitter} className="w-full bg-[#1DA1F2] hover:bg-[#1a91da] text-white font-bold py-3 flex items-center justify-center gap-2 rounded-sm transition-colors">
            <Twitter size={20} /> gloat on X
          </button>
          <button onClick={handleCopy} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 flex items-center justify-center gap-2 rounded-sm transition-colors">
            <Copy size={20} /> Copy for Instagram
          </button>
        </div>
      </div>
    </div>
  );
};