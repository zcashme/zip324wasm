import { useReducer, useEffect, useCallback } from "react";
import { generateKeyBytes } from "./crypto/random.js";
import { buildFundingUri321 } from "./crypto/uri321.js";
import { buildClaimUri324 } from "./crypto/uri324.js";
import {
  deriveTemporaryAddressFromKey,
  encodeZip324KeyBech32,
  initializeZcashWasm,
} from "./crypto/zcashWasm.js";
import { downloadBackupText, copyText, shareText } from "./crypto/backup.js";
import CreateForm from "./components/CreateForm.jsx";
import FundingScreen from "./components/FundingScreen.jsx";
import ReadyScreen from "./components/ReadyScreen.jsx";
import Faq from "./components/Faq.jsx";
import Footer from "./components/Footer.jsx";
import ZcashLogo from "./components/ZcashLogo.jsx";

const NETWORK = "mainnet";
const ZATOSHIS_PER_ZEC = 100_000_000n;
const AMOUNT_PATTERN = /^\d+(?:\.\d{1,8})?$/;

const Screen = { CREATE: "create", FUND: "fund", READY: "ready" };

const emptyGiftCard = {
  amountZec: "",
  memo: "",
  keyBytes: null,
  bech32Key: "",
  tempAddress: "",
  fundingUri321: "",
  claimUri324: "",
  fundedByUserConfirmation: false,
};

