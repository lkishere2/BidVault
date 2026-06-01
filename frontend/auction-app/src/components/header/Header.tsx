import { useState } from 'react';
import { Gavel, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavItem from './NavItem';
import LoginButton from './LoginButton';
import ProfileButton from './ProfileButton';
import AdminButton from './AdminButton';

interface HeaderProps {
    user?: { username: string; initials: string; role?: string };
    isLoggedIn?: boolean;
    isAdmin?: boolean;
    onLogout?: () => void;
    onLogin?: () => void;
}

const NAV = [
    { label: 'Home', path: '/' },
    {
        label: 'Market',
        sub: [
            { label: 'All Auctions', path: '/auctions/hub' },
            { label: 'My Bids', path: '/auction/joined' },
        ],
    },
    { label: 'Community', path: '/community' },
];

export default function Header({ user, isLoggedIn = !!user, isAdmin = false, onLogout, onLogin }: HeaderProps) {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const close = () => setMobileOpen(false);

    return (
        <header className="sticky top-0 z-[100] w-full bg-white border-b border-[#0D0D0D]">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-[60px] sm:h-[68px] lg:h-[72px] flex items-center justify-between gap-6">
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    aria-label="BidVault home"
                    className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer p-0 flex-shrink-0"
                >
                    <div className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] bg-[#0D0D0D] rounded-[9px] flex items-center justify-center flex-shrink-0">
                        <Gavel size={16} color="#F5C518" strokeWidth={2} aria-hidden />
                    </div>
                    <span className="text-[17px] sm:text-[20px] font-bold text-[#0D0D0D] tracking-[-0.03em] leading-none">
                        BidVault
                    </span>
                </button>

                <nav className="hidden md:flex items-center gap-0 flex-1 justify-center">
                    {NAV.map(item => (
                        <NavItem key={item.label} {...item} />
                    ))}
                </nav>

                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <div className="hidden sm:flex items-center gap-2">
                        {isLoggedIn && user ? (
                            <>
                                {isAdmin && <AdminButton />}
                                <ProfileButton username={user.username} initials={user.initials} />
                                <button
                                    type="button"
                                    onClick={onLogout}
                                    title="Log out"
                                    className="w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:border-red-400 hover:text-red-500 transition-colors bg-white cursor-pointer"
                                >
                                    <LogOut size={14} strokeWidth={2} />
                                </button>
                            </>
                        ) : (
                            <div onClick={onLogin}>
                                <LoginButton />
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setMobileOpen(v => !v)}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        className="md:hidden w-[36px] h-[36px] flex items-center justify-center rounded-lg border border-neutral-200 text-[#0D0D0D] hover:border-[#F5C518] hover:text-[#F5C518] transition-colors bg-white cursor-pointer"
                    >
                        {mobileOpen ? <X size={17} strokeWidth={2} /> : <Menu size={17} strokeWidth={2} />}
                    </button>
                </div>
            </div>

            <div
                className="md:hidden border-t border-neutral-100 overflow-hidden transition-all duration-300"
                style={{ maxHeight: mobileOpen ? '420px' : '0px', opacity: mobileOpen ? 1 : 0 }}
            >
                <nav className="flex flex-col px-4 pt-2 pb-3 gap-0.5">
                    {NAV.map(item =>
                        item.sub ? (
                            <div key={item.label}>
                                <p className="px-3 pt-3 pb-1 text-[10px] font-bold tracking-[.12em] uppercase text-neutral-400">
                                    {item.label}
                                </p>
                                {item.sub.map(s => (
                                    <button
                                        key={s.path}
                                        type="button"
                                        onClick={() => { navigate(s.path); close(); }}
                                        className="w-full text-left px-3 py-2.5 text-[13px] font-semibold text-[#0D0D0D] hover:text-[#F5C518] rounded-lg hover:bg-neutral-50 transition-colors bg-transparent border-0 cursor-pointer"
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => { navigate(item.path!); close(); }}
                                className="w-full text-left px-3 py-2.5 text-[13px] font-semibold text-[#0D0D0D] hover:text-[#F5C518] rounded-lg hover:bg-neutral-50 transition-colors bg-transparent border-0 cursor-pointer"
                            >
                                {item.label}
                            </button>
                        )
                    )}

                    <div className="mt-2 pt-2 border-t border-neutral-100">
                        {isLoggedIn && user ? (
                            <div className="flex flex-col gap-2">
                                {isAdmin && (
                                    <div className="px-3 pb-2 border-b border-neutral-100 flex justify-center" onClick={close}>
                                        <AdminButton />
                                    </div>
                                )}
                                <div className="flex items-center justify-between px-3 py-2">
                                    <ProfileButton username={user.username} initials={user.initials} />
                                    <button
                                        type="button"
                                        onClick={() => { onLogout?.(); close(); }}
                                        className="flex items-center gap-1.5 text-[12px] font-semibold text-red-500 bg-transparent border-0 cursor-pointer pl-4"
                                    >
                                        <LogOut size={13} strokeWidth={2} /> Log out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div onClick={() => { onLogin?.(); close(); }} className="w-full flex justify-center py-2">
                                <LoginButton />
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}