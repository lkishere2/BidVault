import { useState, useEffect, useCallback } from 'react';
import { Gavel, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import type { AuctionResponse } from '../../../../types/auction';
import type { Page } from '../../../../types/pagination';
import bidApi from '../../../../api/bidApi';
import AuctionItem from '../hub/AuctionItem';
import AuctionItemSkeleton from '../hub/AuctionItemSkeleton';
import BidSection from '../bid/BidSection';

const PAGE_SIZE = 12;

export default function JoinedAuctionsPage() {
    const [page, setPage] = useState<Page<AuctionResponse> | null>(null);
    const [pageNo, setPageNo] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<AuctionResponse | null>(null);

    const fetchAuctions = useCallback(async (targetPageNo: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await bidApi.getAuctionsBidOn(targetPageNo, PAGE_SIZE);
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
            setError('Failed to load your joined auctions. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAuctions(0);
    }, [fetchAuctions]);

    const totalPages = page?.totalPages ?? 1;

    const handlePageChange = (newPageNo: number) => {
        setPageNo(newPageNo);
        fetchAuctions(newPageNo);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-8 h-8 rounded-[8px] bg-[#F5C518] flex items-center justify-center flex-shrink-0 shadow-sm shadow-[#F5C518]/20">
                            <Activity size={16} color="#0D0D0D" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-[26px] sm:text-[30px] font-black text-[#0D0D0D] tracking-[-0.03em] leading-none">
                            My Joined Auctions
                        </h1>
                    </div>
                    <p className="text-[14px] text-neutral-500 font-medium ml-[42px]">
                        Track all the auctions you are currently bidding on.
                    </p>
                </div>

                {error ? (
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
                ) : !loading && (!page || !page.items || page.items.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                        <div className="w-14 h-14 rounded-2xl bg-neutral-50 flex items-center justify-center">
                            <Activity size={24} className="text-neutral-300" strokeWidth={1.5} />
                        </div>
                        <p className="text-[16px] font-bold text-neutral-700">No active bids</p>
                        <p className="text-[13px] text-neutral-400 text-center max-w-[280px]">
                            You haven't placed any bids yet. Head over to the Hub to find an auction!
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {loading
                                ? Array.from({ length: PAGE_SIZE }).map((_, i) => <AuctionItemSkeleton key={i} />)
                                : page?.items.map(auction => (
                                    <AuctionItem key={auction.id} auction={auction} onClick={setSelected} />
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
                )}

                {selected && <BidSection auction={selected} onClose={() => setSelected(null)} />}
            </div>
        </div>
    );
}
