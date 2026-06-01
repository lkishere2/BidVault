import React, { useEffect, useState } from 'react';
import userApi from '../../../api/userApi';
import type { UserResponse } from '../../../types/user';
import { ProfilePicture } from './ProfilePicture';
import { ProfileStat } from './ProfileStat';
import { EditProfileButton } from './EditProfileButton';
import { MyStorage } from './MyStorage';

export const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const response = await userApi.getInfo();
                setUser(response.data);
            } catch (err) {
                console.error("Failed to load user info:", err);
                setError("Could not load user profile details.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48 text-[#F5C518] animate-pulse">
                Loading profile...
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex justify-center items-center h-48 text-red-500 font-medium">
                {error || "Profile not found"}
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-8 py-8 bg-white border border-[#E8E8E8] rounded-2xl shadow-sm my-8">

            {/* Main row: avatar + info + actions */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

                {/* Avatar */}
                <ProfilePicture avatarUrl={user.avatarUrl} />

                {/* Info block */}
                <div className="flex-1 flex flex-col gap-3 items-center sm:items-start">

                    {/* Name row */}
                    <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
                        <h1 className="text-[22px] font-bold tracking-tight text-[#0D0D0D]">
                            {user.username}
                        </h1>
                        <span className="bg-[#F5C518] text-[#0D0D0D] px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                            Verified
                        </span>
                    </div>

                    {/* Sub-info */}
                    <p className="text-[13px] text-[#888] font-medium">
                        Level 4 Elite&nbsp;&nbsp;·&nbsp;&nbsp;
                        <span className="font-mono text-[#0D0D0D]">Escrow: 0xSCDs...YxoSmTh6</span>
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-6 mt-1">
                        <ProfileStat count={3} label="Active Bids" highlight={true} />
                        <div className="w-px h-6 bg-[#E8E8E8]" />
                        <ProfileStat count={14} label="Auctions Won" />
                        <div className="w-px h-6 bg-[#E8E8E8]" />
                        <ProfileStat count={0} label="Items Listed" />
                    </div>
                </div>

                {/* Actions — pinned right on wide screens */}
                <div className="flex flex-row sm:flex-col gap-2 items-center sm:items-end shrink-0 mt-1">
                    <MyStorage />
                    <EditProfileButton />
                </div>
            </div>
        </div>
    );
};