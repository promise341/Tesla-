# Testing Guide for Critical Features

This guide walks you through testing all 6 newly implemented critical features. You'll need to test as both a **regular user** and an **admin user**.

---

## Prerequisites

1. **Start your dev server**: `npm run dev`
2. **Access the app**: `http://localhost:3000`
3. **Have two test accounts**:
   - One regular user account (for testing features)
   - One admin account (for testing admin panel)

### Create Admin User

To create an admin user, you need to manually update the database or use Prisma Studio:

```bash
npx prisma studio
```

Then:
1. Find your admin user in the User table
2. Change their `role` field from `"USER"` to `"ADMIN"`
3. Save and close Prisma Studio

---

## Feature 1: Crypto Address Generation for Deposits

### Test Steps:

1. **Log in as a regular user**
2. Navigate to: `/dashboard/wallet/deposit`
3. **Request a deposit address**:
   - Click "Generate Deposit Address"
   - Select currency: **BTC**, **ETH**, or **USDT**
   - Click "Generate"

### Expected Results:
- ✅ A unique wallet address is displayed
- ✅ Address format matches the currency (e.g., `1A...` for BTC, `0x...` for ETH/USDT)
- ✅ Expiration time shown (24 hours from now)
- ✅ Can copy address to clipboard

### API Test (via Postman/cURL):
```bash
# Generate address
curl -X POST http://localhost:3000/api/deposits/generate-address \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"currency": "BTC"}'

# Get active addresses
curl -X GET http://localhost:3000/api/deposits/generate-address \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

---

## Feature 2 & 3: Deposit Approval Workflow

### User Side - Request a Deposit:

1. **Log in as regular user**
2. Go to: `/dashboard/wallet/deposit`
3. **Submit deposit request**:
   - Amount: `$100`
   - Method: `BTC`
   - Click "Request Deposit"

### Expected Results:
- ✅ Transaction created with status **PENDING**
- ✅ Transaction appears in `/dashboard/wallet/transactions`

### Admin Side - Approve Deposit:

1. **Log in as admin user**
2. Navigate to: `/admin/deposits`

### Expected Results:
- ✅ See list of **pending deposits**
- ✅ Show user name, email, amount, date, method

3. **Approve the deposit**:
   - Click "Approve" button for the deposit

### Expected Results:
- ✅ Deposit removed from pending list
- ✅ Transaction status changes to **COMPLETED**
- ✅ **User's balance increases by $100** ✨

4. **Verify in user dashboard**:
   - Log in as the regular user
   - Check account balance - should show **+$100**

### API Test:
```bash
# As regular user, get pending deposits (admin only)
curl -X GET http://localhost:3000/api/admin/deposits/approve \
  -H "Authorization: Bearer ADMIN_SESSION_TOKEN"

# As admin, approve a deposit
curl -X PATCH http://localhost:3000/api/admin/deposits/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_SESSION_TOKEN" \
  -d '{"transactionId": "TRANSACTION_ID", "approved": true, "notes": "Verified"}'
```

---

## Feature 4: Withdrawal Approval Workflow

### User Side - Request Withdrawal:

1. **Log in as regular user** (must have balance > 0)
2. Go to: `/dashboard/wallet/withdraw`
3. **Submit withdrawal request**:
   - Amount: `$50`
   - Method: `ETH`
   - Wallet Address: `0x1234567890abcdef1234567890abcdef12345678`
   - Verification Code: `WD-2025-CAPX`
   - Click "Withdraw"

### Expected Results:
- ✅ Transaction created with status **PENDING**
- ✅ Balance NOT deducted yet (happens after admin approval)
- ✅ Transaction appears in history

### Admin Side - Approve Withdrawal:

1. **Log in as admin user**
2. Navigate to: `/admin/withdrawals`

### Expected Results:
- ✅ See list of **pending withdrawals**
- ✅ Show user name, email, amount, wallet address, date

3. **Approve the withdrawal**:
   - Click "Approve" button

### Expected Results:
- ✅ Withdrawal removed from pending list
- ✅ Transaction status changes to **COMPLETED**
- ✅ **User's balance decreases by $50** ✨
- ✅ **totalWithdraw counter increases**

### API Test:
```bash
# Get pending withdrawals (admin)
curl -X GET http://localhost:3000/api/admin/withdrawals/approve \
  -H "Authorization: Bearer ADMIN_SESSION_TOKEN"

