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
        <div className="w-full bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-bold mb-1">Storage</h2>
                    <p className="text-neutral-500 text-sm">Track your archived vault item storage assets.</p>
                </div>
                <AddItemButton onClick={() => setIsAddingItem(true)} />
            </div>

            <hr className="border-neutral-100 my-2" />

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