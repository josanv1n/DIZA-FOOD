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

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === itemId) {
        return { ...i, quantity: Math.max(1, i.quantity + delta) };
      }
      return i;
    }));
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
      alert("Insufficient Cash!");
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

  // Render Menu View
  if (view === 'MENU') {
    return (
      <NeonContainer>
        <Header title="POS TERMINAL" subtitle={`OPERATOR: ${user.username}`} />
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <h3 className="text-neon-green font-techno border-b border-neon-green/30">MENU ITEMS</h3>
            <div className="grid grid-cols-2 gap-3">
              {menu.map(item => (
                <button 
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-white/5 border border-white/10 p-3 text-left hover:bg-neon-blue/20 hover:border-neon-blue transition-colors group"
                >
                  <div className="font-bold group-hover:text-neon-blue">{item.name}</div>
                  <div className="text-xs text-slate-400 font-mono">Rp {item.price.toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mini Cart Sticky Footer */}
          {cart.length > 0 && (
             <div className="p-4 bg-neon-panel border-t border-neon-blue/30 backdrop-blur-lg">
               <div className="flex justify-between items-center mb-3">
                 <span className="text-sm font-mono text-slate-400">{cart.reduce((a, b) => a + b.quantity, 0)} ITEMS</span>
                 <span className="text-xl font-techno text-neon-blue">Rp {subtotal.toLocaleString()}</span>
               </div>
               <NeonButton onClick={() => setView('CHECKOUT')} className="w-full">
                 PROCEED TO PAYMENT
               </NeonButton>
             </div>
          )}
        </div>
        <button onClick={onLogout} className="absolute top-6 right-4 text-xs text-red-500 font-bold z-50">LOGOUT</button>
      </NeonContainer>
    );
  }

  // Render Checkout View
  if (view === 'CHECKOUT') {
    return (
      <NeonContainer>
        <Header title="PAYMENT" onBack={() => setView('MENU')} />
        
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Order Summary */}
          <NeonCard title="ORDER SUMMARY">
            <div className="space-y-2 mt-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm border-b border-white/5 pb-1">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-5 h-5 bg-red-500/20 text-red-500 flex items-center justify-center rounded">-</button>
                    <span className="font-mono text-neon-blue">{item.quantity}x</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-5 h-5 bg-green-500/20 text-green-500 flex items-center justify-center rounded">+</button>
                    <span>{item.name}</span>
                  </div>
                  <span>{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-2 border-t border-white/20 flex justify-between font-bold text-lg">
              <span>TOTAL</span>
              <span className="text-neon-blue">Rp {subtotal.toLocaleString()}</span>
            </div>
          </NeonCard>

          {/* Payment Details */}
          <div className="space-y-4">
             <NeonInput 
                label="Discount Amount (Rp)" 
                type="number" 
                value={discount} 
                onChange={e => setDiscount(e.target.value)} 
                placeholder="0"
             />

             <div className="flex flex-col gap-1">
               <label className="text-xs text-neon-blue/70 font-mono uppercase">PAYMENT METHOD</label>
               <div className="flex gap-2">
                 {[PaymentMethod.CASH, PaymentMethod.TRANSFER, PaymentMethod.QRIS].map(method => (
                   <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 py-2 text-xs font-bold border ${paymentMethod === method ? 'bg-neon-blue text-black border-neon-blue' : 'bg-transparent border-slate-700 text-slate-500'}`}
                   >
                     {method}
                   </button>
                 ))}
               </div>
             </div>

             {paymentMethod === PaymentMethod.CASH ? (
               <NeonInput 
                  label="Cash Received (Rp)" 
                  type="number" 
                  value={cashReceived} 
                  onChange={e => setCashReceived(e.target.value)} 
                  placeholder="0"
               />
             ) : (
                <NeonInput 
                  label="Remark / Ref No." 
                  value={remark} 
                  onChange={e => setRemark(e.target.value)} 
                  placeholder="Transaction ID..."
               />
             )}

             <div className="bg-black/40 p-3 border border-white/10 rounded">
                <div className="flex justify-between text-sm mb-1">
                  <span>Grand Total:</span>
                  <span className="text-neon-blue font-bold">Rp {finalTotal.toLocaleString()}</span>
                </div>
                {paymentMethod === PaymentMethod.CASH && (
                  <div className="flex justify-between text-sm">
                    <span>Change:</span>
                    <span className={`font-bold ${change < 0 ? 'text-red-500' : 'text-neon-green'}`}>
                      Rp {change.toLocaleString()}
                    </span>
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-black/50 backdrop-blur">
          <NeonButton onClick={processTransaction} className="w-full">
            EXECUTE PAYMENT
          </NeonButton>
        </div>
      </NeonContainer>
    );
  }

  // Success View
  return (
    <NeonContainer>
       <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full border-4 border-neon-green flex items-center justify-center mb-6 shadow-[0_0_20px_#00ff41]">
             <svg className="w-10 h-10 text-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
             </svg>
          </div>
          <h2 className="text-2xl font-techno text-neon-green mb-2">TRANSACTION COMPLETE</h2>
          {paymentMethod === PaymentMethod.CASH && (
            <p className="text-xl mb-6">Change: <span className="text-white font-bold">Rp {lastChange.toLocaleString()}</span></p>
          )}
          <NeonButton onClick={reset} className="w-full max-w-xs">
            NEW ORDER
          </NeonButton>
       </div>
    </NeonContainer>
  );
};