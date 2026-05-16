package com.ltnc.auction.domain.exceptions;

public class ItemNotAvailableException extends RuntimeException {
    public ItemNotAvailableException(String message) {
        super(message);
    }
    
}
