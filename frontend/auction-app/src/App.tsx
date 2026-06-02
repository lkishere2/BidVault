import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import HomePage from './pages/user/home/HomePage';
import AdminPage from './pages/admin/home/AdminPage';
import AdminNavbar from './pages/admin/AdminNavbar';
import TransactionPage from './pages/admin/transaction/TransactionPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyPage from './pages/auth/VerifyPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ForgotPasswordVerifyPage from './pages/auth/ForgotPasswordVerifyPage';
import AccountNavbar from './pages/user/user/AccountNavbar';
import OverviewPage from './pages/user/user/overview/OverviewPage';
import OverviewPageLoading from './pages/user/user/overview/OverViewPageLoading';
import BalancePage from './pages/user/user/balance/BalancePage';
import StoragePage from './pages/user/user/storage/StoragePage';
import SettingPage from './pages/user/user/setting/SettingPage';
import HubPage from './pages/user/market/hub/HubPage';
import CommunityPage from './pages/user/community/CommunityPage';
import ProfilePage from './pages/user/community/ProfilePage';
import { userApi } from './api/userApi';
import './App.css';

const MyBidsPage = () => <div className="p-4"><h1 className="text-xl font-bold">My Bids</h1></div>;
const AdminUserControlPage = () => <div className="p-4"><h1 className="text-xl font-bold">User Control Panel</h1></div>;

type UserData = { id?: string | number; username: string; initials: string; role?: string };

function RootLayout({
  user, isLoggedIn, onLogout,
}: {
  user?: UserData;
  isLoggedIn: boolean;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50/50">
      <Header user={user} isLoggedIn={isLoggedIn} isAdmin={user?.role === 'ADMIN'} onLogout={onLogout} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

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
    const syncUser = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) return;

      try {
        const response = await userApi.getInfo();
        const { id, username, role } = response.data;
        const initials = username
          .split(/[\s._-]+/)
          .slice(0, 2)
          .map((w: string) => w[0].toUpperCase())
          .join('');

        setUser({ id, username, initials, role });
      } catch (error) {
        console.error(error);
        setUser(null);
      }
    };

    syncUser();
  }, []);

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

          <Route path="/community" element={<CommunityPage />} />
          <Route path="/profile/:user_id" element={<ProfilePage />} />
          <Route path="/auctions/hub" element={<HubPage />} />
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
            <Route path="balance" element={<BalancePage />} />
            <Route path="storage" element={<StoragePage />} />
            <Route path="settings" element={<SettingPage />} />
          </Route>

          <Route path="/admin" element={<AdminNavbar />}>
            <Route index element={<AdminPage />} />
            <Route path="user-control" element={<AdminUserControlPage />} />
            <Route path="transaction-request" element={<TransactionPage />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;