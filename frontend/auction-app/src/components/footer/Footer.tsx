import { useNavigate } from 'react-router-dom';
import { Gavel } from 'lucide-react';

const PLATFORM_LINKS = [
    { label: 'Home', to: '/' },
    { label: 'Market', to: '/market' },
    { label: 'Explore', to: '/explore' },
    { label: 'Live auctions', to: '/market?filter=live' },
];

const SUPPORT_LINKS = [
    { label: 'Help center', to: '/support/help' },
    { label: 'Contact us', to: '/support/contact' },
    { label: 'Report an issue', to: '/support/report' },
    { label: 'Status', to: '/status' },
];

const LEGAL_LINKS = [
    { label: 'Terms of service', to: '/legal/terms' },
    { label: 'Privacy policy', to: '/legal/privacy' },
    { label: 'Cookie policy', to: '/legal/cookies' },
    { label: 'Seller agreement', to: '/legal/seller' },
];

const SOCIALS: { label: string; href: string; icon: string }[] = [
    { label: 'X / Twitter', href: 'https://x.com', icon: 'twitter' },
    { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
    { label: 'Discord', href: 'https://discord.com', icon: 'discord' },
    { label: 'Facebook', href: 'https://facebook.com', icon: 'facebook' },
];

const colTitleStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#0D0D0D',
    marginBottom: '14px',
};

const colLinkStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    color: '#555',
    textDecoration: 'none',
    marginBottom: '10px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: 'inherit',
    textAlign: 'left',
};

export default function Footer() {
    const navigate = useNavigate();

    return (
        <footer
            style={{
                width: '100%',
                background: '#fff',
                borderTop: '1px solid #0D0D0D',
            }}
        >
            <div
                style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '40px 24px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '32px',
                }}
            >
                {/* Top grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
                        gap: '24px',
                    }}
                >
                    {/* Brand */}
                    <div>
                        <button
                            onClick={() => navigate('/')}
                            aria-label="BidMarket home"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '9px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                marginBottom: '12px',
                            }}
                        >
                            <div
                                style={{
                                    width: '30px',
                                    height: '30px',
                                    background: '#0D0D0D',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <Gavel size={15} color="#F5C518" strokeWidth={2} aria-hidden />
                            </div>
                            <span
                                style={{
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    color: '#0D0D0D',
                                    letterSpacing: '-0.04em',
                                }}
                            >
                                BidMarket
                            </span>
                        </button>
                        <p
                            style={{
                                fontSize: '13px',
                                color: '#888',
                                lineHeight: 1.6,
                                maxWidth: '200px',
                            }}
                        >
                            The live auction platform for collectors, sellers, and serious bidders.
                        </p>
                    </div>

                    {/* Platform */}
                    <div>
                        <p style={colTitleStyle}>Platform</p>
                        {PLATFORM_LINKS.map((link) => (
                            <button
                                key={link.to}
                                onClick={() => navigate(link.to)}
                                style={colLinkStyle}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#0D0D0D')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    {/* Support */}
                    <div>
                        <p style={colTitleStyle}>Support</p>
                        {SUPPORT_LINKS.map((link) => (
                            <button
                                key={link.to}
                                onClick={() => navigate(link.to)}
                                style={colLinkStyle}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#0D0D0D')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    {/* Legal */}
                    <div>
                        <p style={colTitleStyle}>Legal</p>
                        {LEGAL_LINKS.map((link) => (
                            <button
                                key={link.to}
                                onClick={() => navigate(link.to)}
                                style={colLinkStyle}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#0D0D0D')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '0.5px solid #0D0D0D22',
                        paddingTop: '20px',
                    }}
                >
                    <span style={{ fontSize: '12px', color: '#888' }}>
                        © {new Date().getFullYear()} BidMarket. All rights reserved.
                    </span>

                    {/* Socials */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {SOCIALS.map((s) => (
                            <a
                                key={s.label}
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={s.label}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    border: '1px solid #0D0D0D22',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#888',
                                    fontSize: '15px',
                                    textDecoration: 'none',
                                    transition: 'border-color 0.15s, color 0.15s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#F5C518';
                                    e.currentTarget.style.color = '#F5C518';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#0D0D0D22';
                                    e.currentTarget.style.color = '#888';
                                }}
                            >
                                <i className={`ti ti-brand-${s.icon}`} aria-hidden="true" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}