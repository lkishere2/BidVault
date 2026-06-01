import React from 'react';
import UserInfo from './UserInfo';
import UserAuctionGrid from './UserAuctionGrid';

interface OverviewPageProps {
    userId: number;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ userId }) => {
    return (
        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <UserInfo key={`info-${userId}`} userId={userId} />
            <div style={{ height: '1px', background: '#e5e7eb', width: '100%' }} />
            <UserAuctionGrid key={`grid-${userId}`} userId={userId} />
        </div>
    );
};

export default OverviewPage;