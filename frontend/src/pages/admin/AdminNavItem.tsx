import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface AdminNavItemProps {
    to: string;
    icon: ReactNode;
    label: string;
}

export default function AdminNavItem({ to, icon, label }: AdminNavItemProps) {
    return (
        <NavLink
            to={to}
            end
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-[14px] transition-all border-l-2 ${isActive
                    ? 'bg-neutral-50 text-[#0D0D0D] font-semibold border-[#F5C518]'
                    : 'text-neutral-500 hover:bg-neutral-50/80 hover:text-[#0D0D0D] border-transparent'
                }`
            }
        >
            <span className="text-inherit opacity-80 flex-shrink-0">{icon}</span>
            <span>{label}</span>
        </NavLink>
    );
}