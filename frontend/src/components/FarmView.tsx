
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alpaca } from '../types';
import { PixelAlpaca } from './PixelAlpaca';

interface FarmViewProps {
  alpacas: Alpaca[];
  onSelect: (alpaca: Alpaca) => void;
}

// --- SCENERY COMPONENTS ---

const ManorHouse = ({ isNight }: { isNight: boolean }) => (
  <div className="relative w-48 h-40 drop-shadow-2xl z-10 flex-shrink-0">
    <svg viewBox="0 0 100 80" className="w-full h-full" style={{ shapeRendering: 'crispEdges' }}>
      <rect x="10" y="60" width="80" height="10" fill="#3e2723" />
      <rect x="20" y="30" width="60" height="30" fill={isNight ? "#424242" : "#e0e0e0"} />
      <rect x="20" y="30" width="5" height="30" fill="#bdbdbd" />
      <rect x="75" y="30" width="5" height="30" fill="#bdbdbd" />
      <path d="M15,30 L50,10 L85,30" fill="#b71c1c" />
      <rect x="45" y="45" width="10" height="15" fill="#3e2723" />
      {/* Windows */}
      <rect x="25" y="35" width="8" height="10" fill={isNight ? "#ffeb3b" : "#90caf9"} />
      <rect x="67" y="35" width="8" height="10" fill={isNight ? "#ffeb3b" : "#90caf9"} />
      <rect x="30" y="60" width="40" height="2" fill="#9e9e9e" />
    </svg>
    <div className="absolute -bottom-4 w-full text-center">
      <span className="bg-black/70 text-white text-[10px] px-2 py-1 font-mono uppercase tracking-widest border border-yellow-500 shadow-lg">
        Alpaclub Manor
      </span>
    </div>
  </div>
);

const BigStable = ({ isNight }: { isNight: boolean }) => (
  <div className="relative w-48 h-32 drop-shadow-xl z-10 flex-shrink-0">
    <svg viewBox="0 0 100 80" className="w-full h-full" style={{ shapeRendering: 'crispEdges' }}>
      <rect x="5" y="30" width="90" height="50" fill={isNight ? "#3e2723" : "#5d4037"} />
      <path d="M0,30 L50,5 L100,30" fill="#3e2723" />
      <rect x="35" y="50" width="30" height="30" fill="#212121" />
      {/* Sign */}
      <rect x="20" y="35" width="60" height="10" fill="#d7ccc8" />
      <text x="50" y="42" fontSize="5" textAnchor="middle" fill="black" fontWeight="bold">Exclusive Alpacas</text>
    </svg>
  </div>
);

const Factory = ({ isNight }: { isNight: boolean }) => (
  <div className="relative w-40 h-40 drop-shadow-xl z-10 flex-shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ shapeRendering: 'crispEdges' }}>
      <rect x="10" y="40" width="80" height="60" fill={isNight ? "#263238" : "#455a64"} />
      <rect x="20" y="10" width="10" height="30" fill={isNight ? "#37474f" : "#607d8b"} />
      <rect x="40" y="20" width="10" height="20" fill={isNight ? "#37474f" : "#607d8b"} />
      {/* Smoke */}
      <circle cx="25" cy="5" r="3" fill="rgba(255,255,255,0.4)" className="animate-ping" />
      {/* Sign */}
      <rect x="15" y="50" width="70" height="15" fill="#263238" stroke="yellow" strokeWidth="1" />
      <text x="50" y="60" fontSize="6" textAnchor="middle" fill="yellow" fontFamily="monospace">sw-recipes</text>
      {/* Windows */}
      <rect x="20" y="75" width="15" height="15" fill={isNight ? "#ffeb3b" : "#cfd8dc"} />
      <rect x="65" y="75" width="15" height="15" fill={isNight ? "#ffeb3b" : "#cfd8dc"} />
    </svg>
  </div>
);

const StreetLamp = ({ isNight, style }: { isNight: boolean, style: React.CSSProperties }) => (
  <div className="absolute hidden lg:block z-10" style={style}>
    <svg width="20" height="60" viewBox="0 0 20 60">
      <rect x="9" y="10" width="2" height="50" fill="#212121" />
      <circle cx="10" cy="10" r="5" fill={isNight ? "#ffeb3b" : "#e0e0e0"} className={isNight ? "drop-shadow-[0_0_10px_rgba(255,235,59,0.8)]" : ""} />
    </svg>
  </div>
);

