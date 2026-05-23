import React from 'react';
import { Plus } from 'lucide-react';

interface InventoryHeaderProps {
    onAddClick: () => void;
}

export const InventoryHeader: React.FC<InventoryHeaderProps> = ({ onAddClick }) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-[#0D0D0D]">Inventory</h1>
                <p className="text-[#0D0D0D]/60 mt-1">Manage your available products and items.</p>
            </div>
            <button
                onClick={onAddClick}
                className="flex items-center gap-2 bg-[#F5C518] text-[#0D0D0D] px-6 py-3 rounded-full font-semibold hover:bg-[#d9ae15] transition-colors"
            >
                <Plus size={20} />
                Add Product
            </button>
        </div>
    );
};