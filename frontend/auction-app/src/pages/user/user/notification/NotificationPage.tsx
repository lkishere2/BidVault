import { useEffect, useRef, useState, useCallback } from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import NotificationItem from './NotificationItem';
import NotificationSkeleton from './NotificationSkeleton';
import { notificationApi } from '../../../../api/notificationApi';
import { theme } from '../../../../constants/theme';

export interface Notification {
    id: number;
    message: string;
    sendAt: string;
    read?: boolean;
}

const PAGE_SIZE = 20;

export default function NotificationPage() {
    const [items, setItems] = useState<Notification[]>([]);
    const [page, setPage] = useState(0);
    const [hasNext, setHasNext] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const initialLoad = useRef(false);

    const load = useCallback(async (pageNum: number, replace = false) => {
        try {
            if (pageNum === 0) setIsLoading(true);
            else setIsLoadingMore(true);
            setError(null);

            const response = await notificationApi.getMyNotificationsFeed(pageNum, PAGE_SIZE);
            const data = response.data;

            const mapped: Notification[] = data.content.map((n: { id: number; message: string; sendAt: string; hasRead: boolean }) => ({
                id: n.id,
                message: n.message,
                sendAt: n.sendAt,
                read: n.hasRead,
            }));

            setItems(prev => replace ? mapped : [...prev, ...mapped]);
            setHasNext(!data.last);
            setPage(pageNum);
        } catch {
            setError('Failed to load notifications. Please try again.');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        if (initialLoad.current) return;
        initialLoad.current = true;
        load(0, true);
    }, [load]);

    useEffect(() => {
        if (!sentinelRef.current || !hasNext || isLoadingMore) return;
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNext && !isLoadingMore) {
                    load(page + 1);
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasNext, isLoadingMore, load, page]);

    const unread = items.filter(n => !n.read).length;

    const handleToggleRead = async (id: number, currentReadStatus: boolean) => {
        try {
            if (currentReadStatus) {
                await notificationApi.markAsUnread(id);
                setItems(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
            } else {
                await notificationApi.markAsRead(id);
                setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            }
        } catch {
            // handle err if needed
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-8 sm:py-12">

                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.colors.primary }}>
                                <Bell size={14} color={theme.colors.accent} strokeWidth={2.5} />
                            </div>
                            <h1 className="text-[22px] sm:text-[26px] font-black tracking-tight leading-none" style={{ color: theme.colors.text.main }}>
                                Notifications
                            </h1>
                        </div>
                        {!isLoading && unread > 0 && (
                            <p className="text-[12px] font-semibold text-neutral-400 ml-[42px]">
                                {unread} unread
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => load(0, true)}
                        disabled={isLoading}
                        aria-label="Refresh notifications"
                        className="w-[36px] h-[36px] flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 hover:border-[#0D0D0D] hover:text-[#0D0D0D] transition-colors bg-white cursor-pointer disabled:opacity-40"
                    >
                        <RefreshCw size={14} strokeWidth={2} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {isLoading ? (
                    <NotificationSkeleton count={8} />
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <p className="text-[13px] font-semibold text-neutral-400">{error}</p>
                        <button
                            type="button"
                            onClick={() => load(0, true)}
                            className="px-4 py-2 text-[12px] font-bold bg-[#0D0D0D] text-white rounded-lg hover:bg-[#F5C518] hover:text-[#0D0D0D] transition-colors cursor-pointer border-0"
                        >
                            Retry
                        </button>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-300">
                        <Bell size={40} strokeWidth={1.2} />
                        <p className="text-[14px] font-semibold tracking-wide">No notifications yet</p>
                        <p className="text-[12px]">When something happens, you'll see it here.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {items.map(n => (
                            <NotificationItem
                                key={n.id}
                                id={n.id}
                                message={n.message}
                                sendAt={n.sendAt}
                                read={n.read}
                                onToggleRead={() => handleToggleRead(n.id, !!n.read)}
                            />
                        ))}

                        <div ref={sentinelRef} className="h-4" />

                        {isLoadingMore && (
                            <div className="flex flex-col gap-2 mt-1">
                                <NotificationSkeleton count={3} />
                            </div>
                        )}

                        {!hasNext && items.length > 0 && (
                            <p className="text-center text-[11px] font-semibold text-neutral-300 py-4 tracking-wide uppercase">
                                You've reached the end
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}