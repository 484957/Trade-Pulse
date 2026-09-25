# TradePulse Firebase Security Specification

## 1. Data Invariants
1. **User Identity & Multi-Role Isolation**: Every merchant write must enforce that the author UID matches `request.auth.uid`. A merchant cannot elevate their role to `ROLE_ADMIN` or modify other merchants' profiles.
2. **Admin Authority**: Only authenticated administrators (whose UID exists in `/admins/{adminId}` or whose verified email matches the bootstrapped admin `rehankhan0214e@gmail.com` / `ops@tradepulse.io`) can create/update catalog products, update buying pool states (e.g., OPEN -> FROZEN -> EXECUTED), and manage master purchase orders.
3. **Buying Pool Commitments Integrity**: Commitments can only be submitted by verified merchants when a buying pool is in the `OPEN` state. A merchant cannot alter or forge another merchant's commitment ID, volume, or escrow balance.
4. **Wallet Escrow Protection**: Wallets cannot be modified directly by client arbitrary writes. A merchant cannot artificially increment their `availableBalance` or drain another user's escrow.
5. **e-POD Delivery OTP Privacy & Settlement**: Merchant sub-invoices are strictly viewable by the merchant recipient and administrators. Delivery OTPs are 6-digit verification tokens that can only be verified against admin fulfillment settlement.
6. **PII Isolation**: Merchant business registration details, GSTIN, and direct phone contact are isolated under `/users/{userId}/private/info` and strictly readable only by the document owner or verified administrators.

## 2. The "Dirty Dozen" Payloads (Denial Scenarios)
1. **Payload 1 (Privilege Escalation on User Profile)**: An authenticated merchant attempts to update their own role: `{"role": "ROLE_ADMIN"}`. *Expected: PERMISSION_DENIED*.
2. **Payload 2 (Unverified Email Write)**: A user with `email_verified: false` attempts to create or join a pool commitment. *Expected: PERMISSION_DENIED*.
3. **Payload 3 (Commitment Forgery for Another Merchant)**: User A attempts to write a commitment doc under `/pools/{poolId}/commitments/{commitmentId}` with `userId: "user-B-uid"`. *Expected: PERMISSION_DENIED*.
4. **Payload 4 (Ghost Field / Shadow Injection)**: An attacker submits product update with a phantom property `{"ghostAdminOverride": true}`. *Expected: PERMISSION_DENIED*.
5. **Payload 5 (Path ID Poisoning)**: Write request with a 2000-character malicious document ID containing path traversal characters `../../`. *Expected: PERMISSION_DENIED*.
6. **Payload 6 (Terminal State Bypass)**: Attempting to update a buying pool that is already in terminal state `EXECUTED` back to `OPEN`. *Expected: PERMISSION_DENIED*.
7. **Payload 7 (Direct Wallet Balance Inflation)**: A merchant client directly issues a `setDoc` or `updateDoc` on `/wallets/{userId}` with `availableBalance: 99999999`. *Expected: PERMISSION_DENIED*.
8. **Payload 8 (PII Snoop Attack)**: Merchant A attempts to run `getDoc` on `/users/merchant-B/private/info`. *Expected: PERMISSION_DENIED*.
9. **Payload 9 (Commitment on Closed Pool)**: Attempting to add a commitment to a pool whose status is `FROZEN` or `CANCELLED`. *Expected: PERMISSION_DENIED*.
10. **Payload 10 (Negative Commitment Volume)**: Merchant attempts to commit `quantity: -50` to withdraw or skew the pool tier calculation. *Expected: PERMISSION_DENIED*.
11. **Payload 11 (Delivery OTP Leak Query)**: An unauthorized third party queries `/invoices` without filtering for their own `merchantId`. *Expected: PERMISSION_DENIED*.
12. **Payload 12 (Admin Registry Hijack)**: Non-admin user attempts to create a document in `/admins/{uid}`. *Expected: PERMISSION_DENIED*.

## 3. Test Verification Matrix
All 12 adversarial payloads are mapped to explicit boolean gates in `firestore.rules`, enforcing static shape validation (`isValid[Entity]`), relational validation (`get()`, `exists()`), and strict role partitioning (`isAdmin()`).
