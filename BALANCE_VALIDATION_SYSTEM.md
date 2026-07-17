# Balance Validation System

## Overview

A comprehensive balance validation system that checks user balance before all transactions and automatically redirects to the deposit page with contextual information when insufficient funds are detected.

## Features

✅ **Unified Balance Validation** - Consistent validation across all transaction types  
✅ **Automatic Deposit Redirects** - Context-aware redirects with pre-filled amounts  
✅ **Real-time Balance Checks** - Client and server-side validation  
✅ **Detailed Error Messages** - Shows current balance, required amount, and shortfall  
✅ **Reusable Components** - Drop-in components for any purchase flow  
✅ **Transaction Safety** - Atomic balance deductions with Prisma transactions  

---

## Components & Utilities

### 1. **Client-Side Hook** (`app/hooks/useBalance.ts`)

Custom React hook for managing user balance with real-time validation.

**Features:**
- Auto-fetch balance on mount and route changes
- Validation methods for any transaction amount
- Currency formatting utilities
- Balance insufficiency checks

**Usage:**
```typescript
import { useBalance } from "@/app/hooks/useBalance";

function MyComponent() {
  const { 
    balance,          // Current user balance
    loading,          // Loading state
    refreshBalance,   // Manual refresh function
    validateAmount,   // Validation function
    formatBalance,    // Currency formatter
    hasInsufficientBalance // Quick check function
  } = useBalance();

  // Validate purchase amount
  const validation = validateAmount(500, 50); // amount, minAmount
  if (!validation.isValid) {
    console.log(validation.message); // Error message
    console.log(validation.shortfall); // Amount needed
  }
}
```

---

### 2. **Server-Side Utilities** (`app/lib/balanceUtils.ts`)

Comprehensive server-side validation utilities.

**Key Functions:**

#### `validateTransactionAmount(amount, userBalance, minAmount, operation)`
Validates any transaction amount against user balance.

```typescript
import { validateTransactionAmount } from "@/app/lib/balanceUtils";

const validation = validateTransactionAmount(
  500,              // Required amount
  user.balance,     // User's current balance
  50,               // Minimum allowed
  'investment'      // Operation name
);

if (!validation.isValid) {
  return { error: validation.message };
}
```

#### `createInsufficientBalanceError(currentBalance, requiredAmount, operation)`
Creates standardized insufficient balance error responses.

```typescript
import { createInsufficientBalanceError } from "@/app/lib/balanceUtils";

if (user.balance < price) {
  const errorResponse = createInsufficientBalanceError(
    user.balance,
    price,
    'car purchase'
  );
  // Returns:
  // {
  //   error: "Insufficient balance",
  //   message: "You need $X for this operation...",
  //   insufficientBalance: true,
  //   currentBalance: number,
  //   requiredAmount: number,
  //   shortfall: number,
  //   redirectUrl: "/dashboard/wallet/deposit?..."
  // }
  return NextResponse.json(errorResponse, { status: 400 });
}
```

---

### 3. **Balance Checker Component** (`app/components/BalanceChecker.tsx`)

React component that checks balance and optionally redirects or shows alerts.

**Props:**
- `requiredAmount` - Amount needed for transaction
- `operation` - Name of operation (for context)
- `minAmount` - Minimum allowed amount (optional)
- `onBalanceCheck` - Callback with result (optional)
- `redirectOnInsufficient` - Auto-redirect if insufficient (default: false)
- `showAlert` - Show insufficient balance alert (default: true)

**Usage:**
```tsx
import { BalanceChecker } from "@/app/components/BalanceChecker";

<BalanceChecker
  requiredAmount={499}
  operation="VIP card purchase"
  minAmount={50}
  redirectOnInsufficient={false}
  showAlert={true}
  onBalanceCheck={(hasSufficient, balance) => {
    console.log(`Has sufficient: ${hasSufficient}`);
  }}
>
  {/* Your purchase form */}
</BalanceChecker>
```

---

### 4. **Insufficient Balance Alert** (`app/components/InsufficientBalanceAlert.tsx`)

Standalone alert component for displaying balance errors.

**Usage:**
```tsx
import { InsufficientBalanceAlert } from "@/app/components/InsufficientBalanceAlert";

<InsufficientBalanceAlert
  currentBalance={user.balance}
  requiredAmount={500}
  operation="investment plan"
  showDepositButton={true}
/>
```

---

### 5. **API Middleware** (`app/api/middleware/balanceValidation.ts`)

Server-side middleware for consistent balance validation in API routes.

**Usage:**
```typescript
import { checkSufficientBalance } from "@/app/api/middleware/balanceValidation";

export async function POST(req: Request) {
  const { userId, amount } = await req.json();
  
  // Check balance
  const balanceCheck = await checkSufficientBalance({
    userId,
    requiredAmount: amount,
    operation: 'investment purchase',
    includeUserData: true
  });

  if (!balanceCheck.success) {
    return balanceCheck.response; // Returns standardized error
  }

  const user = balanceCheck.user; // User data with balance

  // Proceed with transaction...
}
```

---

## Integration Guide

### Adding Balance Validation to a New Purchase Flow

#### Step 1: Update API Route

