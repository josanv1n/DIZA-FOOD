import React, { useEffect, useState, useMemo } from 'react';
import { NeonContainer, Header, NeonCard, StatCard } from '../components/UI';
import { db } from '../services/db';
import { Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  onLogout: () => void;
}

export const ManagerDashboard: React.FC<Props> = ({ onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    db.getTransactions()
      .then(data => {
        setTransactions(data || []);
      })
      .catch(err => {
        console.error("Failed to load transactions", err);
        setTransactions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter transactions for selected date
  const dailyTransactions = useMemo(() => {
    return transactions.filter(t => t.date && t.date.startsWith(selectedDate));
  }, [transactions, selectedDate]);

  // Daily Stats
  const dailyRevenue = dailyTransactions.reduce((sum, t) => sum + t.finalAmount, 0);
  const dailyOrders = dailyTransactions.length;
  const cashTotal = dailyTransactions.filter(t => t.paymentMethod === 'CASH').reduce((sum, t) => sum + t.finalAmount, 0);
  const digitalTotal = dailyTransactions.filter(t => t.paymentMethod !== 'CASH').reduce((sum, t) => sum + t.finalAmount, 0);

  // Chart Data (Revenue by Hour for selected Date)
  const chartData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, amount: 0 }));
    dailyTransactions.forEach(t => {
      if (t.date) {
        const hour = new Date(t.date).getHours();
        if (hours[hour]) hours[hour].amount += t.finalAmount;
      }
    });
    return hours.map(h => ({
      name: `${h.hour}:00`,
      revenue: h.amount
    })).filter(h => h.revenue > 0); // Only show hours with sales for cleaner view
  }, [dailyTransactions]);

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

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Daily Revenue" value={`Rp ${dailyRevenue.toLocaleString()}`} color="green" />
          <StatCard label="Total Orders" value={dailyOrders} color="blue" />
          <StatCard label="Cash Flow" value={`Rp ${cashTotal.toLocaleString()}`} color="pink" />
          <StatCard label="Digital (QR/TF)" value={`Rp ${digitalTotal.toLocaleString()}`} />
        </div>

        {/* Chart */}
        <NeonCard title="REVENUE TIMELINE" className="h-64">
           {chartData.length > 0 ? (
             <div className="w-full h-full mt-2 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(value) => `${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#00f3ff', color: '#fff' }}
                      itemStyle={{ color: '#00f3ff' }}
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    />
                    <Bar dataKey="revenue" fill="#00f3ff" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
           ) : (
             <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
               NO DATA RECORDED FOR THIS PERIOD
             </div>
           )}
        </NeonCard>

        {/* Recent Transaction Log */}
        <div className="space-y-2">
           <h3 className="text-neon-blue font-mono text-xs uppercase mb-2">Transaction Feed</h3>
           {dailyTransactions.length === 0 && <p className="text-slate-600 text-xs italic">System idle...</p>}
           {dailyTransactions.slice().reverse().map(t => ( // Show newest first
             <div key={t.id} className="bg-white/5 p-3 border-l-2 border-slate-600 flex justify-between items-start">
                <div>
                   <div className="text-xs text-slate-400 font-mono">{t.date ? new Date(t.date).toLocaleTimeString() : '-'}</div>
                   <div className="text-sm font-bold">{t.id}</div>
                   <div className="text-[10px] text-neon-blue">{t.paymentMethod} {t.remark ? `(${t.remark})` : ''}</div>
                </div>
                <div className="text-right">
                   <div className="text-neon-green font-mono">Rp {t.finalAmount.toLocaleString()}</div>
                   {t.discount > 0 && <div className="text-[10px] text-red-400">Disc: -{t.discount}</div>}
                </div>
             </div>
           ))}
        </div>
      </div>
       
      {/* Increased padding to pb-24 */}
      <div className="p-4 pb-24 border-t border-white/10">
        <button onClick={onLogout} className="text-red-500 font-mono text-xs hover:underline w-full text-center">
          TERMINATE SESSION (LOGOUT)
        </button>
      </div>
    </NeonContainer>
  );
};