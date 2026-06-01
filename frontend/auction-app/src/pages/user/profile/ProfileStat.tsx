import React from 'react';

interface ProfileStatProps {
    count: number;
    label: string;
    highlight?: boolean;
}

export const ProfileStat: React.FC<ProfileStatProps> = ({ count, label, highlight }) => {
    return (
        <div className="flex flex-col items-center sm:items-start gap-0.5">
            <span className={`text-[18px] font-bold leading-none ${highlight ? 'text-[#F5C518]' : 'text-[#0D0D0D]'}`}>
                {count}
            </span>
            <span className="text-[11px] text-[#999] uppercase tracking-wider font-medium whitespace-nowrap">
                {label}
            </span>
        </div>
    );
};