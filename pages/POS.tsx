import React, { useEffect, useState, useMemo } from 'react';
import { NeonContainer, Header, NeonButton, NeonCard, NeonInput } from '../components/UI';
import { db } from '../services/db';
import { MenuItem, CartItem, PaymentMethod, Transaction } from '../types';

interface Props {
  user: { username: string; id: string };
  onLogout: () => void;
}

export const POS: React.FC<Props> = ({ user, onLogout }) => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<string>('');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [remark, setRemark] = useState('');
  const [view, setView] = useState<'MENU' | 'CHECKOUT' | 'SUCCESS'>('MENU');
  const [lastChange, setLastChange] = useState(0);

  useEffect(() => {
    db.getMenu().then(setMenu);
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(i => {
        if (i.id === itemId) {
          return { ...i, quantity: i.quantity + delta };
        }
        return i;
      }).filter(i => i.quantity > 0);
    });
  };

  // Calculations
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const discountVal = parseInt(discount) || 0;
  const finalTotal = Math.max(0, subtotal - discountVal);
  const cashVal = parseInt(cashReceived) || 0;
  const change = Math.max(0, cashVal - finalTotal);

  const processTransaction = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === PaymentMethod.CASH && cashVal < finalTotal) {
      alert("UANG CASH KURANG!");
      return;
    }

    const tx: Omit<Transaction, 'id'> = {
      date: new Date().toISOString(),
      userId: user.id,
      totalAmount: subtotal,
      discount: discountVal,
      finalAmount: finalTotal,
      paymentMethod,
      remark: remark,
      details: cart.map(i => ({
        menuId: i.id,
        menuName: i.name,
        price: i.price,
        quantity: i.quantity,
        subtotal: i.price * i.quantity
      }))
    };

    await db.createTransaction(tx);
    setLastChange(change);
    setView('SUCCESS');
  };

  const reset = () => {
    setCart([]);
    setDiscount('');
    setCashReceived('');
    setRemark('');
    setPaymentMethod(PaymentMethod.CASH);
    setView('MENU');
  };

  const foodItems = menu.filter(m => m.category === 'MAKANAN');
  const drinkItems = menu.filter(m => m.category === 'MINUMAN');

  // Render Menu View
  if (view === 'MENU') {
    return (
      <NeonContainer>
        <Header title="KASIR" subtitle={user.username} />
        
        <div className="flex-1 overflow-hidden flex flex-col bg-neon-panel">
          <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
            {/* Food Section */}
            <div>
              <h3 className="text-neon-pink font-techno text-lg mb-3 border-b border-slate-700">MAKANAN</h3>
              <div className="grid grid-cols-1 gap-3">
                {foodItems.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="bg-slate-800 p-4 clip-corner flex justify-between items-center active:bg-neon-pink active:text-white transition-colors border-l-4 border-transparent hover:border-neon-pink group"
                  >
                    <div className="text-left">
                      <div className="font-bold text-lg font-body group-hover:text-neon-pink group-active:text-white">{item.name}</div>
                    </div>
                    <div className="font-techno font-bold text-slate-400 group-active:text-white">Rp {item.price.toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Drink Section */}
            <div>
              <h3 className="text-neon-blue font-techno text-lg mb-3 border-b border-slate-700">MINUMAN</h3>
              <div className="grid grid-cols-1 gap-3">
                {drinkItems.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="bg-slate-800 p-4 clip-corner flex justify-between items-center active:bg-neon-blue active:text-black transition-colors border-l-4 border-transparent hover:border-neon-blue group"
                  >
                     <div className="text-left">
                      <div className="font-bold text-lg font-body group-hover:text-neon-blue group-active:text-black">{item.name}</div>
                    </div>
                    <div className="font-techno font-bold text-slate-400 group-active:text-black">Rp {item.price.toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Cart Button - Lifted up with pb-12 */}
          {cart.length > 0 && (
             <div className="absolute bottom-0 left-0 right-0 p-4 pb-12 bg-gradient-to-t from-black via-black to-transparent z-30">
               <NeonButton onClick={() => setView('CHECKOUT')} className="w-full shadow-2xl animate-pulse">
                 BAYAR: Rp {subtotal.toLocaleString()} ({cart.reduce((a, b) => a + b.quantity, 0)} Item)
               </NeonButton>
             </div>
          )}
        </div>
        <button onClick={onLogout} className="absolute top-5 right-4 z-50 text-red-500 hover:text-white">
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
           </svg>
        </button>
      </NeonContainer>
    );
  }

  // Render Checkout View
  if (view === 'CHECKOUT') {
    return (
      <NeonContainer>
        <Header title="PEMBAYARAN" onBack={() => setView('MENU')} />
        
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Order List */}
          <div className="bg-slate-900 rounded p-4 mb-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center py-3 border-b border-slate-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-700 rounded overflow-hidden">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 bg-slate-800 text-white flex items-center justify-center hover:bg-red-500">-</button>
                    <span className="w-8 h-8 flex items-center justify-center bg-black text-neon-blue font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 bg-slate-800 text-white flex items-center justify-center hover:bg-green-500">+</button>
                  </div>
                  <span className="font-bold">{item.name}</span>
                </div>
                <span className="font-mono text-slate-400">{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="mt-4 flex justify-between items-center text-xl font-bold text-white border-t border-slate-700 pt-3">
              <span>TOTAL</span>
              <span className="text-neon-blue">Rp {subtotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
             <NeonInput 
                label="DISKON (Jika Ada)" 
                type="number" 
                value={discount} 
                onChange={e => setDiscount(e.target.value)} 
                placeholder="0"
             />

             <div>
               <label className="text-sm font-bold text-slate-400 font-techno uppercase tracking-wider mb-2 block">METODE BAYAR</label>
               <div className="grid grid-cols-3 gap-2">
                 {[PaymentMethod.CASH, PaymentMethod.TRANSFER, PaymentMethod.QRIS].map(method => (
                   <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-3 text-sm font-bold clip-corner transition-all ${paymentMethod === method ? 'bg-neon-yellow text-black' : 'bg-slate-800 text-slate-400'}`}
                   >
                     {method}
                   </button>
                 ))}
               </div>
             </div>

             {paymentMethod === PaymentMethod.CASH ? (
               <NeonInput 
                  label="UANG DITERIMA" 
                  type="number" 
                  value={cashReceived} 
                  onChange={e => setCashReceived(e.target.value)} 
                  placeholder="Rp 0"
               />
             ) : (
                <NeonInput 
                  label="KETERANGAN (REMARK)" 
                  value={remark} 
                  onChange={e => setRemark(e.target.value)} 
                  placeholder="No. Ref / Nama Pengirim"
               />
             )}

             <div className="bg-slate-800 p-4 border border-slate-700 clip-corner mt-4">
                <div className="flex justify-between text-lg mb-2">
                  <span className="text-slate-400">Total Bayar:</span>
                  <span className="text-white font-bold">Rp {finalTotal.toLocaleString()}</span>
                </div>
                {paymentMethod === PaymentMethod.CASH && (
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-slate-400">KEMBALIAN:</span>
                    <span className={`${change < 0 ? 'text-red-500' : 'text-neon-yellow'}`}>
                      Rp {change.toLocaleString()}
                    </span>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Added pb-12 to lift button up */}
        <div className="p-4 pb-12 bg-black border-t border-slate-800">
          <NeonButton onClick={processTransaction} className="w-full" variant="success">
            PROSES BAYAR
          </NeonButton>
        </div>
      </NeonContainer>
    );
  }

  // Success View
  return (
    <NeonContainer>
       <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-neon-dark w-full h-full">
          <div className="w-24 h-24 rounded-full border-4 border-neon-green flex items-center justify-center mb-6 shadow-glow-blue animate-bounce">
             <svg className="w-12 h-12 text-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
             </svg>
          </div>
          <h2 className="text-3xl font-techno text-neon-green mb-4">TRANSAKSI SUKSES</h2>
          
          <div className="bg-slate-900 p-6 rounded w-full mb-8 border border-slate-800">
            {paymentMethod === PaymentMethod.CASH && (
              <>
                <p className="text-slate-400 uppercase text-sm mb-1">Uang Kembalian</p>
                <p className="text-4xl font-bold text-white mb-4">Rp {lastChange.toLocaleString()}</p>
              </>
            )}
            <div className="flex justify-between text-sm text-slate-500 border-t border-slate-800 pt-4">
               <span>Total Belanja</span>
               <span>Rp {finalTotal.toLocaleString()}</span>
            </div>
          </div>

          <NeonButton onClick={reset} className="w-full" variant="primary">
            TRANSAKSI BARU
          </NeonButton>
       </div>
    </NeonContainer>
  );
};