import { canShareText } from "../crypto/backup.js";
import QrCode from "./QrCode.jsx";

export default function ReadyScreen({
  giftCard,
  onCopyClaimUri,
  onShareClaimUri,
  onDownloadBackup,
  onStartOver,
}) {
  return (
    <section className="panel">
      <h2 className="panel-title">Gift card ready</h2>

      <p className="alert alert-warning">
        Anyone with this link can claim the funds.
      </p>

      <div className="screen-grid">
        <div className="stack">
          <article className="value-card">
            <p className="value-label">ZIP 324 claim URI</p>
            <code className="value-text">{giftCard.claimUri324}</code>
          </article>

          <div className="button-row">
            <button
              type="button"
              className="button button-primary"
              onClick={onCopyClaimUri}
            >
              Copy URI
            </button>
            {canShareText() && (
              <button
                type="button"
                className="button button-secondary"
                onClick={onShareClaimUri}
              >
                Share
              </button>
            )}
            <button
              type="button"
              className="button button-secondary"
              onClick={onDownloadBackup}
            >
              Download backup
            </button>
          </div>
        </div>

        <div className="qr-panel">
          <p className="qr-label">Claim QR</p>
          <QrCode text={giftCard.claimUri324} />
        </div>
      </div>

      <div className="button-row">
        <button
          type="button"
          className="button button-ghost"
          onClick={onStartOver}
        >
          Create another
        </button>
      </div>
    </section>
  );
}