const HayTruck = () => (
  <div className="absolute left-1/2 transform -translate-x-1/2 z-20 animate-drive-truck pointer-events-none">
    <svg viewBox="0 0 60 40" className="w-32 h-32 drop-shadow-lg" style={{ shapeRendering: 'crispEdges' }}>
      <rect x="10" y="15" width="40" height="10" fill="#1565c0" /> 
      <rect x="40" y="10" width="15" height="15" fill="#0d47a1" /> 
      <rect x="15" y="25" width="6" height="6" fill="#212121" />
      <rect x="45" y="25" width="6" height="6" fill="#212121" />
      <g className="animate-hay-visibility">
        <rect x="12" y="10" width="8" height="5" fill="#fdd835" />
        <rect x="22" y="10" width="8" height="5" fill="#fbc02d" />
        <rect x="15" y="5" width="8" height="5" fill="#f9a825" />
      </g>
    </svg>
  </div>
);

const Tree = ({ style }: { style: React.CSSProperties }) => (
  <div className="absolute w-16 h-20 pointer-events-none z-10 hidden lg:block" style={style}>
     <svg viewBox="0 0 20 25" style={{ shapeRendering: 'crispEdges' }}>
        <rect x="8" y="18" width="4" height="7" fill="#5d4037" />
        <rect x="4" y="10" width="12" height="8" fill="#2e7d32" />
        <rect x="6" y="4" width="8" height="6" fill="#388e3c" />
     </svg>
  </div>
);

const Pond = ({ style }: { style: React.CSSProperties }) => (
  <div className="absolute hidden lg:block pointer-events-none z-0 opacity-80" style={style}>
    <svg width="120" height="60" viewBox="0 0 120 60">
      <ellipse cx="60" cy="30" rx="55" ry="25" fill="#42a5f5" />
      <ellipse cx="40" cy="20" rx="10" ry="3" fill="#90caf9" opacity="0.5" />
      <ellipse cx="80" cy="40" rx="15" ry="5" fill="#90caf9" opacity="0.5" />
    </svg>
  </div>
);

const Hill = ({ style }: { style: React.CSSProperties }) => (
  <div className="absolute hidden lg:block pointer-events-none z-0" style={style}>
    <svg width="300" height="150" viewBox="0 0 300 150">
      <path d="M0,150 Q150,0 300,150" fill="#66bb6a" opacity="0.6" />
    </svg>
  </div>
);

const WheatField = ({ style }: { style: React.CSSProperties }) => (
  <div className="absolute hidden lg:block pointer-events-none z-0" style={style}>
     <div className="w-32 h-24 bg-yellow-200/20 border-2 border-yellow-600/10 transform skew-x-12 grid grid-cols-4 gap-1 p-1">
        {Array.from({length: 12}).map((_,i) => (
           <div key={i} className="bg-yellow-500/30 w-full h-full rounded-full"></div>
        ))}
     </div>
  </div>
);

