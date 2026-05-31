package com.auction.app.domains.auction.auction.scheduler;

import java.time.Instant;
import java.util.List;

import com.auction.app.domains.auction.auction.AuctionRepository;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import com.auction.app.domains.auction.auction.redis.AuctionCacheAdapter;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionHandler {

    private final AuctionRepository auctionRepository;
    private final AuctionExecutionService auctionExecutionService;
    private final AuctionCacheAdapter cache;

    @Scheduled(fixedRate = 10000)
    public void activateUpcomingAuctions() {

        List<Long> toActivateIds = auctionRepository.findUpcomingIdsToActivate(AuctionStatus.UPCOMING, Instant.now());
        if (toActivateIds.isEmpty()) return;
        auctionRepository.updateStatusForIds(toActivateIds, AuctionStatus.ACTIVE);

        for (Long auctionId : toActivateIds) {
            // Fix #10: acquire a distributed lock before processing so only one instance
            // acts on this auction when running in a multi-node deployment
            if (!cache.acquireProcessingLock(auctionId)) {
                log.info("Skipping activate for auction #{} — another instance is processing it", auctionId);
                continue;
            }
            try {
                auctionExecutionService.processActiveAuctionById(auctionId);
            } catch (Exception e) {
                log.error("Failed to activate upcoming auction #{}: {}", auctionId, e.getMessage(), e);
            } finally {
                cache.releaseProcessingLock(auctionId);
            }
        }
    }

    // Same logic as the active
    @Scheduled(fixedRate = 10000)
    public void endActiveAuctions() {

        List<Long> toEndIds = auctionRepository.findActiveIdsToEnd(AuctionStatus.ACTIVE, Instant.now());
        if (toEndIds.isEmpty()) return;

        // Fix #2: bulk-update status to ENDED before processing, mirroring activateUpcomingAuctions.
        // Without this, a failed processEndedAuctionById rolls back its own transaction but leaves
        // the DB row as ACTIVE — the next scheduler tick re-picks it and double-processes it
        // (double-deducting the winner's balance, double-crediting the seller).
        auctionRepository.updateStatusForIds(toEndIds, AuctionStatus.ENDED);

        for (Long auctionId : toEndIds) {
            // Fix #10: same distributed lock guard as activateUpcomingAuctions
            if (!cache.acquireProcessingLock(auctionId)) {
                log.info("Skipping end for auction #{} — another instance is processing it", auctionId);
                continue;
            }
            try {
                auctionExecutionService.processEndedAuctionById(auctionId);
            } catch (Exception e) {
                log.error("Failed to process ending for auction #{}: {}", auctionId, e.getMessage(), e);
            } finally {
                cache.releaseProcessingLock(auctionId);
            }
        }
    }
}