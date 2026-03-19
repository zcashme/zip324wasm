export function buildClaimUri324(amountZec, memo, bech32Key) {
  const parts = [];
  parts.push(`amount=${encodeURIComponent(amountZec)}`);

  if (memo) {
    parts.push(`desc=${encodeURIComponent(memo)}`);
  }

  parts.push(`key=${encodeURIComponent(bech32Key)}`);

  return `https://pay.withzcash.com:65536/payment/v1#${parts.join("&")}`;
}
