package com.ltnc.auction.infrastructure.scheduler;

import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.ltnc.auction.domain.auction.auc.AuctionRepository;
import com.ltnc.auction.domain.auction.auc.AuctionStatus;
import com.ltnc.auction.domain.auction.bid.BidNotificationPayload;
import com.ltnc.auction.domain.auction.bid.BidService;
import com.ltnc.auction.infrastructure.websocket.AuctionWebSocketPublisher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class BidQueueProcessor {

    private final BidService bidService;
    private final AuctionRepository auctionRepository;
    private final AuctionWebSocketPublisher publisher; 

    @Scheduled(fixedRate = 1000)
    public void processQueues() {
        List<Long> activeAuctionIds = auctionRepository
                .findByStatusWithDetails(AuctionStatus.ACTIVE)
                .stream()
                .map(a -> a.getId())
                .toList();

        for (Long auctionId : activeAuctionIds) {
            BidNotificationPayload lastPayload = null;

            while (true) {
                var result = bidService.processNextBid(auctionId);
                if (result.isEmpty()) break;
                lastPayload = result.get();
            }

            if (lastPayload != null) {
                publisher.publish(lastPayload);
                log.info("Queue drained for auction #{} — final price ${}",
                        auctionId, lastPayload.getCurrentPrice());
            }
        }
    }
}