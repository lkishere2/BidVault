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
        <div className="w-full bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 md:gap-6 text-center sm:text-left">
                <img src={avatarUrl} alt={user?.username || 'User Avatar'} className="w-24 h-24 rounded-full object-cover border-4 border-neutral-50 shadow-sm" />
                <div className="flex flex-col gap-1.5">
                    <h2 className="text-[22px] md:text-[26px] font-black text-[#0D0D0D] tracking-tight">
                        {user ? user.username : `User #${userId}`}
                    </h2>
                    {isMe && user?.email && <p className="text-[14px] font-medium text-neutral-500">{user.email}</p>}
                    {isMe && user?.balance && <p className="text-[14px] font-bold text-[#F5C518]">Balance: ${user.balance}</p>}

                    {stats && (
                        <div className="flex items-center justify-center sm:justify-start gap-4 mt-2">
                            <span className="text-[13px] font-medium text-neutral-500"><strong className="text-[#0D0D0D] font-black">{stats.followersCount ?? 0}</strong> Followers</span>
                            <span className="text-[13px] font-medium text-neutral-500"><strong className="text-[#0D0D0D] font-black">{stats.followingCount ?? 0}</strong> Following</span>
                        </div>
                    )}
                </div>
            </div>

            {!isMe && currentUserId !== undefined && (
                <button
                    onClick={handleFollowToggle}
                    className={`px-8 py-3 rounded-xl text-[14px] font-bold transition-all duration-200 ${
                        isFollowing 
                        ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200' 
                        : 'bg-[#0D0D0D] text-white hover:bg-[#F5C518] hover:text-[#0D0D0D]'
                    }`}
                >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
            )}
        </div>
    );
};

export default UserInfo;