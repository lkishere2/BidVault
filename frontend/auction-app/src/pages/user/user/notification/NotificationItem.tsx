import { Gavel, UserPlus, CheckCircle, Circle } from 'lucide-react';
import { theme } from '../../../../constants/theme';

interface NotificationItemProps {
    id?: number;
    message: string;
    sendAt: string; // ISO string
    read?: boolean;
    compact?: boolean; // true = dropdown style, false = full page style
    onToggleRead?: () => void;
}

function getIcon(message: string) {
    if (message.toLowerCase().includes('auction')) {
        return <Gavel size={14} strokeWidth={2} style={{ color: theme.colors.accent }} />;
    }
    return <UserPlus size={14} strokeWidth={2} style={{ color: theme.colors.primary }} />;
}

function timeAgo(iso: string) {
    try {
        const diff = Date.now() - new Date(iso).getTime();
        const s = Math.floor(diff / 1000);
        if (s < 60) return 'just now';
        const m = Math.floor(s / 60);
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        const d = Math.floor(h / 24);
        if (d < 30) return `${d}d ago`;
        const mo = Math.floor(d / 30);
        if (mo < 12) return `${mo}mo ago`;
        return `${Math.floor(mo / 12)}y ago`;
    } catch {
        return '';
    }
}

export default function NotificationItem({ id, message, sendAt, read = true, compact = false, onToggleRead }: NotificationItemProps) {
    if (compact) {
        return (
            <div className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-50 group cursor-pointer`}
                 style={{ backgroundColor: !read ? theme.colors.notification.unreadBg : theme.colors.notification.readBg }}
                 onClick={onToggleRead}
                 role="button"
                 tabIndex={0}
            >
                {/* Unread dot */}
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0`}
                      style={{ backgroundColor: !read ? theme.colors.notification.unreadDot : 'transparent' }} />
                <div className="flex-1 min-w-0">
                    <p className={`text-[12.5px] leading-snug`} style={{ color: theme.colors.text.main, fontWeight: !read ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal }}>
                        {message}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: theme.colors.text.muted }}>{timeAgo(sendAt)}</p>
                </div>
            </div>
        );
    }

    // Full page variant
    return (
        <div
            className={`flex items-start gap-4 px-5 py-4 rounded-xl border transition-all`}
            style={{
                backgroundColor: !read ? theme.colors.notification.unreadBg : theme.colors.surface,
                borderColor: !read ? `${theme.colors.accent}40` : theme.colors.border,
                boxShadow: !read ? `2px 2px 0px ${theme.colors.accent}` : 'none'
            }}
        >
            {/* Icon */}
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0`}
                 style={{ 
                    backgroundColor: !read ? `${theme.colors.accent}15` : theme.colors.background,
                    borderColor: !read ? `${theme.colors.accent}30` : theme.colors.border,
                    borderWidth: '1px'
                 }}>
                {getIcon(message)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={`text-[13.5px] leading-snug`} style={{ color: theme.colors.text.main, fontWeight: !read ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal }}>
                    {message}
                </p>
                <p className="text-[11.5px] mt-1" style={{ color: theme.colors.text.muted }}>{timeAgo(sendAt)}</p>
            </div>

            {/* Actions */}
            {onToggleRead && (
                <button 
                    type="button" 
                    onClick={onToggleRead}
                    className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-black/5 transition-all focus:opacity-100 ml-2"
                    title={read ? "Mark as unread" : "Mark as read"}
                    style={{ opacity: !read ? 1 : undefined }}
                >
                    {read ? (
                        <Circle size={16} strokeWidth={2} style={{ color: theme.colors.text.muted }} className="opacity-0 hover:opacity-100 transition-opacity" />
                    ) : (
                        <CheckCircle size={16} strokeWidth={2.5} style={{ color: theme.colors.accent }} />
                    )}
                </button>
            )}
            
            {!onToggleRead && !read && (
                <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: theme.colors.accent }} />
            )}
        </div>
    );
}