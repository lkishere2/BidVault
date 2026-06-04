import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

export interface SubItem {
    label: string;
    path: string;
}

export interface NavItemProps {
    label: string;
    path?: string;
    sub?: SubItem[];
    onNavigate?: () => void;
    onIntercept?: () => boolean;
}

export default function NavItem({ label, path, sub, onNavigate, onIntercept }: NavItemProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const hasSub = !!sub?.length;

    const isActive = hasSub
        ? sub!.some(s => location.pathname.startsWith(s.path))
        : path === '/'
            ? location.pathname === '/'
            : !!path && location.pathname.startsWith(path);

    useEffect(() => {
        if (!hasSub) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [hasSub]);

    const baseBtn = `relative px-4 py-2 text-[13px] font-semibold tracking-[.01em] bg-transparent border-0 cursor-pointer transition-colors duration-150 whitespace-nowrap`;
    const colorCls = isActive ? 'text-[#F5C518]' : 'text-[#0D0D0D] hover:text-[#F5C518]';

    if (hasSub) {
        return (
            <div ref={ref} className="relative">
                <button
                    type="button"
                    onClick={() => {
                        if (onIntercept && onIntercept()) return;
                        setOpen(v => !v);
                    }}
                    className={`${baseBtn} ${colorCls} flex items-center gap-1`}
                >
                    {label}
                    <ChevronDown
                        size={12}
                        strokeWidth={2.5}
                        style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                    {isActive && <span className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-[#F5C518]" />}
                </button>

                {open && (
                    <div className="absolute top-[calc(100%+6px)] left-0 w-44 bg-white border border-neutral-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] py-1.5 z-[200] overflow-hidden">
                        {sub!.map(s => (
                            <button
                                key={s.path}
                                type="button"
                                onClick={() => {
                                    if (onIntercept && onIntercept()) return;
                                    navigate(s.path);
                                    setOpen(false);
                                    onNavigate?.();
                                }}
                                className={`w-full text-left px-4 py-2.5 text-[12px] font-semibold transition-colors cursor-pointer border-0
                                    ${location.pathname === s.path
                                        ? 'bg-[#0D0D0D] text-white'
                                        : 'bg-white text-[#0D0D0D] hover:bg-neutral-50 hover:text-[#F5C518]'}`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={() => {
                if (onIntercept && onIntercept()) return;
                navigate(path ?? '/');
                onNavigate?.();
            }}
            className={`${baseBtn} ${colorCls}`}
        >
            {label}
            {isActive && <span className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-[#F5C518]" />}
        </button>
    );
}