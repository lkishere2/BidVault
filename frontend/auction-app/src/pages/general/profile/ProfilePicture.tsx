import React from 'react';

interface ProfilePictureProps {
    avatarUrl?: string;
}

export const ProfilePicture: React.FC<ProfilePictureProps> = ({ avatarUrl }) => {
    return (
        <div className="relative w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0 border-2 border-[#E8E8E8] hover:border-[#F5C518] transition-all group cursor-pointer">
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                />
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-9 h-9 text-[#BBBBBB] group-hover:text-[#F5C518] transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
            )}

            {/* Online dot */}
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
        </div>
    );
};