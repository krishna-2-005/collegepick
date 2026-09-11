const LAKH = 100_000;
const CRORE = 10_000_000;

function trimDecimal(value: number, digits = 1): string {
  return value.toFixed(digits).replace(/\.0+$/, "");
}

/** Compact rupees in Indian units: 85000 -> "₹85K", 240000 -> "₹2.4L", 12500000 -> "₹1.25Cr". */
export function formatINR(amount: number): string {
  if (amount >= CRORE) return `₹${trimDecimal(amount / CRORE, 2)}Cr`;
  if (amount >= LAKH) return `₹${trimDecimal(amount / LAKH)}L`;
  if (amount >= 1000) return `₹${trimDecimal(amount / 1000)}K`;
  return `₹${amount}`;
}

/** Fee range with one currency sign: "₹1.2L–2.4L". Collapses equal values. */
export function formatFeeRange(min: number, max: number): string {
  if (min === max) return formatINR(min);
  return `${formatINR(min)}–${formatINR(max).slice(1)}`;
}

/** Package in lakhs per annum: 8.5 -> "8.5 LPA". */
export function formatLPA(lpa: number): string {
  return `${trimDecimal(lpa)} LPA`;
}

/** Percentage from 0–100: 92.4 -> "92%". */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/** Grouped count in Indian style: 12345 -> "12,345". */
export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

/** Rating to one decimal: 4 -> "4.0". */
export function formatRating(value: number): string {
  return value.toFixed(1);
}
