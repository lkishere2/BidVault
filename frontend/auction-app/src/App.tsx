import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/header';
import HomePage from './pages/general/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyPage from './pages/auth/VerifyPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ForgotPasswordVerifyPage from './pages/auth/ForgotPasswordVerifyPage';

// Main App Views
import { ProfilePage } from './pages/general/profile/ProfilePage';
import { InventoryPage } from './pages/general/storage/InventoryPage';
import './App.css';

function App() {
  const [user, setUser] = useState<{ username: string; initials: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('bidvault_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (userData: { username: string; initials: string }) => {
    localStorage.setItem('bidvault_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('bidvault_user');
    setUser(null);
  };

  if (isLoading) {
    return null;
  }

  return (
    <BrowserRouter>
      <Header
        isLoggedIn={!!user}
        user={user ?? undefined}
        onLogout={handleLogout}
      />

      <Routes>
        {/* Core Global Features */}
        <Route path="/" element={<HomePage />} />

        {/* User Workspace & Profile Dashboard */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/inventory" element={<InventoryPage />} />

        {/* Authentication Contexts */}
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forget-password" element={<ForgotPasswordPage />} />

        {/* Token Validation Checks */}
        <Route path="/verify/user" element={<VerifyPage />} />
        <Route path="/verify/forget-password" element={<ForgotPasswordVerifyPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;