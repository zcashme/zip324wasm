# Zcash Gift Card Generator

Client-only one-page app for generating Zcash gift cards.

The app:

- generates a fresh 32-byte secret in the browser
- derives a temporary Sapling address from that secret via Rust/WASM
- builds a ZIP 321 funding URI
- builds a ZIP 324 claim URI
- renders QR codes locally
- lets the sender copy, share, or download a backup of the claim URI

No backend is used for key generation, claim URI generation, or secret storage.

## Current Scope

Implemented:

- three-screen flow: create, fund, ready
- amount validation
- browser RNG via `crypto.getRandomValues`
- Sapling temporary address derivation in Rust/WASM
- ZIP 321 funding URI generation
- ZIP 324 claim URI generation
- QR rendering
- copy/share/download backup actions

Not implemented:

- chain-based funding verification
- local encrypted draft persistence
- deterministic recovery from a wallet seed

## Tech Stack

- Vite
- vanilla JavaScript
- Rust
- `wasm-pack`
- `sapling-crypto`
- `zcash_protocol`
- `qrcode`

## Project Layout

```text
src/
  app.js
  main.js
  state.js
  styles.css
  ui/
    createForm.js
    fundingScreen.js
    readyScreen.js
  crypto/
    backup.js
    random.js
    uri321.js
    uri324.js
    zcashWasm.js
  qr/
    renderQr.js
  wasm/
    pkg/
wasm/
  zcash-gift-wasm/
    Cargo.toml
    src/lib.rs
```

## Requirements

- Node.js 22+ recommended
- Rust toolchain
- `wasm32-unknown-unknown` target
- `wasm-pack`
- `wasm-bindgen-cli`

If needed:

```powershell
rustup target add wasm32-unknown-unknown
cargo install wasm-pack
cargo install wasm-bindgen-cli
```

## Install

```powershell
npm.cmd install
```

## Run Locally

Build the WASM package and start the dev server:

```powershell
npm.cmd run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

## Production Build

```powershell
npm.cmd run build
```

Preview the production build:

```powershell
npm.cmd run preview
```

Usually available at:

```text
http://localhost:4173
```

## User Flow

1. Enter amount and optional memo.
2. Click `Create gift card`.
3. The app generates a random secret locally.
4. The app derives a temporary Sapling address locally.
5. The app displays the funding address, ZIP 321 URI, and QR code.
6. Fund that address with the intended amount.
7. Click `I sent the funds`.
8. The app generates the ZIP 324 claim URI locally.
9. Copy, share, or download the backup.

## Security Notes

- Secrets are generated in-browser with `crypto.getRandomValues`.
- The gift card secret is kept in memory only.
- No analytics or backend secret storage are used.
- The claim URI is bearer access to the funds.
- Anyone with the claim URI can claim the funds.
- Refreshing the tab before backup can lose access to the gift card.

## Important Limitations

- Funding is user-confirmed only. The app does not verify the chain.
- Wallet support for ZIP 324 handling may vary.
- This prototype assumes the funded amount and claim amount stay consistent.

## Core Functions

Implemented in the frontend or WASM bridge:

- `generateKeyBytes()`
- `deriveTemporaryAddressFromKey(keyBytes, network)`
- `encodeZip324KeyBech32(keyBytes, network)`
- `buildFundingUri321(address, amountZec, memo)`
- `buildClaimUri324(amountZec, memo, bech32Key)`
- `downloadBackupText(data)`
- `copyText(text)`
- `shareText(text)`

## Notes for Development

- The generated WASM package is written to `src/wasm/pkg`.
- The app imports the generated WASM bindings from source so Vite dev/build work consistently.
- The page CSP allows local WebAssembly compilation with `'wasm-unsafe-eval'`.

## Manual Verification

Basic check:

1. Run `npm.cmd run dev`.
2. Create a gift card with a valid amount such as `1.23`.
3. Confirm that a Sapling address and funding QR appear.
4. Click `I sent the funds`.
5. Confirm that a ZIP 324 URI, claim QR, and backup download action appear.

