# TradePulse: Multi-Tenant Group-Buying Aggregator

TradePulse is a B2B group-buying aggregator designed to pool procurement volume across localized merchant clusters (such as **Vasai-Virar**, Maharashtra). By pooling individual orders from small kirana stores, supermarkets, and restaurants, the platform unlocks wholesale volumetric price tiers directly from tier-1 FMCG distributors and manufacturers.

---

## 🌟 Architecture & Features

1. **Merchant Portal (`/pools`, `/invoices`, `/wallet`)**:
   - Browse active bulk buying pools and live dynamic pricing tiers.
   - Commit volume with real-time price calculations and automated escrow holds.
   - View tax sub-invoices with GST breakdown (CGST & SGST 2.5% for intra-state Maharashtra).
   - Display electronic Proof of Delivery (e-POD) 6-digit OTP codes for goods handover.
   - Merchant double-entry wallet balance and transaction ledger.

2. **Admin Console (`/admin`)**:
   - Operations dashboard with aggregate ecosystem metrics.
   - Product catalog management and volume-based pricing tier definitions.
   - Buying pool lifecycle controls (create pools, issue consolidated Master POs).
   - Delivery verification with 6-digit OTP (e-POD) that triggers escrow release to distributor accounts payable and refunds rebates.
   - Merchant KYC verification and credit management.

3. **Core Backend Engine (`server.ts`)**:
   - Express REST API running on port 3000 with Vite middleware integration.
   - In-memory ACID double-entry ledger tracking merchant available funds, escrow holds, distributor payables, and platform commission.
   - Stateless JWT authentication and role-based access control.

---

## 🔑 Demo Credentials

### 1. Merchant Accounts
- **Om Sai Kirana General Store** (Vasai West)
  - **Email**: `omsai.vasai@tradepulse.io`
  - **Password**: `Password123!`
- **Manvelpada Supermarket** (Virar East)
  - **Email**: `manvelpada.mart@tradepulse.io`
  - **Password**: `Password123!`

### 2. Admin / Operations Account
- **TradePulse Ops** (Vasai West Operations Office)
  - **Email**: `ops@tradepulse.io`
  - **Password**: `AdminPass123!`
  - Access via `/admin` or click "Switch to Admin Console" from the top navigation.