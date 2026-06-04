import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import auctionApi from '../../../../api/auctionApi';
import { bidApi } from '../../../../api/bidApi';
import type { AuctionResponse } from '../../../../types/auction';
import type { BidFeedEvent, BidNotificationPayload, BidResponse } from '../../../../types/bid';
import BidInfoPanel from './BidInfoPanel';
import BidFeedPanel from './BidFeedPanel';

export default function BidPage() {
    const { auction_id } = useParams<{ auction_id: string }>();
    const navigate = useNavigate();
    
    const [auction, setAuction] = useState<AuctionResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [isConnected, setIsConnected] = useState(false);
    const [ticker, setTicker] = useState<BidNotificationPayload | null>(null);
    const [bids, setBids] = useState<BidFeedEvent[]>([]);
    const stompClientRef = useRef<Client | null>(null);

    const normalizeBidFeedEvent = (data: Partial<BidFeedEvent>): BidFeedEvent => {
        const placedAt = data.placedAt ? String(data.placedAt) : new Date().toISOString();
        const amount = data.amount !== undefined ? String(data.amount) : '0';
        const bidderLabel = data.bidderLabel ?? 'Unknown bidder';
        const bidId = data.bidId ?? (Number(new Date(placedAt).getTime()) || Date.now());

        return {
            bidId,
            auctionId: data.auctionId ?? Number(auction_id ?? '0'),
            bidderId: data.bidderId ?? 0,
            bidderLabel,
            amount,
            placedAt,
        };
    };

    // Fetch Auction Data
    useEffect(() => {
        if (!auction_id) return;
        setLoading(true);
        auctionApi.getAuction(Number(auction_id))
            .then(res => {
                setAuction(res.data);
                // Also fetch initial bids
                bidApi.getBidHistory(Number(auction_id), 0, 50).then(bRes => {
                    const data = bRes.data as any;
                    const content = Array.isArray(data) ? data : (data?.content || []);
                    const history = content.map((b: BidResponse) => ({
                        bidId: b.bidId,
                        auctionId: b.auctionId,
                        bidderId: (b as any).bidderId ?? 0,
                        bidderLabel: b.bidderLabel,
                        amount: b.amount,
                        placedAt: b.placedAt
                    }));
                    setBids(prev => {
                        const newBids = [...prev];
                        history.forEach(hBid => {
                            if (!newBids.some(b => b.bidId === hBid.bidId || (`${b.bidderLabel}-${b.amount}-${b.placedAt}`) === `${hBid.bidderLabel}-${hBid.amount}-${hBid.placedAt}`)) {
                                newBids.push(hBid);
                            }
                        });
                        return newBids.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
                    });
                }).catch(err => console.error('Failed to fetch initial bid history:', err));
            })
            .catch(err => {
                setError('Failed to load auction data.');
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, [auction_id]);

    // WebSocket logic
    useEffect(() => {
        if (!auction) return;
        
        const wsUrl = (import.meta.env.VITE_WS_URL as string) || 'ws://localhost:8000/ws';
        const token = localStorage.getItem('accessToken');

        const client = new Client({
            brokerURL: wsUrl,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
            onConnect: () => {
                setIsConnected(true);

                client.subscribe(`/topic/auction/${auction.id}`, (message) => {
                    if (message.body) {
                        try {
                            const data = JSON.parse(message.body) as BidNotificationPayload;
                            setTicker(data);
                        } catch (e) {
                            console.error('Error parsing ticker message', e);
                        }
                    }
                });

                client.subscribe(`/topic/auction/${auction.id}/bids`, (message) => {
                    if (message.body) {
                        try {
                            const data = JSON.parse(message.body) as Partial<BidFeedEvent>;
                            const event = normalizeBidFeedEvent(data);
                            setBids(prev => {
                                const existingKey = event.bidId;
                                const hasExisting = prev.some(b => b.bidId === existingKey || (`${b.bidderLabel}-${b.amount}-${b.placedAt}`) === `${event.bidderLabel}-${event.amount}-${event.placedAt}`);
                                if (hasExisting) return prev;
                                return [event, ...prev];
                            });
                        } catch (e) {
                            console.error('Error parsing bid event', e);
                        }
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
            },
            onWebSocketClose: () => {
                setIsConnected(false);
            },
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [auction]);

    const handlePlaceBid = (amount: string) => {
        if (stompClientRef.current && stompClientRef.current.connected && auction) {
            stompClientRef.current.publish({
                destination: `/app/auction/${auction.id}/bid`,
                body: JSON.stringify({ amount })
            });
        } else {
            console.error('Cannot place bid, STOMP client not connected');
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 bg-neutral-50/50 min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-[#F5C518] animate-spin" />
                    <p className="text-[14px] font-semibold text-neutral-500">Loading auction details...</p>
                </div>
            </div>
        );
    }

    if (error || !auction) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
                <p className="text-[15px] font-bold text-red-500">{error || 'Auction not found'}</p>
                <button 
                    onClick={() => navigate(-1)} 
                    className="px-4 py-2 bg-[#0D0D0D] text-white rounded-lg text-[13px] font-semibold hover:bg-black transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-neutral-50/50 py-8 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-64px)]">
            <div className="max-w-6xl mx-auto flex flex-col gap-6">
                <div>
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[14px] font-bold text-neutral-500 hover:text-[#0D0D0D] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-neutral-200 hover:border-neutral-300"
                    >
                        <ArrowLeft size={16} strokeWidth={2} />
                        Back to Auctions
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden flex flex-col lg:flex-row lg:h-[750px]">
                    {/* Left: Info Panel */}
                    <div className="w-full lg:w-3/5 border-b lg:border-b-0 lg:border-r border-neutral-200 flex flex-col h-auto min-h-[500px] lg:min-h-0 lg:h-auto overflow-y-auto">
                        <BidInfoPanel auction={auction} ticker={ticker} onPlaceBid={handlePlaceBid} />
                    </div>

                    {/* Right: Feed Panel */}
                    <div className="w-full lg:w-2/5 flex flex-col bg-neutral-50/50 h-[500px] lg:h-auto min-h-0">
                        <BidFeedPanel bids={bids} isConnected={isConnected} />
                    </div>
                </div>
            </div>
        </div>
    );
}
