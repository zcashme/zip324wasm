export function renderCreateForm({ state, onSubmit }) {
  const section = document.createElement("section");
  section.className = "panel panel-create";

  const title = document.createElement("p");
  title.className = "eyebrow";
  title.textContent = "Step 1 of 3";

  const heading = document.createElement("h1");
  heading.className = "panel-title";
  heading.textContent = "Create gift card";

  const intro = document.createElement("p");
  intro.className = "panel-copy";
  intro.textContent =
    "Generate a fresh secret locally, derive a temporary Sapling address, and keep the claim link in this browser only.";

  const form = document.createElement("form");
  form.className = "gift-form";

  const amountField = document.createElement("label");
  amountField.className = "field";
  amountField.htmlFor = "amount";
  amountField.textContent = "Amount";

  const amountInput = document.createElement("input");
  amountInput.id = "amount";
  amountInput.name = "amount";
  amountInput.inputMode = "decimal";
  amountInput.placeholder = "1.23";
  amountInput.autocomplete = "off";
  amountInput.value = state.giftCard.amountZec;

  const amountError = document.createElement("p");
  amountError.className = "field-error";
  amountError.textContent = state.errors.amountZec ?? "";

  const memoField = document.createElement("label");
  memoField.className = "field";
  memoField.htmlFor = "memo";
  memoField.textContent = "Memo";

  const memoInput = document.createElement("textarea");
  memoInput.id = "memo";
  memoInput.name = "memo";
  memoInput.rows = 4;
  memoInput.placeholder = "Happy birthday";
  memoInput.value = state.giftCard.memo;

  const memoHelp = document.createElement("p");
  memoHelp.className = "field-help";
  memoHelp.textContent = "Optional. Included in the funding URI and claim URI description.";

  const errorBanner = document.createElement("p");
  errorBanner.className = "alert alert-error";
  errorBanner.hidden = !state.submitError;
  errorBanner.textContent = state.submitError;

  const wasmBanner = document.createElement("p");
  wasmBanner.className = state.wasmError ? "alert alert-error" : "alert alert-soft";
  wasmBanner.hidden = !state.wasmError && !state.wasmReady;
  wasmBanner.textContent = state.wasmError
    ? state.wasmError
    : "Zcash WASM loaded. Secrets stay in memory on this device.";

  const buttonRow = document.createElement("div");
  buttonRow.className = "button-row";

  const submitButton = document.createElement("button");
  submitButton.className = "button button-primary";
  submitButton.type = "submit";
  submitButton.disabled = state.isBusy || Boolean(state.wasmError);
  submitButton.textContent = state.isBusy ? "Creating..." : "Create gift card";

  const note = document.createElement("p");
  note.className = "fine-print";
  note.textContent =
    "This prototype keeps the gift card secret only in memory. Refreshing the tab before backup can lose access.";

  amountField.append(amountInput);
  memoField.append(memoInput);
  buttonRow.append(submitButton);
  form.append(
    amountField,
    amountError,
    memoField,
    memoHelp,
    errorBanner,
    wasmBanner,
    buttonRow,
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    onSubmit({
      amountZec: amountInput.value,
      memo: memoInput.value,
    });
  });

  section.append(title, heading, intro, form, note);
  return section;
}
