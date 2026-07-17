# Tesla CapX - Cryptocurrency Wallet Addresses

This document contains all the real cryptocurrency wallet addresses configured for the Tesla CapX platform.

## Configured Wallets

### 1. Bitcoin (BTC)
- **Network:** Bitcoin Network
- **Address:** `bc1qfkt5syd6n2dsqe3af2dhkmq8w0myqeealh7t6`

### 2. Ethereum (ETH)
- **Network:** Ethereum Network
- **Address:** `0x79De6d50cC9D9fB9A5926b6b4037570650DF1a17`

### 3. BNB (Binance Coin)
- **Network:** BSC Network (Binance Smart Chain)
- **Address:** `0x79De6d50cC9D9fB9A5926b6b4037570650DF1a17`
- **Note:** Same address as Ethereum (compatible networks)

### 4. Solana (SOL)
- **Network:** Solana Network
- **Address:** `CpHS2AK9uLyeHNvTFmDUcnPxpNvHUnfCZ9m4P7Mqw8Sg`

### 5. USDT (Ethereum)
- **Network:** Ethereum Network (ERC-20)
- **Address:** `0xbC2A5137E4e0f5B4a07D46B904eF054B35A95b7a`

### 6. USDT (Tron)
- **Network:** Tron Network (TRC-20)
- **Address:** `TVyZQzexvLtq8uBC8bcXJykqtRaC4VKWGU`

## Environment Variables

These addresses are stored in `.env.local`:

```env
NEXT_PUBLIC_BTC_WALLET=bc1qfkt5syd6n2dsqe3af2dhkmq8w0myqeealh7t6
NEXT_PUBLIC_ETH_WALLET=0x79De6d50cC9D9fB9A5926b6b4037570650DF1a17
NEXT_PUBLIC_BNB_WALLET=0x79De6d50cC9D9fB9A5926b6b4037570650DF1a17
NEXT_PUBLIC_SOLANA_WALLET=CpHS2AK9uLyeHNvTFmDUcnPxpNvHUnfCZ9m4P7Mqw8Sg
NEXT_PUBLIC_USDT_ETH_WALLET=0xbC2A5137E4e0f5B4a07D46B904eF054B35A95b7a
NEXT_PUBLIC_USDT_TRX_WALLET=TVyZQzexvLtq8uBC8bcXJykqtRaC4VKWGU
```

## Deposit Flow

1. User selects cryptocurrency from 6 options
2. User enters deposit amount (minimum $50)
3. System displays wallet address with QR code
4. User sends payment to displayed address
5. User uploads payment proof screenshot
6. Admin verifies and approves deposit
7. Balance credited to user account

## Security Notes

- All wallet addresses are real and functional
- Deposits require admin approval before balance credit
- Payment proofs are stored and reviewed
- User's wallet address collected for potential refunds
- All transactions logged in database

## Files Modified

- `.env.local` - Added BNB and Solana wallet addresses
- `app/dashboard/wallet/deposit/page.tsx` - Added BNB and Solana options
- `app/api/transactions/deposit/route.ts` - Added BNB and SOLANA to valid methods

## Testing

To test deposits:
1. Login to user account
2. Navigate to Dashboard → Wallet → Deposit
3. Select any of the 6 cryptocurrencies
4. Enter amount and follow payment flow
5. Upload proof screenshot
6. Check admin panel for pending deposit approval
