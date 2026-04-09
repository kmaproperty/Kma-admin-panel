/** Business rule from spec: 100 coins = ₹10 → ₹ value = coins / 10 */
export function coinsToInr(coins) {
  const n = Number(coins);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round((n / 10) * 100) / 100;
}

export const DEFAULT_COINS_ON_DEAL_CLOSED = 500;
