import React from 'react';
import { Mail, MapPin, Globe } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-4xl font-serif text-luxury-gold mb-8 uppercase tracking-widest text-center">Concierge</h1>
      
      <div className="bg-luxury-charcoal p-8 md:p-12 border border-gray-800 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-luxury-gold opacity-5 rounded-full -ml-12 -mb-12 pointer-events-none"></div>

        <p className="text-gray-300 mb-8 text-center font-light">
          For inquiries regarding high-value asset transfers, technical support, or DAO governance proposals, please contact our dedicated concierge team.
        </p>

        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-black/40 p-4 rounded border border-gray-700">
            <div className="bg-luxury-gold p-2 rounded-full text-black">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Email Support</p>
              <p className="text-white font-mono">vip@alpacaesclusivi.com</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-black/40 p-4 rounded border border-gray-700">
            <div className="bg-luxury-gold p-2 rounded-full text-black">
              <Globe size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Headquarters (Virtual)</p>
              <p className="text-white">Decentraland - Estate #402, Crypto Valley</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-black/40 p-4 rounded border border-gray-700">
            <div className="bg-luxury-gold p-2 rounded-full text-black">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Legal Entity</p>
              <p className="text-white">Alpaca DAO LLC, Switzerland</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700 text-center">
           <p className="text-xs text-gray-500">
             Note: All transactions are final. Please review the smart contract interaction terms before bidding.
           </p>
        </div>
      </div>
    </div>
  );
};
