export const COINS_PER_KZ = 100;
export const POINTS_PER_KZ = 100;

export const coinsToKz = (coins: number) => coins / COINS_PER_KZ;
export const coinsToPoints = (coins: number) => coins;

export const formatKz = (coins: number, opts: { decimals?: number; sign?: boolean } = {}) => {
  const { decimals = 2, sign = false } = opts;
  const kz = coinsToKz(coins);
  const abs = Math.abs(kz);
  const formatted = abs.toLocaleString("pt-PT", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const prefix = sign && kz > 0 ? "+" : kz < 0 ? "−" : "";
  return `${prefix}${formatted} Kz`;
};

export const formatKzCompact = (coins: number) => {
  const kz = coinsToKz(coins);
  if (Math.abs(kz) >= 1_000_000) return `${(kz / 1_000_000).toFixed(1)}M Kz`;
  if (Math.abs(kz) >= 1_000) return `${(kz / 1_000).toFixed(1)}k Kz`;
  return formatKz(coins, { decimals: kz % 1 === 0 ? 0 : 2 });
};

export const formatPoints = (coins: number, opts: { sign?: boolean } = {}) => {
  const { sign = false } = opts;
  const pts = coinsToPoints(coins);
  const abs = Math.abs(pts);
  const formatted = Math.round(abs).toLocaleString("pt-PT");
  const prefix = sign && pts > 0 ? "+" : pts < 0 ? "−" : "";
  return `${prefix}${formatted} pts`;
};

export const formatPointsCompact = (coins: number) => {
  const pts = coinsToPoints(coins);
  const abs = Math.abs(pts);
  if (abs >= 1_000_000) return `${(pts / 1_000_000).toFixed(1)}M pts`;
  if (abs >= 1_000) return `${(pts / 1_000).toFixed(1)}k pts`;
  return formatPoints(coins);
};

export const VIEW_COST_COINS = 20;
export const VIEW_INTERVAL_SEC = 30;
export const DAILY_LIMIT_COINS = 3000;
export const DM_REPLY_COST_COINS = 50;
