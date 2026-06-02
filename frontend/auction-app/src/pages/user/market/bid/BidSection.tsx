import { X } from 'lucide-react';
import type { AuctionResponse } from '../../../../types/auction';
import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import BidInfoPanel from './BidInfoPanel';
import BidFeedPanel from './BidFeedPanel';
import type { BidFeedEvent, BidNotificationPayload } from '../../../../types/bid';

interface BidSectionProps {
    auction: AuctionResponse;
    onClose: () => void;
}

export default function BidSection({ auction, onClose }: BidSectionProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [ticker, setTicker] = useState<BidNotificationPayload | null>(null);
    const [bids, setBids] = useState<BidFeedEvent[]>([]);
    const stompClientRef = useRef<Client | null>(null);

    useEffect(() => {
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    useEffect(() => {
        const wsUrl = (import.meta.env.VITE_WS_URL as string) || 'ws://localhost:8000/ws';
        
        const client = new Client({
            brokerURL: wsUrl,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                setIsConnected(true);
                
                // Subscribe to ticker updates
                client.subscribe(`/topic/auction/${auction.id}`, (message) => {
                    if (message.body) {
                        try {
                            const data = JSON.parse(message.body) as BidNotificationPayload;
                            // Spring might wrap objects with class name, we just need the properties
                            // But assuming the frontend type matches the payload
                            setTicker(data);
                        } catch (e) {
                            console.error('Error parsing ticker message', e);
                        }
                    }
                });

                // Subscribe to live bids
                client.subscribe(`/topic/auction/${auction.id}/bids`, (message) => {
                    if (message.body) {
                        try {
                            const data = JSON.parse(message.body) as BidFeedEvent;
                            setBids(prev => [data, ...prev]);
                        } catch (e) {
                            console.error('Error parsing bid event', e);
                        }
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
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
    }, [auction.id]);

    const handlePlaceBid = (amount: string) => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.publish({
                destination: `/app/auction/${auction.id}/bid`,
                body: JSON.stringify({ amount })
            });
        } else {
            console.error('Cannot place bid, STOMP client not connected');
        }
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full sm:max-w-4xl bg-white sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl animate-slide-up flex flex-col h-[85vh] sm:h-[600px]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-white z-10 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[15px] font-bold text-[#0D0D0D]">Auction #{auction.id}</span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600 transition-colors cursor-pointer bg-white"
                    >
                        <X size={14} strokeWidth={2} />
                    </button>
                </div>

                {/* Body Content - Split View */}
                <div className="flex flex-col sm:flex-row flex-1 overflow-hidden min-h-0">
                    {/* Left: Info Panel */}
                    <div className="w-full sm:w-1/2 overflow-y-auto min-h-0">
                        <BidInfoPanel auction={auction} ticker={ticker} onPlaceBid={handlePlaceBid} />
                    </div>
                    
                    {/* Right: Feed Panel */}
                    <div className="w-full sm:w-1/2 overflow-y-auto min-h-0 border-t sm:border-t-0 sm:border-l border-neutral-100">
                        <BidFeedPanel bids={bids} isConnected={isConnected} />
                    </div>
                </div>
            </div>
        </div>
    );
}