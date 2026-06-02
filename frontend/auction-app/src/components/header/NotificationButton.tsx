import { Bell } from 'lucide-react';

interface NotificationButtonProps {
    unreadCount?: number;
    isOpen: boolean;
    onClick: () => void;
}

export default function NotificationButton({ unreadCount = 0, isOpen, onClick }: NotificationButtonProps) {
    const capped = unreadCount > 99 ? '99+' : unreadCount;

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={`Notifications${unreadCount > 0 ? `, ${capped} unread` : ''}`}
            aria-expanded={isOpen}
            className={`
                relative w-[36px] h-[36px] flex items-center justify-center rounded-lg border transition-colors bg-white cursor-pointer
                ${isOpen
                    ? 'border-[#F5C518] text-[#F5C518]'
                    : 'border-neutral-200 text-[#0D0D0D] hover:border-[#F5C518] hover:text-[#F5C518]'
                }
            `}
        >
            <Bell size={17} strokeWidth={2} />

            {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-[3px] bg-[#F5C518] text-[#0D0D0D] text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                    {capped}
                </span>
            )}
        </button>
    );
}