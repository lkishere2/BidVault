import React, { useEffect, useState } from 'react';
import { auctionApi } from '../../../../api/auctionApi';
import type { AuctionResponse } from '../../../../types/auction';
import UserAuctionItem from './UserAuctionItem';
import UserAuctionInfo from './UserAuctionInfo';
import UserAuctionGridLoading from './UserAuctionGridLoading';

interface UserAuctionGridProps {
    userId: number;
    isMe?: boolean;
}

export const UserAuctionGrid: React.FC<UserAuctionGridProps> = ({ userId, isMe = false }) => {
    const [auctions, setAuctions] = useState<AuctionResponse[]>([]);
    const [selectedAuction, setSelectedAuction] = useState<AuctionResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetchAuctions = async () => {
            setIsLoading(true);
            try {
                const res = isMe
                    ? await auctionApi.getMyAuctions(0, 10)
                    : await auctionApi.getDiscoverableAuctions({ status: 'ACTIVE' }, 0, 20);

                if (cancelled) return;

                const data = res.data as unknown as { content?: AuctionResponse[] } | AuctionResponse[];
                let rawList = Array.isArray(data) ? data : (data?.content ?? []);

                if (!isMe) {
                    rawList = rawList.filter(auction => auction.sellerId === userId);
                }

                setAuctions(rawList);
            } catch (error) {
                console.error(error);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchAuctions();

        return () => { cancelled = true; };
    }, [userId, isMe]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '32px' }}>
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