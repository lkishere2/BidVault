import React from 'react';

export const UserAuctionGridLoading: React.FC = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-3 animate-pulse">
                    <div className="w-full h-40 bg-neutral-200 rounded-lg" />
                    <div className="flex flex-col gap-2">
                        <div className="h-5 bg-neutral-200 rounded w-3/4" />
                        <div className="h-4 bg-neutral-100 rounded w-1/2" />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <div className="h-6 bg-neutral-200 rounded w-16" />
                        <div className="h-4 bg-neutral-100 rounded w-12" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserAuctionGridLoading;