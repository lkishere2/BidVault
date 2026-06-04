import React, { useEffect, useState } from 'react';
import { productApi } from '../../../../api/productApi';
import type { ProductResponse } from '../../../../types/product';
import { UserItem } from './UserItem';
import { UserItemInfo } from './UserItemInfo';
import { CreateAuctionSection } from './CreateAuctionSection';

interface UserItemGridProps {
    refreshKey?: number;
}

export const UserItemGrid: React.FC<UserItemGridProps> = ({ refreshKey }) => {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
    const [launchProduct, setLaunchProduct] = useState<ProductResponse | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await productApi.getStorage();
            setProducts(res.data.content);
        } catch (err) {
            console.error('Failed to load storage:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [refreshKey]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-[280px] bg-neutral-100 border border-neutral-200 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    const availableProducts = products.filter(p => p.quantity > 0);

    if (availableProducts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-neutral-50 rounded-2xl border border-neutral-100 mt-6 text-center">
                <p className="text-[16px] font-bold text-[#0D0D0D]">No items in storage yet.</p>
                <p className="text-[14px] text-neutral-500 mt-1">Add your first item to get started.</p>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {availableProducts.map(product => (
                    <UserItem
                        key={product.id}
                        product={product}
                        onClick={() => setSelectedProduct(product)}
                        onLaunch={() => setLaunchProduct(product)}
                    />
                ))}
            </div>

            {selectedProduct && (
                <UserItemInfo
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onUpdated={() => { setSelectedProduct(null); fetchProducts(); }}
                    onDeleted={() => { setSelectedProduct(null); fetchProducts(); }}
                />
            )}

            {launchProduct && (
                <CreateAuctionSection
                    product={launchProduct}
                    onClose={() => setLaunchProduct(null)}
                    onSuccess={() => { setLaunchProduct(null); fetchProducts(); }}
                />
            )}
        </div>
    );
};

export default UserItemGrid;