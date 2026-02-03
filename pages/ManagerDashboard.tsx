import React, { useEffect, useState, useMemo } from 'react';
import { NeonContainer, Header, StatCard } from '../components/UI';
import { db } from '../services/db';
import { Transaction } from '../types';

interface Props {
  onLogout: () => void;
}

// Robust currency formatter that handles any input type safely
const safeCurrency = (value: any): string => {
  if (value === null || value === undefined) return '0';
  const num = Number(value);
  if (isNaN(num)) return '0';
  return num.toLocaleString('id-ID');
};

export const ManagerDashboard: React.FC<Props> = ({ onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Use local date for default selection to ensure today's data is shown correctly
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    // Adjust for timezone offset to get local YYYY-MM-DD
    const offset = now.getTimezoneOffset() * 60000;
    const localIso = new Date(now.getTime() - offset).toISOString().split('T')[0];
    return localIso;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    db.getTransactions()
      .then(data => {
        setTransactions(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Failed to load transactions", err);
        setTransactions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter transactions for selected date
  const dailyTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return transactions.filter(t => {
      if (!t || !t.date) return false;
      // Compare YYYY-MM-DD
      return t.date.substring(0, 10) === selectedDate;
    });
  }, [transactions, selectedDate]);

  // Daily Stats with safe number conversion and optional chaining
  const dailyRevenue = dailyTransactions.reduce((sum, t) => sum + (Number(t?.finalAmount) || 0), 0);
  const dailyOrders = dailyTransactions.length;
  const cashTotal = dailyTransactions
    .filter(t => t?.paymentMethod === 'CASH')
    .reduce((sum, t) => sum + (Number(t?.finalAmount) || 0), 0);
  const digitalTotal = dailyTransactions
    .filter(t => t?.paymentMethod !== 'CASH')
    .reduce((sum, t) => sum + (Number(t?.finalAmount) || 0), 0);

  if (loading) {
    return (
      <NeonContainer>
        <div className="flex flex-col items-center justify-center h-full">
           <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-neon-blue font-techno tracking-widest animate-pulse">LOADING ANALYTICS...</p>
        </div>
      </NeonContainer>
    );
  }

  return (
    <NeonContainer>
      <Header title="EXECUTIVE DASHBOARD" subtitle="ANALYTICS MODULE" />
      
      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white/5 p-2 rounded border border-white/10">
          <label className="text-xs font-mono text-slate-400">TARGET DATE:</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-transparent text-white font-mono focus:outline-none flex-1"
          />
        </div>

        {/* Big Revenue Card */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 border-l-4 border-neon-green clip-corner shadow-lg relative overflow-hidden">
           <div className="absolute right-0 top-0 p-4 opacity-10">
              <svg className="w-24 h-24 text-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
           </div>
           <h3 className="text-sm font-techno text-neon-green uppercase tracking-widest mb-1">Total Omset Hari Ini</h3>
           <div className="text-4xl font-bold font-body text-white">Rp {safeCurrency(dailyRevenue)}</div>
           <div className="mt-2 text-xs font-mono text-slate-400">Total {dailyOrders} Transaksi</div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Cash Flow" value={`Rp ${safeCurrency(cashTotal)}`} color="pink" />
          <StatCard label="Digital (QR/TF)" value={`Rp ${safeCurrency(digitalTotal)}`} color="blue" />
        </div>

        {/* Recent Transaction Log */}
        <div className="space-y-2">
           <h3 className="text-neon-blue font-mono text-xs uppercase mb-2">Transaction Feed</h3>
           {dailyTransactions.length === 0 && <p className="text-slate-600 text-xs italic">System idle / No data for this date.</p>}
           {dailyTransactions.slice().reverse().map((t, idx) => ( 
             <div key={t?.id || idx} className="bg-white/5 p-3 border-l-2 border-slate-600 flex justify-between items-start">
                <div>
                   <div className="text-xs text-slate-400 font-mono">
                     {t?.date ? new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                   </div>
                   <div className="text-sm font-bold">{t?.id || 'ID?'}</div>
                   <div className="text-[10px] text-neon-blue">{t?.paymentMethod || '-'} {t?.remark ? `(${t.remark})` : ''}</div>
                </div>
                <div className="text-right">
                   {/* SAFE RENDERING: Uses helper function */}
                   <div className="text-neon-green font-mono">Rp {safeCurrency(t?.finalAmount)}</div>
                   {(t?.discount || 0) > 0 && <div className="text-[10px] text-red-400">Disc: -{t.discount}</div>}
                </div>
             </div>
           ))}
        </div>
      </div>
       
      <div className="p-4 pb-24 border-t border-white/10">
        <button onClick={onLogout} className="text-red-500 font-mono text-xs hover:underline w-full text-center">
          TERMINATE SESSION (LOGOUT)
        </button>
      </div>
    </NeonContainer>
  );
};