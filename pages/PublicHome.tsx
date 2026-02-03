import React, { useEffect, useState } from 'react';
import { NeonContainer, Header, NeonCard, NeonButton } from '../components/UI';
import { db } from '../services/db';
import { MenuItem, PromoText } from '../types';

interface Props {
  onLoginClick: () => void;
}

export const PublicHome: React.FC<Props> = ({ onLoginClick }) => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [promo, setPromo] = useState<PromoText | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const m = await db.getMenu();
      const p = await db.getPromo();
      setMenu(m);
      setPromo(p);
    };
    fetchData();
  }, []);

  const foodItems = menu.filter(m => m.category === 'MAKANAN');
  const drinkItems = menu.filter(m => m.category === 'MINUMAN');

  return (
    <NeonContainer>
      <Header title="DIZA FOOD" subtitle="Cyber Culinary Experience" />
      
      <main className="p-4 flex flex-col gap-6 flex-1 overflow-y-auto">
        {/* Profile Section */}
        <section className="text-center space-y-2">
          <div className="w-24 h-24 mx-auto bg-neon-blue/10 rounded-full border-2 border-neon-blue flex items-center justify-center shadow-neon-blue animate-pulse">
            <span className="font-techno text-3xl font-bold italic">DF</span>
          </div>
          <p className="text-slate-400 text-sm max-w-[80%] mx-auto">
            Menyajikan Ayam Geprek, Batagor, Siomay, Indomie, dan Minuman Segar dengan cita rasa masa depan.
          </p>
        </section>

        {/* Promo Section */}
        {promo && promo.active && (
          <NeonCard className="border-neon-pink/50 shadow-neon-pink">
             <div className="text-center animate-pulse">
                <h3 className="font-techno text-neon-pink text-lg mb-1">WARNING: PROMO</h3>
                <p className="font-mono text-white text-sm uppercase">{promo.content}</p>
             </div>
          </NeonCard>
        )}

        {/* Menu Section */}
        <div className="space-y-4">
          <h2 className="font-techno text-neon-green text-xl border-b border-neon-green/30 pb-2">MAKANAN</h2>
          <div className="grid gap-3">
            {foodItems.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-white/5 p-3 border-l-2 border-neon-green">
                <span className="font-body text-lg">{item.name}</span>
                <span className="font-mono text-neon-green">Rp {item.price.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <h2 className="font-techno text-neon-blue text-xl border-b border-neon-blue/30 pb-2 mt-4">MINUMAN</h2>
          <div className="grid gap-3">
            {drinkItems.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-white/5 p-3 border-l-2 border-neon-blue">
                <span className="font-body text-lg">{item.name}</span>
                <span className="font-mono text-neon-blue">Rp {item.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="p-4 border-t border-white/10 bg-black/50 backdrop-blur">
        <NeonButton onClick={onLoginClick} className="w-full">
          SYSTEM ACCESS (LOGIN)
        </NeonButton>
      </div>
    </NeonContainer>
  );
};