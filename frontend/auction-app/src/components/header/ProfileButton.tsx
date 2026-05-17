import { ChevronDown, User, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProfileButtonProps {
    username: string;
    initials: string;
    onLogout?: () => void;
}

export default function ProfileButton({ username, initials, onLogout }: ProfileButtonProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen((prev) => !prev)}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    height: '36px',
                    padding: '0 12px 0 6px',
                    background: '#FFFFFF',
                    border: '1px solid #0D0D0D',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F9F9F9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
            >
                {/* Gold avatar */}
                <div
                    style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: '#F5C518',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#0D0D0D',
                        letterSpacing: '0.02em',
                        flexShrink: 0,
                    }}
                >
                    {initials}
                </div>

                <span
                    style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#0D0D0D',
                        maxWidth: '96px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {username}
                </span>

                <ChevronDown
                    size={13}
                    color="#0D0D0D"
                    strokeWidth={2}
                    style={{
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                    }}
                    aria-hidden
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        minWidth: '160px',
                        background: '#FFFFFF',
                        border: '1px solid #0D0D0D',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        zIndex: 50,
                    }}
                >
                    <button
                        onClick={() => { navigate('/profile'); setOpen(false); }}
                        style={dropdownItemStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#F5C51820')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                        <User size={14} strokeWidth={2} aria-hidden />
                        My Profile
                    </button>

                    <div style={{ height: '0.5px', background: '#0D0D0D20', margin: '0 12px' }} />

                    <button
                        onClick={() => { onLogout?.(); setOpen(false); }}
                        style={{ ...dropdownItemStyle, color: '#CC0000' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#FFF0F0')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                        <LogOut size={14} strokeWidth={2} aria-hidden />
                        Log out
                    </button>
                </div>
            )}
        </div>
    );
}

const dropdownItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    fontSize: '13px',
    fontWeight: 500,
    color: '#0D0D0D',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'background 0.12s ease',
};