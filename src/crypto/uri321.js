export function buildFundingUri321(address, amountZec, memo) {
  const params = new URLSearchParams();
  params.set("amount", amountZec);

  if (memo) {
    params.set("memo", memo);
  }

  return `zcash:${address}?${params.toString()}`;
}
