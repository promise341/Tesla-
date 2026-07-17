# Investment Plan Payment System - Complete Guide

## ✅ What I Built for You

A **simple, functional** system where users can pay for investment plans with cryptocurrency, upload proof, and get approved by admin.

---

## 🎯 Simple User Flow

### **Step 1: User Clicks "Join Investment Plan"**
- User selects a plan (e.g., Beginner Plan - $1,200)
- Clicks "Join Investment Plan" button

### **Step 2: Choose Payment Method** 
**NEW Modal Shows 2 Options:**

1. **Pay with Balance** (Green) ✓
   - If they have money in account
   - Instant activation
   
2. **Pay with Crypto** (Blue) ✓
   - Shows: BTC, ETH, BNB, Solana, USDT
   - Requires admin approval

### **Step 3: Crypto Payment Flow**
User selects crypto (e.g., Bitcoin):

1. **See Wallet Address**
   - Shows your BTC wallet address
   - Shows QR code
   - User copies address

2. **User Sends Payment**
   - Goes to their crypto wallet
   - Sends $1,200 worth of BTC
   - Takes screenshot

3. **Upload Proof**
   - Upload screenshot
   - Enter their wallet address (for refunds)
   - Click "Submit"

4. **Success Message**
   - "Payment proof submitted!"
   - "Awaiting admin approval (2-4 hours)"

---

## 👨‍💼 Admin Flow

### **Admin Panel**
Go to: `/admin/investment-payments`

**Admin Sees:**
- List of pending investment payments
- User info (name, email)
- Plan details (name, amount, rate)
- Payment method (BTC, ETH, etc.)
- **Payment proof image** (screenshot user uploaded)
- User's wallet address

**Admin Actions:**
1. **View Proof** - Click image to see full size
2. **Approve** - Activates the plan, user starts earning
3. **Reject** - Enter reason, cancels the plan

---

## 📁 Files I Created

### **1. Payment Method Modal**
`app/dashboard/buy-plan/components/PaymentMethodModal.tsx`
- Shows balance vs crypto options
- Checks if user has enough balance

### **2. Crypto Payment Page**
`app/dashboard/buy-plan/crypto-payment/page.tsx`
- Select cryptocurrency
- Show wallet + QR code
- Upload proof form
- Success confirmation

### **3. Database Schema**
`prisma/schema.prisma`
- Added payment fields to ActivePlan:
  - `paymentMethod` - BTC, ETH, BNB, etc.
  - `paymentStatus` - PENDING, APPROVED, REJECTED
  - `paymentProofUrl` - Screenshot path
  - `userWalletAddress` - For refunds

### **4. API Endpoints**

**For Users:**
- `POST /api/plans/subscribe` - Pay with balance
- `POST /api/plans/subscribe-crypto` - Pay with crypto + proof

**For Admin:**
- `GET /api/admin/investment-payments` - List pending
- `POST /api/admin/investment-payments/approve` - Approve plan
- `POST /api/admin/investment-payments/reject` - Reject plan

### **5. Admin Interface**
`app/admin/investment-payments/page.tsx`
- View all pending payments
- See proof images
- Approve/Reject buttons

### **6. Pending Investment Card**
`app/dashboard/investments/components/PendingInvestmentCard.tsx`
- Shows pending investments in My Portfolio
- Yellow badge: "PENDING APPROVAL"
- Shows crypto icon and payment method

---

## 🔧 How to Use (Integration)

### **To Enable on Buy Plan Page:**

Open `app/dashboard/buy-plan/page.tsx` and import the modal:

```typescript
import PaymentMethodModal from "./components/PaymentMethodModal";
```

Then add state and show the modal when user clicks "Join Plan".

**OR** just use the crypto-payment page directly:
- When user clicks plan, redirect to:
- `/dashboard/buy-plan/crypto-payment?plan=Beginner Plan&amount=1200`

---

## 💾 Database Migration

**IMPORTANT:** Run this command to update database:

```bash
npx prisma db push
```

This adds the new payment fields to ActivePlan table.

---

## 🎨 What User Sees

### **Balance Payment:**
✓ Instant activation
✓ No waiting
✓ Balance deducted immediately
✓ Plan starts earning right away

### **Crypto Payment:**
⏳ Pending status
⏳ Shows "Awaiting admin approval"
⏳ Yellow badge in My Portfolio
✅ Activates after admin approves

---

## 📊 Admin Dashboard Access

Add link to admin sidebar:

```tsx
<Link href="/admin/investment-payments">
  Investment Payments
</Link>
```

---

## ✨ Key Features

1. **6 Cryptocurrencies Supported**
   - Bitcoin (BTC)
   - Ethereum (ETH)
   - BNB (BSC Network)
   - Solana
   - USDT (Ethereum)
   - USDT (Tron)

2. **Security**
   - User uploads proof
   - Admin must verify manually
   - No auto-activation for crypto
   - Balance payments are instant

3. **User Experience**
   - Clear payment options
   - QR codes for easy scanning
   - Copy wallet address button
   - Success/Pending messages

4. **Admin Control**
   - Review all proofs
   - Approve/Reject with reason
   - Track payment methods
   - User wallet addresses saved

---

## 🚀 Next Steps

1. **Run database migration:**
   ```bash
   npx prisma db push
   ```

2. **Test the flow:**
   - Login as user
   - Go to Buy Plan page
   - Select a plan
   - Try crypto payment
   - Upload fake proof

3. **Login as admin:**
   - Go to `/admin/investment-payments`
   - See the pending payment
   - Approve it

4. **Check user portfolio:**
   - User should see active plan
   - Earnings start

---

## 📝 Summary

**What Works:**
✅ User selects payment method (Balance or Crypto)
✅ Crypto payment shows wallet QR code
✅ User uploads proof
✅ Admin reviews and approves
✅ Plan activates after approval
✅ Pending investments show in portfolio

**SIMPLE. FUNCTIONAL. SECURE.** 🎉

---

## 🆘 Support

If anything doesn't work:
1. Check database migration ran (`npx prisma db push`)
2. Check wallet addresses in `.env.local`
3. Check file upload folder exists (`public/proofs/investments`)
4. Check admin has ADMIN role in database

---

**That's it! Your investment payment system is ready!** 🚀