# Approve withdrawal
curl -X PATCH http://localhost:3000/api/admin/withdrawals/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_SESSION_TOKEN" \
  -d '{"transactionId": "TRANSACTION_ID", "approved": true}'
```

---

## Feature 5: Referral System

### Setup Referral Tracking:

1. **Get User A's referral link**: `/dashboard`
   - Find "Your Referral Link": `http://teslacapx.com/ref/USERNAME_A`

2. **User B signs up using the link**:
   - New signup process should pass `referralCode=USERNAME_A`

3. **Track the referral** (this should happen automatically during signup):
   ```bash
   curl -X POST http://localhost:3000/api/referral/track \
     -H "Content-Type: application/json" \
     -d '{
       "referralCode": "USERNAME_A",
       "newUserEmail": "userb@example.com"
     }'
   ```

### Expected Results:
- ✅ Referral record created in database
- ✅ Status is **PENDING** until User B deposits

### Claim Referral Bonus:

1. **User B makes a deposit**:
   - Request deposit: `$100`
   - Admin approves it
   - User B's balance: `+$100`

2. **User A claims referral bonus**:
   - Log in as User A
   - Call this endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/referral/claim \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer USER_A_SESSION_TOKEN" \
     -d '{"refereeEmail": "userb@example.com"}'
   ```

### Expected Results:
- ✅ Referral status changes to **CREDITED**
- ✅ **User A's balance increases by $50** (referral bonus)
- ✅ **PROFIT transaction created** in User A's transaction history

### Check Referral Stats:

```bash
# Get referral stats (as referrer)
curl -X GET http://localhost:3000/api/referral/claim \
  -H "Authorization: Bearer USER_A_SESSION_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "stats": {
    "totalReferrals": 1,
    "creditedBonuses": 1,
    "pendingBonuses": 0,
    "totalBonusEarned": 50
  },
  "referrals": [...]
}
```

---

## Feature 6: Market Data Endpoints

### Test Forex Data:

```bash
# Get all forex pairs
curl -X GET http://localhost:3000/api/market/forex

# Get specific pair
curl -X GET http://localhost:3000/api/market/forex?pair=EUR%2FUSD
```

Expected response:
```json
{
  "success": true,
  "data": {
    "pair": "EUR/USD",
    "name": "Euro vs US Dollar",
    "price": 1.0950,
    "change": 0.45,
    "volume": 350000000000
  }
}
```

### Test Commodities Data:

```bash
# Get all commodities
curl -X GET http://localhost:3000/api/market/commodities

# Get specific commodity
curl -X GET http://localhost:3000/api/market/commodities?symbol=GOLD
```

### Test Bonds Data:

```bash
# Get all bonds
curl -X GET http://localhost:3000/api/market/bonds

