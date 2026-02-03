import React, { useState } from 'react';
import { PublicHome } from './pages/PublicHome';
import { Login } from './pages/Login';
import { POS } from './pages/POS';
import { AdminDashboard } from './pages/AdminDashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { User, UserRole } from './types';

export default function App() {
  // Simple State-based routing since we need to persist auth state easily in this demo structure
  const [currentPage, setCurrentPage] = useState<'HOME' | 'LOGIN' | 'APP'>('HOME');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('APP');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('HOME');
  };

  const renderAppPage = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case UserRole.USER:
        return <POS user={currentUser} onLogout={handleLogout} />;
      case UserRole.ADMIN:
        return <AdminDashboard onLogout={handleLogout} />;
      case UserRole.MANAGER:
        return <ManagerDashboard onLogout={handleLogout} />;
      default:
        return <div>Access Denied</div>;
    }
  };

  return (
    <>
      {currentPage === 'HOME' && <PublicHome onLoginClick={() => setCurrentPage('LOGIN')} />}
      {currentPage === 'LOGIN' && <Login onLoginSuccess={handleLoginSuccess} onBack={() => setCurrentPage('HOME')} />}
      {currentPage === 'APP' && renderAppPage()}
    </>
  );
}