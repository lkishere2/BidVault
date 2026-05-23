import React from 'react';
import { Edit2, Trash2, Package } from 'lucide-react';
import type { ProductResponse } from '../../../types/product';

interface ProductCardProps {
    product: ProductResponse;
    onEdit: (product: ProductResponse) => void;
    onDelete: (id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
    const tagsArray = Array.isArray(product.tags) ? product.tags : Array.from(product.tags || []);

    return (
        <div className="bg-white border border-[#0D0D0D]/10 rounded-2xl overflow-hidden flex flex-col transition-shadow hover:shadow-lg">
            <div className="h-48 bg-[#0D0D0D]/5 relative flex items-center justify-center border-b border-[#0D0D0D]/10">
                {product.productImageUrl ? (
                    <img src={product.productImageUrl} alt={product.productName} className="w-full h-full object-cover" />
                ) : (
                    <Package size={48} className="text-[#0D0D0D]/20" />
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-[#0D0D0D] border border-[#0D0D0D]/10">
                    Qty: {product.quantity}
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-[#0D0D0D] mb-1 line-clamp-1">{product.productName}</h3>
                <p className="text-[#0D0D0D]/60 text-sm mb-4 line-clamp-2 flex-grow">
                    {product.description || 'No description provided.'}
                </p>

                <div className="flex flex-wrap gap-1 mb-6">
                    {tagsArray.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs font-semibold px-2 py-1 bg-[#0D0D0D]/5 text-[#0D0D0D] rounded-md">
                            {tag}
                        </span>
                    ))}
                    {tagsArray.length > 3 && (
                        <span className="text-xs font-semibold px-2 py-1 bg-[#0D0D0D]/5 text-[#0D0D0D] rounded-md">
                            +{tagsArray.length - 3}
                        </span>
                    )}
                </div>

                <div className="flex gap-2 mt-auto">
                    <button
                        onClick={() => onEdit(product)}
                        className="flex-1 flex justify-center items-center gap-2 py-2 border border-[#0D0D0D]/10 rounded-full text-[#0D0D0D] font-medium hover:bg-[#0D0D0D]/5 transition-colors"
                    >
                        <Edit2 size={16} /> Edit
                    </button>
                    <button
                        onClick={() => onDelete(product.id)}
                        className="w-10 flex justify-center items-center border border-red-200 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};