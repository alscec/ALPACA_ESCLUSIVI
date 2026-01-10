import React from 'react';
import { Alpaca, AccessoryType } from '../types';
import { AlertTriangle, DollarSign, User, Gift, Shield, History } from 'lucide-react';

interface AlpacaCardProps {
  alpaca: Alpaca;
  onBid: (alpaca: Alpaca) => void;
  onCustomize: (alpaca: Alpaca) => void;
  onHistory: (alpaca: Alpaca) => void;
}

const AccessoryIcon = ({ type }: { type: AccessoryType }) => {
  switch (type) {
    case AccessoryType.GOLD_CHAIN: return <span className="text-2xl absolute bottom-2 right-2">⛓️</span>;
    case AccessoryType.SILK_SCARF: return <span className="text-2xl absolute bottom-2 right-2">🧣</span>;
    case AccessoryType.TOP_HAT: return <span className="text-2xl absolute -top-4 left-1/2 transform -translate-x-1/2">🎩</span>;
    case AccessoryType.DIAMOND_STUD: return <span className="text-xl absolute top-8 right-6">💎</span>;
    default: return null;
  }
};

export const AlpacaCard: React.FC<AlpacaCardProps> = ({ alpaca, onBid, onCustomize, onHistory }) => {
  
  // Calculate if protected
  // const COOLDOWN_MS = 5 * 60 * 1000;
 // const isProtected = (Date.now() - alpaca.lastTransactionTimestamp) < COOLDOWN_MS && alpaca.ownerName !== 'System DAO';
  // Quando ricevi i dati
//const lastTransactionDate = new Date(alpaca.lastTransactionTimestamp).getTime(); // Converte stringa in numero
//const now = Date.now();
//const isLocked = (now - lastTransactionDate) < (5 * 60 * 1000);

// 1. Convertiamo la data che arriva dal server (stringa ISO) in numero
const lastTransactionDate = new Date(alpaca.lastTransactionTimestamp).getTime();
const now = Date.now();
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minuti

// 2. Calcoliamo se è bloccato
// È bloccato SE: (è passato poco tempo) E (il proprietario NON è il Sistema)
const isLocked = (now - lastTransactionDate) < COOLDOWN_MS && alpaca.ownerName !== 'System DAO';

  return (
    <div className="relative group bg-luxury-charcoal border border-luxury-charcoal hover:border-luxury-gold transition-all duration-500 rounded-sm p-6 flex flex-col shadow-xl hover:shadow-2xl hover:shadow-yellow-900/20 overflow-hidden">
      
      {/* Badge ID */}
      <div className="absolute top-0 left-0 bg-luxury-black text-luxury-gold text-xs font-serif px-3 py-1 border-r border-b border-luxury-charcoal z-10">
        #{alpaca.id.toString().padStart(2, '0')}
      </div>

      {/* Protected Badge */}
      {isLocked && (
        <div className="absolute top-0 right-0 bg-blue-900/80 text-blue-200 text-xs px-2 py-1 flex items-center gap-1 z-20 border-l border-b border-blue-500 rounded-bl-lg" title="Protected from takeover">
          <Shield size={12} />
          <span>LOCKED</span>
        </div>
      )}

      {/* Optional Custom Background */}
      {alpaca.backgroundImage && (
        <div 
          className="absolute inset-0 opacity-20 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${alpaca.backgroundImage})` }}
        />
      )}


      {/* Visual Avatar */}
      <div 
        className="relative w-32 h-32 mx-auto mb-6 mt-2 rounded-full flex items-center justify-center border-4 border-black/30 transition-all duration-500 z-10"
        // 👇 QUI STA LA MAGIA: Applichiamo il colore dinamico
        style={{ 
          backgroundColor: alpaca.stableColor || '#333', // Il colore della stalla (o grigio se manca)
          boxShadow: `0 0 20px ${alpaca.stableColor}60` // Un alone luminoso dello stesso colore (opzionale)
        }}
      >
        <AccessoryIcon type={alpaca.accessory} />
        
        {/* Alpaca SVG */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-24 h-24 relative z-20" // Z-20 per stare sopra lo sfondo
          style={{ fill: alpaca.color, filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.5))' }}
        >
           <path d="M30,80 L30,60 Q30,50 40,50 L50,50 Q60,50 60,40 L60,20 Q60,10 50,10 L45,10 Q40,10 40,20 L40,30 L35,30 L35,20 Q35,5 50,5 Q65,5 70,20 L70,40 Q70,55 60,60 L60,80 L50,80 L50,65 L40,65 L40,80 Z" />
        </svg>
      </div>



      

      {/* Info */}
      <div className="text-center space-y-2 mb-4 z-10">
        <h3 className="text-xl font-serif text-white tracking-wide">{alpaca.name}</h3>
        <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
          <User size={14} />
          <span>Owned by: <span className="text-luxury-silver">{alpaca.ownerName}</span></span>
        </div>
        <div className="flex items-center justify-center space-x-1 text-luxury-gold font-bold text-lg">
          <DollarSign size={18} />
          <span>{alpaca.currentValue.toLocaleString()} EUR</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex gap-2 z-10">
        <button 
          onClick={() => onBid(alpaca)}
          disabled={isLocked}
          className={`flex-1 text-luxury-black font-bold py-2 px-4 text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${isLocked ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-luxury-gold hover:bg-white'}`}
        >
           {isLocked ? <Shield size={14} /> : 'Takeover'}
        </button>
        <button 
          onClick={() => onCustomize(alpaca)}
          className="bg-black/50 backdrop-blur border border-gray-600 text-gray-400 hover:text-white hover:border-white p-2 transition-colors"
          title="Manage Asset"
        >
          <Gift size={18} />
        </button>
        <button 
          onClick={() => onHistory(alpaca)}
          className="bg-black/50 backdrop-blur border border-gray-600 text-gray-400 hover:text-white hover:border-white p-2 transition-colors"
          title="Asset History"
        >
          <History size={18} />
        </button>
      </div>
    </div>
  );
};