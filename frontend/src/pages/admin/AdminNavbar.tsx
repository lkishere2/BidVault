import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, MessageSquare } from 'lucide-react';
import AdminNavItem from './AdminNavItem';

export default function AdminNavbar() {
    return (
        <div className="bg-neutral-50/60 min-h-[calc(100vh-72px)] w-full transition-colors">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8">
                {/* Left Sidebar */}
                <aside className="w-full md:w-[240px] flex-shrink-0">
                    <div className="bg-white border border-neutral-200/80 rounded-xl p-3 flex flex-col gap-1 shadow-sm sticky top-24">
                        <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-[.1em] text-neutral-400">
                            Management
                        </div>
                        <AdminNavItem to="/admin" icon={<LayoutDashboard size={17} strokeWidth={2} />} label="Dashboard" />
                        <AdminNavItem to="/admin/user-control" icon={<Users size={17} strokeWidth={2} />} label="User Control" />
                        <AdminNavItem to="/admin/transaction-request" icon={<CreditCard size={17} strokeWidth={2} />} label="Transactions" />
                        <AdminNavItem to="/admin/feedback" icon={<MessageSquare size={17} strokeWidth={2} />} label="Feedback" />
                    </div>
                </aside>

                {/* Main Work Area */}
                <main className="flex-1 bg-white border border-neutral-200/80 rounded-xl p-6 sm:p-8 min-h-[550px] shadow-sm">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}