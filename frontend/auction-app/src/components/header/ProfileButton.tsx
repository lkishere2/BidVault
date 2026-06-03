import { useNavigate } from 'react-router-dom';

interface ProfileButtonProps {
    username: string;
    initials: string;
    profileImageUrl?: string;
    onLogout?: () => void;
}

export default function ProfileButton({ username, initials, profileImageUrl }: ProfileButtonProps) {
    const navigate = useNavigate();
    const rawProfile = (profileImageUrl as any) ?? (profileImageUrl as any) ?? undefined;
    const resolvedProfile = rawProfile;
    const avatarUrl = resolvedProfile
        ? resolvedProfile.startsWith('http')
            ? resolvedProfile
            : `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${resolvedProfile}`
        : null;

    return (
        <button
            onClick={() => navigate('/account/overview')}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                height: '44px',
                padding: '0 16px 0 8px',
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
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                {avatarUrl ? (
                    <img src={avatarUrl} alt={`${username} avatar`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#F5C518',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#0D0D0D',
                            letterSpacing: '0.02em',
                        }}
                    >
                        {initials}
                    </div>
                )}
            </div>

            <span
                style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#0D0D0D',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {username}
            </span>
        </button>
    );
}