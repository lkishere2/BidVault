import React from 'react';
import { Rocket } from 'lucide-react';
import type { ProductResponse } from '../../../../types/product';

interface UserItemProps {
    product: ProductResponse;
    onClick: () => void;
    onLaunch: () => void;
}

export const UserItem: React.FC<UserItemProps> = ({ product, onClick, onLaunch }) => {
    const imageUrl = product.productImageUrl
        ? product.productImageUrl.startsWith('http')
            ? product.productImageUrl
            : `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${product.productImageUrl}`
        : 'https://placehold.co/400x300/f3f4f6/9ca3af?text=No+Image';

    return (
        <div
            onClick={onClick}
            className="group flex flex-col gap-3 bg-white border border-neutral-200 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden"
        >
            <div className="w-full h-40 rounded-xl overflow-hidden bg-neutral-100">
                <img
                    src={imageUrl}
                    alt={product.productName || 'Item'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            
            <div className="flex flex-col gap-1 px-1">
                <h4 className="text-[16px] font-black text-[#0D0D0D] truncate tracking-tight">
                    {product.productName || 'Unnamed Item'}
                </h4>
                {product.quantity !== undefined && (
                    <p className="text-[13px] font-semibold text-neutral-500">
                        Quantity: <span className="font-black text-[#0D0D0D]">{product.quantity}</span>
                    </p>
                )}
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); onLaunch(); }}
                className="mt-auto flex items-center justify-center gap-1.5 w-full py-2.5 bg-[#F5C518] text-[#0D0D0D] border-none rounded-xl text-[13px] font-black cursor-pointer transition-colors duration-200 hover:bg-[#e0b416]"
            >
                <Rocket size={15} strokeWidth={2.5} />
                Launch Auction
            </button>
        </div>
    );
};

export default UserItem;