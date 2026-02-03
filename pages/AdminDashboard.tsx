import React, { useState, useEffect } from 'react';
import { NeonContainer, Header, NeonButton, NeonInput, NeonCard } from '../components/UI';
import { db } from '../services/db';
import { MenuItem } from '../types';

interface Props {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'MENU' | 'PROMO'>('MENU');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [promoText, setPromoText] = useState('');
  
  // New Menu State
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'MAKANAN' | 'MINUMAN'>('MAKANAN');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const m = await db.getMenu();
    setMenu(m);
    const p = await db.getPromo();
    setPromoText(p.content);
  };

  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    setLoading(true);
    await db.addMenu({
      name: newItemName,
      price: parseInt(newItemPrice),
      category: newItemCategory
    });
    setNewItemName('');
    setNewItemPrice('');
    await loadData();
    setLoading(false);
  };

  const handleUpdatePromo = async () => {
    setLoading(true);
    await db.updatePromo(promoText);
    setLoading(false);
    alert("Promo Updated Broadcasted!");
  };

  return (
    <NeonContainer>
      <Header title="ADMIN CONSOLE" subtitle="SYSTEM CONFIGURATION" />
      
      <div className="flex border-b border-neon-blue/20">
        <button 
          onClick={() => setActiveTab('MENU')}
          className={`flex-1 py-3 font-techno text-xs ${activeTab === 'MENU' ? 'bg-neon-blue/20 text-neon-blue border-b-2 border-neon-blue' : 'text-slate-500'}`}
        >
          MENU DATABASE
        </button>
        <button 
          onClick={() => setActiveTab('PROMO')}
          className={`flex-1 py-3 font-techno text-xs ${activeTab === 'PROMO' ? 'bg-neon-pink/20 text-neon-pink border-b-2 border-neon-pink' : 'text-slate-500'}`}
        >
          PROMO BROADCAST
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'MENU' ? (
          <div className="space-y-6">
            <NeonCard title="ADD NEW ITEM" className="border-neon-green/30">
              <form onSubmit={handleAddMenu} className="space-y-3 mt-2">
                <NeonInput 
                  placeholder="Item Name" 
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                />
                <div className="flex gap-2">
                   <select 
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="bg-black/40 border border-slate-700 text-white p-3 flex-1 font-mono focus:border-neon-blue outline-none"
                   >
                     <option value="MAKANAN">MAKANAN</option>
                     <option value="MINUMAN">MINUMAN</option>
                   </select>
                   <input 
                    type="number"
                    placeholder="Price"
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(e.target.value)}
                    className="bg-black/40 border border-slate-700 text-white p-3 flex-1 font-mono focus:border-neon-blue outline-none"
                   />
                </div>
                <NeonButton type="submit" variant="secondary" className="w-full text-sm py-2" isLoading={loading}>
                  UPLOAD TO DB
                </NeonButton>
              </form>
            </NeonCard>

            <div className="space-y-2">
              <h3 className="text-neon-blue font-mono text-sm mb-2">CURRENT DATABASE</h3>
              {menu.map(item => (
                <div key={item.id} className="bg-white/5 p-2 flex justify-between items-center border-l border-slate-600">
                  <span className="text-sm">{item.name}</span>
                  <div className="flex gap-2 text-xs font-mono text-slate-400">
                    <span>{item.category}</span>
                    <span className="text-neon-blue">{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
             <NeonCard title="FRONTEND TEXT CONTROLLER">
                <textarea 
                  value={promoText}
                  onChange={e => setPromoText(e.target.value)}
                  className="w-full h-32 bg-black/40 border border-slate-700 p-3 text-neon-pink font-mono focus:border-neon-pink outline-none mt-2"
                  placeholder="Enter promo text here..."
                />
                <NeonButton onClick={handleUpdatePromo} variant="secondary" className="w-full mt-4" isLoading={loading}>
                  UPDATE DISPLAY
                </NeonButton>
             </NeonCard>
          </div>
        )}
      </div>
      
      {/* Added pb-12 here */}
      <div className="p-4 pb-12 border-t border-white/10">
        <button onClick={onLogout} className="text-red-500 font-mono text-xs hover:underline w-full text-center">
          TERMINATE SESSION (LOGOUT)
        </button>
      </div>
    </NeonContainer>
  );
};