const initialState = {
  screen: Screen.CREATE,
  giftCard: { ...emptyGiftCard },
  errors: {},
  statusMessage: "",
  submitError: "",
  isBusy: false,
  wasmReady: false,
  wasmError: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "WASM_READY":
      return { ...state, wasmReady: true, wasmError: "" };
    case "WASM_ERROR":
      return { ...state, wasmReady: false, wasmError: action.error };
    case "VALIDATION_ERROR":
      return {
        ...state,
        screen: Screen.CREATE,
        errors: { amountZec: action.error },
        submitError: "",
        giftCard: {
          ...state.giftCard,
          amountZec: action.amountZec,
          memo: action.memo,
        },
      };
    case "SET_BUSY":
      return {
        ...state,
        isBusy: true,
        errors: {},
        submitError: "",
        giftCard: {
          ...state.giftCard,
          amountZec: action.amountZec,
          memo: action.memo,
        },
      };
    case "GIFT_CARD_CREATED":
      return {
        ...state,
        isBusy: false,
        screen: Screen.FUND,
        statusMessage: "",
        submitError: "",
        giftCard: action.giftCard,
      };
    case "GIFT_CARD_FAILED":
      return {
        ...state,
        screen: Screen.CREATE,
        isBusy: false,
        submitError: "Gift card generation failed. Try again.",
      };
    case "CONFIRM_FUNDING":
      return {
        ...state,
        screen: Screen.READY,
        statusMessage: "",
        giftCard: {
          ...state.giftCard,
          claimUri324: action.claimUri324,
          fundedByUserConfirmation: true,
        },
      };
    case "BACK_TO_CREATE":
      return {
        ...initialState,
        wasmReady: state.wasmReady,
        wasmError: state.wasmError,
        giftCard: {
          ...emptyGiftCard,
          amountZec: state.giftCard.amountZec,
          memo: state.giftCard.memo,
        },
      };
    case "START_OVER":
      return {
        ...initialState,
        wasmReady: state.wasmReady,
        wasmError: state.wasmError,
      };
    case "SET_STATUS":
      return { ...state, statusMessage: action.message };
    default:
      return state;
  }
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
    return { ok: false, error: "Amount must be greater than zero." };
  }
  return { ok: true, amountZec: normalizeAmount(amountInput) };
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

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    initializeZcashWasm()
      .then(() => dispatch({ type: "WASM_READY" }))
      .catch((error) => {
        const details =
          error instanceof Error && error.message ? ` ${error.message}` : "";
        dispatch({
          type: "WASM_ERROR",
          error: `WASM failed to load.${details}`,
        });
      });
  }, []);

  const createGiftCard = useCallback(async ({ amountZec, memo }) => {
    const trimmedMemo = memo.trim();
    const amountInput = amountZec.trim();
    const validation = validateGiftCardInput(amountInput);

    if (!validation.ok) {
      dispatch({
        type: "VALIDATION_ERROR",
        error: validation.error,
        amountZec: amountInput,
        memo: trimmedMemo,
      });
      return;
    }

    dispatch({
      type: "SET_BUSY",
      amountZec: validation.amountZec,
      memo: trimmedMemo,
    });

    try {
      const keyBytes = generateKeyBytes();
      const tempAddress = await deriveTemporaryAddressFromKey(
        keyBytes,
        NETWORK,
      );
      const bech32Key = await encodeZip324KeyBech32(keyBytes, NETWORK);
      const fundingUri321 = buildFundingUri321(
        tempAddress,
        validation.amountZec,
        trimmedMemo,
      );

      dispatch({
        type: "GIFT_CARD_CREATED",
        giftCard: {
          amountZec: validation.amountZec,
          memo: trimmedMemo,
          keyBytes,
          bech32Key,
          tempAddress,
          fundingUri321,
          claimUri324: "",
          fundedByUserConfirmation: false,
        },
      });
    } catch {
      dispatch({ type: "GIFT_CARD_FAILED" });
    }
  }, []);

  const confirmFunding = useCallback(() => {
    const claimUri324 = buildClaimUri324(
      state.giftCard.amountZec,
      state.giftCard.memo,
      state.giftCard.bech32Key,
      NETWORK,
    );
    dispatch({ type: "CONFIRM_FUNDING", claimUri324 });
  }, [state.giftCard.amountZec, state.giftCard.memo, state.giftCard.bech32Key]);

  const backToCreate = useCallback(
    () => dispatch({ type: "BACK_TO_CREATE" }),
    [],
  );
  const startOver = useCallback(() => dispatch({ type: "START_OVER" }), []);

  const runStatusAction = useCallback(async (action, successMessage) => {
    try {
      await action();
      dispatch({ type: "SET_STATUS", message: successMessage });
    } catch (error) {
      dispatch({
        type: "SET_STATUS",
        message: error instanceof Error ? error.message : "Action failed.",
      });
    }
  }, []);

  const copyAddress = useCallback(
    () =>
      runStatusAction(
        () => copyText(state.giftCard.tempAddress),
        "Funding address copied.",
      ),
    [runStatusAction, state.giftCard.tempAddress],
  );

  const copyFundingUri = useCallback(
    () =>
      runStatusAction(
        () => copyText(state.giftCard.fundingUri321),
        "Funding URI copied.",
      ),
    [runStatusAction, state.giftCard.fundingUri321],
  );

  const copyClaimUri = useCallback(
    () =>
      runStatusAction(
        () => copyText(state.giftCard.claimUri324),
        "Claim URI copied.",
      ),
    [runStatusAction, state.giftCard.claimUri324],
  );

  const shareClaimUri = useCallback(
    () =>
      runStatusAction(
        () => shareText(state.giftCard.claimUri324),
        "Claim URI shared.",
      ),
    [runStatusAction, state.giftCard.claimUri324],
  );

  const downloadBackup = useCallback(() => {
    downloadBackupText(state.giftCard);
    dispatch({ type: "SET_STATUS", message: "Backup downloaded." });
  }, [state.giftCard]);

  let screen;
  if (state.screen === Screen.CREATE) {
    screen = <CreateForm state={state} onSubmit={createGiftCard} />;
  } else if (state.screen === Screen.FUND) {
    screen = (
      <FundingScreen
        giftCard={state.giftCard}
        onCopyAddress={copyAddress}
        onCopyFundingUri={copyFundingUri}
        onBack={backToCreate}
        onConfirmFunding={confirmFunding}
      />
    );
  } else {
    screen = (
      <ReadyScreen
        giftCard={state.giftCard}
        onCopyClaimUri={copyClaimUri}
        onShareClaimUri={shareClaimUri}
        onDownloadBackup={downloadBackup}
        onStartOver={startOver}
      />
    );
  }

  return (
    <>
      <main className="app-shell">
        <h1 className="app-title">
          <ZcashLogo size={44} />
          Zcash Gift Card
        </h1>

        {state.statusMessage && (
          <p className="alert alert-soft">{state.statusMessage}</p>
        )}

        {screen}

        <Faq />
      </main>

      <Footer />
    </>
  );
}
