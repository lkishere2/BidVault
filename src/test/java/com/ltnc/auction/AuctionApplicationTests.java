package com.ltnc.auction;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Auction Application Tests")
class AuctionApplicationTests {

	@Test
	@DisplayName("Application class should be loadable")
	void applicationLoads() {
		try {
			Class<?> appClass = Class.forName("com.ltnc.auction.AuctionApplication");
			assertNotNull(appClass, "AuctionApplication should be loadable");
			assertTrue(appClass.getName().contains("AuctionApplication"), 
					"Class should be named AuctionApplication");
		} catch (ClassNotFoundException e) {
			fail("AuctionApplication class should exist: " + e.getMessage());
		}
	}

}
