
import React, { useEffect, useState, Component, ErrorInfo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Alpaca, AccessoryType } from './types';
import { alpacaService } from './services/alpacaService';
import { AlpacaCard } from './components/AlpacaCard';
import { FarmView } from './components/FarmView';
import { BidModal } from './components/BidModal';
import { CustomizeModal } from './components/CustomizeModal';
import { HistoryModal } from './components/HistoryModal';
import { VictoryModal } from './components/VictoryModal';
import { HallOfFame } from './components/HallOfFame';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { Star, ShieldCheck, Loader2, LayoutGrid, Sprout, Info, Phone, Trophy, AlertCircle } from 'lucide-react';

// Error Boundary to prevent crashes
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_: Error) { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) return <div className="p-10 text-center text-red-500"><AlertCircle className="mx-auto mb-4" />Something went wrong. Please refresh.</div>;
    return this.props.children;
  }
}

const Content: React.FC = () => {
  const [alpacas, setAlpacas] = useState<Alpaca[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlpaca, setSelectedAlpaca] = useState<Alpaca | null>(null);
  const [modalType, setModalType] = useState<'bid' | 'customize' | 'history' | null>(null);
  const [showVictory, setShowVictory] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    fetchFarm();
    // Auto refresh every 30s to simulate live market
    const interval = setInterval(fetchFarm, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchFarm = async () => {
    try {
      const data = await alpacaService.getAll();
      setAlpacas(data);
    } catch (error) {
      console.error(error);
      showNotification("Connection lost. Retrying...", true);
    } finally {
      setLoading(false);
    }
  };

  const handleBidClick = (alpaca: Alpaca) => { setSelectedAlpaca(alpaca); setModalType('bid'); };
  const handleCustomizeClick = (alpaca: Alpaca) => { setSelectedAlpaca(alpaca); setModalType('customize'); };
  const handleHistoryClick = (alpaca: Alpaca) => { setSelectedAlpaca(alpaca); setModalType('history'); };

  const handleFarmSelect = (alpaca: Alpaca) => {
    setSelectedAlpaca(alpaca);
    if (alpaca.ownerName === 'System DAO') {
       setModalType('bid');
    } else {
       setModalType('customize');
    }
  };

  const handleBidSubmit = async (amount: number, owner: string, pass: string) => {
    if (!selectedAlpaca) return;
    try {
      await alpacaService.placeBid({
        alpacaId: selectedAlpaca.id,
        bidAmount: amount,
        newOwnerName: owner,
        newPassword: pass
      });
      fetchFarm();
      setShowVictory(true); // Trigger Victory Modal
    } catch (error: any) {
      alert(error.message || "Transaction failed");
    }
  };

  const handleCustomizeSubmit = async (data: any) => {
    if (!selectedAlpaca) return;
    try {
      await alpacaService.customize({ alpacaId: selectedAlpaca.id, ...data });
      showNotification(`Asset updated successfully.`);
      fetchFarm();
    } catch (error: any) {
      // Propagate error to modal to display it inline
      throw error;
    }
  };

  const showNotification = (msg: string, isError = false) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen font-sans bg-luxury-black text-gray-200 flex flex-col">
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex flex-col lg:flex-row justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <ShieldCheck className="text-luxury-gold group-hover:text-white transition-colors" size={32} />
            <div>
              <h1 className="text-xl sm:text-2xl font-serif text-luxury-gold tracking-widest uppercase group-hover:text-white transition-colors">Alpaca Esclusivi</h1>
              <p className="text-[10px] text-gray-500 tracking-wider uppercase">Luxury Digital Asset Management</p>
            </div>
          </Link>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <nav className="flex gap-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              <Link to="/about" className="hover:text-luxury-gold flex items-center gap-1"><Info size={14} /> About</Link>
              <Link to="/hall-of-fame" className="hover:text-luxury-gold flex items-center gap-1"><Trophy size={14} /> Hall of Fame</Link>
              <Link to="/contacts" className="hover:text-luxury-gold flex items-center gap-1"><Phone size={14} /> Concierge</Link>
            </nav>
            <div className="h-4 w-px bg-gray-700 hidden sm:block"></div>
            <div className="flex bg-luxury-charcoal rounded-lg p-1 border border-gray-700">
              <Link to="/" className={`flex items-center gap-2 px-4 py-2 rounded text-xs uppercase tracking-wide transition-all ${location.pathname === '/' ? 'bg-luxury-gold text-black font-bold shadow-lg' : 'text-gray-400 hover:text-white'}`}><LayoutGrid size={14} /> Dashboard</Link>
              <Link to="/farm" className={`flex items-center gap-2 px-4 py-2 rounded text-xs uppercase tracking-wide transition-all ${location.pathname === '/farm' ? 'bg-[#4caf50] text-white font-bold shadow-lg' : 'text-gray-400 hover:text-white'}`}><Sprout size={14} /> Live Farm</Link>
            </div>
          </div>
        </div>
      </header>

      <main className={`flex-grow ${location.pathname === '/farm' ? '' : 'container mx-auto px-4 mt-10'}`}>
        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-luxury-gold" size={48} /></div>
        ) : (
          <Routes>
            <Route path="/" element={
              <>
                <div className="mb-8 text-center">
                  <h2 className="text-4xl font-serif text-white mb-4">The Royal Paddock</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">Welcome to the world's most exclusive digital farm. Only ten Alpacas exist. Ownership is fleeting.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-10">
                  {alpacas.map((alpaca) => (
                    <AlpacaCard key={alpaca.id} alpaca={alpaca} onBid={handleBidClick} onCustomize={handleCustomizeClick} onHistory={handleHistoryClick} />
                  ))}
                </div>
              </>
            } />
            <Route path="/farm" element={<FarmView alpacas={alpacas} onSelect={handleFarmSelect} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/hall-of-fame" element={<HallOfFame />} />
            <Route path="/contacts" element={<ContactPage />} />
          </Routes>
        )}
      </main>

      <footer className="border-t border-gray-800 bg-black text-gray-500 py-10 mt-auto z-40 relative">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
           <div className="space-y-2"><h4 className="text-luxury-gold uppercase font-bold mb-2">Corporate Data</h4><p>Alpaca Esclusivi S.r.l.</p><p>Via della Blockchain 10, Milano</p><p>P.IVA: 12345678901</p></div>
           <div className="space-y-2"><h4 className="text-luxury-gold uppercase font-bold mb-2">Contacts</h4><p>info@alpacaesclusivi.com</p></div>
           <div className="space-y-2"><h4 className="text-luxury-gold uppercase font-bold mb-2">Legal</h4><p>Privacy Policy (GDPR)</p><p>Terms & Conditions</p></div>
        </div>
      </footer>

      {notification && (
        <div className="fixed bottom-8 right-8 bg-luxury-gold text-black px-6 py-3 rounded shadow-lg flex items-center gap-2 animate-bounce z-50">
          <Star size={16} fill="black" />
          <span className="font-bold">{notification}</span>
        </div>
      )}

      <BidModal isOpen={modalType === 'bid'} alpaca={selectedAlpaca} onClose={() => setModalType(null)} onSubmit={handleBidSubmit} />
      <CustomizeModal isOpen={modalType === 'customize'} alpaca={selectedAlpaca} onClose={() => setModalType(null)} onSubmit={handleCustomizeSubmit} />
      <HistoryModal isOpen={modalType === 'history'} alpaca={selectedAlpaca} onClose={() => setModalType(null)} />
      
      <VictoryModal 
        isOpen={showVictory} 
        onClose={() => setShowVictory(false)} 
        alpacaName={selectedAlpaca?.name || ''} 
        alpacaId={selectedAlpaca?.id || 0} 
      />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Content />
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;
