export function renderFundingScreen({
  giftCard,
  qrNode,
  onCopyAddress,
  onCopyFundingUri,
  onBack,
  onConfirmFunding,
}) {
  const section = document.createElement("section");
  section.className = "panel";

  const title = document.createElement("p");
  title.className = "eyebrow";
  title.textContent = "Step 2 of 3";

  const heading = document.createElement("h1");
  heading.className = "panel-title";
  heading.textContent = "Temporary address ready";

  const intro = document.createElement("p");
  intro.className = "panel-copy";
  intro.textContent = `Fund exactly ${giftCard.amountZec} ZEC to the temporary address below, then confirm once you have sent it.`;

  const layout = document.createElement("div");
  layout.className = "screen-grid";

  const infoColumn = document.createElement("div");
  infoColumn.className = "stack";

  const addressCard = createValueCard("Funding address", giftCard.tempAddress);
  const addressButtons = createButtonRow([
    {
      label: "Copy address",
      className: "button button-secondary",
      onClick: onCopyAddress,
    },
  ]);

  const uriCard = createValueCard("ZIP 321 funding URI", giftCard.fundingUri321);
  const uriButtons = createButtonRow([
    {
      label: "Copy funding URI",
      className: "button button-secondary",
      onClick: onCopyFundingUri,
    },
  ]);

  const caution = document.createElement("p");
  caution.className = "fine-print";
  caution.textContent =
    "Prototype note: this flow assumes the gift amount and claim amount match directly. Wallet fee handling may vary by implementation.";

  infoColumn.append(addressCard, addressButtons, uriCard, uriButtons, caution);

  const qrCard = document.createElement("div");
  qrCard.className = "qr-panel";

  const qrLabel = document.createElement("p");
  qrLabel.className = "qr-label";
  qrLabel.textContent = "Funding QR";

  qrCard.append(qrLabel, qrNode);

  layout.append(infoColumn, qrCard);

  const actions = createButtonRow([
    {
      label: "Back",
      className: "button button-secondary",
      onClick: onBack,
      type: "button",
    },
    {
      label: "I sent the funds",
      className: "button button-primary",
      onClick: onConfirmFunding,
      type: "button",
    },
  ]);

  section.append(title, heading, intro, layout, actions);
  return section;
}

function createValueCard(label, value) {
  const card = document.createElement("article");
  card.className = "value-card";

  const cardLabel = document.createElement("p");
  cardLabel.className = "value-label";
  cardLabel.textContent = label;

  const cardValue = document.createElement("code");
  cardValue.className = "value-text";
  cardValue.textContent = value;

  card.append(cardLabel, cardValue);
  return card;
}

function createButtonRow(buttons) {
  const row = document.createElement("div");
  row.className = "button-row";

  for (const buttonConfig of buttons) {
    const button = document.createElement("button");
    button.type = buttonConfig.type ?? "button";
    button.className = buttonConfig.className;
    button.textContent = buttonConfig.label;
    button.addEventListener("click", buttonConfig.onClick);
    row.append(button);
  }

  return row;
}
