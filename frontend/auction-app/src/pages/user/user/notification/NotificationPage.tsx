import { useEffect, useRef, useState, useCallback } from 'react';
import { Bell, RefreshCw, CheckCheck, MailOpen } from 'lucide-react';
import NotificationItem from './NotificationItem';
import NotificationGrid from './NotificationGrid';
import NotificationSkeleton from './NotificationSkeleton';
import { notificationApi } from '../../../../api/notificationApi';
import type { Notification, NotificationResponse } from '../../../../types/notification';
import { theme } from '../../../../constants/theme';
import { NOTIFICATION_SYNC_EVENT, broadcastNotificationChange, type NotificationSyncPayload } from './notificationEvents';

const PAGE_SIZE = 20;

type BulkAction = 'mark-all-read' | 'mark-all-unread' | null;

export default function NotificationPage() {
    const [items, setItems] = useState<Notification[]>([]);
    const [page, setPage] = useState(0);
    const [hasNext, setHasNext] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [bulkLoading, setBulkLoading] = useState<BulkAction>(null);
    const [gridView, setGridView] = useState(false);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const initialLoad = useRef(false);

    const load = useCallback(async (pageNum: number, replace = false) => {
        try {
            if (pageNum === 0) setIsLoading(true);
            else setIsLoadingMore(true);
            setError(null);

            const response = await notificationApi.getMyNotificationsFeed(pageNum, PAGE_SIZE);
            const data = response.data;

            const mapped: Notification[] = data.content.map((n: NotificationResponse) => ({
                id: n.id,
                message: n.message,
                sendAt: n.sendAt,
                read: n.hasRead,
            }));

            setItems(prev => (replace ? mapped : [...prev, ...mapped]));
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
                if (entries[0] && entries[0].isIntersecting && hasNext && !isLoadingMore) {
                    load(page + 1);
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasNext, isLoadingMore, load, page]);

    useEffect(() => {
        const handleSync = (e: Event) => {
            const customEvent = e as CustomEvent<NotificationSyncPayload>;
            const { action, id, currentReadStatus } = customEvent.detail;

            if (action === 'toggle-read' && id !== undefined) {
                setItems(prev => prev.map(n => (n.id === id ? { ...n, read: !currentReadStatus } : n)));
            } else if (action === 'mark-all-read') {
                setItems(prev => prev.map(n => ({ ...n, read: true })));
            } else if (action === 'mark-all-unread') {
                setItems(prev => prev.map(n => ({ ...n, read: false })));
            }
        };

        window.addEventListener(NOTIFICATION_SYNC_EVENT, handleSync);
        return () => window.removeEventListener(NOTIFICATION_SYNC_EVENT, handleSync);
    }, []);

    const unread = items.filter(n => !n.read).length;
    const hasItems = items.length > 0;

    const handleToggleRead = async (id: number, currentReadStatus: boolean) => {
        try {
            if (currentReadStatus) {
                await notificationApi.markAsUnread(id);
                setItems(prev => prev.map(n => (n.id === id ? { ...n, read: false } : n)));
            } else {
                await notificationApi.markAsRead(id);
                setItems(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
            }
            broadcastNotificationChange({ action: 'toggle-read', id, currentReadStatus });
        } catch (e) {
            void e;
        }
    };

    const handleMarkAllRead = async () => {
        if (bulkLoading) return;
        try {
            setBulkLoading('mark-all-read');
            await notificationApi.markAllAsRead();
            setItems(prev => prev.map(n => ({ ...n, read: true })));
            broadcastNotificationChange({ action: 'mark-all-read' });
        } catch (e) {
            void e;
        } finally {
            setBulkLoading(null);
        }
    };

    const handleMarkAllUnread = async () => {
        if (bulkLoading) return;
        try {
            setBulkLoading('mark-all-unread');
            await notificationApi.markAllAsUnread();
            setItems(prev => prev.map(n => ({ ...n, read: false })));
            broadcastNotificationChange({ action: 'mark-all-unread' });
        } catch (e) {
            void e;
        } finally {
            setBulkLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8 sm:py-12">

                <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: theme.colors.primary }}
                            >
                                <Bell size={14} color={theme.colors.accent} strokeWidth={2.5} />
                            </div>
                            <h1
                                className="text-[22px] sm:text-[26px] font-black tracking-tight leading-none"
                                style={{ color: theme.colors.text.main }}
                            >
                                Notifications
                            </h1>
                            {!isLoading && unread > 0 && (
                                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#F5C518] text-[#0D0D0D] text-[11px] font-black leading-none">
                                    {unread}
                                </span>
                            )}
                        </div>
                        {!isLoading && hasItems && (
                            <p className="text-[12px] font-semibold text-neutral-400 ml-[42px]">
                                {items.length} total · {unread} unread
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {hasItems && unread > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                disabled={!!bulkLoading}
                                className="flex items-center gap-1.5 h-[36px] px-3 rounded-lg border border-neutral-200 text-[12px] font-semibold text-neutral-600 hover:border-[#0D0D0D] hover:text-[#0D0D0D] hover:bg-white transition-colors bg-white cursor-pointer disabled:opacity-40"
                            >
                                {bulkLoading === 'mark-all-read' ? (
                                    <RefreshCw size={12} strokeWidth={2} className="animate-spin" />
                                ) : (
                                    <CheckCheck size={13} strokeWidth={2} />
                                )}
                                Mark all read
                            </button>
                        )}

                        {hasItems && unread < items.length && (
                            <button
                                type="button"
                                onClick={handleMarkAllUnread}
                                disabled={!!bulkLoading}
                                className="flex items-center gap-1.5 h-[36px] px-3 rounded-lg border border-neutral-200 text-[12px] font-semibold text-neutral-600 hover:border-[#0D0D0D] hover:text-[#0D0D0D] hover:bg-white transition-colors bg-white cursor-pointer disabled:opacity-40"
                            >
                                {bulkLoading === 'mark-all-unread' ? (
                                    <RefreshCw size={12} strokeWidth={2} className="animate-spin" />
                                ) : (
                                    <MailOpen size={13} strokeWidth={2} />
                                )}
                                Mark all unread
                            </button>
                        )}

                        {hasItems && (
                            <button
                                type="button"
                                onClick={() => setGridView(v => !v)}
                                aria-label={gridView ? 'Switch to list view' : 'Switch to grid view'}
                                className="w-[36px] h-[36px] flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 hover:border-[#0D0D0D] hover:text-[#0D0D0D] transition-colors bg-white cursor-pointer"
                            >
                                {gridView ? (
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <line x1="1" y1="3" x2="13" y2="3" />
                                        <line x1="1" y1="7" x2="13" y2="7" />
                                        <line x1="1" y1="11" x2="13" y2="11" />
                                    </svg>
                                ) : (
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="1" y="1" width="5" height="5" rx="1" />
                                        <rect x="8" y="1" width="5" height="5" rx="1" />
                                        <rect x="1" y="8" width="5" height="5" rx="1" />
                                        <rect x="8" y="8" width="5" height="5" rx="1" />
                                    </svg>
                                )}
                            </button>
                        )}

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
                ) : gridView ? (
                    <NotificationGrid
                        items={items}
                        isLoadingMore={isLoadingMore}
                        onToggleRead={handleToggleRead}
                        sentinelRef={sentinelRef}
                        hasNext={hasNext}
                    />
                ) : (
                    <div className="flex flex-col gap-2">
                        {items.map(n => (
                            <NotificationItem
                                key={n.id}
                                notificationId={n.id}
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