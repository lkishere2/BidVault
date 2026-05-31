package com.auction.app.controllers.admin.transaction;

import com.auction.app.domains.transaction.dtos.ClientRequest;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Node;
import javafx.scene.layout.VBox;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.function.Consumer;

@Component
public class ClientRequestGridController {

    @FXML private VBox containerBox;

    public void renderItems(List<ClientRequest> items, Consumer<ClientRequest> onAccept, Consumer<ClientRequest> onDeny) {
        containerBox.getChildren().clear();

        if (items == null || items.isEmpty()) return;

        for (ClientRequest request : items) {
            try {
                FXMLLoader loader = new FXMLLoader(getClass().getResource("/ui/views/admin/transaction/ClientRequestItem.fxml"));
                Node itemNode = loader.load();

                ClientRequestItemController itemController = loader.getController();
                itemController.populate(request, onAccept, onDeny);

                containerBox.getChildren().add(itemNode);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}