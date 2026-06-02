import React, { useEffect, useState } from 'react';
import { connectionApi } from '../../../../api/connectionApi';
import { userApi } from '../../../../api/userApi';
import type { UserStats } from '../../../../types/connection';
import type { UserResponse } from '../../../../types/user';
import UserInfoLoading from './UserInfoLoading';

interface UserInfoProps {
    userId: number;
    currentUserId?: number;
}

export const UserInfo: React.FC<UserInfoProps> = ({ userId, currentUserId }) => {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);

    // Determine if this profile belongs to the logged-in user.
    // If currentUserId hasn't loaded yet (undefined), we don't assume it's "me".
    const isMe = currentUserId !== undefined && currentUserId === userId;

    useEffect(() => {
        let isMounted = true;

        const fetchOverviewData = async () => {
            setIsLoading(true);
            try {
                let userDetail: UserResponse | null = null;

                // 1. Fetch main user profile information
                if (isMe) {
                    try {
                        const userRes = await userApi.getInfo();
                        userDetail = userRes.data;
                    } catch (err) {
                        console.error("Error fetching current user info:", err);
                    }
                } else {
                    try {
                        const searchRes = await userApi.searchUsers('', 0, 100);
                        // Defensively check both .items and .content arrays from the response
                        const items = searchRes?.data?.items || searchRes?.data?.content || [];
                        userDetail = items.find((u: UserResponse) => u.id === userId) || null;
                    } catch (err) {
                        console.error("Error searching user list:", err);
                    }
                }

                // Fallback placeholder if user wasn't found or API failed, preventing a blank state
                if (!userDetail) {
                    userDetail = {
                        id: userId,
                        username: `User #${userId}`,
                        email: '',
                        balance: '0',
                        role: 'USER',
                    };
                }

                if (!isMounted) return;
                setUser(userDetail);

                // 2. Fetch stats and follow relationship in parallel
                // Wrapped individually so that if one fails, it doesn't break the whole component
                try {
                    const [statsRes, followRes] = await Promise.all([
                        connectionApi.getStats(userId).catch(err => {
                            console.error("Error fetching stats:", err);
                            return { data: null };
                        }),
                        isMe
                            ? Promise.resolve({ data: false })
                            : connectionApi.checkFollowStatus(userId).catch(err => {
                                console.error("Error checking follow status:", err);
                                return { data: false };
                            })
                    ]);

                    if (isMounted) {
                        if (statsRes?.data) setStats(statsRes.data);
                        if (followRes?.data !== undefined) setIsFollowing(followRes.data);
                    }
                } catch (parallelErr) {
                    console.error("Error in parallel stats/follow fetch:", parallelErr);
                }

            } catch (error) {
                console.error("General error in fetchOverviewData:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchOverviewData();

        return () => {
            isMounted = false;
        };
    }, [userId, isMe, currentUserId]);

    const handleFollowToggle = async () => {
        try {
            await connectionApi.follow(userId);
            setIsFollowing(!isFollowing);
            const statsRes = await connectionApi.getStats(userId);
            if (statsRes?.data) {
                setStats(statsRes.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=F5C518&color=0D0D0D&size=128&font-weight=bold`;
    const avatarUrl = user?.profileImageUrl
        ? user.profileImageUrl.startsWith('http')
            ? user.profileImageUrl
            : `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${user.profileImageUrl}`
        : defaultAvatar;

    if (isLoading) return <UserInfoLoading />;

    return (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <img src={avatarUrl} alt={user?.username || 'User Avatar'} style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                        {user ? user.username : `User #${userId}`}
                    </h2>
                    {isMe && user?.email && <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>{user.email}</p>}
                    {isMe && user?.balance && <p style={{ margin: 0, color: '#16a34a', fontSize: '14px', fontWeight: '600' }}>Balance: ${user.balance}</p>}

                    {stats && (
                        <div style={{ display: 'flex', gap: '20px', margin: '4px 0' }}>
                            <span style={{ fontSize: '14px', color: '#4b5563' }}><strong style={{ color: '#1f2937' }}>{stats.followersCount ?? 0}</strong> Followers</span>
                            <span style={{ fontSize: '14px', color: '#4b5563' }}><strong style={{ color: '#1f2937' }}>{stats.followingCount ?? 0}</strong> Following</span>
                        </div>
                    )}
                </div>
            </div>

            {!isMe && currentUserId !== undefined && (
                <button
                    onClick={handleFollowToggle}
                    style={{
                        padding: '10px 24px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        border: isFollowing ? '1px solid #d1d5db' : 'none',
                        background: isFollowing ? '#ffffff' : '#1f2937',
                        color: isFollowing ? '#374151' : '#ffffff'
                    }}
                >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
            )}
        </div>
    );
};

export default UserInfo;