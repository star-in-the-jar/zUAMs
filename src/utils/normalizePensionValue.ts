// Universal validator/normalizer for pension input
export function normalizePensionValue(val: string): string | undefined {
  // Remove all non-digit characters
  const digits = val.replace(/\D/g, "");
  if (!digits || isNaN(Number(digits)) || Number(digits) <= 0) {
    return undefined;
  }
  // Remove leading zeros
  return String(Number(digits));
}
