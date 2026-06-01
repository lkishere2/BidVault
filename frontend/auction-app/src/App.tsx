import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import HomePage from './pages/user/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyPage from './pages/auth/VerifyPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ForgotPasswordVerifyPage from './pages/auth/ForgotPasswordVerifyPage';
import { ProfilePage } from './pages/user/profile/ProfilePage';
import { InventoryPage } from './pages/user/storage/InventoryPage';
import AccountNavbar from './pages/user/user/AccountNavbar';
import OverviewPage from './pages/user/user/overview/OverviewPage';
import OverviewPageLoading from './pages/user/user/overview/OverViewPageLoading';
import './App.css';

const OfficeDashboard = () => <div className="p-4"><h1 className="text-xl font-bold">Dashboard</h1></div>;
const ExplorePage = () => <div className="p-4"><h1 className="text-xl font-bold">Explore</h1></div>;
const AllAuctionsPage = () => <div className="p-4"><h1 className="text-xl font-bold">All Auctions</h1></div>;
const MyBidsPage = () => <div className="p-4"><h1 className="text-xl font-bold">My Bids</h1></div>;

const AccountBalance = () => <div><h2 className="text-xl font-bold mb-4">Balance</h2><p className="text-neutral-500 text-sm">Manage transactions and funds wallet setup.</p></div>;
const AccountStorage = () => <div><h2 className="text-xl font-bold mb-4">Storage</h2><p className="text-neutral-500 text-sm">Track your archived vault item storage assets.</p></div>;
const AccountSettings = () => <div><h2 className="text-xl font-bold mb-4">Settings</h2><p className="text-neutral-500 text-sm">Update security parameters and preference rules.</p></div>;

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

type UserData = { id?: string | number; username: string; initials: string };

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
        <Route
          element={
            <RootLayout
              user={user ?? undefined}
              isLoggedIn={!!user}
              onLogout={handleLogout}
            />
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forget-password" element={<ForgotPasswordPage />} />

          <Route path="/verify/user" element={<VerifyPage />} />
          <Route path="/verify/forget-password" element={<ForgotPasswordVerifyPage />} />

          <Route path="/office" element={<OfficeDashboard />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/auctions/hub" element={<AllAuctionsPage />} />
          <Route path="/auction/joined" element={<MyBidsPage />} />

          <Route path="/account" element={<AccountNavbar />}>
            <Route
              path="overview"
              element={
                user?.id ? (
                  <OverviewPage userId={Number(user.id)} />
                ) : (
                  <OverviewPageLoading />
                )
              }
            />
            <Route path="balance" element={<AccountBalance />} />
            <Route path="storage" element={<AccountStorage />} />
            <Route path="settings" element={<AccountSettings />} />
          </Route>

          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/inventory" element={<InventoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;