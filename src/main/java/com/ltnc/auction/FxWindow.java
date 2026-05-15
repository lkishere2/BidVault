package com.ltnc.auction;

import com.ltnc.auction.ui.SceneManager;
import javafx.stage.Stage;

public class FxWindow {
    public void show() {
        Stage stage = new Stage();
        SceneManager.init(stage);
        SceneManager.showAuth();
    }
}