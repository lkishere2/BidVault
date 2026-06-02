import React, { useState } from 'react';
import { UserItemGrid } from './UserItemGrid';
import { AddItemButton } from './AddItemButton';
import { AddItemSection } from './AddItemSection';

export const StoragePage: React.FC = () => {
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleItemAdded = () => {
        setIsAddingItem(false);
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0' }}>Storage</h2>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Track your archived vault item storage assets.</p>
                </div>
                <AddItemButton onClick={() => setIsAddingItem(true)} />
            </div>

            <div style={{ height: '1px', background: '#e5e7eb', width: '100%' }} />

            <UserItemGrid key={refreshKey} />

            {isAddingItem && (
                <AddItemSection
                    onClose={() => setIsAddingItem(false)}
                    onSuccess={handleItemAdded}
                />
            )}
        </div>
    );
};

export default StoragePage;