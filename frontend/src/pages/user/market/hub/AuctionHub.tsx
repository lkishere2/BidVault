import { useState, useEffect, useCallback } from 'react';
import { Gavel, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AuctionResponse, AuctionFindingRequest } from '../../../../types/auction';
import type { Page } from '../../../../types/pagination';
import auctionApi from '../../../../api/auctionApi';
import { useNavigate } from 'react-router-dom';
import AuctionItem from './AuctionItem';
import AuctionItemSkeleton from './AuctionItemSkeleton';

const PAGE_SIZE = 12;

interface AuctionHubProps {
    filters: AuctionFindingRequest;
}

export default function AuctionHub({ filters }: AuctionHubProps) {
    const [page, setPage] = useState<Page<AuctionResponse> | null>(null);
    const [pageNo, setPageNo] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchAuctions = useCallback(async (targetPageNo: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await auctionApi.getDiscoverableAuctions(filters, targetPageNo, PAGE_SIZE);
            const rawData = res.data as any;

            if (rawData && Array.isArray(rawData.content) && !rawData.items) {
                setPage({
                    items: rawData.content,
                    totalItems: rawData.totalElements ?? rawData.content.length,
                    totalPages: rawData.totalPages ?? 1,
                    currentPage: rawData.number ?? targetPageNo,
                    pageSize: rawData.size ?? PAGE_SIZE,
                    hasNextPage: rawData.last === false,
                    hasPreviousPage: rawData.first === false
                });
            } else {
                setPage(rawData);
            }
        } catch {
            setError('Failed to load auctions. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        setPageNo(0);
        fetchAuctions(0);
    }, [filters, fetchAuctions]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                    <Gavel size={20} className="text-red-400" strokeWidth={1.5} />
                </div>
                <p className="text-[14px] font-semibold text-neutral-600">{error}</p>
                <button
                    type="button"
                    onClick={() => fetchAuctions(pageNo)}
                    className="mt-1 px-4 py-2 rounded-lg bg-[#0D0D0D] text-white text-[13px] font-semibold cursor-pointer hover:bg-[#F5C518] hover:text-[#0D0D0D] transition-all"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!loading && (!page || !page.items || page.items.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center">
                    <Gavel size={24} className="text-neutral-300" strokeWidth={1.5} />
                </div>
                <p className="text-[16px] font-bold text-neutral-700">No auctions found</p>
                <p className="text-[13px] text-neutral-400 text-center max-w-[280px]">
                    Try adjusting your filters or check back soon for new listings.
                </p>
            </div>
        );
    }

    const totalPages = page?.totalPages ?? 1;

    const handlePageChange = (newPageNo: number) => {
        setPageNo(newPageNo);
        fetchAuctions(newPageNo);
    };

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading
                    ? Array.from({ length: PAGE_SIZE }).map((_, i) => <AuctionItemSkeleton key={i} />)
                    : page?.items.map(auction => (
                        <AuctionItem key={auction.id} auction={auction} onClick={(auction) => navigate(`/auctions/hub/${auction.id}`)} />
                    ))
                }
            </div>

            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        type="button"
                        onClick={() => handlePageChange(Math.max(0, pageNo - 1))}
                        disabled={pageNo === 0}
                        className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all bg-white"
                    >
                        <ChevronLeft size={15} strokeWidth={2} />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const p = Math.max(0, Math.min(pageNo - 2, totalPages - 5)) + i;
                        return (
                            <button
                                key={p}
                                type="button"
                                onClick={() => handlePageChange(p)}
                                className={`w-9 h-9 rounded-lg text-[13px] font-bold transition-all cursor-pointer border ${p === pageNo
                                    ? 'bg-[#0D0D0D] text-white border-[#0D0D0D]'
                                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 bg-white'
                                    }`}
                            >
                                {p + 1}
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => handlePageChange(Math.min(totalPages - 1, pageNo + 1))}
                        disabled={pageNo >= totalPages - 1}
                        className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all bg-white"
                    >
                        <ChevronRight size={15} strokeWidth={2} />
                    </button>
                </div>
            )}
        </>
    );
}