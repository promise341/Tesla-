# 🏦 Trading Deposit System - Complete Implementation Plan

**Date:** January 2025  
**Purpose:** Users must deposit funds before trading. Deposits require payment proof and admin approval.

---

## 🎯 System Requirements

### **User Flow:**
1. User has $0 balance
2. Tries to access trading → **BLOCKED** → Redirected to deposit page
3. User deposits funds with payment proof
4. Admin reviews and approves deposit
5. User receives notification
6. Balance updated → User can now trade

---

## ✅ Current Status

### **What's Already Built:**

#### **1. Deposit Page** ✅
**Location:** `/app/dashboard/wallet/deposit/page.tsx`

**Features:**
- ✅ Multi-step deposit flow:
  1. Choose cryptocurrency (BTC, ETH, BNB, SOL, USDT-ETH, USDT-TRX)
  2. Enter amount (minimum $50)
  3. Show wallet address with QR code
  4. Upload payment proof screenshot
  5. Enter user's wallet address (for refunds)
- ✅ Copy-to-clipboard functionality
- ✅ Real wallet addresses from `.env.local`
- ✅ File upload validation
- ✅ Success confirmation

**Wallet Addresses Used:**
- BTC: `bc1qfkt5syd6n2dsqe3af2drhkmq8w0myqeealh7t6`
- ETH: `0x79De6d50cC9D9fB9A5926b6b4037570650DF1a17`
- USDT (TRC20): `TVyZQzexvLtq8uBC8bcXJykqtRaC4VKW6u`
- BNB: `0x79De6d50cC9D9fB9A5926b6b4037570650DF1a17`
- SOL: `CpHS2AK9uLyeHNvTFmDUcnPxpNvHUnfCZ9m4P7Mqw8Sg`

**Status:** ✅ **FULLY FUNCTIONAL**

---

#### **2. Trading Pages** ✅
**Locations:**
- `/app/dashboard/trading/page.tsx` - Markets overview
- `/app/dashboard/trade/[id]/page.tsx` - Trade execution

**Features:**
- ✅ 166 tradable instruments
- ✅ Buy/Sell with leverage
- ✅ Stop Loss & Take Profit
- ✅ Live P&L tracking
- ✅ Balance display

**Status:** ✅ **FULLY FUNCTIONAL**

---

## 🔧 What Needs to Be Added

### **1. Balance Check & Redirect**

#### **A. Trading Markets Page**
**File:** `app/dashboard/trading/page.tsx`

**Add these changes:**

```typescript
// At top with other imports
import { useRouter } from "next/navigation";

// In component, add state
const router = useRouter();
const [balance, setBalance] = useState(0);
const [balanceLoading, setBalanceLoading] = useState(true);

// Add balance fetch function
const fetchBalance = useCallback(async () => {
  try {
    const res = await fetch("/api/user/me");
    if (res.ok) {
      const data = await res.json();
      setBalance(data.balance || 0);
    }
  } catch {}
  finally { setBalanceLoading(false); }
}, []);

// Call it on mount
useEffect(() => {
  fetchAll();
  fetchBalance();
  // ... rest of code
}, [fetchAll, fetchBalance]);

// Add zero balance warning banner BEFORE the market table
{!balanceLoading && balance === 0 && (
  <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl p-5 flex items-start gap-4">
    <AlertCircle size={24} className="text-orange-500 flex-shrink-0 mt-0.5"/>
    <div className="flex-1">
      <h3 className="font-extrabold text-orange-900 dark:text-orange-100 mb-1">
        Insufficient Balance to Trade
      </h3>
      <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
        You need to deposit funds before you can start trading. Click below to make your first deposit.
      </p>
      <Link
        href="/dashboard/wallet/deposit"
        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors"
      >
        <Coins size={16} />
        Deposit Funds Now
      </Link>
    </div>
  </div>
)}
```

---

#### **B. Trade Execution Page**
**File:** `app/dashboard/trade/[id]/page.tsx`

**Add this after the balance fetch useEffect:**

```typescript
// Redirect to deposit if balance is 0
useEffect(() => {
  if (!loading && balance === 0) {
    router.push("/dashboard/wallet/deposit?from=trading");
  }
}, [balance, loading, router]);
```

**What it does:**
- Checks balance after page loads
- If balance is exactly $0 → Redirects to deposit page
- Adds `?from=trading` parameter so deposit page can show context

---

### **2. Deposit API Endpoints**

#### **A. Create Deposit Transaction**
**Endpoint:** `POST /api/transactions/deposit`

**What it should do:**
1. Get authenticated user
2. Create transaction record with status "PENDING"
3. Return transaction ID

**Request:**
```json
{
  "amount": 100.00,
  "method": "BTC"
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "trans_123",
    "userId": "user_456",
    "type": "DEPOSIT",
    "amount": 100.00,
    "method": "BTC",
    "status": "PENDING",
    "createdAt": "2025-01-14T12:00:00Z"
  }
}
```

