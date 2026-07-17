# Stock Plans Payment System - What to Add

## Current Status
Your stock-plans page currently has:
- ✅ Display of 6 stock investment plans
- ✅ Amount slider working
- ✅ "Invest in Stocks" button
- ⚠️ **BUT**: Clicking "Invest" goes directly to confirm modal (no payment method choice)

## What's Missing
The page needs the **same payment system** as the buy-plan page.

---

## What Needs to Be Added

### 1. Payment Method Modal Component

**Add this component** after line 9 (after `type Plan = ...`):

```typescript
/* ── Payment Method Selection Modal ── */
function PaymentMethodModal({ 
  plan, 
  amount, 
  userBalance, 
  onSelectBalance, 
  onSelectCrypto, 
  onClose 
}: { 
  plan: Plan; 
  amount: number; 
  userBalance: number; 
  onSelectBalance: () => void; 
  onSelectCrypto: () => void; 
  onClose: () => void; 
}) {
  const hasEnoughBalance = userBalance >= amount;
  const remainingBalance = userBalance - amount;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Modal content - shows Balance vs Crypto options */}
      {/* Exact same as buy-plan page */}
    </div>
  );
}
```

**What it does:**
- Shows 2 payment options: Balance (instant) or Crypto (pending)
- Checks if user has enough balance
- Green card for balance payment, blue card for crypto payment

---

### 2. Update Main Component State

**Change line ~102** (in the main component):

**FROM:**
```typescript
export default function StockPlansPage() {
  const [userBalance, setUserBalance] = useState(0);
  const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null);
  const [confirmAmount, setConfirmAmount] = useState(0);
  // ...
```

**TO:**
```typescript
export default function StockPlansPage() {
  const router = useRouter();  // ADD THIS
  const [userBalance, setUserBalance] = useState(0);
  
  // ADD THESE TWO LINES:
  const [paymentMethodPlan, setPaymentMethodPlan] = useState<Plan | null>(null);
  const [paymentMethodAmount, setPaymentMethodAmount] = useState(0);
  
  const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null);
  const [confirmAmount, setConfirmAmount] = useState(0);
  // ...
```

**Why:** Need to track which plan user selected for payment method choice

---

### 3. Update handleInvest Function

**Change line ~110** (the `handleInvest` function):

**FROM:**
```typescript
function handleInvest(plan: Plan, amount: number) { 
  setConfirmPlan(plan); 
  setConfirmAmount(amount); 
  setError(""); 
}
```

**TO:**
```typescript
function handleInvest(plan: Plan, amount: number) { 
  // Show payment method selection FIRST
  setPaymentMethodPlan(plan); 
  setPaymentMethodAmount(amount); 
  setError(""); 
}
```

**Why:** Now clicking "Invest" shows payment method modal, not confirm modal

---

### 4. Add Two New Handler Functions

**Add these functions** after `handleInvest`:

```typescript
function handleSelectBalance() {
  // User chose balance payment - show confirmation
  setConfirmPlan(paymentMethodPlan);
  setConfirmAmount(paymentMethodAmount);
  setPaymentMethodPlan(null);
}

function handleSelectCrypto() {
  // User chose crypto - redirect to crypto payment page
  if (!paymentMethodPlan) return;
  router.push(
    `/dashboard/stock-plans/crypto-payment?plan=${encodeURIComponent(paymentMethodPlan.name)}&amount=${paymentMethodAmount}&rate=${paymentMethodPlan.rate}&duration=${paymentMethodPlan.duration}`
  );
}
```

**What they do:**
- `handleSelectBalance`: Closes payment modal, opens confirm modal
- `handleSelectCrypto`: Redirects to crypto payment page (like buy-plan)

---

### 5. Update Return Statement

**Change line ~125** (in the return statement):

**FROM:**
```typescript
return (
  <>
    {confirmPlan && <ConfirmModal ... />}
    {successPlan && <SuccessModal ... />}
    <div className="space-y-6 max-w-6xl mx-auto">
```

**TO:**
```typescript
return (
  <>
    {/* Payment method selection modal (FIRST) */}
    {paymentMethodPlan && (
      <PaymentMethodModal
        plan={paymentMethodPlan}
        amount={paymentMethodAmount}
        userBalance={userBalance}
        onSelectBalance={handleSelectBalance}
        onSelectCrypto={handleSelectCrypto}
        onClose={() => setPaymentMethodPlan(null)}
      />
    )}

    {/* Confirm modal (for balance payments) */}
    {confirmPlan && <ConfirmModal ... />}
    
    {/* Success modal */}
    {successPlan && <SuccessModal ... />}
    
    <div className="space-y-6 max-w-6xl mx-auto">
```

**Why:** Show payment method modal BEFORE confirm modal

---

### 6. Create Crypto Payment Page

**Create new file:**
`app/dashboard/stock-plans/crypto-payment/page.tsx`

**Copy the entire content from:**
`app/dashboard/buy-plan/crypto-payment/page.tsx`

**It's exactly the same** - no changes needed!

---

## The Complete User Flow (After Changes)

### Balance Payment:
```
1. User clicks "Invest in Stocks"
   ↓
2. PaymentMethodModal shows
   ↓
3. User clicks "Pay with Account Balance"
   ↓
4. ConfirmModal shows
   ↓
5. User confirms
   ↓
6. API: /api/plans/subscribe
   ↓
7. SuccessModal shows
   ↓
8. Plan ACTIVE immediately
```

### Crypto Payment:
```
1. User clicks "Invest in Stocks"
   ↓
2. PaymentMethodModal shows
   ↓
3. User clicks "Pay with Cryptocurrency"
   ↓
4. Redirects to /dashboard/stock-plans/crypto-payment
   ↓
5. Select crypto (BTC/ETH/BNB/SOLANA/USDT)
   ↓
6. Show QR code + wallet address
   ↓
7. User uploads payment proof
   ↓
8. API: /api/plans/subscribe-crypto
   ↓
9. Plan status: PENDING_PAYMENT
   ↓
10. Admin approves
   ↓
11. Plan ACTIVE
```

---

## Summary

**5 Simple Changes:**

1. ✅ Add `PaymentMethodModal` component (copy from buy-plan)
2. ✅ Add `useRouter` import and 2 new state variables
3. ✅ Change `handleInvest` to show payment modal first
4. ✅ Add `handleSelectBalance` and `handleSelectCrypto` functions
5. ✅ Update return statement to render payment modal first

**1 New File:**
6. ✅ Create `crypto-payment/page.tsx` (copy from buy-plan)

---

## Why This Is Simple

- **No new APIs needed** - uses existing `/api/plans/subscribe` and `/api/plans/subscribe-crypto`
- **No database changes** - same schema, same fields
- **Same logic** - just copy from buy-plan page
- **Same flow** - users already understand it from buy-plan

---

## Result

After these changes, your stock-plans page will:
- ✅ Show payment method choice (Balance vs Crypto)
- ✅ Support instant balance payments
- ✅ Support crypto payments with proof upload
- ✅ Support admin approval for crypto payments
- ✅ Work exactly like buy-plan page

**It's literally the same payment system, just on a different page!**
