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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', height: '260px', background: '#f9fafb', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                <p style={{ fontSize: '16px', fontWeight: 500 }}>No items in storage yet.</p>
                <p style={{ fontSize: '14px', marginTop: '4px' }}>Add your first item to get started.</p>
            </div>
        );
    }

    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {products.map(product => (
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
        </>
    );
};

export default UserItemGrid;