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

**[Live Demo](https://bid-vault-seven.vercel.app/)** &nbsp;•&nbsp; **[Main Repository](https://github.com/lkishere2/BidVault)** &nbsp;•&nbsp; **[Deployment Fork](https://github.com/2cpk-fin/BidVault)**

</div>

---

## 1. Problem Description and System Scope

**Problem:** Traditional physical auctions are limited by geography and time. Existing online bidding systems often suffer from latency issues, race conditions during high-traffic bidding wars, and lack a unified experience across different devices.
**System Scope:** **BidVault** is a real-time, highly resilient auction and bidding platform. The system is designed to provide a secure, fraud-resistant environment for users to manage digital wallets, host auctions, and participate in live bidding. It features a dual-interface architecture, offering both a modern web application and a desktop application, backed by a robust microservice-inspired Domain-Driven Design (DDD) backend.

## 2. Technologies, Environment, and Prerequisites

### Technologies Used
* **Backend API & Desktop UI:** Java, Spring Boot 3.4.0, JavaFX
* **Web Frontend:** React 19, TypeScript, Vite, Tailwind CSS
* **Databases:** PostgreSQL (Main persistent storage via Supabase), Upstash Redis (Cache, Pub/Sub, Queue, Auth storage)
* **Security:** JWT, OAuth2 (Google Provider)
* **Deployment & DevOps:** Docker, Vercel (Frontend), Cloudinary (Image CDN)

### Runtime Environment & Prerequisites
To run this project locally, your environment must have:
* **Java:** JDK 17 or higher
* **Node.js:** v18.0 or higher (with `npm`)
* **Docker & Docker Compose:** Required if running the full containerized stack.
* **Internet Connection:** Required to connect to managed cloud databases (Supabase, Upstash) and OAuth providers.

---

## 3. Directory Structure and Main Modules

The repository is organized into two main monolithic modules (Backend and Frontend) adopting Domain-Driven Design.

```text
/BidVault
├── backend/                       # Java backend & JavaFX application
│   ├── src/main/java/com/auction/app/
│   │   ├── controllers/           # JavaFX UI Controllers
│   │   ├── domains/               # Core Business Logic separated by domain
│   │   │   ├── auction/           # Bidding and Auction logic
│   │   │   ├── auth/              # Security and Token management
│   │   │   ├── products/          # Product storage management
│   │   │   ├── transaction/       # Wallet and money logic
│   │   │   └── users/             # User profiles and connections
│   │   └── infrastructure/        # Configurations (Security, WebSocket, Redis)
│   └── src/main/resources/ui/     # JavaFX FXML views and styles
│
├── frontend/                      # ReactTS Web Application
│   └── src/
│       ├── api/                   # Axios HTTP clients and Interceptors
│       ├── components/            # Reusable UI components
│       ├── pages/                 # Route-based page components
│       └── types/                 # TypeScript interfaces
│
├── docker-compose.yml             # Orchestration for containerized deployment
├── DB.md                          # Database Entity-Relationship documentation
├── EXPLAINATION.md                # In-depth technical logic (Concurrency, Auth)
└── FEATURE.md                     # Client-facing feature descriptions
```

---

## 4. Running the Application (Cross-Platform)

You can run the application using Docker, or locally using your native OS tools. The commands below are verified to work across **Windows**, **Linux**, and **macOS**.

### Option A: Running via Docker (Easiest)
Make sure Docker daemon is running.
```bash
git clone https://github.com/lkishere2/BidVault
cd BidVault
docker-compose up --build -d
```
*Note: The frontend will be exposed on port 80. Ensure no other service is using port 80.*

### Option B: Running Locally (Development Mode)
If you prefer running the source code directly without Docker:

**For Backend (Java/Spring Boot/JavaFX):**
*   **Windows (PowerShell/CMD):**
    ```cmd
    cd backend
    .\mvnw javafx:run
    ```
*   **Linux / macOS (Terminal):**
    ```bash
    cd backend
    ./mvnw javafx:run
    ```

**For Frontend (React/Vite):** (Universal across all OS)
```bash
cd frontend/auction-app
npm install
npm run dev
```

---

## 5. Execution Order (Server / Client)

If you are running the system locally (Option B), you **must** follow this strict execution order:

1. **Start the Backend Server FIRST:** 
   Navigate to the `backend/` directory and execute the Maven wrapper command (as shown above). Wait until the Spring Boot console logs indicate the server has started (typically on `localhost:8000`). The JavaFX Desktop app will also launch simultaneously.
2. **Start the Frontend Web Client SECOND:** 
   Once the backend is running and accepting connections, navigate to `frontend/auction-app/`, install dependencies, and run the development server. The web app will typically be available at `localhost:5173`.
3. *(Reasoning: The React frontend immediately attempts to establish a WebSocket STOMP connection and fetch initial configurations on load. If the backend is not running first, the frontend will throw network errors.)*

---

## 6. List of Completed Features

The system successfully implements the following core features:

### Authentication & Authorization
* **OAuth2 Integration:** One-click Google Sign-In.
* **Local Registration:** Secure email verification using Redis OTPs (15-minute TTL).
* **Robust Security:** JWT-based stateless authentication with secure Refresh Token rotation and Redis-backed Filter Chain optimization.
* **Role-Based Access Control:** Distinct capabilities for `USER` and `ADMIN` roles.

### User & Wallet Management
* **Profile Customization:** Users can update avatars, passwords, and usernames.
* **Financial Transactions:** Users can request Deposits and Withdrawals. Admins review and approve/deny these requests on a dedicated dashboard to maintain financial integrity.

### Auction & Bidding Engine (Real-Time)
* **Product Storage:** Users manage personal inventories of items.
* **Auction Hosting:** Users can launch live auctions with custom start/end times and dynamic minimum bid calculations.
* **Automated Lifecycle:** A background scheduler automatically transitions auctions from `UPCOMING` → `ACTIVE` → `ENDED`.
* **High-Concurrency Bidding:** Utilizes a Redis Queue and background async workers to process simultaneous bids sequentially, preventing database locks and race conditions.
* **Live Updates:** Bids and price changes are broadcasted in real-time to all clients via STOMP WebSockets and Redis Pub/Sub.

### Social & Community
* **Following System:** Users can search and follow their favorite sellers.
* **Real-Time Notifications:** Instant alerts pushed to clients when a followed seller launches a new auction, or when a user gains a new follower.
* **Admin Broadcasts:** Administrators can push system-wide announcements to all active users.

---
<div align="center">
Made with coffee and hard work by <b>Group 7</b>
</div>
