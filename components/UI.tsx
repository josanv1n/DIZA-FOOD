import React from 'react';

// --- Types ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  isLoading?: boolean;
}

// --- Components ---

export const NeonContainer: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`h-screen w-screen bg-neon-dark text-white font-body flex justify-center items-center overflow-hidden relative ${className}`}>
    {/* Background Tech Pattern */}
    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
         style={{ 
           backgroundImage: 'radial-gradient(circle at center, #161B22 0%, #000 100%)',
         }}>
    </div>
    
    {/* Mobile Frame */}
    <div className="w-full h-full max-w-md bg-neon-panel relative z-10 flex flex-col shadow-2xl overflow-hidden md:border-x md:border-slate-800">
      <div className="scanline"></div>
      {children}
    </div>
  </div>
);

export const Header: React.FC<{ title: string, subtitle?: string, onBack?: () => void }> = ({ title, subtitle, onBack }) => (
  <header className="px-4 py-4 bg-neon-surface border-b border-slate-700 z-20 shadow-md">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded clip-corner hover:bg-slate-700 active:scale-95 transition">
            <svg className="w-6 h-6 text-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div>
          <h1 className="text-xl font-techno font-bold tracking-wider text-white uppercase leading-none">
            {title}
          </h1>
          {subtitle && <p className="text-sm font-bold text-neon-blue font-body tracking-widest uppercase mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-neon-pink rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse delay-75"></div>
        <div className="w-2 h-2 bg-neon-yellow rounded-full animate-pulse delay-150"></div>
      </div>
    </div>
  </header>
);

export const NeonButton: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', isLoading, ...props }) => {
  const baseStyle = "font-techno font-bold uppercase tracking-widest py-4 px-6 transition-all duration-200 clip-corner active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center";
  
  const variants = {
    primary: "bg-neon-blue text-black hover:bg-cyan-300 shadow-glow-blue",
    secondary: "bg-slate-800 text-neon-blue border border-neon-blue/30 hover:bg-slate-700 hover:border-neon-blue",
    danger: "bg-neon-pink text-white hover:bg-red-600 shadow-glow-pink",
    success: "bg-neon-yellow text-black hover:bg-yellow-300"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          PROCESSING
        </span>
      ) : children}
    </button>
  );
};

export const NeonCard: React.FC<{ children: React.ReactNode, className?: string, title?: string }> = ({ children, className = '', title }) => (
  <div className={`bg-neon-surface p-4 relative clip-corner border-l-4 border-neon-blue ${className}`}>
    {title && (
      <div className="mb-3 flex items-center justify-between border-b border-slate-700 pb-2">
        <span className="font-techno text-lg font-bold text-neon-blue uppercase">{title}</span>
        <div className="h-1 w-10 bg-neon-blue"></div>
      </div>
    )}
    {children}
  </div>
);

export const NeonInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-2 mb-4">
    {label && <label className="text-sm font-bold text-slate-400 font-techno uppercase tracking-wider">{label}</label>}
    <input 
      className={`bg-black border border-slate-700 text-white text-lg p-4 focus:outline-none focus:border-neon-blue focus:shadow-glow-blue transition-all font-body rounded-none clip-corner placeholder-slate-600 ${className}`}
      {...props}
    />
  </div>
);

export const StatCard: React.FC<{ label: string, value: string | number, color?: 'blue' | 'pink' | 'yellow' | 'green' }> = ({ label, value, color = 'blue' }) => {
  const colors = {
    blue: 'border-neon-blue text-neon-blue',
    pink: 'border-neon-pink text-neon-pink',
    yellow: 'border-neon-yellow text-neon-yellow',
    green: 'border-neon-green text-neon-green'
  };

  return (
    <div className={`bg-slate-900 border-l-4 p-3 ${colors[color]}`}>
      <span className="text-xs font-bold uppercase text-slate-400 block mb-1 font-techno">{label}</span>
      <span className="text-xl font-bold font-body text-white block truncate">{value}</span>
    </div>
  );
};