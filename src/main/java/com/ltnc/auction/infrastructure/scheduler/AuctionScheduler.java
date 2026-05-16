package com.ltnc.auction.infrastructure.scheduler;

import java.time.Instant;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.ltnc.auction.domain.auction.auc.Auction;
import com.ltnc.auction.domain.auction.auc.AuctionCacheAdapter;
import com.ltnc.auction.domain.auction.auc.AuctionRepository;
import com.ltnc.auction.domain.auction.auc.AuctionService;
import com.ltnc.auction.domain.auction.auc.AuctionState;
import com.ltnc.auction.domain.auction.auc.AuctionStatus;
import com.ltnc.auction.domain.auction.reservedfunds.ReservedFundStatus;
import com.ltnc.auction.domain.auction.reservedfunds.ReservedFunds;
import com.ltnc.auction.domain.auction.reservedfunds.ReservedFundsRepository;
import com.ltnc.auction.domain.inventory.Item;
import com.ltnc.auction.domain.inventory.ItemStatus;
import com.ltnc.auction.domain.inventory.ItemStorageRepository;
import com.ltnc.auction.domain.user.User;
import com.ltnc.auction.domain.user.UserRepository;
import com.ltnc.auction.infrastructure.websocket.AuctionWebSocketPublisher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionScheduler {

    private final AuctionRepository auctionRepository;
    private final ReservedFundsRepository reservedFundsRepository;
    private final ItemStorageRepository itemStorageRepository;
    private final UserRepository userRepository;
    private final AuctionCacheAdapter auctionCacheAdapter;
    private final AuctionService auctionService;
    private final AuctionWebSocketPublisher publisher;

    @Scheduled(fixedRate = 30000)
    @Transactional
    public void activateUpcomingAuctions() {
        List<Auction> toActivate = auctionRepository
                .findUpcomingToActivate(AuctionStatus.UPCOMING, Instant.now());

        for (Auction auction : toActivate) {
            auction.setStatus(AuctionStatus.ACTIVE);
            auctionRepository.save(auction);

            AuctionState state = auctionCacheAdapter.getAuctionState(auction.getId());
            if (state != null) {
                state.setStatus(AuctionStatus.ACTIVE);
                auctionCacheAdapter.updateAuctionState(auction.getId(), state);
            } else {
                auctionService.cacheAuctionState(auction);
            }
            log.info("Auction #{} is now ACTIVE", auction.getId());
        }
    }

    @Scheduled(fixedRate = 30000)
    @Transactional
    public void endActiveAuctions() {
        List<Auction> toEnd = auctionRepository
                .findActiveToEnd(AuctionStatus.ACTIVE, Instant.now());

        for (Auction auction : toEnd) {
            AuctionState finalState = auctionCacheAdapter.getAuctionState(auction.getId());

            if (finalState != null) {
                auction.setCurrentPrice(finalState.getCurrentPrice());
                auction.setBidCount(finalState.getBidCount());
                auction.setEndTime(finalState.getEndTime());
                if (finalState.getWinnerId() != null) {
                    userRepository.findById(finalState.getWinnerId())
                            .ifPresent(auction::setWinner);
                }
            }

            if (auction.getBidCount() == 0) {
                handleNoBids(auction);
            } else {
                handleWinner(auction);
            }

            auction.setStatus(AuctionStatus.ENDED);
            auctionRepository.save(auction);

            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        auctionCacheAdapter.clearAuctionCache(auction.getId());
                    }
                });
            } else {
                auctionCacheAdapter.clearAuctionCache(auction.getId());
            }

            String winnerLabel = auction.getWinner() != null
                ? auction.getWinner().getDisplayUsername() + " #" + auction.getWinner().getUserId()
                : null;
            publisher.publishAuctionEnded(auction.getId(), winnerLabel, auction.getCurrentPrice());

            log.info("Auction #{} ENDED — cleared from Redis", auction.getId());
        }
    }

    private void handleNoBids(Auction auction) {
        Item item = auction.getItem();
        item.setStatus(ItemStatus.AVAILABLE);
        itemStorageRepository.save(item);
        log.info("Auction #{} ended with no bids — item returned to seller", auction.getId());
    }

    private void handleWinner(Auction auction) {
        User winner = auction.getWinner();
        User seller = auction.getSeller();

        log.info("handleWinner — winner: {}, seller: {}",
                winner != null ? winner.getUserId() : "NULL",
                seller != null ? seller.getUserId() : "NULL");

        List<ReservedFunds> allFunds = reservedFundsRepository.findByAuctionId(auction.getId());
        log.info("Total funds records found: {}", allFunds.size());

        for (ReservedFunds funds : allFunds) {
            log.info("Fund #{} status={} amount={}", funds.getId(), funds.getStatus(), funds.getAmount());
            if (funds.getStatus() == ReservedFundStatus.HELD) {
                captureFunds(funds, winner, seller);
            }
        }

        transferItem(auction, winner);
    }

    private void captureFunds(ReservedFunds funds, User winner, User seller) {
        log.info("captureFunds called — user #{}, amount ${}, current balance ${}",
            winner.getUserId(), funds.getAmount(), winner.getBalance());

        funds.setStatus(ReservedFundStatus.CAPTURED);
        reservedFundsRepository.save(funds);

        winner.setBalance(winner.getBalance().subtract(funds.getAmount()));
        userRepository.save(winner);

        seller.setBalance(seller.getBalance().add(funds.getAmount()));
        userRepository.save(seller);

        log.info("Captured ${} from winner #{}, credited to seller #{}",
            funds.getAmount(), winner.getUserId(), seller.getUserId());
        log.info("Winner balance: ${} — Seller balance: ${}",
            winner.getBalance(), seller.getBalance());
    }

    private void transferItem(Auction auction, User winner) {
        Item soldItem = auction.getItem();
        soldItem.setOwner(winner);
        soldItem.setStatus(ItemStatus.AVAILABLE);
        itemStorageRepository.save(soldItem);
        log.info("Item '{}' transferred to winner #{}", soldItem.getName(), winner.getUserId());
    }
}