import React, { useState } from 'react';
import { NeonContainer, Header, NeonInput, NeonButton, NeonCard } from '../components/UI';
import { db } from '../services/db';
import { User } from '../types';

interface Props {
  onLoginSuccess: (user: User) => void;
  onBack: () => void;
}

export const Login: React.FC<Props> = ({ onLoginSuccess, onBack }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await db.login(username, pin);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('ACCESS DENIED: Invalid Credentials');
      }
    } catch (err) {
      setError('SYSTEM ERROR: Connection Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <NeonContainer>
      <Header title="AUTHENTICATION" onBack={onBack} />
      
      <main className="flex-1 flex items-center justify-center p-6">
        <NeonCard className="w-full" title="SECURE LOGIN">
          <form onSubmit={handleLogin} className="space-y-6 mt-4">
            <div className="text-center mb-6">
              <div className="inline-block p-4 rounded-full border border-neon-blue/30 bg-neon-blue/5 mb-2">
                <svg className="w-8 h-8 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-xs text-slate-500 font-mono">ENTER CREDENTIALS TO ACCESS DATABASE</p>
            </div>

            <NeonInput 
              label="Username" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. kasir, admin, manager"
            />
            
            <NeonInput 
              label="Access PIN" 
              type="password" 
              value={pin} 
              onChange={e => setPin(e.target.value)}
              placeholder="****"
            />

            {error && (
              <div className="bg-red-900/20 border border-red-500 p-2 text-center">
                <p className="text-red-500 text-xs font-mono font-bold animate-pulse">{error}</p>
              </div>
            )}

            <NeonButton type="submit" className="w-full" isLoading={loading}>
              INITIATE SESSION
            </NeonButton>
          </form>
          
          <div className="mt-8 pt-4 border-t border-white/5 text-[10px] font-mono text-slate-600 text-center">
            <p>HINT (DEMO):</p>
            <p>User: kasir / 1234</p>
            <p>Admin: admin / admin</p>
            <p>Manager: manager / boss</p>
          </div>
        </NeonCard>
      </main>
    </NeonContainer>
  );
};