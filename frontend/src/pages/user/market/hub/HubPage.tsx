import { useState } from 'react';
import { Gavel } from 'lucide-react';
import type { AuctionFindingRequest } from '../../../../types/auction';
import SearchBar from './SearchBar';
import AuctionHub from './AuctionHub';

export default function HubPage() {
    const [filters, setFilters] = useState<AuctionFindingRequest>({});

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-8 h-8 rounded-[8px] bg-[#0D0D0D] flex items-center justify-center flex-shrink-0">
                            <Gavel size={14} color="#F5C518" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-[26px] sm:text-[30px] font-black text-[#0D0D0D] tracking-[-0.03em] leading-none">
                            Auction Hub
                        </h1>
                    </div>
                    <p className="text-[14px] text-neutral-500 font-medium ml-[42px]">
                        Discover live and upcoming auctions
                    </p>
                </div>

                <div className="mb-6">
                    <SearchBar onSearch={setFilters} />
                </div>

                <AuctionHub filters={filters} />
            </div>
        </div>
    );
}