---

#### **B. Upload Payment Proof**
**Endpoint:** `POST /api/deposits/upload-proof`

**What it should do:**
1. Get authenticated user
2. Validate file (image only, max 5MB)
3. Upload to storage
4. Update transaction with proof URL and user wallet
5. Create notification for user: "Deposit proof submitted"
6. **Create notification for ADMIN:** "New deposit proof to review"
7. Return success

**Request (FormData):**
```
transactionId: "trans_123"
proofImage: File
walletAddress: "0x..."
```

**Response:**
```json
{
  "success": true,
  "proofUrl": "https://storage.../proof_123.png"
}
```

---

### **3. Admin Deposit Approval Page**

#### **Location:** `/app/admin/deposits/page.tsx`

**Features Needed:**
- ✅ List all pending deposits
- ✅ Show:
  - User name & email
  - Amount
  - Cryptocurrency method
  - Payment proof (clickable image)
  - User's wallet address
  - Submission date
- ✅ **Approve Button:**
  - Add amount to user balance
  - Update transaction status to "COMPLETED"
  - Create notification: "Your deposit of $X has been approved!"
- ✅ **Reject Button:**
  - Update transaction status to "REJECTED"
  - Create notification: "Your deposit was rejected. Reason: [reason]"
  - Input field for rejection reason

**UI Structure:**
```tsx
<div className="space-y-4">
  {deposits.map(deposit => (
    <div key={deposit.id} className="bg-white rounded-xl p-6 border">
      {/* User Info */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className="font-bold">{deposit.user.name}</p>
          <p className="text-sm text-gray-500">{deposit.user.email}</p>
        </div>
      </div>

      {/* Deposit Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Amount</p>
          <p className="font-bold text-lg">${deposit.amount}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Method</p>
          <p className="font-bold">{deposit.method}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">User Wallet</p>
          <code className="text-xs">{deposit.userWallet}</code>
        </div>
        <div>
          <p className="text-sm text-gray-500">Date</p>
          <p className="text-sm">{new Date(deposit.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Payment Proof */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">Payment Proof:</p>
        <a href={deposit.proofUrl} target="_blank" rel="noopener noreferrer">
          <img 
            src={deposit.proofUrl} 
            alt="Payment Proof" 
            className="max-w-md rounded-lg border cursor-pointer hover:opacity-80"
          />
        </a>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => handleApprove(deposit.id)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg"
        >
          ✓ Approve
        </button>
        <button
          onClick={() => handleReject(deposit.id)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          ✗ Reject
        </button>
      </div>
    </div>
  ))}
</div>
```

---

#### **Admin Approval API**
**Endpoint:** `POST /api/admin/deposits/approve`

**Request:**
```json
{
  "transactionId": "trans_123",
  "action": "APPROVE" // or "REJECT"
  "reason": "Invalid proof" // only for REJECT
}
```

**What it does:**

**If APPROVE:**
1. Update transaction status to "COMPLETED"
2. **Add amount to user balance:**
   ```typescript
   await prisma.user.update({
     where: { id: userId },
     data: {
       balance: {
         increment: amount
       }
     }
   });
   ```
3. Create notification for user:
   ```typescript
   await prisma.notification.create({
     data: {
       userId: transaction.userId,
       type: "DEPOSIT_APPROVED",
       title: "Deposit Approved!",
       message: `Your deposit of $${amount} via ${method} has been approved and added to your balance.`,
       read: false,
     }
   });
   ```

**If REJECT:**
1. Update transaction status to "REJECTED"
2. Create notification for user:
   ```typescript
   await prisma.notification.create({
     data: {
       userId: transaction.userId,
       type: "DEPOSIT_REJECTED",
       title: "Deposit Rejected",
       message: `Your deposit of $${amount} was rejected. Reason: ${reason}`,
       read: false,
     }
   });
   ```

**Response:**
```json
{
  "success": true,
  "message": "Deposit approved",
  "newBalance": 100.00
}
```

---

### **4. User Notifications**

#### **Notification Types:**

1. **DEPOSIT_SUBMITTED:**
   - When: User uploads payment proof
   - Title: "Deposit Proof Submitted"
   - Message: "Your deposit proof has been submitted. We'll review it within 2-4 hours."

2. **DEPOSIT_APPROVED:**
   - When: Admin approves deposit
   - Title: "Deposit Approved!"
   - Message: "Your deposit of $X via [method] has been approved and added to your balance."

3. **DEPOSIT_REJECTED:**
   - When: Admin rejects deposit
   - Title: "Deposit Rejected"
   - Message: "Your deposit of $X was rejected. Reason: [reason]"

---

## 📊 Database Schema

