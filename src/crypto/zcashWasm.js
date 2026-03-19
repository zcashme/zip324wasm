import initWasm, {
  derive_temporary_address_from_key,
  encode_zip324_key_bech32,
} from "../wasm/pkg/zcash_gift_wasm.js";

let initPromise;

function normalizeKeyBytes(keyBytes) {
  if (!(keyBytes instanceof Uint8Array) || keyBytes.length !== 32) {
    throw new Error("Gift card secrets must be exactly 32 bytes.");
  }

  return keyBytes;
}

async function ensureInitialized() {
  if (!initPromise) {
    initPromise = initWasm().catch((error) => {
      initPromise = undefined;
      throw error;
    });
  }

  await initPromise;
}

export async function initializeZcashWasm() {
  await ensureInitialized();
}

export async function deriveTemporaryAddressFromKey(keyBytes, network = "mainnet") {
  await ensureInitialized();
  return derive_temporary_address_from_key(normalizeKeyBytes(keyBytes), network);
}

export async function encodeZip324KeyBech32(keyBytes, network = "mainnet") {
  await ensureInitialized();
  return encode_zip324_key_bech32(normalizeKeyBytes(keyBytes), network);
}
