package com.auction.app.controllers.market;

import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Node;
import javafx.scene.layout.GridPane;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Consumer;

/**
 * Controller for the auction card grid.
 *
 * <p>This is a Spring {@code @Component} because it is included via
 * {@code <fx:include fx:id="auctionGrid">} inside {@code MarketView.fxml},
 * whose controller ({@link MarketViewController}) is also Spring-managed.
 * The Spring controller factory resolves this bean by type when JavaFX
 * processes the include.
 *
 * <p>Card layout: 4 columns, unlimited rows.
 */
@Component("marketAuctionGridController")
public class MarketAuctionGridController {

    private static final int COLUMN_COUNT = 4;

    @FXML private GridPane gridPane;

    /**
     * Clears the grid and renders a fresh set of auction cards.
     *
     * @param items        list of auctions to display (may be empty, never null)
     * @param onItemClicked callback forwarded to each card; the card passes its
     *                      {@link AuctionResponse} back so the caller can open the
     *                      correct popup for that auction's status
     */
    public void renderItems(List<AuctionResponse> items, Consumer<AuctionResponse> onItemClicked) {
        gridPane.getChildren().clear();

        if (items == null || items.isEmpty()) return;

        for (int i = 0; i < items.size(); i++) {
            try {
                FXMLLoader loader = new FXMLLoader(
                        getClass().getResource("/ui/views/market/MarketAuctionItem.fxml")
                );
                // Each card gets its own controller instance — not Spring-managed,
                // because cards are short-lived view fragments with no service deps.
                MarketAuctionItemController itemController = new MarketAuctionItemController();
                loader.setController(itemController);

                Node cardNode = loader.load();
                itemController.populate(items.get(i), onItemClicked);

                int row = i / COLUMN_COUNT;
                int col = i % COLUMN_COUNT;
                gridPane.add(cardNode, col, row);

            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}