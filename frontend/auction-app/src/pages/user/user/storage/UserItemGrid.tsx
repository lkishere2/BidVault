import React, { useEffect, useState } from 'react';
import { productApi } from '../../../../api/productApi';
import type { ProductResponse } from '../../../../types/product';
import UserItem from './UserItem';
import UserItemInfo from './UserItemInfo';
import UserItemGridLoading from './UserItemGridLoading';

export const UserItemGrid: React.FC = () => {
    const [items, setItems] = useState<ProductResponse[]>([]);
    const [selectedItem, setSelectedItem] = useState<ProductResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetchStorage = async () => {
            setIsLoading(true);
            try {
                const res = await productApi.getStorage(0, 20);
                if (cancelled) return;

                const data = res.data as unknown as { content?: ProductResponse[] } | ProductResponse[];
                setItems(Array.isArray(data) ? data : (data?.content ?? []));
            } catch (error) {
                console.error(error);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchStorage();

        return () => { cancelled = true; };
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {isLoading ? (
                <UserItemGridLoading />
            ) : items.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Your storage is currently empty.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                    {items.map((item) => (
                        <UserItem
                            key={item.id}
                            product={item}
                            onClick={() => setSelectedItem(item)}
                        />
                    ))}
                </div>
            )}
            {selectedItem && (
                <UserItemInfo
                    product={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </div>
    );
};

export default UserItemGrid;