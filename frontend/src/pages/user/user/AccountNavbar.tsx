import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Box, Settings, Bell } from 'lucide-react';

export default function AccountNavbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { label: 'Overview', path: '/account/overview', icon: <LayoutDashboard size={16} /> },
        { label: 'Balance', path: '/account/balance', icon: <Wallet size={16} /> },
        { label: 'Storage', path: '/account/storage', icon: <Box size={16} /> },
        { label: 'Notifications', path: '/account/notifications', icon: <Bell size={16} /> },
        { label: 'Settings', path: '/account/settings', icon: <Settings size={16} /> },
    ];

    return (
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col md:flex-row gap-8 lg:gap-12 w-full">
            <aside className="w-full md:w-[240px] lg:w-[260px] flex-shrink-0">
                <nav className="flex flex-row md:flex-col gap-1 sm:gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 border-b md:border-b-0 border-neutral-200">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                type="button"
                                onClick={() => navigate(item.path)}
                                className={`flex items-center gap-3 px-5 py-3.5 text-[14px] font-bold rounded-2xl cursor-pointer transition-all duration-200 border-0 whitespace-nowrap
                                    ${isActive
                                        ? 'bg-[#0D0D0D] text-[#F5C518] shadow-md hover:opacity-90'
                                        : 'bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-[#0D0D0D]'}`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        );
                    })}
                </nav>
            </aside>

            <section className="flex-1 min-w-0 w-full flex flex-col">
                <Outlet />
            </section>
        </div>
    );
}