# Get specific bond
curl -X GET http://localhost:3000/api/market/bonds?symbol=US10Y
```

### Expected Results:
- ✅ All endpoints return `success: true`
- ✅ Data includes price, change, volume/yield information
- ✅ Query filtering works (by pair/symbol)

---

## Feature 7: Admin Panel & KYC Approval

### Access Admin Panel:

1. **Log in as admin user**
2. Navigate to: `/admin`

### Expected Results:
- ✅ Admin panel loads (requires admin role)
- ✅ Regular users get redirected if they try to access `/admin`
- ✅ Shows stat cards: Pending Deposits, Withdrawals, KYC, Total Users

### KYC Verification:

1. **Regular user submits KYC**:
   - Go to: `/dashboard/verify-account`
   - Upload ID front, ID back, selfie
   - Submit

### Expected Results:
- ✅ `kycStatus` changes to **PENDING**
- ✅ Documents saved to `/public/kyc/` folder

2. **Admin reviews KYC**:
   - Log in as admin
   - Go to: `/admin/kyc`
   - See list of pending KYC submissions

### Expected Results:
- ✅ Can view all 3 documents (front, back, selfie)
- ✅ Documents display as images

3. **Admin approves/rejects**:
   - Click "Approve" or "Reject"

### Expected Results:
- ✅ User's `kycStatus` changes to **VERIFIED** or **REJECTED**
- ✅ Admin action logged in database
- ✅ User removed from pending list

---

## Admin Panel Navigation

### Available Pages:

| Page | Path | Purpose |
|------|------|---------|
| Overview | `/admin` | Dashboard with stats and quick actions |
| Deposits | `/admin/deposits` | Review pending deposits |
| Withdrawals | `/admin/withdrawals` | Review pending withdrawals |
| KYC | `/admin/kyc` | Review and approve identity verification |
| Logs | `/admin/logs` | View all admin actions (created but empty - optional to implement) |

---

## Full End-to-End Flow

**Scenario**: User A refers User B and both make deposits

### Steps:

1. **User A**:
   - Creates account
   - Gets referral link: `ref/user_a`

2. **User B**:
   - Clicks User A's referral link
   - Signs up with code `user_a`

3. **Admin**:
   - Tracks referral (or happens auto on signup)

4. **User B**:
   - Requests $100 deposit via BTC
   - Gets deposit address

5. **Admin**:
   - Sees pending deposit in `/admin/deposits`
   - Approves it
   - User B's balance: `+$100`

6. **User A**:
   - Claims referral bonus
   - Balance increases by `$50`
   - Transaction appears as **PROFIT** type

---

## Troubleshooting

### Issue: Admin panel shows 403 Forbidden
- **Solution**: Make sure user's `role` is set to `"ADMIN"` in database

### Issue: Deposit approval doesn't credit balance
- **Solution**: Check the PATCH endpoint is returning success, verify transaction status is COMPLETED

### Issue: Referral claim fails with "Referee must complete a deposit"
- **Solution**: Ensure the referee's deposit transaction has status **COMPLETED** (admin must approve it first)

### Issue: Market data returns 404
- **Solution**: Check endpoints are at `/api/market/forex`, `/api/market/commodities`, `/api/market/bonds`

### Issue: KYC documents don't display
- **Solution**: Verify files are saved in `/public/kyc/` and paths are correct in database

---

## Quick Testing Checklist

### Crypto Address Generation
- [ ] Can generate BTC, ETH, USDT addresses
- [ ] Address format is correct
- [ ] 24-hour expiration shown
- [ ] Can retrieve active addresses

### Deposit Workflow
- [ ] User requests deposit
- [ ] Admin sees pending deposit
- [ ] Admin approves
- [ ] User balance increases
- [ ] Transaction status = COMPLETED

### Withdrawal Workflow
- [ ] User requests withdrawal
- [ ] Admin sees pending withdrawal
- [ ] Admin approves
- [ ] User balance decreases
- [ ] totalWithdraw increases

### Referral System
- [ ] Referral tracked when user signs up
- [ ] Bonus claimed after referee deposits
- [ ] Referrer gets $50 bonus
- [ ] Stats endpoint shows correct data

### Market Data
- [ ] Forex endpoint returns pairs
- [ ] Commodities endpoint returns commodities
- [ ] Bonds endpoint returns bonds
- [ ] Query filtering works

### Admin Panel
- [ ] Admin can access `/admin`
- [ ] Regular users cannot access
- [ ] Stats display correctly
- [ ] All action buttons work
- [ ] KYC documents display

---

## Next Steps

1. Test all features using this guide
2. Report any bugs or issues
3. Consider implementing:
   - Real crypto API integration (instead of mock addresses)
   - Real market data source (Alpha Vantage, IEX Cloud, etc.)
   - Auto-payout scheduler for daily profits
   - Admin logs page (empty but routed)
   - Email notifications for approvals

---

**Note**: This testing guide assumes you're running locally with SQLite. In production, you'll need:
- Real payment gateway integration
- Real market data APIs
- Email service for notifications
- Proper secrets management
- Rate limiting on APIs
