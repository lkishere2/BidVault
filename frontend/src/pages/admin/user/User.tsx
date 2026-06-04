import React, { useState } from 'react';
import { Trash2, Eye } from 'lucide-react';
import type { UserResponse } from '../../../types/user';

const theme = {
    gold: '#F5C518',
    black: '#0D0D0D',
    white: '#FFFFFF',
    goldDark: '#D4A900',
} as const;

interface UserCardProps {
    user: UserResponse;
    onView: (user: UserResponse) => void;
    onDelete: (user: UserResponse) => void;
    index: number;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onView, onDelete, index }) => {
    const [hovered, setHovered] = useState(false);
    const [deleteHovered, setDeleteHovered] = useState(false);

    const avatarUrl = user.profileImageUrl
        ? user.profileImageUrl.startsWith('http')
            ? user.profileImageUrl
            : `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${user.profileImageUrl}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=F5C518&color=0D0D0D&size=128&bold=true`;

    const isAdmin = user.role === 'ADMIN';

    return (
        <>
            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <div
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    background: hovered ? '#f9fafb' : '#ffffff',
                    border: hovered ? `1px solid ${theme.gold}80` : '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    animation: `fadeSlideIn 0.35s ease both`,
                    animationDelay: `${Math.min(index * 40, 400)}ms`,
                    boxShadow: hovered ? `0 0 0 1px ${theme.gold}20, 0 8px 24px rgba(0,0,0,0.4)` : 'none',
                    position: 'relative',
                    overflow: 'hidden',
                }}
                onClick={() => onView(user)}
            >
                {/* Gold top accent on hover */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                    background: theme.gold,
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                }} />

                {/* Avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    <img
                        src={avatarUrl}
                        alt={user.username}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${isAdmin ? theme.gold : '#e5e7eb'}`, flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user.username}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                            {user.email}
                        </div>
                    </div>
                </div>

                {/* Role badge + balance */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{
                        fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                        padding: '3px 8px', borderRadius: '4px',
                        background: isAdmin ? `${theme.gold}20` : '#f3f4f6',
                        color: isAdmin ? theme.gold : '#6b7280',
                        border: `1px solid ${isAdmin ? theme.gold + '80' : '#e5e7eb'}`,
                        textTransform: 'uppercase',
                    }}>
                        {user.role}
                    </span>
                    <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>
                        ${user.balance}
                    </span>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                    <button
                        onClick={() => onView(user)}
                        style={{
                            flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                            padding: '7px 0', borderRadius: '6px', border: 'none',
                            background: theme.gold, color: theme.black,
                            fontWeight: 700, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = theme.goldDark)}
                        onMouseLeave={e => (e.currentTarget.style.background = theme.gold)}
                    >
                        <Eye size={13} strokeWidth={2.5} /> View
                    </button>
                    <button
                        onClick={() => onDelete(user)}
                        onMouseEnter={() => setDeleteHovered(true)}
                        onMouseLeave={() => setDeleteHovered(false)}
                        style={{
                            width: '34px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            padding: '7px 0', borderRadius: '6px',
                            border: `1px solid ${deleteHovered ? '#dc2626' : '#e5e7eb'}`,
                            background: deleteHovered ? '#1a0a0a' : 'transparent',
                            color: deleteHovered ? '#dc2626' : '#4b5563',
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}
                    >
                        <Trash2 size={13} strokeWidth={2} />
                    </button>
                </div>
            </div>
        </>
    );
};

export default UserCard;