export const FarmView: React.FC<FarmViewProps> = ({ alpacas, onSelect }) => {
  const [isNight, setIsNight] = useState(false);
  const navigate = useNavigate();
  const leftSideAlpacas = alpacas.filter((_, i) => i % 2 === 0);
  const rightSideAlpacas = alpacas.filter((_, i) => i % 2 !== 0);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour >= 20 || hour < 6);
  }, []);

  return (
    <div className={`relative min-h-screen overflow-x-hidden font-sans transition-colors duration-1000 ${isNight ? 'bg-[#1b5e20]' : 'bg-[#4caf50]'}`}>
      <style>{`
        /* 
           TOTAL CYCLE: 90 Seconds (Slow)
           0% -> Starts Bottom (110%)
           25% -> Arrives Top (250px) (Takes ~22.5s)
           28% -> Unload (Hay disappears) (~25.2s)
           29% -> Wait ends (~26.1s)
           55% -> Arrives Bottom (110%) (Takes ~23s)
           100% -> Rest
        */
        @keyframes drive-cycle {
          0% { top: 110%; }
          25% { top: 250px; }
          29% { top: 250px; }
          55% { top: 110%; }
          100% { top: 110%; }
        }
        .animate-drive-truck { animation: drive-cycle 90s linear infinite; }
        
        @keyframes hay-vis {
          0% { opacity: 1; }
          28% { opacity: 1; } /* Visible while arriving */
          28.1% { opacity: 0; } /* Unload */
          99% { opacity: 0; } /* Empty on return */
          100% { opacity: 1; } /* Reset */
        }
        .animate-hay-visibility { animation: hay-vis 90s linear infinite; }
      `}</style>

      {/* TEXTURE & OVERLAY */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#81c784 15%, transparent 16%)', backgroundSize: '24px 24px' }}>
      </div>
      {isNight && <div className="absolute inset-0 bg-blue-900/40 pointer-events-none mix-blend-multiply z-0"></div>}

      <div className="relative max-w-[1600px] mx-auto pt-12 pb-32 px-4">
        
        {/* DESKTOP SCENERY - MOVED FAR FROM CENTER */}
        <Hill style={{ top: '50px', left: '-10%' }} />
        <Hill style={{ top: '300px', right: '-10%' }} />
        <Pond style={{ top: '250px', left: '2%' }} />
        <Pond style={{ bottom: '150px', right: '2%' }} />
        <WheatField style={{ top: '600px', left: '5%' }} />
        <WheatField style={{ top: '350px', right: '5%' }} />
        
        {/* BUILDINGS ROW */}
        <div className="flex flex-wrap justify-center items-end gap-4 mb-12 relative z-20">
          <div 
            onClick={() => navigate('/about')} 
            className="cursor-pointer hover:scale-105 transition-transform duration-300"
            title="About Us"
          >
            <BigStable isNight={isNight} />
          </div>
          <ManorHouse isNight={isNight} />
          <div 
            onClick={() => window.open('https://sw-recipes.com', '_blank')} 
            className="cursor-pointer hover:scale-105 transition-transform duration-300"
            title="Visit sw-recipes.com"
          >
            <Factory isNight={isNight} />
          </div>
        </div>

        <Tree style={{ top: '200px', left: '2%' }} />
        <Tree style={{ top: '700px', left: '2%' }} />
        <Tree style={{ top: '400px', right: '2%' }} />
        <Tree style={{ top: '800px', right: '2%' }} />
        
        {/* STREET LAMPS ALONG ROAD */}
        <StreetLamp isNight={isNight} style={{ top: '350px', left: 'calc(50% - 60px)' }} />
        <StreetLamp isNight={isNight} style={{ top: '350px', left: 'calc(50% + 40px)' }} />
        <StreetLamp isNight={isNight} style={{ top: '650px', left: 'calc(50% - 60px)' }} />
        <StreetLamp isNight={isNight} style={{ top: '650px', left: 'calc(50% + 40px)' }} />

        {/* ROAD & TRUCK - HIDDEN ON MOBILE/TABLET (lg:block) */}
        <div className="hidden lg:block absolute top-64 bottom-0 left-1/2 transform -translate-x-1/2 w-40 bg-[#795548] border-l-4 border-r-4 border-[#5d4037] z-0">
           <div className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-2 border-l-4 border-dashed border-[#a1887f] opacity-50 h-full"></div>
           <div className="absolute inset-0 opacity-30 bg-repeat" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%233e2723\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </div>

        <div className="hidden lg:block absolute top-0 bottom-0 left-0 right-0 pointer-events-none overflow-hidden z-20">
           <HayTruck />
        </div>

        {/* MOBILE VIEW - SINGLE COLUMN ORDERED 1-10 */}
        <div className="flex flex-col gap-8 mt-12 items-center lg:hidden relative z-10">
          {alpacas.map((alpaca) => (
             <div key={alpaca.id} className="w-full max-w-[340px] relative">
               <PenBlock alpaca={alpaca} onSelect={onSelect} side="left" isNight={isNight} />
             </div>
          ))}
        </div>

        {/* DESKTOP VIEW - SPLIT COLUMNS (EVENS/ODDS) */}
        <div className="hidden lg:flex relative z-10 flex-row justify-between lg:gap-52 mt-12 items-start">
          
          {/* LEFT SIDE (To the left of road) */}
          <div className="w-full flex-1 space-y-24 flex flex-col items-end">
            {leftSideAlpacas.map((alpaca) => (
              <div key={alpaca.id} className="w-full max-w-[340px] relative">
                <PenBlock alpaca={alpaca} onSelect={onSelect} side="left" isNight={isNight} />
                {/* Path connector */}
                <div className="absolute top-1/2 -right-24 w-24 h-4 bg-[#8d6e63] border-t-2 border-b-2 border-[#5d4037] z-[-1]"></div>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE (To the right of road) */}
          <div className="w-full flex-1 space-y-24 flex flex-col items-start mt-24 lg:mt-0">
            {rightSideAlpacas.map((alpaca) => (
              <div key={alpaca.id} className="w-full max-w-[340px] relative">
                <PenBlock alpaca={alpaca} onSelect={onSelect} side="right" isNight={isNight} />
                {/* Path connector */}
                <div className="absolute top-1/2 -left-24 w-24 h-4 bg-[#8d6e63] border-t-2 border-b-2 border-[#5d4037] z-[-1]"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PenBlock = ({ alpaca, onSelect, side, isNight }: { alpaca: Alpaca, onSelect: (a: Alpaca) => void, side: 'left' | 'right', isNight: boolean }) => {
  const customBgStyle = alpaca.backgroundImage ? {
    backgroundImage: `url(${alpaca.backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  } : {};

  // Logic for item placement: 
  // If pen is on LEFT side of road, items should be on RIGHT (closer to road).
  // If pen is on RIGHT side of road, items should be on LEFT (closer to road).
  const itemPlacementClass = side === 'left' ? 'right-4' : 'left-4';

  return (
    <div 
      onClick={() => onSelect(alpaca)}
      className={`group relative border-4 border-[#5d4037] h-64 cursor-pointer hover:scale-105 transition-transform shadow-[0_10px_0_rgba(0,0,0,0.2)] overflow-visible w-full ${isNight ? 'bg-[#2e7d32]' : 'bg-[#66bb6a]'}`}
      style={customBgStyle}
    >
      {isNight && <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>}

      <div className="absolute -top-2 left-0 w-full flex justify-between px-2 z-20">
         {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-3 bg-[#3e2723]"></div>)}
      </div>

      <div className={`absolute top-[-30px] left-4 lg:${side === 'left' ? 'left-4' : 'right-4'} lg:${side === 'left' ? 'right-auto' : 'left-auto'} w-32 h-36 z-0`}>
         <div className="h-10 bg-[#a1887f] border-b-4 border-black/20 transform skew-x-12 origin-bottom-left"></div>
         <div className="h-26 border-x-2 border-black/20 relative" style={{ height: '100%', backgroundColor: alpaca.stableColor || '#795548' }}>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-16 bg-[#3e2723] rounded-t-sm shadow-inner"></div>
            <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 w-24 bg-[#d7ccc8] border-2 border-[#3e2723] shadow-md z-30 flex items-center justify-center py-1 ${isNight ? 'brightness-75' : ''}`}>
               <span className="text-[9px] font-bold text-[#3e2723] uppercase tracking-tighter truncate max-w-full px-1">
                  {alpaca.name}
               </span>
            </div>
         </div>
      </div>

      <div className={`absolute bottom-4 ${itemPlacementClass} flex flex-col items-center gap-1 z-10`}>
         <div className="w-10 h-8 bg-yellow-400 border border-yellow-600 rounded-sm relative">
             <div className="absolute inset-0 border-r border-yellow-600 opacity-50 w-3"></div>
         </div>
         <div className="w-16 h-6 bg-blue-300 border-2 border-gray-600 rounded-b-sm overflow-hidden">
             <div className="w-full h-full bg-blue-500 opacity-70 mt-1"></div>
         </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 scale-100 transition-transform group-hover:scale-110">
        <PixelAlpaca color={alpaca.color} accessory={alpaca.accessory} isMoving={true} />
      </div>

      <div className="absolute top-4 right-2 bg-yellow-400 text-black font-bold text-xs px-2 py-1 border border-black transform rotate-12 opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-lg">
        €{alpaca.currentValue}
      </div>
    </div>
  );
};
