import React from 'react';

// --- Types ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

// --- Components ---

export const NeonContainer: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`min-h-screen bg-neon-dark text-neon-blue font-body flex justify-center items-start pt-4 pb-12 ${className}`}>
    <div className="w-full max-w-md bg-neon-panel border-x border-neon-blue/20 min-h-[95vh] relative shadow-2xl overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  </div>
);

export const Header: React.FC<{ title: string, subtitle?: string, onBack?: () => void }> = ({ title, subtitle, onBack }) => (
  <header className="p-6 border-b border-neon-blue/30 bg-neon-panel/90 backdrop-blur sticky top-0 z-50">
    <div className="flex items-center justify-between">
      <div>
        {onBack && (
          <button onClick={onBack} className="text-xs text-neon-pink mb-1 hover:underline">
            &lt; BACK
          </button>
        )}
        <h1 className="text-2xl font-techno font-bold tracking-wider text-white drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-neon-green mt-1 font-mono tracking-widest uppercase">{subtitle}</p>}
      </div>
      <div className="w-3 h-3 bg-neon-green rounded-full shadow-[0_0_10px_#00ff41] animate-pulse"></div>
    </div>
  </header>
);

export const NeonButton: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', isLoading, ...props }) => {
  const baseStyle = "relative font-techno uppercase tracking-widest py-3 px-6 transition-all duration-200 clip-path-polygon disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-neon-blue/10 border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black hover:shadow-neon-blue",
    secondary: "bg-neon-pink/10 border border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black hover:shadow-neon-pink",
    danger: "bg-red-900/20 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white",
    ghost: "border-transparent text-gray-400 hover:text-white"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? "PROCESSING..." : children}
    </button>
  );
};

export const NeonCard: React.FC<{ children: React.ReactNode, className?: string, title?: string }> = ({ children, className = '', title }) => (
  <div className={`bg-slate-900/50 border border-neon-blue/20 p-4 relative overflow-hidden backdrop-blur-sm ${className}`}>
    {title && (
      <div className="absolute top-0 left-0 bg-neon-blue/20 px-3 py-1 text-[10px] font-techno text-neon-blue uppercase border-r border-b border-neon-blue/30">
        {title}
      </div>
    )}
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-neon-blue"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-neon-blue"></div>
    {children}
  </div>
);

export const NeonInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-1 mb-4">
    {label && <label className="text-xs text-neon-blue/70 font-mono uppercase">{label}</label>}
    <input 
      className={`bg-black/40 border border-slate-700 text-white p-3 focus:outline-none focus:border-neon-blue focus:shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all font-mono placeholder-slate-600 ${className}`}
      {...props}
    />
  </div>
);

export const StatCard: React.FC<{ label: string, value: string | number, color?: 'blue' | 'pink' | 'green' }> = ({ label, value, color = 'blue' }) => {
  const colors = {
    blue: 'text-neon-blue border-neon-blue/30',
    pink: 'text-neon-pink border-neon-pink/30',
    green: 'text-neon-green border-neon-green/30'
  };

  return (
    <div className={`border ${colors[color]} bg-black/40 p-3 flex flex-col items-center justify-center`}>
      <span className="text-[10px] uppercase tracking-widest opacity-80 mb-1">{label}</span>
      <span className={`text-xl font-techno font-bold ${color === 'blue' ? 'text-neon-blue' : color === 'pink' ? 'text-neon-pink' : 'text-neon-green'}`}>
        {value}
      </span>
    </div>
  );
};
