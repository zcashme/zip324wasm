export const Screen = Object.freeze({
  CREATE: "create",
  FUND: "fund",
  READY: "ready",
});

const emptyGiftCard = Object.freeze({
  amountZec: "",
  memo: "",
  keyBytes: null,
  bech32Key: "",
  tempAddress: "",
  fundingUri321: "",
  claimUri324: "",
  fundedByUserConfirmation: false,
});

export function createInitialState() {
  return {
    screen: Screen.CREATE,
    giftCard: { ...emptyGiftCard },
    errors: {},
    statusMessage: "",
    submitError: "",
    isBusy: false,
    wasmReady: false,
    wasmError: "",
  };
}

export function buildGiftCard(data) {
  return Object.seal({
    amountZec: data.amountZec,
    memo: data.memo,
    keyBytes: data.keyBytes,
    bech32Key: data.bech32Key,
    tempAddress: data.tempAddress,
    fundingUri321: data.fundingUri321,
    claimUri324: data.claimUri324 ?? "",
    fundedByUserConfirmation: Boolean(data.fundedByUserConfirmation),
  });
}
