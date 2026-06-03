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
                    : await auctionApi.getAuctionsBySellerId(userId, 0, 20);

                if (cancelled) return;

                const data = res.data as unknown as { content?: AuctionResponse[] } | AuctionResponse[];
                const rawList = Array.isArray(data) ? data : (data?.content ?? []);

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
        <div className="flex flex-col gap-6 mt-10">
            <h3 className="text-[20px] font-black text-[#0D0D0D] tracking-tight">Auctions</h3>
            {isLoading ? (
                <UserAuctionGridLoading />
            ) : auctions.length === 0 ? (
                <div className="bg-neutral-50 rounded-2xl p-10 text-center border border-neutral-100">
                    <p className="text-neutral-500 text-[14px] font-bold">No auctions posted yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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