```typescript
import { createInsufficientBalanceError } from "@/app/lib/balanceUtils";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId, amount, paymentMethod } = await req.json();
  
  const isBalancePayment = paymentMethod === "BALANCE";

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, balance: true, email: true, name: true }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // ✅ Balance validation
  if (isBalancePayment && user.balance < amount) {
    const errorResponse = createInsufficientBalanceError(
      user.balance,
      amount,
      'your operation name'
    );
    return NextResponse.json(errorResponse, { status: 400 });
  }

  // ✅ Atomic balance deduction
  if (isBalancePayment) {
    await prisma.$transaction([
      // Create your record
      prisma.yourModel.create({ /* ... */ }),
      // Deduct balance
      prisma.user.update({
        where: { id: user.id },
        data: { balance: { decrement: amount } }
      }),
      // Create transaction record
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: "YOUR_TYPE",
          amount,
          method: "BALANCE",
          address: "Description",
          status: "COMPLETED"
        }
      })
    ]);
  }

  return NextResponse.json({ success: true });
}
```

#### Step 2: Add Client-Side Validation

```tsx
import { useBalance } from "@/app/hooks/useBalance";
import { InsufficientBalanceAlert } from "@/app/components/InsufficientBalanceAlert";

function PurchasePage() {
  const { balance, loading, hasInsufficientBalance, formatBalance } = useBalance();
  const [selectedAmount, setSelectedAmount] = useState(500);
  
  // Check balance before showing form
  if (!loading && hasInsufficientBalance(selectedAmount)) {
    return (
      <InsufficientBalanceAlert
        currentBalance={balance}
        requiredAmount={selectedAmount}
        operation="this purchase"
        showDepositButton={true}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Your purchase form */}
    </form>
  );
}
```

#### Step 3: Handle API Response

```typescript
const response = await fetch("/api/your-endpoint", {
  method: "POST",
  body: JSON.stringify({ /* ... */ })
});

const data = await response.json();

// ✅ Check for insufficient balance
if (!response.ok && data.insufficientBalance) {
  // Redirect to deposit with context
  router.push(data.redirectUrl);
  return;
}

if (data.error) {
  setError(data.message || data.error);
  return;
}
```

---

## Deposit Page Context

The deposit page (`app/dashboard/wallet/deposit/page.tsx`) automatically detects and displays context from URL parameters:

**URL Parameters:**
- `reason` - Why user was redirected (e.g., "insufficient_balance")
- `operation` - What they were trying to do (e.g., "car purchase")
- `required` - Total amount needed
- `shortfall` - Amount they need to deposit

**Example:**
```
/dashboard/wallet/deposit?reason=insufficient_balance&operation=VIP%20card&required=499.00&shortfall=250.00
```

The deposit page will:
1. Show a contextual banner explaining why they need to deposit
2. Pre-fill the deposit amount with the shortfall (rounded up to $50 minimum)
3. Display required amount vs current balance breakdown

---

## Transaction Types with Balance Validation

### ✅ Implemented

1. **VIP Memberships** (`/api/vip/purchase/route.ts`)
   - Balance payment with instant activation
   - Atomic balance deduction
   - Transaction logging

2. **Investment Plans** (`/api/plans/subscribe/route.ts`)
   - Balance payment support
   - Active plan creation
   - Balance validation

3. **Withdrawals** (`/api/transactions/withdraw/route.ts`)
   - Balance check before withdrawal
   - Verification code required
   - Pending admin approval

4. **Car Orders** (`/api/cars/order/route.ts`)
   - Balance payment option
   - Instant approval for balance payments
   - Atomic transaction

5. **Trading** (`/dashboard/trade/[id]/page.tsx`)
   - Auto-redirect if balance is 0
   - Real-time balance display

---

## Best Practices

### ✅ Do's

1. **Always validate on both client and server**
   ```typescript
   // Client validation (UX)
   const validation = validateAmount(amount);
   if (!validation.isValid) {
     setError(validation.message);
     return;
   }
   
   // Server validation (security)
   if (user.balance < amount) {
     return createInsufficientBalanceError(...);
   }
   ```

2. **Use atomic transactions for balance deductions**
   ```typescript
   await prisma.$transaction([
     prisma.purchase.create({ /* ... */ }),
     prisma.user.update({
       data: { balance: { decrement: amount } }
     })
   ]);
   ```

3. **Create transaction records**
   ```typescript
   prisma.transaction.create({
     data: {
       userId,
       type: "PURCHASE_TYPE",
       amount,
       method: "BALANCE",
       address: "Description",
       status: "COMPLETED"
     }
   })
   ```

4. **Provide context in redirects**
   ```typescript
   router.push(
     `/dashboard/wallet/deposit?reason=insufficient_balance&operation=${encodeURIComponent(operation)}&required=${amount}&shortfall=${shortfall}`
   );
   ```

### ❌ Don'ts

1. **Don't deduct balance without validation**
2. **Don't skip transaction records**
3. **Don't use generic error messages**
4. **Don't forget to refresh balance after transactions**

---

## Testing Checklist

- [ ] User with $0 balance cannot make purchases
- [ ] User with insufficient balance sees helpful error
- [ ] User is redirected to deposit page with context
- [ ] Deposit page shows correct shortfall amount
- [ ] Balance is deducted atomically with purchase
- [ ] Transaction records are created
- [ ] Balance displays update after purchase
- [ ] Multiple concurrent purchases don't cause race conditions
- [ ] Validation works for all payment methods
- [ ] Error messages are clear and actionable

---

## Future Enhancements

- [ ] Balance reservation system for pending transactions
- [ ] Credit/installment payment options
- [ ] Balance transfer between users
- [ ] Automated low balance notifications
- [ ] Balance history and analytics
- [ ] Multi-currency support
- [ ] Balance freeze for security holds

---

## Support

For questions or issues with the balance validation system:
1. Check this documentation first
2. Review existing implementations in VIP and investment APIs
3. Test with the useBalance hook and BalanceChecker component
4. Contact the development team

**Last Updated:** December 2024
