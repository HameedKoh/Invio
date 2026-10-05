// Naira shows as ₦ (en-NG). Other currencies use en-US formatting.
export const formatMoney = (n: number, currency = "NGN"): string =>
  new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency,
  }).format(n);
