

import React, { useState } from 'react';
import { Alpaca, AccessoryType } from '../types';
import { X, Save, Palette, Image as ImageIcon, Home, Key, AlertTriangle, AlertCircle } from 'lucide-react';

interface CustomizeModalProps {
  alpaca: Alpaca | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { passwordVerify: string; newName?: string; newColor?: string; newStableColor?: string; newBackgroundImage?: string; newAccessory?: AccessoryType }) => Promise<void>;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({ alpaca, isOpen, onClose, onSubmit }) => {
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#FFFFFF');
  const [stableColor, setStableColor] = useState('#795548');
  const [bgImage, setBgImage] = useState('');
  const [accessory, setAccessory] = useState<AccessoryType>(AccessoryType.NONE);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (alpaca) {
      setName(alpaca.name);
      setColor(alpaca.color);
      setStableColor(alpaca.stableColor || '#795548');
      setBgImage(alpaca.backgroundImage || '');
      setAccessory(alpaca.accessory);
      setPassword(''); // Reset password field
      setError('');
      setIsSaving(false);
    }
  }, [alpaca, isOpen]);

  if (!isOpen || !alpaca) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!password) {
      setError("Please enter the asset password to verify ownership.");
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({ 
        passwordVerify: password,
        newName: name, 
        newColor: color, 
        newStableColor: stableColor,
        newBackgroundImage: bgImage,
        newAccessory: accessory 
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update asset.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-luxury-charcoal border-l-4 border-luxury-gold w-full max-w-lg p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-serif text-white mb-2">Manage Asset</h2>
        <p className="text-gray-400 text-xs mb-6">Ownership Verification Required</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Verification */}
          <div className="bg-red-900/20 border border-red-900/50 p-3 rounded">
            <label className="block text-xs uppercase tracking-widest text-red-400 mb-1 flex items-center gap-2">
              <Key size={12} /> Verify Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-luxury-black border border-red-900 focus:border-red-500 text-white p-2 outline-none"
              placeholder="Enter password set at purchase"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="block text-xs uppercase tracking-widest text-gray-400">Asset Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-luxury-black border border-gray-700 focus:border-luxury-gold text-white p-2 outline-none"
                placeholder="No offensive names"
              />
            </div>

            {/* Accessory */}
            <div className="space-y-1">
              <label className="block text-xs uppercase tracking-widest text-gray-400">Accessory</label>
              <select 
                value={accessory}
                onChange={(e) => setAccessory(e.target.value as AccessoryType)}
                className="w-full bg-luxury-black border border-gray-700 text-white p-2 outline-none"
              >
                {Object.values(AccessoryType).map((acc) => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-gray-800 my-2" />

          {/* Alpaca Color */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Palette size={14} /> Coat Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {['#FFFFFF', '#8B4513', '#000000', '#FFD700', '#C0C0C0', '#FF69B4', '#5D4037'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Stable Color */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Home size={14} /> Stable Paint
            </label>
            <div className="flex gap-2 flex-wrap">
              {['#795548', '#5D4037', '#3E2723', '#8D6E63', '#BCAAA4', '#212121', '#F5F5F5', '#1A237E'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setStableColor(c)}
                  className={`w-6 h-6 rounded-sm border-2 transition-transform hover:scale-110 ${stableColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Background Image */}
          <div className="space-y-1">
            <label className="block text-xs uppercase tracking-widest text-gray-400 flex items-center gap-2">
               <ImageIcon size={14} /> Pen Terrain (Image URL)
            </label>
            <input 
              type="text" 
              value={bgImage}
              onChange={(e) => setBgImage(e.target.value)}
              placeholder="https://example.com/grass.jpg"
              className="w-full bg-luxury-black border border-gray-700 focus:border-luxury-gold text-white p-2 outline-none text-xs"
            />
            {bgImage && (
              <div className="w-full h-12 rounded mt-2 bg-cover bg-center border border-gray-700" style={{ backgroundImage: `url(${bgImage})` }}></div>
            )}
          </div>

          <div className="mt-4 p-3 bg-luxury-black border border-gray-800 rounded flex gap-2 items-start">
             <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
             <p className="text-[10px] text-gray-500 leading-tight">
               <span className="text-gray-300 font-bold">Content Disclaimer:</span> By uploading images or setting names, you agree to our Terms. 
               We reserve the right to reset inappropriate content (NSFW, hate speech) without refund. 
               Your IP is logged.
             </p>
          </div>

          {error && (
            <div className="mt-2 p-3 bg-red-900/50 border border-red-800 text-red-200 text-xs flex items-center gap-2 rounded">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isSaving}
            className={`w-full bg-white text-black font-bold py-3 hover:bg-luxury-gold transition-colors flex items-center justify-center gap-2 mt-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaving ? 'Verifying...' : <><Save size={16} /> Save Configuration</>}
          </button>
        </form>
      </div>
    </div>
  );
};
