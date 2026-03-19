import { buildGiftCard, createInitialState, Screen } from "./state.js";
import { downloadBackupText, copyText, shareText } from "./crypto/backup.js";
import { generateKeyBytes } from "./crypto/random.js";
import { buildFundingUri321 } from "./crypto/uri321.js";
import { buildClaimUri324 } from "./crypto/uri324.js";
import {
  deriveTemporaryAddressFromKey,
  encodeZip324KeyBech32,
  initializeZcashWasm,
} from "./crypto/zcashWasm.js";
import { renderQr } from "./qr/renderQr.js";
import { renderCreateForm } from "./ui/createForm.js";
import { renderFundingScreen } from "./ui/fundingScreen.js";
import { renderReadyScreen } from "./ui/readyScreen.js";

const ZATOSHIS_PER_ZEC = 100_000_000n;
const AMOUNT_PATTERN = /^\d+(?:\.\d{1,8})?$/;
const NETWORK = "mainnet";

export function mountApp(root) {
  let state = createInitialState();
  let renderVersion = 0;

  const setState = (nextState) => {
    state = nextState;
    void render();
  };

  const updateState = (updater) => {
    state = updater(state);
    void render();
  };

  const actions = {
    async initialize() {
      try {
        await initializeZcashWasm();
        updateState((current) => ({
          ...current,
          wasmReady: true,
          wasmError: "",
        }));
      } catch (error) {
        const details =
          error instanceof Error && error.message
            ? ` ${error.message}`
            : "";

        updateState((current) => ({
          ...current,
          wasmReady: false,
          wasmError:
            `The Zcash cryptography module failed to load.${details}`,
        }));
      }
    },

    async createGiftCard(formValues) {
      const memo = formValues.memo.trim();
      const amountInput = formValues.amountZec.trim();
      const validation = validateGiftCardInput(amountInput);

      if (!validation.ok) {
        setState({
          ...state,
          screen: Screen.CREATE,
          errors: { amountZec: validation.error },
          submitError: "",
          giftCard: {
            ...state.giftCard,
            amountZec: amountInput,
            memo,
          },
        });
        return;
      }

      setState({
        ...state,
        isBusy: true,
        errors: {},
        submitError: "",
        giftCard: {
          ...state.giftCard,
          amountZec: validation.amountZec,
          memo,
        },
      });

      try {
        const keyBytes = generateKeyBytes();
        const tempAddress = await deriveTemporaryAddressFromKey(keyBytes, NETWORK);
        const bech32Key = await encodeZip324KeyBech32(keyBytes, NETWORK);
        const fundingUri321 = buildFundingUri321(tempAddress, validation.amountZec, memo);

        setState({
          ...state,
          isBusy: false,
          screen: Screen.FUND,
          statusMessage: "",
          submitError: "",
          giftCard: buildGiftCard({
            amountZec: validation.amountZec,
            memo,
            keyBytes,
            bech32Key,
            tempAddress,
            fundingUri321,
            fundedByUserConfirmation: false,
          }),
        });
      } catch {
        setState({
          ...state,
          screen: Screen.CREATE,
          isBusy: false,
          submitError: "Gift card generation failed before a claim URI was created. Try again on this device.",
        });
      }
    },

    confirmFunding() {
      const claimUri324 = buildClaimUri324(
        state.giftCard.amountZec,
        state.giftCard.memo,
        state.giftCard.bech32Key,
      );

      setState({
        ...state,
        screen: Screen.READY,
        statusMessage: "",
        giftCard: buildGiftCard({
          ...state.giftCard,
          claimUri324,
          fundedByUserConfirmation: true,
        }),
      });
    },

    backToCreate() {
      const nextState = createInitialState();

      setState({
        ...nextState,
        wasmReady: state.wasmReady,
        wasmError: state.wasmError,
        giftCard: {
          ...nextState.giftCard,
          amountZec: state.giftCard.amountZec,
          memo: state.giftCard.memo,
        },
      });
    },

    startOver() {
      setState({
        ...createInitialState(),
        wasmReady: state.wasmReady,
        wasmError: state.wasmError,
      });
    },

    async copyAddress() {
      await runStatusAction(async () => {
        await copyText(state.giftCard.tempAddress);
      }, "Funding address copied.");
    },

    async copyFundingUri() {
      await runStatusAction(async () => {
        await copyText(state.giftCard.fundingUri321);
      }, "Funding URI copied.");
    },

    async copyClaimUri() {
      await runStatusAction(async () => {
        await copyText(state.giftCard.claimUri324);
      }, "Claim URI copied.");
    },

    async shareClaimUri() {
      await runStatusAction(async () => {
        await shareText(state.giftCard.claimUri324);
      }, "Claim URI shared.");
    },

    downloadBackup() {
      downloadBackupText(state.giftCard);
      updateState((current) => ({
        ...current,
        statusMessage: "Backup downloaded locally.",
      }));
    },
  };

  async function runStatusAction(action, successMessage) {
    try {
      await action();
      updateState((current) => ({
        ...current,
        statusMessage: successMessage,
      }));
    } catch (error) {
      updateState((current) => ({
        ...current,
        statusMessage: error instanceof Error ? error.message : "Action failed.",
      }));
    }
  }

  async function buildQrNode(payload) {
    const wrapper = document.createElement("div");
    wrapper.className = "qr-shell";

    try {
      await renderQr(wrapper, payload);
    } catch {
      const fallback = document.createElement("p");
      fallback.className = "field-error";
      fallback.textContent = "QR rendering failed in this browser.";
      wrapper.append(fallback);
    }

    return wrapper;
  }

  async function render() {
    const currentRenderVersion = ++renderVersion;
    root.replaceChildren();

    const frame = document.createElement("main");
    frame.className = "app-shell";

    const hero = document.createElement("section");
    hero.className = "hero";

    const heroTitle = document.createElement("p");
    heroTitle.className = "hero-kicker";
    heroTitle.textContent = "Client-only flow";

    const heroHeading = document.createElement("h1");
    heroHeading.className = "hero-title";
    heroHeading.textContent = "Generate a Zcash gift card without handing the secret to any server.";

    const heroCopy = document.createElement("p");
    heroCopy.className = "hero-copy";
    heroCopy.textContent =
      "This page creates a random 32-byte secret in the browser, derives a temporary Sapling address through WASM, then produces a raw ZIP 324 claim URI you can copy, share, or back up.";

    hero.append(heroTitle, heroHeading, heroCopy);

    frame.append(hero);

    if (state.statusMessage) {
      const status = document.createElement("p");
      status.className = "alert alert-soft";
      status.textContent = state.statusMessage;
      frame.append(status);
    }

    let screenNode;

    if (state.screen === Screen.CREATE) {
      screenNode = renderCreateForm({
        state,
        onSubmit: actions.createGiftCard,
      });
    } else if (state.screen === Screen.FUND) {
      screenNode = renderFundingScreen({
        giftCard: state.giftCard,
        qrNode: await buildQrNode(state.giftCard.fundingUri321),
        onCopyAddress: actions.copyAddress,
        onCopyFundingUri: actions.copyFundingUri,
        onBack: actions.backToCreate,
        onConfirmFunding: actions.confirmFunding,
      });
    } else {
      screenNode = renderReadyScreen({
        giftCard: state.giftCard,
        qrNode: await buildQrNode(state.giftCard.claimUri324),
        onCopyClaimUri: actions.copyClaimUri,
        onShareClaimUri: actions.shareClaimUri,
        onDownloadBackup: actions.downloadBackup,
        onStartOver: actions.startOver,
      });
    }

    if (currentRenderVersion !== renderVersion) {
      return;
    }

    const footer = document.createElement("footer");
    footer.className = "app-footer";
    footer.textContent =
      "No analytics, no remote logging, no server-side key storage. Keep the claim URI private.";

    frame.append(screenNode, footer);
    root.append(frame);
  }

  void render();
  void actions.initialize();
}

function validateGiftCardInput(amountInput) {
  if (!amountInput) {
    return { ok: false, error: "Amount is required." };
  }

  if (!AMOUNT_PATTERN.test(amountInput)) {
    return {
      ok: false,
      error: "Amount must be a decimal with at most 8 fractional digits.",
    };
  }

  const zatoshis = toZatoshis(amountInput);

  if (zatoshis <= 0n) {
    return {
      ok: false,
      error: "Amount must be greater than zero.",
    };
  }

  return {
    ok: true,
    amountZec: normalizeAmount(amountInput),
  };
}

function normalizeAmount(value) {
  const [wholeRaw, fractionRaw = ""] = value.split(".");
  const whole = wholeRaw.replace(/^0+(?=\d)/, "") || "0";
  const fraction = fractionRaw.replace(/0+$/, "");

  return fraction ? `${whole}.${fraction}` : whole;
}

function toZatoshis(value) {
  const [whole, fraction = ""] = value.split(".");
  const wholePart = BigInt(whole || "0") * ZATOSHIS_PER_ZEC;
  const fractionPart = BigInt((fraction.padEnd(8, "0") || "0").slice(0, 8));

  return wholePart + fractionPart;
}
