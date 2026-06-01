package com.auction.app.controllers.market.bidsection;

import javafx.fxml.FXML;
import javafx.scene.layout.VBox;
import lombok.Getter;
import org.springframework.stereotype.Component;

@Component
@Getter
public class BidSectionViewController {
    @FXML private VBox bidInfoPanelContainer;
    @FXML private VBox bidFeedPanelContainer;
}