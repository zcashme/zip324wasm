const CLAIM_HOSTS = {
  mainnet: "pay.withzcash.com",
  testnet: "pay.testzcash.com",
};

export function buildClaimUri324(amountZec, memo, bech32Key, network = "mainnet") {
  const host = CLAIM_HOSTS[network] ?? CLAIM_HOSTS.mainnet;
  const parts = [];
  parts.push(`amount=${encodeURIComponent(amountZec)}`);

  if (memo) {
    parts.push(`desc=${encodeURIComponent(memo)}`);
  }

  parts.push(`key=${encodeURIComponent(bech32Key)}`);

  return `https://${host}:65536/payment/v1#${parts.join("&")}`;
}
