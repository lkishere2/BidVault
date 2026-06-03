import React from 'react';
import UserInfo from './UserInfo';
import UserAuctionGrid from './UserAuctionGrid';

interface OverviewPageProps {
    userId: number;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ userId }) => {
    return (
        <div className="flex flex-col w-full gap-8">
            <UserInfo key={`info-${userId}`} userId={userId} />
            <UserAuctionGrid key={`grid-${userId}`} userId={userId} />
        </div>
    );
};

export default OverviewPage;