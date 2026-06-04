import React from 'react';

export const UserInfoLoading: React.FC = () => {
    return (
        <div className="w-full bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse">
            <div className="flex flex-col sm:flex-row items-center gap-5 md:gap-6 text-center sm:text-left">
                <div className="w-24 h-24 rounded-full bg-neutral-200 border-4 border-neutral-50 shadow-sm" />
                <div className="flex flex-col gap-2 items-center sm:items-start">
                    <div className="h-7 bg-neutral-200 rounded-md w-48" />
                    <div className="h-4 bg-neutral-100 rounded-md w-32" />
                    <div className="h-4 bg-neutral-100 rounded-md w-24" />
                    <div className="flex items-center gap-4 mt-2">
                        <div className="h-4 bg-neutral-100 rounded-md w-20" />
                        <div className="h-4 bg-neutral-100 rounded-md w-20" />
                    </div>
                </div>
            </div>
            <div className="w-28 h-11 bg-neutral-200 rounded-xl" />
        </div>
    );
};

export default UserInfoLoading;