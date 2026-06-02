import { LogOut } from 'lucide-react';
import { logout } from '../../api/axios';

interface LogoutButtonProps {
    onClick?: () => void;
    variant?: 'desktop' | 'mobile';
}

export default function LogoutButton({ onClick, variant = 'desktop' }: LogoutButtonProps) {
    const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClick) {
            onClick();
        } else {
            logout();
        }
    };

    if (variant === 'mobile') {
        return (
            <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-red-500 bg-transparent border-0 cursor-pointer pl-4"
            >
                <LogOut size={13} strokeWidth={2} /> Log out
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            className="w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:border-red-400 hover:text-red-500 transition-colors bg-white cursor-pointer"
        >
            <LogOut size={14} strokeWidth={2} />
        </button>
    );
}