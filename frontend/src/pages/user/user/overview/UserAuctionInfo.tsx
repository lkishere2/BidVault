import React, { useState } from 'react';
import type { AuctionResponse } from '../../../../types/auction';
import { ImageViewerModal } from '../../../../components/ui/ImageViewerModal';

interface UserAuctionInfoProps {
    auction: AuctionResponse;
    onClose: () => void;
    isMe?: boolean;
    onCancel?: (id: number) => void;
}

export const UserAuctionInfo: React.FC<UserAuctionInfoProps> = ({ auction, onClose, isMe, onCancel }) => {
    const [viewerImage, setViewerImage] = useState<string | null>(null);

    // Smart image URL handler with a modern placeholder
    const imageUrl = auction.productImageUrl
        ? auction.productImageUrl.startsWith('http')
            ? auction.productImageUrl
            : `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${auction.productImageUrl}`
        : 'https://placehold.co/600x400/f3f4f6/9ca3af?text=No+Image';

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
            <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', width: '90%', maxWidth: '540px', maxHeight: '85vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'transparent', fontSize: '24px', color: '#9ca3af', cursor: 'pointer', outline: 'none' }}>✕</button>

                <h2 style={{ margin: '0 0 16px 0', fontSize: '22px', fontWeight: '700', color: '#1f2937', paddingRight: '24px' }}>{auction.productName}</h2>
                <img 
                    src={imageUrl} 
                    alt={auction.productName} 
                    style={{ width: '100%', maxHeight: '260px', objectFit: 'cover', borderRadius: '8px', background: '#f3f4f6', marginBottom: '20px', cursor: 'zoom-in' }} 
                    onClick={() => setViewerImage(imageUrl)}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>
                    <div><span style={{ color: '#6b7280', fontSize: '13px' }}>Status</span><div style={{ fontWeight: '600', color: '#1f2937', marginTop: '2px' }}>{auction.status}</div></div>
                    <div><span style={{ color: '#6b7280', fontSize: '13px' }}>Total Bids</span><div style={{ fontWeight: '600', color: '#1f2937', marginTop: '2px' }}>{auction.bidCount}</div></div>
                    <div><span style={{ color: '#6b7280', fontSize: '13px' }}>Starting Price</span><div style={{ fontWeight: '600', color: '#1f2937', marginTop: '2px' }}>${auction.startingPrice}</div></div>
                    <div><span style={{ color: '#6b7280', fontSize: '13px' }}>Current Price</span><div style={{ fontWeight: '600', color: '#16a34a', marginTop: '2px' }}>${auction.currentPrice}</div></div>
                    <div><span style={{ color: '#6b7280', fontSize: '13px' }}>Quantity</span><div style={{ fontWeight: '600', color: '#1f2937', marginTop: '2px' }}>{auction.auctionedQuantity}</div></div>
                    <div><span style={{ color: '#6b7280', fontSize: '13px' }}>Extended</span><div style={{ fontWeight: '600', color: '#1f2937', marginTop: '2px' }}>{auction.extended ? 'Yes' : 'No'}</div></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 0', borderBottom: auction.productDescription ? '1px solid #e5e7eb' : 'none' }}>
                    <div style={{ fontSize: '13px', color: '#4b5563' }}><strong style={{ color: '#1f2937' }}>Starts:</strong> {new Date(auction.startTime).toLocaleString()}</div>
                    <div style={{ fontSize: '13px', color: '#4b5563' }}><strong style={{ color: '#1f2937' }}>Ends:</strong> {new Date(auction.endTime).toLocaleString()}</div>
                </div>

                {auction.productDescription && (
                    <div style={{ paddingTop: '16px' }}>
                        <span style={{ color: '#6b7280', fontSize: '13px' }}>Description</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>{auction.productDescription}</p>
                    </div>
                )}

                {auction.productTags && auction.productTags.length > 0 && (
                    <div style={{ marginTop: '20px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {auction.productTags.map((tag: unknown, idx) => (
                            <span key={idx} style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '500' }}>
                                {tag && typeof tag === 'object' && 'name' in tag ? String((tag as { name: unknown }).name) : String(tag)}
                            </span>
                        ))}
                    </div>
                )}

                {isMe && (auction.status === 'UPCOMING' || (auction.status === 'ACTIVE' && auction.bidCount === 0)) && onCancel && (
                    <button 
                        onClick={() => onCancel(auction.id)}
                        style={{ marginTop: '24px', width: '100%', padding: '12px', background: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none', transition: 'background 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}
                    >
                        Cancel Auction
                    </button>
                )}
            </div>
            {viewerImage && <ImageViewerModal imageUrl={viewerImage} onClose={() => setViewerImage(null)} />}
        </div>
    );
};

export default UserAuctionInfo;