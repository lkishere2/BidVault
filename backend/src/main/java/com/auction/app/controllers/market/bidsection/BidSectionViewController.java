package com.auction.app.controllers.market.bidsection;

import javafx.fxml.FXML;
import javafx.scene.layout.VBox;
import lombok.Getter;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Getter
public class BidSectionViewController {
    @FXML private VBox bidInfoPanelContainer;
    @FXML private VBox bidFeedPanelContainer;
}