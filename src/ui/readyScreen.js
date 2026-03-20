import { canShareText } from "../crypto/backup.js";

export function renderReadyScreen({
  giftCard,
  qrNode,
  onCopyClaimUri,
  onShareClaimUri,
  onDownloadBackup,
  onStartOver,
}) {
  const section = document.createElement("section");
  section.className = "panel panel-ready";

  const title = document.createElement("p");
  title.className = "eyebrow";
  title.textContent = "Step 3 of 3";

  const heading = document.createElement("h1");
  heading.className = "panel-title";
  heading.textContent = "Gift card ready";

  const intro = document.createElement("p");
  intro.className = "panel-copy";
  intro.textContent =
    "Back up the claim URI before you send it. This app does not keep a server-side recovery path.";

  const warning = document.createElement("p");
  warning.className = "alert alert-warning";
  warning.textContent = "Anyone with this link can claim the funds.";

  const layout = document.createElement("div");
  layout.className = "screen-grid";

  const infoColumn = document.createElement("div");
  infoColumn.className = "stack";

  const claimCard = document.createElement("article");
  claimCard.className = "value-card";

  const claimLabel = document.createElement("p");
  claimLabel.className = "value-label";
  claimLabel.textContent = "Raw ZIP 324 URI";

  const claimValue = document.createElement("code");
  claimValue.className = "value-text value-text-large";
  claimValue.textContent = giftCard.claimUri324;

  claimCard.append(claimLabel, claimValue);

  const buttonRow = document.createElement("div");
  buttonRow.className = "button-row";

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className = "button button-primary";
  copyButton.textContent = "Copy URI";
  copyButton.addEventListener("click", onCopyClaimUri);

  const shareButton = document.createElement("button");
  shareButton.type = "button";
  shareButton.className = "button button-secondary";
  shareButton.textContent = "Share";
  shareButton.hidden = !canShareText();
  shareButton.addEventListener("click", onShareClaimUri);

  const backupButton = document.createElement("button");
  backupButton.type = "button";
  backupButton.className = "button button-secondary";
  backupButton.textContent = "Download backup";
  backupButton.addEventListener("click", onDownloadBackup);

  buttonRow.append(copyButton, shareButton, backupButton);

  const backupChecklist = document.createElement("ul");
  backupChecklist.className = "checklist";
  backupChecklist.innerHTML = `
    <li>Copy the raw URI.</li>
    <li>Download a local text backup.</li>
    <li>Only then share the URI or its QR code.</li>
  `;

  infoColumn.append(claimCard, buttonRow, backupChecklist);

  const qrCard = document.createElement("div");
  qrCard.className = "qr-panel";

  const qrLabel = document.createElement("p");
  qrLabel.className = "qr-label";
  qrLabel.textContent = "Claim QR";

  qrCard.append(qrLabel, qrNode);

  layout.append(infoColumn, qrCard);

  const footerActions = document.createElement("div");
  footerActions.className = "button-row";

  const startOverButton = document.createElement("button");
  startOverButton.type = "button";
  startOverButton.className = "button button-ghost";
  startOverButton.textContent = "Create another";
  startOverButton.addEventListener("click", onStartOver);

  footerActions.append(startOverButton);

  section.append(title, heading, intro, warning, layout, footerActions);
  return section;
}
