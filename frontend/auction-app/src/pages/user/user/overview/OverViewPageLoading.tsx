import React from 'react';
import UserInfoLoading from './UserInfoLoading';
import UserAuctionGridLoading from './UserAuctionGridLoading';

export const OverviewPageLoading: React.FC = () => {
    return (
        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <UserInfoLoading />
            <div style={{ height: '1px', background: '#e5e7eb', width: '100%' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>Auctions</h3>
                <UserAuctionGridLoading />
            </div>
        </div>
    );
};

export default OverviewPageLoading;