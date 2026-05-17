import { Gavel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavItem from './NavItem';
import SearchBar from './SearchBar';
import LoginButton from './LoginButton';
import ProfileButton from './ProfileButton';

interface HeaderProps {
    isLoggedIn: boolean;
    user?: {
        username: string;
        initials: string;
    };
    onLogout?: () => void;
}

const NAV_ITEMS = [
    { label: 'Home', to: '/' },
    { label: 'Market', to: '/market' },
    { label: 'Explore', to: '/explore' },
];

export default function Header({ isLoggedIn, user, onLogout }: HeaderProps) {
    const navigate = useNavigate();

    return (
        <header
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                width: '100%',
                height: '60px',
                background: '#FFFFFF',
                borderBottom: '1px solid #0D0D0D',
            }}
        >
            <div
                style={{
                    maxWidth: '1280px',
                    height: '100%',
                    margin: '0 auto',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                }}
            >
                <button
                    onClick={() => navigate('/')}
                    aria-label="BidMarket home"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            background: '#0D0D0D',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <Gavel size={16} color="#F5C518" strokeWidth={2} aria-hidden />
                    </div>
                    <span
                        style={{
                            fontSize: '17px',
                            fontWeight: 700,
                            color: '#0D0D0D',
                            letterSpacing: '-0.03em',
                            lineHeight: 1,
                        }}
                    >
                        BidMarket
                    </span>
                </button>

                <SearchBar />

                <div style={{ flex: 1 }} />

                <nav
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                    aria-label="Main navigation"
                >
                    {NAV_ITEMS.map((item) => (
                        <NavItem key={item.to} label={item.label} to={item.to} />
                    ))}
                </nav>

                <div style={{ marginLeft: '12px' }}>
                    {isLoggedIn && user ? (
                        <ProfileButton
                            username={user.username}
                            initials={user.initials}
                            onLogout={onLogout}
                        />
                    ) : (
                        <LoginButton />
                    )}
                </div>
            </div>
        </header>
    );
}