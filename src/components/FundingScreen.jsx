import QrCode from "./QrCode.jsx";

export default function FundingScreen({
  giftCard,
  onCopyAddress,
  onCopyFundingUri,
  onBack,
  onConfirmFunding,
}) {
  return (
    <section className="panel">
      <h2 className="panel-title">
        Fund {giftCard.amountZec} ZEC
      </h2>

      <div className="screen-grid">
        <div className="stack">
          <article className="value-card">
            <p className="value-label">Funding address</p>
            <code className="value-text">{giftCard.tempAddress}</code>
          </article>
          <div className="button-row">
            <button
              type="button"
              className="button button-secondary"
              onClick={onCopyAddress}
            >
              Copy address
            </button>
          </div>

          <article className="value-card">
            <p className="value-label">ZIP 321 funding URI</p>
            <code className="value-text">{giftCard.fundingUri321}</code>
          </article>
          <div className="button-row">
            <button
              type="button"
              className="button button-secondary"
              onClick={onCopyFundingUri}
            >
              Copy funding URI
            </button>
          </div>
        </div>

        <div className="qr-panel">
          <p className="qr-label">Funding QR</p>
          <QrCode text={giftCard.fundingUri321} />
        </div>
      </div>

      <div className="button-row button-row-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={onBack}
        >
          Back
        </button>
        <button
          type="button"
          className="button button-primary"
          onClick={onConfirmFunding}
        >
          I sent the funds
        </button>
      </div>
    </section>
  );
}
