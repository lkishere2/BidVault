import React from 'react';
import { Search } from 'lucide-react';
import type { Tag } from '../../../types/product';
import { ALL_TAGS } from './constants';

interface InventoryFiltersProps {
    keyword: string;
    setKeyword: (k: string) => void;
    selectedTags: Set<Tag>;
    toggleTag: (tag: Tag) => void;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({ keyword, setKeyword, selectedTags, toggleTag }) => {
    return (
        <div className="flex flex-col gap-4 mb-8">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0D0D0D]/40" size={20} />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-[#0D0D0D]/10 rounded-full focus:outline-none focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518] text-[#0D0D0D] bg-white transition-all"
                />
            </div>

            <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-colors ${selectedTags.has(tag)
                            ? 'bg-[#F5C518] border-[#F5C518] text-[#0D0D0D]'
                            : 'bg-white border-[#0D0D0D]/10 text-[#0D0D0D]/70 hover:border-[#0D0D0D]/30'
                            }`}
                    >
                        {tag.replace('_', ' ')}
                    </button>
                ))}
            </div>
        </div>
    );
};