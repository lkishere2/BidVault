import React, { useEffect, useState } from 'react';
import { auctionApi } from '../../../../api/auctionApi';
import type { AuctionResponse } from '../../../../types/auction';
import UserAuctionItem from './UserAuctionItem';
import UserAuctionInfo from './UserAuctionInfo';
import UserAuctionGridLoading from './UserAuctionGridLoading';

interface UserAuctionGridProps {
    userId: number;
}

export const UserAuctionGrid: React.FC<UserAuctionGridProps> = ({ userId }) => {
    const [auctions, setAuctions] = useState<AuctionResponse[]>([]);
    const [selectedAuction, setSelectedAuction] = useState<AuctionResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        auctionApi.getMyAuctions(userId, 0, 10)
            .then((res) => {
                const data = res.data as unknown as { content?: AuctionResponse[] } | AuctionResponse[];
                if (Array.isArray(data)) {
                    setAuctions(data);
                } else {
                    setAuctions(data?.content || []);
                }
            })
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, [userId]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>Auctions</h3>
            {isLoading ? (
                <UserAuctionGridLoading />
            ) : auctions.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>No auctions posted yet.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                    {auctions.map((auction) => (
                        <UserAuctionItem
                            key={auction.id}
                            auction={auction}
                            onClick={() => setSelectedAuction(auction)}
                        />
                    ))}
                </div>
            )}
            {selectedAuction && (
                <UserAuctionInfo
                    auction={selectedAuction}
                    onClose={() => setSelectedAuction(null)}
                />
            )}
        </div>
    );
};

export default UserAuctionGrid;