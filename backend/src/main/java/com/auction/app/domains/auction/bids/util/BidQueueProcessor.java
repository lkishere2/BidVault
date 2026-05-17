package com.auction.app.domains.auction.bids.util;

import com.auction.app.domains.auction.auction.AuctionRepository;
import com.auction.app.domains.auction.auction.AuctionStatus;
import com.auction.app.domains.auction.auction.notification.AuctionPublisher;
import com.auction.app.domains.auction.bids.BidService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class BidQueueProcessor {

    private final BidService bidService;
    private final AuctionRepository auctionRepository;
    private final AuctionPublisher publisher;

    // Process one bid per active auction per tick — Redis pub/sub handles WebSocket broadcast
    @Scheduled(fixedRate = 1000)
    public void processQueues() {
        auctionRepository.findIdsByStatus(AuctionStatus.ACTIVE)
                .forEach(auctionId -> {
                    bidService.processNextBid(auctionId)
                            .ifPresent(payload -> {
                                publisher.publish(payload);
                                log.info("Bid processed and published for auction #{} — price ${}", auctionId, payload.getCurrentPrice());
                            });
                });
    }
}