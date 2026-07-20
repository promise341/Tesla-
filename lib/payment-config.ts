/**
 * CENTRAL PAYMENT CONFIGURATION
 * All wallet addresses verified from screenshots
 * Use this file across all payment pages for consistency
 */

export const PAYMENT_WALLETS = {
  BTC: "bc1qfkt5syd6n2dsge3af2drhkmq8w0myqealh7t6",
  ETH: "0x79De6d50cC9D9fB9A5926b6b4037570650DF1a17",
  USDT_TRC20: "TVyZQzexvLtq8uBC8bcXJykgtRaC4VKW6u",
  BNB_BSC: "0x79De6d50cC9D9fB9A5926b6b4037570650DF1a17",
  XRP: "rs4mroj8yadUceuvCcfjnJMXXyobtNspJ3",
  DOGE: "D7vAQaDTQG9U5nvV7JZwNJHoTEQLp8TPVu",
  SOLANA: "CpHS2AK9uLyeHNvTFmDUcnPxpNvHUnfCZ9m4P7Mqw8Sg",
} as const;

export const PAYMENT_METHODS = [
  {
    id: "BTC",
    name: "Bitcoin",
    fullName: "Bitcoin (BTC)",
    desc: "Cryptocurrency Payment",
    address: PAYMENT_WALLETS.BTC,
    network: "Bitcoin Network",
  },
  {
    id: "ETH",
    name: "Ethereum",
    fullName: "Ethereum (ETH)",
    desc: "Cryptocurrency Payment",
    address: PAYMENT_WALLETS.ETH,
    network: "Ethereum Network",
  },
  {
    id: "USDT",
    name: "USDT",
    fullName: "Tether (USDT-TRC20)",
    desc: "Cryptocurrency Payment",
    address: PAYMENT_WALLETS.USDT_TRC20,
    network: "Tron (TRC20) Network",
  },
  {
    id: "BNB",
    name: "BNB",
    fullName: "Binance Coin (BNB-BSC)",
    desc: "Cryptocurrency Payment",
    address: PAYMENT_WALLETS.BNB_BSC,
    network: "Binance Smart Chain",
  },
  {
    id: "XRP",
    name: "XRP",
    fullName: "Ripple (XRP)",
    desc: "Cryptocurrency Payment",
    address: PAYMENT_WALLETS.XRP,
    network: "XRP Network",
  },
  {
    id: "DOGE",
    name: "Dogecoin",
    fullName: "Dogecoin (DOGE)",
    desc: "Cryptocurrency Payment",
    address: PAYMENT_WALLETS.DOGE,
    network: "Dogecoin Network",
  },
  {
    id: "SOLANA",
    name: "Solana",
    fullName: "Solana (SOL)",
    desc: "Cryptocurrency Payment",
    address: PAYMENT_WALLETS.SOLANA,
    network: "Solana Network",
  },
] as const;

export type PaymentMethodId = typeof PAYMENT_METHODS[number]["id"];
export type PaymentMethod = typeof PAYMENT_METHODS[number];

/**
 * Get payment method by ID
 */
export function getPaymentMethod(id: string): PaymentMethod | undefined {
  return PAYMENT_METHODS.find((method) => method.id === id);
}

/**
 * Validate wallet address format
 */
export function isValidWalletAddress(address: string): boolean {
  if (!address || address.trim().length === 0) return false;
  
  // Basic validation - at least 26 characters
  if (address.length < 26) return false;
  
  // Check for common patterns
  const patterns = {
    BTC: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,90}$/,
    ETH: /^0x[a-fA-F0-9]{40}$/,
    USDT_TRC20: /^T[A-Za-z1-9]{33}$/,
    SOLANA: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    XRP: /^r[0-9a-zA-Z]{24,34}$/,
    DOGE: /^D[5-9A-HJ-NP-Ua-km-z]{33}$/,
  };
  
  return Object.values(patterns).some((pattern) => pattern.test(address));
}

/**
 * Copy wallet address to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy:", error);
    return false;
  }
}
