use bech32::{Bech32, Hrp};
use sapling_crypto::{
    keys::{ExpandedSpendingKey, FullViewingKey},
    zip32::{sapling_default_address, DiversifierKey},
};
use wasm_bindgen::prelude::*;
use zcash_protocol::constants::{
    mainnet::HRP_SAPLING_PAYMENT_ADDRESS as MAINNET_SAPLING_ADDRESS_HRP,
    testnet::HRP_SAPLING_PAYMENT_ADDRESS as TESTNET_SAPLING_ADDRESS_HRP,
};

const MAINNET_PAYMENT_URI_KEY_HRP: &str = "secret-spending-key-main";
const TESTNET_PAYMENT_URI_KEY_HRP: &str = "secret-spending-key-test";

struct NetworkConfig {
    payment_address_hrp: &'static str,
    payment_uri_key_hrp: &'static str,
}

#[wasm_bindgen]
pub fn derive_temporary_address_from_key(key_bytes: &[u8], network: &str) -> Result<String, JsValue> {
    let key = parse_key_bytes(key_bytes)?;
    let config = network_config(network)?;

    let expsk = ExpandedSpendingKey::from_spending_key(&key);
    let fvk = FullViewingKey::from_expanded_spending_key(&expsk);
    let dk = DiversifierKey::master(&key);
    let (_, payment_address) = sapling_default_address(&fvk, &dk);

    bech32::encode::<Bech32>(
        Hrp::parse_unchecked(config.payment_address_hrp),
        &payment_address.to_bytes(),
    )
    .map_err(|_| JsValue::from_str("Failed to encode the Sapling payment address."))
}

#[wasm_bindgen]
pub fn encode_zip324_key_bech32(key_bytes: &[u8], network: &str) -> Result<String, JsValue> {
    let key = parse_key_bytes(key_bytes)?;
    let config = network_config(network)?;

    bech32::encode::<Bech32>(Hrp::parse_unchecked(config.payment_uri_key_hrp), &key)
        .map_err(|_| JsValue::from_str("Failed to encode the ZIP 324 key."))
}

fn parse_key_bytes(key_bytes: &[u8]) -> Result<[u8; 32], JsValue> {
    key_bytes
        .try_into()
        .map_err(|_| JsValue::from_str("ZIP 324 keys must be exactly 32 bytes."))
}

fn network_config(network: &str) -> Result<NetworkConfig, JsValue> {
    match network {
        "mainnet" => Ok(NetworkConfig {
            payment_address_hrp: MAINNET_SAPLING_ADDRESS_HRP,
            payment_uri_key_hrp: MAINNET_PAYMENT_URI_KEY_HRP,
        }),
        "testnet" => Ok(NetworkConfig {
            payment_address_hrp: TESTNET_SAPLING_ADDRESS_HRP,
            payment_uri_key_hrp: TESTNET_PAYMENT_URI_KEY_HRP,
        }),
        _ => Err(JsValue::from_str(
            "Unsupported network. Use \"mainnet\" or \"testnet\".",
        )),
    }
}
