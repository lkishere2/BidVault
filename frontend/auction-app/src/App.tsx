import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import HomePage from './pages/general/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyPage from './pages/auth/VerifyPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ForgotPasswordVerifyPage from './pages/auth/ForgotPasswordVerifyPage';
import { ProfilePage } from './pages/general/profile/ProfilePage';
import { InventoryPage } from './pages/general/storage/InventoryPage';
import './App.css';

// ── Placeholder pages ──
const OfficeDashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Dashboard</h1></div>;
const ExplorePage = () => <div className="p-8"><h1 className="text-2xl font-bold">Explore</h1></div>;
const AllAuctionsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">All Auctions</h1></div>;
const MyBidsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">My Bids</h1></div>;
const AccountPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Account</h1></div>;

// ── Root layout: Header + page content + Footer on every route ──
function RootLayout({
  user, isLoggedIn, onLogout,
}: {
  user?: { username: string; initials: string };
  isLoggedIn: boolean;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

type UserData = { id?: string; username: string; initials: string };

// ── Initialise from localStorage synchronously so no effect needed ──
function readSavedUser(): UserData | null {
  try {
    const raw = localStorage.getItem('bidvault_user');
    return raw ? (JSON.parse(raw) as UserData) : null;
  } catch {
    return null;
  }
}

function App() {
  const [user, setUser] = useState<UserData | null>(readSavedUser);

  // Keep localStorage in sync whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('bidvault_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bidvault_user');
    }
  }, [user]);

  const handleLoginSuccess = (userData: UserData) => setUser(userData);
  const handleLogout = () => setUser(null);

  return (
    <BrowserRouter>
      <Routes>
        {/* All routes share the root layout (header + footer) */}
        <Route
          element={
            <RootLayout
              user={user ?? undefined}
              isLoggedIn={!!user}
              onLogout={handleLogout}
            />
          }
        >
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forget-password" element={<ForgotPasswordPage />} />

          {/* Token checks */}
          <Route path="/verify/user" element={<VerifyPage />} />
          <Route path="/verify/forget-password" element={<ForgotPasswordVerifyPage />} />

          {/* App pages */}
          <Route path="/office" element={<OfficeDashboard />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/auctions/hub" element={<AllAuctionsPage />} />
          <Route path="/auction/joined" element={<MyBidsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/inventory" element={<InventoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;