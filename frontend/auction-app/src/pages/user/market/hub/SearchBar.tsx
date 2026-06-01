import { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import type { AuctionFindingRequest, AuctionStatus } from '../../../../types/auction';
import type { Tag } from '../../../../types/product';

interface SearchBarProps {
    onSearch: (filters: AuctionFindingRequest) => void;
}

const STATUS_OPTIONS: { value: AuctionStatus; label: string }[] = [
    { value: 'ACTIVE', label: 'Live Now' },
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'ENDED', label: 'Ended' },
    { value: 'CANCELLED', label: 'Cancelled' }
];

const TAG_OPTIONS: { value: Tag; label: string }[] = [
    { value: 'ELECTRONICS', label: 'Electronics' },
    { value: 'FOOD', label: 'Food' },
    { value: 'COLLECTIBLES', label: 'Collectibles' },
    { value: 'FASHION', label: 'Fashion' },
    { value: 'JEWELRY', label: 'Jewelry' },
    { value: 'ART', label: 'Art' },
    { value: 'VEHICLES', label: 'Vehicles' },
    { value: 'SPORTS', label: 'Sports' },
    { value: 'GARDENING', label: 'Gardening' },
    { value: 'GAMES', label: 'Games' },
    { value: 'ONLINE_ITEM', label: 'Online Item' },
    { value: 'OTHER', label: 'Other' }
];

export default function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [status, setStatus] = useState<AuctionStatus | ''>('');
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [minPrice, setMinPrice] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const activeFilterCount = [status, minPrice, startTime, endTime].filter(Boolean).length + selectedTags.length;

    function toggleTag(tag: Tag) {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    }

    function handleSearch() {
        const payload: AuctionFindingRequest = {};
        if (query.trim()) payload.productName = query.trim();
        if (status) payload.status = status;
        if (minPrice) payload.minStartingPrice = minPrice;
        if (startTime) payload.startTime = new Date(startTime).toISOString();
        if (endTime) payload.endTime = new Date(endTime).toISOString();
        if (selectedTags.length > 0) payload.tags = selectedTags;

        onSearch(payload);
    }

    function handleReset() {
        setQuery('');
        setStatus('');
        setSelectedTags([]);
        setMinPrice('');
        setStartTime('');
        setEndTime('');
        onSearch({});
    }

    return (
        <div className="w-full bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
            <div className="flex gap-2">
                <div className="relative flex-1 h-[44px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} strokeWidth={2} />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="Search by product name..."
                        className="w-full h-full pl-11 pr-4 rounded-xl border border-neutral-200 text-[14px] font-medium text-[#0D0D0D] placeholder-neutral-400 focus:outline-none focus:border-[#0D0D0D] transition-all bg-neutral-50/50"
                    />
                </div>

                <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`h-[44px] px-4 rounded-xl border flex items-center gap-2 text-[13px] font-bold cursor-pointer transition-all ${showFilters || activeFilterCount > 0
                        ? 'border-[#0D0D0D] bg-[#0D0D0D] text-white'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 bg-white'
                        }`}
                >
                    <SlidersHorizontal size={15} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Filters</span>
                    {activeFilterCount > 0 && (
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${showFilters || activeFilterCount > 0 ? 'bg-[#F5C518] text-[#0D0D0D]' : 'bg-neutral-100 text-neutral-600'}`}>
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={handleSearch}
                    className="h-[44px] px-6 rounded-xl bg-[#0D0D0D] text-white text-[13px] font-bold hover:bg-[#F5C518] hover:text-[#0D0D0D] transition-all cursor-pointer hidden sm:block"
                >
                    Search
                </button>
            </div>

            {showFilters && (
                <div className="mt-5 pt-4 border-t border-neutral-100 space-y-5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[12px] font-black text-[#0D0D0D] uppercase tracking-wider">Advanced Filters</h4>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="text-[12px] font-bold text-neutral-400 hover:text-red-500 transition-colors cursor-pointer flex items-center gap-1"
                        >
                            <X size={13} strokeWidth={2.5} />
                            Reset All
                        </button>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                            Categories
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {TAG_OPTIONS.map(option => {
                                const isSelected = selectedTags.includes(option.value);
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => toggleTag(option.value)}
                                        className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all border cursor-pointer ${isSelected
                                            ? 'bg-[#0D0D0D] border-[#0D0D0D] text-white'
                                            : 'border-neutral-200 text-neutral-600 bg-white hover:border-neutral-300'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                                Auction Status
                            </label>
                            <div className="relative">
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value as AuctionStatus | '')}
                                    className="w-full h-[38px] pl-3 pr-8 rounded-lg border border-neutral-200 text-[13px] font-medium text-[#0D0D0D] focus:outline-none focus:border-[#F5C518] transition-all bg-white appearance-none"
                                >
                                    <option value="">All Statuses</option>
                                    {STATUS_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                                Min Starting Price ($)
                            </label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={minPrice}
                                onChange={e => setMinPrice(e.target.value)}
                                className="w-full h-[38px] px-3 rounded-lg border border-neutral-200 text-[13px] font-medium text-[#0D0D0D] focus:outline-none focus:border-[#F5C518] transition-all bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                                Starts After
                            </label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                className="w-full h-[38px] px-3 rounded-lg border border-neutral-200 text-[13px] font-medium text-[#0D0D0D] focus:outline-none focus:border-[#F5C518] transition-all bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                                End Before
                            </label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                                className="w-full h-[38px] px-3 rounded-lg border border-neutral-200 text-[13px] font-medium text-[#0D0D0D] focus:outline-none focus:border-[#F5C518] transition-all bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-1">
                        <button
                            type="button"
                            onClick={() => { handleSearch(); setShowFilters(false); }}
                            className="h-[38px] px-5 rounded-xl bg-[#0D0D0D] text-white text-[13px] font-bold hover:bg-[#F5C518] hover:text-[#0D0D0D] transition-all cursor-pointer"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}