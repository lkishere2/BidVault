import React from 'react';
import type { AuctionResponse } from '../../../../types/auction';

interface UserAuctionItemProps {
    auction: AuctionResponse;
    onClick: () => void;
}

export const UserAuctionItem: React.FC<UserAuctionItemProps> = ({ auction, onClick }) => {
    // Smart image URL handler with a clean, modern placeholder
    const imageUrl = auction.productImageUrl
        ? auction.productImageUrl.startsWith('http')
            ? auction.productImageUrl
            : `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${auction.productImageUrl}`
        : 'https://placehold.co/400x300/f3f4f6/9ca3af?text=No+Image';

    return (
        <div
            onClick={onClick}
            style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                background: '#ffffff',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <img
                src={imageUrl}
                alt={auction.productName}
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px', background: '#f3f4f6' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {auction.productName}
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>
                    Current Bid: <span style={{ color: '#16a34a', fontWeight: '600' }}>${auction.currentPrice}</span>
                </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '4px' }}>
                <span style={{ fontSize: '12px', padding: '4px 8px', background: '#f3f4f6', color: '#4b5563', borderRadius: '4px', fontWeight: '500' }}>
                    {auction.status}
                </span>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {/* Fixed TypeScript Error Here by casting bidCount to a Number */}
                    {auction.bidCount} {Number(auction.bidCount) === 1 ? 'bid' : 'bids'}
                </span>
            </div>
        </div>
    );
};

export default UserAuctionItem;