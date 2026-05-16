package com.ltnc.auction.domain.exceptions;

public class AuctionNotFoundException extends RuntimeException {
    public AuctionNotFoundException(String message) {
        super(message);
    }
    
}