### **Transaction Model** (if not exists)
```prisma
model Transaction {
  id          String   @id @default(uuid())
  userId      String
  type        String   // "DEPOSIT", "WITHDRAWAL", "TRADE"
  amount      Float
  method      String   // "BTC", "ETH", "USDT", etc.
  status      String   @default("PENDING") // "PENDING", "COMPLETED", "REJECTED"
  proofUrl    String?  // Payment proof screenshot URL
  userWallet  String?  // User's wallet address for refunds
  reason      String?  // Rejection reason
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id])
}
```

**Note:** If Transaction model already exists, ensure it has:
- `proofUrl` field
- `userWallet` field
- `method` field

---

## 🔄 Complete User Journey

### **Scenario: New User Wants to Trade**

1. **User visits `/dashboard/trading`:**
   - Balance: $0
   - Sees orange warning banner: "Insufficient Balance to Trade"
   - Clicks "Deposit Funds Now" button

2. **Redirected to `/dashboard/wallet/deposit`:**
   - Step 1: Selects "Bitcoin (BTC)"
   - Step 2: Enters amount: $500
   - Step 3: Sees BTC wallet address + QR code
   - Copies wallet address
   - Sends $500 worth of BTC from their wallet
   - Clicks "I have paid - Upload Proof"

3. **Upload Proof Step:**
   - Enters their BTC wallet address (for refunds)
   - Uploads screenshot of transaction
   - Clicks "Submit Payment Proof"

4. **API Creates:**
   - Transaction record (PENDING status)
   - Uploads proof image to storage
   - Creates notification: "Deposit proof submitted"

5. **Admin Reviews:**
   - Goes to `/admin/deposits`
   - Sees pending $500 BTC deposit
   - Clicks payment proof image → Opens in new tab
   - Verifies transaction
   - Clicks "✓ Approve"

6. **API Updates:**
   - Transaction status → "COMPLETED"
   - User balance: $0 → $500
   - Creates notification: "Deposit approved! $500 added."

7. **User Returns to Trading:**
   - Refreshes `/dashboard/trading`
   - Balance now shows $500
   - No warning banner
   - Can click "Trade" on any instrument
   - Can place trades successfully

---

## ✅ Implementation Checklist

### **Frontend:**
- [ ] Add balance check to trading markets page
- [ ] Add zero balance warning banner
- [ ] Add balance check to trade execution page
- [ ] Add redirect to deposit if balance = $0
- [ ] Create admin deposits page (`/admin/deposits`)
- [ ] Add approve/reject functionality

### **Backend:**
- [ ] Create/verify `POST /api/transactions/deposit`
- [ ] Create/verify `POST /api/deposits/upload-proof`
- [ ] Create `GET /api/admin/deposits` (fetch pending)
- [ ] Create `POST /api/admin/deposits/approve`
- [ ] Add balance increment logic on approve
- [ ] Add notification creation on approve/reject

### **Database:**
- [ ] Verify Transaction model has all fields
- [ ] Add indexes for performance:
  - `userId` + `status`
  - `status` + `createdAt`

### **Testing:**
- [ ] Test $0 balance redirect
- [ ] Test deposit submission
- [ ] Test file upload
- [ ] Test admin approval → balance update
- [ ] Test admin rejection
- [ ] Test notifications
- [ ] Test trading after deposit approved

---

## 🎯 Success Criteria

**System is ready when:**
1. ✅ Users with $0 balance cannot access trading
2. ✅ Deposit page works end-to-end
3. ✅ Payment proof uploads successfully
4. ✅ Admin can see all pending deposits
5. ✅ Admin can approve → balance increases
6. ✅ Admin can reject → user gets notification
7. ✅ Users receive instant notifications
8. ✅ After approval, users can trade immediately

---

## 📝 Additional Features (Optional)

1. **Deposit History:**
   - Page showing all user deposits
   - Status badges (Pending/Approved/Rejected)
   - Filter by status

2. **Deposit Limits:**
   - Daily deposit limit
   - Monthly deposit limit
   - KYC verification for large amounts

3. **Auto-Approval:**
   - Integrate blockchain API
   - Verify transaction on-chain
   - Auto-approve if confirmed

4. **Deposit Bonuses:**
   - First deposit bonus (e.g., +10%)
   - Referral bonuses
   - Promotional campaigns

---

## 🚀 Quick Implementation Steps

**To implement this system ASAP:**

1. **First:** Add balance check & redirect on trading pages (15 min)
2. **Second:** Test deposit page (already exists) (5 min)
3. **Third:** Create admin deposits approval page (30 min)
4. **Fourth:** Create/verify deposit APIs (30 min)
5. **Fifth:** Test complete flow end-to-end (15 min)

**Total Time:** ~1.5 hours for complete system

---

**Document Created By:** Kiro AI Development System  
**Date:** January 2025  
**Purpose:** Guide for implementing mandatory deposit before trading
