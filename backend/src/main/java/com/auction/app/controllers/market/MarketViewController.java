package com.auction.app.controllers.market;

import com.auction.app.controllers.market.bidsection.BidSectionController;
import com.auction.app.domains.auction.auction.AuctionService;
import com.auction.app.domains.auction.auction.dtos.AuctionFindingRequest;
import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.stage.Stage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.concurrent.DelegatingSecurityContextRunnable;
import org.springframework.stereotype.Component;

@Component
public class MarketViewController {

    @FXML private MarketSearchBarController   searchBarController;
    @FXML private MarketAuctionGridController  auctionGridController;
    @FXML private Button prevButton;
    @FXML private Button nextButton;
    @FXML private Label  pageTrackerLabel;

    @Autowired private AuctionService       auctionService;
    @Autowired private BidSectionController bidSectionController;

    private int currentPage = 0;
    private int totalPages  = 1;
    private static final int PAGE_SIZE = 12;

    @FXML
    public void initialize() {
        if (searchBarController != null) {
            searchBarController.setOnSearchTriggered(() -> {
                currentPage = 0;
                loadPage();
            });
        }
        loadPage();
    }

    @FXML
    private void handlePrevPage() {
        if (currentPage > 0) { currentPage--; loadPage(); }
    }

    @FXML
    private void handleNextPage() {
        if (currentPage < totalPages - 1) { currentPage++; loadPage(); }
    }

    private void loadPage() {
        AuctionFindingRequest criteria = searchBarController != null
                ? searchBarController.buildRequest()
                : new AuctionFindingRequest();

        Pageable pageable = PageRequest.of(currentPage, PAGE_SIZE);

        // Fix: wrap in DelegatingSecurityContextRunnable so the Spring Security context
        // is propagated to the worker thread.  Without this, any security check inside
        // getDiscoverableAuctions (e.g. @PreAuthorize or SecurityUtils.getCurrentUser())
        // throws an AuthenticationCredentialsNotFoundException because the thread-local
        // SecurityContext is empty on a plain new Thread().
        Runnable task = new DelegatingSecurityContextRunnable(() -> {
            try {
                Page<AuctionResponse> page = auctionService.getDiscoverableAuctions(criteria, pageable);
                Platform.runLater(() -> {
                    totalPages = Math.max(1, page.getTotalPages());
                    if (auctionGridController != null) {
                        auctionGridController.renderItems(page.getContent(), this::handleItemClicked);
                    }
                    pageTrackerLabel.setText(String.format("Page %d of %d", currentPage + 1, totalPages));
                    prevButton.setDisable(currentPage == 0);
                    nextButton.setDisable(currentPage >= totalPages - 1);
                });
            } catch (Exception e) {
                e.printStackTrace();
            }
        });

        Thread worker = new Thread(task);
        worker.setDaemon(true);
        worker.start();
    }

    private void handleItemClicked(AuctionResponse auction) {
        if (auction == null || auction.getStatus() == null) return;

        Stage owner = (Stage) pageTrackerLabel.getScene().getWindow();

        switch (auction.getStatus()) {
            case UPCOMING -> bidSectionController.open(auction, AuctionStatus.UPCOMING, owner);
            case ACTIVE   -> bidSectionController.open(auction, AuctionStatus.ACTIVE,   owner);
            case ENDED    -> bidSectionController.open(auction, AuctionStatus.ENDED,     owner);
            default       -> { /* CANCELLED — never reaches market grid */ }
        }
    }
}