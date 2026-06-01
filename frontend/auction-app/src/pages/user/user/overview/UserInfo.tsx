import React, { useEffect, useState } from 'react';
import { connectionApi } from '../../../../api/connectionApi';
import { userApi } from '../../../../api/userApi';
import type { UserStats } from '../../../../types/connection';
import type { UserResponse } from '../../../../types/user';
import UserInfoLoading from './UserInfoLoading';

interface UserInfoProps {
    userId: number;
}

interface AxiosResponseWrapper<T> {
    data: T;
}

export const UserInfo: React.FC<UserInfoProps> = ({ userId }) => {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            userApi.getInfo(userId)
                .then((res: AxiosResponseWrapper<UserResponse>) => setUser(res.data))
                .catch(() => { }),
            connectionApi.getStats(userId)
                .then((res: AxiosResponseWrapper<UserStats>) => setStats(res.data))
                .catch(() => { })
        ]).finally(() => setIsLoading(false));
    }, [userId]);

    const avatarUrl = user?.profileImageUrl
        ? `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${user.profileImageUrl}`
        : '';

    if (isLoading) {
        return <UserInfoLoading />;
    }

    return (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={user?.username}
                    style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }}
                />
            ) : (
                <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#9ca3af', border: '2px solid #e5e7eb' }}>
                    👤
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                    {user ? user.username : `User #${userId}`}
                </h2>
                {user?.email && <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>{user.email}</p>}

                {stats && (
                    <div style={{ display: 'flex', gap: '20px', margin: '4px 0' }}>
                        <span style={{ fontSize: '14px', color: '#4b5563' }}><strong style={{ color: '#1f2937' }}>{stats.followersCount}</strong> Followers</span>
                        <span style={{ fontSize: '14px', color: '#4b5563' }}><strong style={{ color: '#1f2937' }}>{stats.followingCount}</strong> Following</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserInfo;