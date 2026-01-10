import React from 'react';
import { ShieldCheck, TrendingUp, Gem } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif text-luxury-gold mb-6 uppercase tracking-widest">About The Protocol</h1>
        <p className="text-xl text-gray-400 font-light">
          Redefining digital ownership through scarcity and hostile competition.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-luxury-charcoal p-8 border border-gray-800 text-center">
          <Gem className="mx-auto text-luxury-gold mb-4" size={40} />
          <h3 className="text-xl font-bold text-white mb-2">Absolute Scarcity</h3>
          <p className="text-gray-400 text-sm">
            There are only 10 Alpacas. There will only ever be 10. No minting. No inflation. Absolute exclusivity.
          </p>
        </div>
        <div className="bg-luxury-charcoal p-8 border border-gray-800 text-center">
          <TrendingUp className="mx-auto text-luxury-gold mb-4" size={40} />
          <h3 className="text-xl font-bold text-white mb-2">Market Valuation</h3>
          <p className="text-gray-400 text-sm">
            The market decides the price. An asset is worth exactly what someone else is willing to pay to take it from you.
          </p>
        </div>
        <div className="bg-luxury-charcoal p-8 border border-gray-800 text-center">
          <ShieldCheck className="mx-auto text-luxury-gold mb-4" size={40} />
          <h3 className="text-xl font-bold text-white mb-2">Hostile Takeover</h3>
          <p className="text-gray-400 text-sm">
            Ownership is temporary. If a rival bids higher than your asset's current value, the asset is transferred immediately.
          </p>
        </div>
      </div>

      <div className="bg-black/50 p-8 border-l-4 border-luxury-gold">
        <h2 className="text-2xl font-serif text-white mb-4">The Farm Logic</h2>
        <p className="text-gray-300 mb-4 leading-relaxed">
          Alpaca Esclusivi represents a digital estate. When you acquire an Alpaca via a Hostile Takeover, the farm undergoes a "Factory Reset". 
          The previous owner's decorations, names, and customizations are wiped clean.
        </p>
        <p className="text-gray-300 leading-relaxed">
          As the new owner, you are granted the title deed and a secure password. You may then commission new paint for the stables, 
          landscape the pen with imported imagery, and adorn your Alpaca with accessories befitting its new valuation.
        </p>
      </div>
    </div>
  );
};
