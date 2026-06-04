import React from 'react';

interface AddItemButtonProps {
    onClick: () => void;
}

export const AddItemButton: React.FC<AddItemButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 bg-[#F5C518] text-[#0D0D0D] border-0 rounded-xl px-5 py-2.5 text-[14px] font-bold cursor-pointer transition-all duration-200 hover:bg-[#e0b416] hover:-translate-y-0.5 shadow-md hover:shadow-lg"
        >
            <span className="text-[18px] leading-none font-black">+</span>
            Add Item
        </button>
    );
};

export default AddItemButton;