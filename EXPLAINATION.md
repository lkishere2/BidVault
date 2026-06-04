# Technical Implementation & Logic Explanation

This document provides an in-depth look at the technical architecture and the specific logic driving the core features of the Bid Vault platform. It emphasizes performance optimization, security mechanisms, and the handling of high-concurrency scenarios.

---

## 1. Authentication & Security Architecture

### 1.1. Dual Authentication Strategy
* **OAuth2 (Google Integration):** We utilize the Authorization Code Flow. The frontend redirects to Google, receives an auth code, and sends it to our backend. The backend exchanges this for an access token, fetches the user's profile, and either registers them or logs them in, issuing our own system's JWT. This completely bypasses the need to handle passwords for these users.
* **Local Accounts & OTP Verification:** To prevent spam and ensure valid emails, registration requires an OTP. 
  * Spring Boot Mail (via Gmail SMTP) dispatches the code.
  * The code is stored in **Redis** with a strict 15-minute Time-To-Live (TTL). 
  * *Why Redis?* Using Redis for OTPs prevents the primary PostgreSQL database from being bloated with transient, short-lived verification codes.

### 1.2. The Token System (JWT & Refresh Tokens)
* **Access Tokens (JWT):** Short-lived, stateless tokens containing the user's ID and role in the payload.
* **Refresh Tokens:** Long-lived, stateful tokens stored in the PostgreSQL `refresh_tokens` table. When a JWT expires, the client uses the Refresh Token to obtain a new pair. Upon logout, the Refresh Token is deleted/blacklisted to prevent token hijacking.

### 1.3. Filter Chain Optimization (The Redis Cache)
In a traditional Spring Security setup, the JWT filter intercepts every request, decodes the token, and queries the database to load the `UserDetails` (roles, permissions, lock status). 
* **The Problem:** In a real-time app with thousands of requests per second, hitting PostgreSQL on every request quickly exhausts the database connection pool.
* **The Solution:** We implemented a lightweight version of `UserDetails` and cache it in Redis with a 30-minute TTL. The filter checks Redis first (`O(1)` time complexity). This makes authorization virtually instantaneous and drastically reduces database load.

---

## 2. Wallet & Financial Transaction Logic

Handling money requires strict ACID compliance. 
* **Pending States:** When a user requests a deposit or withdrawal, a `Transaction` entity is created with a `PENDING` status. The user's `balance` remains untouched.
* **Admin Resolution & Database Integrity:** Administrators review these requests on a dashboard. When an admin approves a transaction (changing it to `SUCCESS`), the system executes an update to the user's `balance`.
* **Locking:** To prevent race conditions where a user might attempt to withdraw money simultaneously from multiple devices, the system relies on PostgreSQL's row-level locking (or JPA Optimistic Locking using `@Version` tags) during the balance update process to guarantee financial consistency.

---

## 3. The Auction Lifecycle Scheduler

Auctions must start and end exactly on time, without relying on a user triggering an HTTP request.
* **The Polling Mechanism:** A Spring `@Scheduled` task runs continuously every **500 milliseconds**.
* **State Transitions:** 
  * It scans for auctions where `startTime <= now()` and `status == UPCOMING`, transitioning them to `ACTIVE`.
  * It scans for auctions where `endTime <= now()` and `status == ACTIVE`, transitioning them to `ENDED`, and determines the winner based on the highest bid.
* **Cache Eviction:** Immediately upon updating an auction's state, the scheduler deletes the corresponding cached auction data in Redis. The next client request will force a cache miss, ensuring they retrieve the fresh state from the database and repopulate the cache.

---

## 4. Deep Dive: Auction Concurrency Handling

The most complex technical challenge in Bid Vault is the **"Thundering Herd"** problem during an auction's closing seconds. Hundreds of users might click "Bid" at the exact same millisecond. 

If we process these requests synchronously by connecting directly to PostgreSQL, we risk:
1. **Race Conditions:** Two users bidding $100 simultaneously could both be accepted.
2. **Database Deadlocks:** Multiple threads trying to lock the same `Auction` row to update the `currentPrice`.
3. **Thread Exhaustion:** The Tomcat web server running out of worker threads as they all wait for database locks.

**The Solution: Redis Queue and Pub/Sub Architecture**

### Step-by-Step Concurrency Flow:

1. **Bid Ingestion (O(1) Time Complexity):**
   When a bid request hits the API (via HTTP or STOMP WebSocket), the controller **does not** touch PostgreSQL. Instead, it serializes the bid payload (User ID, Auction ID, Amount, Timestamp) and executes a Redis `RPUSH` command to append the bid to a specific list: `auction:queue:{auction_id}`. 
   *Because Redis operates on a single-threaded event loop, all incoming bids are naturally serialized and queued in the exact chronological order they were received, eliminating race conditions at the ingestion layer.*

2. **Sequential Drain (The Async Worker):**
   A dedicated background thread (Async Worker) continuously polls the queue using commands like `LPOP` or `BLPOP` (blocking pop). 
   * The worker processes exactly **one bid at a time** for a given auction. 

3. **In-Memory Validation:**
   Before hitting the database, the worker validates the bid against the cached state of the auction.
   * It checks a Redis key `auction:price:{auction_id}` to get the current highest price.
   * If `New Bid Amount < Current Cached Price + minBidIncrement`, the bid is instantly rejected and discarded.

4. **Database Write (The Bottleneck Removed):**
   If the bid is valid, the worker:
   * Updates the `auction:price:{auction_id}` cache with the new amount.
   * Saves the new `Bid` entity to PostgreSQL.
   * Updates the `Auction` entity's `currentPrice` and `bidCount`.
   * *Because only one worker is writing to this specific auction's row at a time, there are zero database locks or deadlocks.*

5. **Real-Time Broadcast (Pub/Sub):**
   Immediately after a successful write, the worker publishes a payload (new price, highest bidder username) to a Redis Pub/Sub channel: `auction:notify:{auction_id}`.

6. **WebSocket Gateway Delivery:**
   The Spring WebSocket Gateway servers are subscribed to these Redis channels. When a message is published, the gateway catches it and instantly routes it via STOMP over SockJS to the specific topic (e.g., `/topic/auctions/{auction_id}`). 
   All browsers viewing that auction receive the payload and update their UI instantaneously, creating a seamless, conflict-free bidding war.
