import React, { useState } from 'react';
import { X, Trash2, Mail, Wallet, Shield, User as UserIcon } from 'lucide-react';
import type { UserResponse } from '../../../types/user';

const theme = {
    gold: '#F5C518',
    black: '#0D0D0D',
    white: '#FFFFFF',
    goldDark: '#D4A900',
} as const;

interface UserInfoModalProps {
    user: UserResponse;
    onClose: () => void;
    onDelete: (user: UserResponse) => void;
}

export const UserInfoModal: React.FC<UserInfoModalProps> = ({ user, onClose, onDelete }) => {
    const [confirmDelete, setConfirmDelete] = useState(false);

    const avatarUrl = user.profileImageUrl
        ? user.profileImageUrl.startsWith('http')
            ? user.profileImageUrl
            : `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${user.profileImageUrl}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=F5C518&color=0D0D0D&size=128&bold=true`;

    const isAdmin = user.role === 'ADMIN';

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', width: '90%', maxWidth: '440px', overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.15)', animation: 'modalIn 0.2s ease', position: 'relative' }}>
                <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

                {/* Gold header strip */}
                <div style={{ height: '4px', background: theme.gold }} />

                <div style={{ padding: '28px' }}>
                    {/* Close */}
                    <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer', display: 'flex', padding: '4px' }}>
                        <X size={20} />
                    </button>

                    {/* Avatar + name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <img src={avatarUrl} alt={user.username} style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${isAdmin ? theme.gold : '#e5e7eb'}`, flexShrink: 0 }} />
                        <div>
                            <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>{user.username}</h2>
                            <span style={{
                                fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                                padding: '3px 8px', borderRadius: '4px',
                                background: isAdmin ? `${theme.gold}20` : '#f3f4f6',
                                color: isAdmin ? '#92400e' : '#6b7280',
                                border: `1px solid ${isAdmin ? theme.gold + '60' : '#e5e7eb'}`,
                                textTransform: 'uppercase',
                            }}>{user.role}</span>
                        </div>
                    </div>

                    {/* Info rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                        {[
                            { icon: <UserIcon size={14} color="#9ca3af" />, label: 'ID', value: `#${user.id}`, valueColor: '#1f2937' },
                            { icon: <Mail size={14} color="#9ca3af" />, label: 'Email', value: user.email || '—', valueColor: '#1f2937' },
                            { icon: <Wallet size={14} color="#9ca3af" />, label: 'Balance', value: `$${user.balance}`, valueColor: '#16a34a' },
                            { icon: <Shield size={14} color="#9ca3af" />, label: 'Role', value: user.role, valueColor: isAdmin ? '#92400e' : '#1f2937' },
                        ].map(({ icon, label, value, valueColor }) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                                {icon}
                                <span style={{ fontSize: '12px', color: '#9ca3af', width: '56px', flexShrink: 0 }}>{label}</span>
                                <span style={{ fontSize: '14px', color: valueColor, fontWeight: 600 }}>{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Delete section */}
                    {!confirmDelete ? (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            style={{
                                width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                                padding: '10px 0', borderRadius: '8px',
                                border: '1px solid #fecaca', background: '#fff5f5',
                                color: '#dc2626', fontWeight: 600, fontSize: '14px',
                                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#dc2626'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.borderColor = '#fecaca'; }}
                        >
                            <Trash2 size={14} /> Delete User
                        </button>
                    ) : (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                            <p style={{ margin: '0 0 4px 0', color: '#dc2626', fontWeight: 700, fontSize: '15px' }}>Delete {user.username}?</p>
                            <p style={{ margin: '0 0 14px 0', color: '#9ca3af', fontSize: '13px' }}>This cannot be undone.</p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    style={{ flex: 1, padding: '8px 0', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => onDelete(user)}
                                    style={{ flex: 1, padding: '8px 0', borderRadius: '6px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }}
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserInfoModal;