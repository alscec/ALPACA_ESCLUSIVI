
/*import React, { useEffect, useState } from 'react';
import { Crown, Hourglass, Loader2, Star, Clock, TrendingUp } from 'lucide-react';
import { alpacaService } from '../services/alpacaService';
import { HallOfFameStats } from '../types';

export const HallOfFame: React.FC = () => {
  const [stats, setStats] = useState<HallOfFameStats | null>(null);

  useEffect(() => {
    alpacaService.getHallOfFame().then(setStats);
  }, []);

  if (!stats) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-luxury-gold" /></div>;

  const formatDuration = (ms: number) => {
    const hrs = ms / (1000 * 60 * 60);
    if (hrs < 1) return `${Math.floor(ms / (1000 * 60))}m`;
    return `${hrs.toFixed(1)}h`;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif text-luxury-gold mb-12 text-center uppercase tracking-widest">Hall of Fame</h1>
      
      {/* GLOBAL RECORDS */
      /*<div className="grid md:grid-cols-2 gap-12 mb-20">
        {/* THE TYCOON */
        /*<div className="bg-gradient-to-br from-gray-900 to-black border border-luxury-gold p-8 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-yellow-900/10 group-hover:bg-yellow-900/20 transition-colors"></div>
          <Crown className="mx-auto text-yellow-400 mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" size={64} />
          <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">The Tycoon</h2>
          <p className="text-gray-500 text-xs uppercase mb-6">Highest Total Capital Deployed</p>
          
          <div className="text-4xl font-serif text-luxury-gold mb-2">{stats.tycoon.name}</div>
          <div className="font-mono text-green-500 text-xl">€{stats.tycoon.totalSpent.toLocaleString()}</div>
        </div>

        {/* THE STEWARD */
        /*<div className="bg-gradient-to-br from-gray-900 to-black border border-blue-900 p-8 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-blue-900/20 transition-colors"></div>
          <Hourglass className="mx-auto text-blue-400 mb-6 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" size={64} />
          <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">The Steward</h2>
          <p className="text-gray-500 text-xs uppercase mb-6">Longest Cumulative Ownership</p>
          
          <div className="text-4xl font-serif text-blue-200 mb-2">{stats.steward.name}</div>
          <div className="font-mono text-blue-400 text-xl">
            {formatDuration(stats.steward.totalDurationMs)}
          </div>
        </div>
      </div>

      {/* INDIVIDUAL ALPACA RECORDS */
      /*<h3 className="text-2xl font-serif text-white mb-8 text-center uppercase tracking-widest flex items-center justify-center gap-3">
        <Star className="text-luxury-gold" size={24} /> 
        Legacy Records by Asset 
        <Star className="text-luxury-gold" size={24} />
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.alpacaRecords.map((record) => (
          <div key={record.id} className="bg-luxury-charcoal border border-gray-800 p-4 rounded text-center hover:border-luxury-gold transition-colors flex flex-col justify-between">
            <div>
               <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Asset #{record.id}</div>
               <div className="text-luxury-gold font-bold mb-4 truncate">{record.name}</div>
            </div>
            
            <div className="space-y-3">
              {/* Max Bid */
              /*<div className="bg-black/40 p-2 rounded">
                <div className="text-[10px] text-gray-400 uppercase flex items-center justify-center gap-1">
                  <TrendingUp size={10} /> Max Bidder
                </div>
                <div className="text-green-400 font-mono text-sm">€{record.highestBid.toLocaleString()}</div>
                <div className="text-xs text-white font-bold mt-1">{record.recordHolder}</div>
              </div>

              {/* Longest Duration */
              /*<div className="bg-black/40 p-2 rounded">
                <div className="text-[10px] text-gray-400 uppercase flex items-center justify-center gap-1">
                  <Clock size={10} /> Time Lord
                </div>
                <div className="text-blue-400 font-mono text-sm">{formatDuration(record.longestDurationMs)}</div>
                <div className="text-xs text-white font-bold mt-1">{record.longestSteward}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};*/

import React from 'react';
import { Trophy, Lock, Hourglass } from 'lucide-react';

export const HallOfFame: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-pulse-slow">
      
      {/* Icona Grande */}
      <div className="relative mb-8">
        <Trophy size={80} className="text-gray-800" />
        <Lock size={32} className="text-luxury-gold absolute -bottom-2 -right-2" />
      </div>

      {/* Titolo */}
      <h2 className="text-4xl font-serif text-luxury-gold mb-4 tracking-widest uppercase">
        Hall of Fame
      </h2>

      {/* Sottotitolo narrativo */}
      <p className="text-gray-400 max-w-lg text-lg mb-8 font-serif italic">
        "Gli scribi stanno ancora calcolando le dinastie. I registri storici verranno aperti presto."
      </p>

      {/* Badge Coming Soon */}
      <div className="flex items-center gap-3 bg-gray-900/80 border border-luxury-gold/30 px-8 py-4 rounded-full backdrop-blur-md">
        <Hourglass size={20} className="text-luxury-gold animate-spin-slow" />
        <span className="text-luxury-gold font-bold tracking-[0.2em] uppercase text-sm">
          Coming Soon
        </span>
      </div>

    </div>
  );
};
