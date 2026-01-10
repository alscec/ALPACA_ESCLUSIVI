
import React from 'react';
import { AccessoryType } from '../types';

interface PixelAlpacaProps {
  color: string;
  accessory: AccessoryType;
  isMoving?: boolean;
}

export const PixelAlpaca: React.FC<PixelAlpacaProps> = ({ color, accessory, isMoving = false }) => {
  // Helper for crisp pixel edges
  const pixelStyle = { shapeRendering: 'crispEdges' };

  return (
    <div className={`relative w-24 h-24 ${isMoving ? 'animate-bounce' : ''}`} style={{ animationDuration: '3s' }}>
      <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-xl" style={pixelStyle as any}>
        {/* --- SHADOW --- */}
        <rect x="8" y="28" width="14" height="2" fill="rgba(0,0,0,0.3)" />

        {/* --- LEGS --- */}
        <rect x="10" y="22" width="2" height="6" fill="#3e2723" /> {/* Back Left */}
        <rect x="18" y="22" width="2" height="6" fill="#3e2723" /> {/* Back Right */}
        <rect x="8" y="24" width="2" height="6" fill="#5d4037" /> {/* Front Left */}
        <rect x="16" y="24" width="2" height="6" fill="#5d4037" /> {/* Front Right */}

        {/* --- BODY --- */}
        <rect x="8" y="14" width="14" height="10" fill={color} />
        
        {/* --- NECK & HEAD --- */}
        <rect x="8" y="6" width="6" height="10" fill={color} />
        <rect x="6" y="4" width="6" height="6" fill={color} /> {/* Snout area */}

        {/* --- EARS --- */}
        <rect x="6" y="2" width="1" height="2" fill={color} />
        <rect x="10" y="2" width="1" height="2" fill={color} />

        {/* --- FACE DETAILS --- */}
        <rect x="6" y="6" width="1" height="1" fill="black" /> {/* Eye */}
        <rect x="10" y="6" width="1" height="1" fill="black" /> {/* Eye (if facing forward, strictly side view here usually) */}
        <rect x="5" y="7" width="2" height="1" fill="#3e2723" /> {/* Muzzle */}

        {/* --- ACCESSORIES --- */}
        {accessory === AccessoryType.GOLD_CHAIN && (
          <rect x="8" y="13" width="6" height="2" fill="#FFD700" />
        )}
        {accessory === AccessoryType.SILK_SCARF && (
          <>
            <rect x="7" y="12" width="8" height="3" fill="#E91E63" />
            <rect x="12" y="14" width="2" height="4" fill="#E91E63" />
          </>
        )}
        {accessory === AccessoryType.TOP_HAT && (
          <>
             <rect x="5" y="3" width="8" height="1" fill="#212121" /> {/* Brim */}
             <rect x="6" y="0" width="6" height="3" fill="#212121" /> {/* Top */}
             <rect x="6" y="2" width="6" height="1" fill="#D32F2F" /> {/* Band */}
          </>
        )}
        {accessory === AccessoryType.DIAMOND_STUD && (
          <rect x="9" y="9" width="2" height="2" fill="#00FFFF" /> /* On chest/neck */
        )}
      </svg>
    </div>
  );
};
