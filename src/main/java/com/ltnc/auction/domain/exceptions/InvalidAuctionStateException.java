package com.ltnc.auction.domain.exceptions;

public class InvalidAuctionStateException extends RuntimeException {
    public InvalidAuctionStateException(String message) {
        super(message);
    }
}
