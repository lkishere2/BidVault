import React, { useEffect, useState } from 'react';
import { connectionApi } from '../../../../api/connectionApi';
import { userApi } from '../../../../api/userApi';
import type { UserStats } from '../../../../types/connection';
import type { UserResponse } from '../../../../types/user';
import UserInfoLoading from './UserInfoLoading';

interface UserInfoProps {
    userId: number;
}

export const UserInfo: React.FC<UserInfoProps> = ({ userId }) => {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOverviewData = async () => {
            setIsLoading(true);
            try {
                const [userRes, statsRes] = await Promise.all([
                    userApi.getInfo(),
                    connectionApi.getStats(userId)
                ]);

                setUser(userRes.data);
                setStats(statsRes.data);
            } catch (error) {
                console.error("Failed to load user overview info:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOverviewData();
    }, [userId]);

    // Create a dynamic avatar based on the username with your brand colors
    const defaultAvatar = `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=F5C518&color=0D0D0D&size=128&font-weight=bold`;

    const avatarUrl = user?.profileImageUrl
        ? user.profileImageUrl.startsWith('http')
            ? user.profileImageUrl
            : `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${user.profileImageUrl}`
        : defaultAvatar;

    if (isLoading) {
        return <UserInfoLoading />;
    }

    return (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <img
                src={avatarUrl}
                alt={user?.username}
                style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }}
            />
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