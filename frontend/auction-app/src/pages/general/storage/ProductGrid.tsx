import React from 'react';
import { ProductCard } from './ProductCard';
import type { ProductResponse } from '../../../types/product';
import { PackageX } from 'lucide-react';

interface ProductGridProps {
    products: ProductResponse[];
    isLoading: boolean;
    onEdit: (product: ProductResponse) => void;
    onDelete: (id: number) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading, onEdit, onDelete }) => {
    if (isLoading) {
        return <div className="py-20 text-center text-[#0D0D0D]/50 font-medium animate-pulse">Loading inventory...</div>;
    }

    if (products.length === 0) {
        return (
            <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-[#0D0D0D]/10 rounded-3xl bg-white">
                <PackageX size={48} className="text-[#0D0D0D]/20 mb-4" />
                <h3 className="text-xl font-bold text-[#0D0D0D] mb-1">No products found</h3>
                <p className="text-[#0D0D0D]/60">Try adjusting your search or add a new product.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};