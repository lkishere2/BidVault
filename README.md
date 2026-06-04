<div align="center">

```
██████╗ ██╗██████╗     ██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗
██╔══██╗██║██╔══██╗    ██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝
██████╔╝██║██║  ██║    ██║   ██║███████║██║   ██║██║     ██║   
██╔══██╗██║██║  ██║    ╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║   
██████╔╝██║██████╔╝     ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║   
╚═════╝ ╚═╝╚═════╝       ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   
```

### *Where every bid tells a story.*

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaFX](https://img.shields.io/badge/JavaFX-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

**[Live Demo](https://bid-vault-seven.vercel.app/)** &nbsp;•&nbsp; **[Main Repository](https://github.com/lkishere2/BidVault)** &nbsp;•&nbsp; **[Deployment Fork](https://github.com/2cpk-fin/BidVault)**

</div>

---

## ![Overview](https://img.shields.io/badge/-%20Overview-4A90D9?style=flat-square&labelColor=4A90D9&color=1a1a2e)

**BidVault** is a real-time auction and bidding platform built with a microservice-inspired architecture. It features a highly secure authentication system, a live bidding engine, and a dual-interface approach — accessible via both a modern web app (ReactTS) and a desktop JavaFX application.

---

## ![Achievements](https://img.shields.io/badge/-%20Key%20Achievements-F5A623?style=flat-square&labelColor=F5A623&color=1a1a2e)

- **Highly secure** authentication & authorization system with `ADMIN` and `USER` roles
- **Fully functional** real-time auction and bidding engine
- **Dual interface** — Web (ReactTS) + Desktop (JavaFX)
- **Deployed** on third-party cloud platforms

---

## ![Technologies](https://img.shields.io/badge/-%20Technologies-7ED321?style=flat-square&labelColor=7ED321&color=1a1a2e)

| Layer | Technology |
|-------|-----------|
| ![](https://img.shields.io/badge/Backend%20API-6DB33F?style=flat-square) | Spring Boot (Java) |
| ![](https://img.shields.io/badge/Web%20UI-61DAFB?style=flat-square&logoColor=black) | React + TypeScript |
| ![](https://img.shields.io/badge/Desktop%20UI-ED8B00?style=flat-square) | JavaFX |
| ![](https://img.shields.io/badge/Main%20Database-316192?style=flat-square) | PostgreSQL |
| ![](https://img.shields.io/badge/Cache%20Database-DC382D?style=flat-square) | Redis |
| ![](https://img.shields.io/badge/Authentication-yellow?style=flat-square) | JWT, OAuth2 |
| ![](https://img.shields.io/badge/Containerization-2496ED?style=flat-square) | Docker |
| ![](https://img.shields.io/badge/Testing-25A162?style=flat-square) | JUnit, Mockito |
| ![](https://img.shields.io/badge/Documentation-85EA2D?style=flat-square&logoColor=black) | Swagger |

---

## ![Team](https://img.shields.io/badge/-%20Team%20%E2%80%94%20Group%207-E91E8C?style=flat-square&labelColor=E91E8C&color=1a1a2e)

| Member | Role |
|--------|------|
| **Trần Vũ Duy Hưng** | System design, database architecture, caching layers |
| **Vũ Long Khánh** | Security, authentication & authorization, ReactJS web UI |
| **Nguyễn Hoàng Lâm** | Feature testing (JUnit/Mockito), JavaFX UI, RESTful API |
| **Đinh Thái Hữu Khánh** | Feature testing (JUnit/Mockito), JavaFX UI, RESTful API |

---

## ![Architecture](https://img.shields.io/badge/-%20Architecture-9B59B6?style=flat-square&labelColor=9B59B6&color=1a1a2e)

The backend follows **Domain-Driven Design (DDD)**, with each domain cleanly separated and deployed across multi-cloud services.

### Project Structure

```
/bidvault
├── /backend
│   └── /src
│       ├── /main/java/com/auction/app
│       │   ├── /controllers        # JavaFX UI Controllers
│       │   ├── /domains            # Business Logic (DDD)
│       │   └── /infrastructure     # Configurations
│       └── /resources/ui           # JavaFX UI (components, styles, views)
└── /frontend/auction-app           # React UI
    └── /src
        ├── /api
        ├── /components
        ├── /pages
        │   ├── /admin
        │   ├── /auth
        │   └── /user
        └── /types
```

### Domain Structure

```
/domain
├── /dtos
├── /model
├── Repository.java
├── Controller.java
└── Service.java
```

### Test Structure

```
/folder
├── ControllerTests.java
├── ServiceTests.java
└── RepositoryTests.java
```

---

## ![Features](https://img.shields.io/badge/-%20Features%20%26%20Architecture-E74C3C?style=flat-square&labelColor=E74C3C&color=1a1a2e)

### ![Auth](https://img.shields.io/badge/1.-Authentication%20%26%20Authorization-FF6B6B?style=flat-square)

#### Registration

- **Google users** — OAuth2 integration allows one-click registration via *Continue with Google*.
- **Local users** — Stricter flow powered by Spring Boot Mail and Redis:
  1. User submits username, email, and password → server hashes the password → DB saves the account with `enabled = false`.
  2. A verification code is dispatched to the user's email via a message broker → Redis stores the code with a **15-minute TTL**.
  3. On successful verification → Redis deletes the key → DB sets `enabled = true` → user can now log in.

#### Login

- **Google users** — Same OAuth2 flow, minimal friction.
- **Local users** — Submit email and password → server validates credentials → issues a **JWT** and a **Refresh Token**.

#### Forgot Password

- **Google users** — Password reset is disabled for security reasons; users must authenticate via their Google account.
- **Local users** — Redis-backed reset flow:
  1. User requests a password reset → a verification code is sent via broker → Redis stores the code with a **15-minute TTL**.
  2. On successful verification → Redis creates a **reset ticket with a 5-minute TTL**.
  3. Within those 5 minutes, the user can reset their password. After expiry, the ticket is invalidated and verification must be repeated.

---

#### ![JWT](https://img.shields.io/badge/JWT%20%26%20the%20Filter%20Chain-F39C12?style=flat-square)

Upon login, users receive a **JWT** (short-lived) and a **Refresh Token** (long-lived).

A JWT consists of three Base64URL-encoded parts: `Header.Payload.Signature`

- **Header** — declares the token type and signing algorithm (HS256).
- **Payload** — contains claims: `sub` (user email & role), `iat` (issued at), `exp` (expiration).
- **Signature** — `HMAC-SHA256(base64(header) + "." + base64(payload), secret)` — tamper-proof seal.

**Filter flow** — the JWT filter extends `OncePerRequestFilter` and runs on every request:

```
Incoming Request
      │
      ▼
Extract Bearer token from Authorization header
      │
      ▼
Decode token → extract sub claim (email / role)
      │
      ▼
UserDetailsService.loadUserByUsername() → UserDetails from DB
      │
      ▼
Validate signature + check exp claim
      │
      ▼
Build UsernamePasswordAuthenticationToken(UserDetails, authorities)
      │
      ▼
Set into SecurityContextHolder → request proceeds
      │
      ▼ (on any failure)
401 Unauthorized
```

---

#### ![Refresh](https://img.shields.io/badge/Refresh%20Token-27AE60?style=flat-square)

| Property | JWT | Refresh Token |
|----------|-----|---------------|
| Lifespan | Short (e.g. 15 min) | Long (e.g. 7 days) |
| Stateless | Yes | No |
| Storage | Client-side | DB / Redis |

- **Rotation** — every time a Refresh Token is used, the old one is invalidated and a new one is issued.
- **Revocation** — on logout, the Refresh Token is deleted from Redis and blacklisted, ensuring it cannot be reused.
- **Expiry flow** — when the JWT expires, the client sends the Refresh Token to `/auth/refresh` → server validates against DB/Redis → issues a new JWT and Refresh Token pair.

---

#### ![Optimization](https://img.shields.io/badge/Filter%20Chain%20Optimization-1ABC9C?style=flat-square)

Calling `UserDetailsService` on every request means a DB hit on every request — a bottleneck under high traffic.

**Solution:** a lightweight `UserDetails` object is cached in Redis with a **30-minute TTL**. The filter reads from Redis first, bypassing the DB entirely for authenticated sessions. Result: drastically reduced DB load and near-instant request validation.

```
Request → JWT Filter → Redis cache hit? ──Yes──→ Use cached UserDetails
                                │
                               No
                                │
                                ▼
                         Load from DB → cache in Redis → proceed
```

---

### ![User](https://img.shields.io/badge/2.-User%20Features-3498DB?style=flat-square)

#### Profile

- Users can update their profile image, username, and password.

#### Money Management

- **Deposit / Withdraw** — users submit a transaction request → server validates and saves it as `PENDING`.
- Users can cancel a `PENDING` transaction at any time → record is removed from DB.
- **Admin side** — admin reviews transactions and sets status to `SUCCESS` or `FAILED`.

---

### ![Auction](https://img.shields.io/badge/3.-Auction%20System-E67E22?style=flat-square)

#### Product Storage

- Users add products (name, tags, quantity, image, etc.) to their personal storage before listing.
- Spring Security ensures users can only manage their own storage — cross-user access is rejected at the authorization layer.

#### Launching an Auction

- Users select a product and set starting price, quantity, start time, and end time.
- The server auto-calculates the minimum bid increment as **+5% of the current price**.
- Auction is saved to DB with `UPCOMING` status.

#### Bidding

- Users can browse and place bids on active auctions.

---

### ![Social](https://img.shields.io/badge/4.-Social%20%26%20Notification%20System-8E44AD?style=flat-square)

#### Following

- Users can search and follow other users via the community page.
- Followers are notified whenever a followed user launches a new auction.

#### Notifications

| Event | Recipients |
|-------|-----------|
| New system update (admin broadcast) | All users |
| New follower | Followed user |
| New auction launched | All followers of that user |

---

## ![Getting Started](https://img.shields.io/badge/-%20Getting%20Started-2ECC71?style=flat-square&labelColor=2ECC71&color=1a1a2e)

### Prerequisites

- Java 17+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL
- Redis

### Run with Docker

```bash
git clone https://github.com/lkishere2/BidVault.git
cd BidVault
docker-compose up --build
```

### Run locally

```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend/auction-app
npm install
npm run dev
```

---

<div align="center">

Made with coffee and hard work by **Group 7**

</div>
