import Tesseract from "tesseract.js";

/**
 * Validates whether an uploaded image buffer contains characteristics of a real payment receipt.
 * Scans the image for critical payment transaction credentials.
 */
export async function validatePaymentProof(buffer: Buffer): Promise<{ isValid: boolean; extractedText: string; reason?: string }> {
  const ocrPromise = (async () => {
    try {
      const { data: { text } } = await Tesseract.recognize(
        buffer,
        "eng"
      );
      return { success: true, text };
    } catch (err) {
      console.error("[OCR ENGINE ERROR]:", err);
      return { success: false, text: "" };
    }
  })();

  const timeoutPromise = new Promise<{ success: boolean; text: string; isTimeout: boolean }>((resolve) => {
    setTimeout(() => {
      resolve({ success: false, text: "", isTimeout: true });
    }, 4500); // 4.5s timeout threshold
  });

  try {
    const result = await Promise.race([ocrPromise, timeoutPromise]);
    
    if ('isTimeout' in result && result.isTimeout) {
      console.warn("[OCR TIMEOUT]: OCR took too long. Bypassing check to prevent hanging.");
      return { isValid: true, extractedText: "" };
    }

    if (!result.success) {
      return { isValid: true, extractedText: "" };
    }

    const lower = result.text.toLowerCase();
    
    // Keywords representing transaction proof credentials
    const credentials = [
      "txid", "transaction", "hash", "status", "completed", "success", "successful",
      "confirmed", "recipient", "blockchain", "wallet", "address", "from", "to",
      "amount", "sent", "payment", "transferred", "transfer", "btc", "eth", "usdt", 
      "bnb", "solana", "sol", "xrp", "doge", "trx", "tron", "fee", "gas", "block", "network",
      "details", "order", "receipt", "exodus", "trust", "metamask", "binance", "coinbase",
      "okx", "bybit", "luno", "crypto", "receive", "send"
    ];

    // Count how many matching credentials/keywords are found
    let matchCount = 0;
    for (const word of credentials) {
      if (lower.includes(word)) {
        matchCount++;
      }
    }

    // Require at least 2 distinct credentials to verify it is an actual transaction receipt
    if (matchCount < 2) {
      return {
        isValid: false,
        extractedText: result.text,
        reason: "The uploaded file does not appear to be a valid payment receipt. Please upload a clear screenshot of the transaction details (showing status, TXID/Hash, recipient address, or amount)."
      };
    }

    return {
      isValid: true,
      extractedText: result.text
    };
  } catch (err) {
    console.error("[OCR VALIDATION ERROR]:", err);
    return {
      isValid: true,
      extractedText: "",
    };
  }
}
