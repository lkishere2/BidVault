import React from 'react';
import type { UserResponse } from '../../../types/user';

interface UserItemProps {
    user: UserResponse;
    onClick: () => void;
}

export const UserItem: React.FC<UserItemProps> = ({ user, onClick }) => {
    const defaultAvatar = `https://ui-avatars.com/api/?name=${user.username}&background=F5C518&color=0D0D0D&size=128&font-weight=bold`;

    const avatarUrl = user.profileImageUrl
        ? user.profileImageUrl.startsWith('http')
            ? user.profileImageUrl
            : `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${user.profileImageUrl}`
        : defaultAvatar;

    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: '#ffffff',
                cursor: 'pointer'
            }}
        >
            <img
                src={avatarUrl}
                alt={user.username}
                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                    {user.username}
                </h4>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    View Profile →
                </span>
            </div>
        </div>
    );
};

export default UserItem;