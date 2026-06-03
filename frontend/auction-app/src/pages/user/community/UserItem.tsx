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
            className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 bg-white cursor-pointer transition-all duration-200 hover:border-neutral-300 hover:shadow-sm group"
        >
            <img
                src={avatarUrl}
                alt={user.username}
                className="w-14 h-14 rounded-full object-cover"
            />
            <div className="flex flex-col gap-1">
                <h4 className="m-0 text-[16px] font-bold text-[#0D0D0D] group-hover:text-[#F5C518] transition-colors">
                    {user.username}
                </h4>
                <span className="text-[13px] font-medium text-neutral-500">
                    View Profile →
                </span>
            </div>
        </div>
    );
};

export default UserItem;