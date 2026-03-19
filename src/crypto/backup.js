function assertClipboardSupport() {
  if (!navigator.clipboard?.writeText) {
    throw new Error("Clipboard access is unavailable in this browser.");
  }
}

export async function copyText(text) {
  assertClipboardSupport();
  await navigator.clipboard.writeText(text);
}

export function canShareText() {
  return typeof navigator.share === "function";
}

export async function shareText(text) {
  if (!canShareText()) {
    throw new Error("Native sharing is unavailable on this device.");
  }

  await navigator.share({ text });
}

export function buildBackupText(data) {
  const memoLine = data.memo || "None";

  return [
    "Zcash Gift Card Backup",
    "",
    `Amount: ${data.amountZec} ZEC`,
    `Memo: ${memoLine}`,
    "",
    "Claim URI:",
    data.claimUri324,
    "",
    "Temporary address:",
    data.tempAddress,
    "",
    "Funding URI:",
    data.fundingUri321,
    "",
    "Warning: anyone with this claim URI can claim the funds.",
  ].join("\n");
}

export function downloadBackupText(data) {
  const text = buildBackupText(data);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const safeAmount = data.amountZec.replace(/[^\d.]/g, "_");

  anchor.href = url;
  anchor.download = `zcash-gift-card-${safeAmount || "backup"}.txt`;
  anchor.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1_000);
}
