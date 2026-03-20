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

    const titleBar = document.createElement("header");
    titleBar.className = "title-bar";

    const titleBrand = document.createElement("div");
    titleBrand.className = "title-brand";
    titleBrand.append(createZcashLogo(44));

    const titleCopy = document.createElement("div");
    titleCopy.className = "title-copy";

    const appTitle = document.createElement("h1");
    appTitle.className = "app-title";
    appTitle.textContent = "Zcash Gift Card";

    titleCopy.append(appTitle);
    titleBrand.append(titleCopy);
    titleBar.append(titleBrand);
    frame.append(titleBar);

    const hero = document.createElement("section");
    hero.className = "hero";

    const heroTitle = document.createElement("p");
    heroTitle.className = "hero-kicker";
    heroTitle.textContent = "Client-side only";

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

    const footerBrand = document.createElement("div");
    footerBrand.className = "footer-brand";
    footerBrand.append(createZcashLogo(24));

    const footerBrandLabel = document.createElement("span");
    footerBrandLabel.textContent = "Zcash Gift Card";
    footerBrand.append(footerBrandLabel);

    const footerLinks = document.createElement("div");
    footerLinks.className = "footer-links";

    const specLink = document.createElement("a");
    specLink.href = "https://zips.z.cash/zip-0324";
    specLink.target = "_blank";
    specLink.rel = "noopener noreferrer";
    specLink.textContent = "ZIP 324 Spec";

    const repoLink = document.createElement("a");
    repoLink.href = "https://github.com/zcashme/zip324wasm";
    repoLink.target = "_blank";
    repoLink.rel = "noopener noreferrer";
    repoLink.textContent = "GitHub";

    footerLinks.append(specLink, repoLink);

    const footerNote = document.createElement("p");
    footerNote.className = "footer-note";
    footerNote.textContent =
      "No analytics, no remote logging, no server-side key storage. Keep the claim URI private.";

    footer.append(footerBrand, footerLinks, footerNote);

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

function createZcashLogo(size) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 493.3 490.2");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("zcash-logo");

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", "245.4");
  circle.setAttribute("cy", "245.4");
  circle.setAttribute("r", "225.4");
  circle.setAttribute("fill", "#f3b724");

  const mark = document.createElementNS("http://www.w3.org/2000/svg", "path");
  mark.setAttribute(
    "d",
    "m165 315.5v34.4h61.5v37.7h37.8v-37.7h61.5v-45.5h-95.4l95.4-129.4v-34.4h-61.5v-37.6h-37.8v37.6h-61.5v45.6h95.4z",
  );
  mark.setAttribute("fill", "#fff");

  svg.append(circle, mark);
  return svg;
}
