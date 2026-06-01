import React from 'react';
import { useNavigate } from 'react-router-dom';

export const EditProfileButton: React.FC = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/profile/edit')}
            className="w-full sm:w-auto min-w-[130px] bg-white hover:bg-[#F5F5F5] text-[#0D0D0D] border border-[#E0E0E0] font-semibold py-2 px-5 rounded-full text-sm transition-all tracking-wide"
        >
            Settings
        </button>
    );
};