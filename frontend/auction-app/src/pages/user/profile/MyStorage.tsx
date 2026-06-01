import React from 'react';
import { useNavigate } from 'react-router-dom';

export const MyStorage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/inventory')}
            className="w-full sm:w-auto min-w-[160px] bg-[#0D0D0D] hover:bg-[#2A2A2A] text-white font-bold py-2 px-5 rounded-full text-sm transition-all tracking-wide"
        >
            My Vault & Inventory
        </button>
    );
};