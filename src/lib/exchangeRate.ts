import { CAMPAIGN_CONFIG } from "../config";

const CACHE_KEY = "xiaomi_pad_8_fx_rates";
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

interface FxRates {
  timestamp: number;
  rates: {
    INR: number;
    EUR: number;
    GBP: number;
    USD: number;
    [key: string]: number;
  };
}

export async function getLiveRates(): Promise<{
  INR: number;
  EUR: number;
  GBP: number;
  USD: number;
}> {
  // Check local storage cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data: FxRates = JSON.parse(cached);
      if (Date.now() - data.timestamp < CACHE_DURATION_MS && data.rates.INR) {
        return data.rates;
      }
    }
  } catch {
    // Ignore localStorage errors
  }

  // Fetch live rates
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.rates && json.rates.INR) {
        const rates = {
          USD: 1,
          INR: Number(json.rates.INR) || CAMPAIGN_CONFIG.FALLBACK_USD_TO_INR,
          EUR: Number(json.rates.EUR) || 0.95,
          GBP: Number(json.rates.GBP) || 0.81,
        };

        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ timestamp: Date.now(), rates }),
          );
        } catch {
          // ignore cache write error
        }

        return rates;
      }
    }
  } catch (err) {
    console.warn(
      "Failed to fetch live FX rates, falling back to default:",
      err,
    );
  }

  return {
    USD: 1,
    INR: CAMPAIGN_CONFIG.FALLBACK_USD_TO_INR,
    EUR: 0.95,
    GBP: 0.81,
  };
}

/**
 * Compute the locked USD and INR amounts for approval.
 * Locks historical totals so currency fluctuations later do not alter approved donations.
 */
export function calculateApprovalAmounts(
  nativeAmount: number,
  currency: string,
  fxUsdToInr: number,
  rates?: { EUR: number; GBP: number },
): { usd_amount: number; inr_amount: number } {
  const curr = (currency || "INR").toUpperCase();

  if (curr === "USD") {
    const usd = Math.round(nativeAmount * 100) / 100;
    const inr = Math.round(usd * fxUsdToInr);
    return { usd_amount: usd, inr_amount: inr };
  }

  if (curr === "INR") {
    const inr = Math.round(nativeAmount);
    const usd = Math.round((inr / fxUsdToInr) * 100) / 100;
    return { usd_amount: usd, inr_amount: inr };
  }

  if (curr === "EUR") {
    const eurRate = rates?.EUR || 0.95; // EUR per 1 USD
    const usd = Math.round((nativeAmount / eurRate) * 100) / 100;
    const inr = Math.round(usd * fxUsdToInr);
    return { usd_amount: usd, inr_amount: inr };
  }

  if (curr === "GBP") {
    const gbpRate = rates?.GBP || 0.81; // GBP per 1 USD
    const usd = Math.round((nativeAmount / gbpRate) * 100) / 100;
    const inr = Math.round(usd * fxUsdToInr);
    return { usd_amount: usd, inr_amount: inr };
  }

  // Default fallback assuming 1:1 USD or treating as native
  const usd = Math.round(nativeAmount * 100) / 100;
  const inr = Math.round(usd * fxUsdToInr);
  return { usd_amount: usd, inr_amount: inr };
}
