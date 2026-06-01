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
import AccountNavbar from './pages/user/user/AccountNavbar';
import OverviewPage from './pages/user/user/overview/OverviewPage';
import OverviewPageLoading from './pages/user/user/overview/OverViewPageLoading';
import StoragePage from './pages/user/user/storage/StoragePage';
import SettingPage from './pages/user/user/setting/SettingPage';
import HubPage from './pages/user/market/hub/HubPage';
import CommunityPage from './pages/user/community/CommunityPage';
import ProfilePage from './pages/user/community/ProfilePage';
import { userApi } from './api/userApi';
import './App.css';

const MyBidsPage = () => <div className="p-4"><h1 className="text-xl font-bold">My Bids</h1></div>;

const AccountBalance = () => <div><h2 className="text-xl font-bold mb-4">Balance</h2><p className="text-neutral-500 text-sm">Manage transactions and funds wallet setup.</p></div>;

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
    const syncUser = async () => {
      const token = localStorage.getItem('accessToken');

      if (token && !user?.id) {
        try {
          const response = await userApi.getInfo();
          const { id, username } = response.data;
          const initials = username
            .split(/[\s._-]+/)
            .slice(0, 2)
            .map((w: string) => w?.toUpperCase() ?? '')
            .join('');

          setUser({ id, username, initials });
        } catch (error) {
          console.error(error);
          setUser(null);
        }
      }
    };

    syncUser();
  }, [user?.id]);

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
            <Route path="balance" element={<AccountBalance />} />
            <Route path="storage" element={<StoragePage />} />
            <Route path="settings" element={<SettingPage />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;