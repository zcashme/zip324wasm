import { useState } from "react";

export default function CreateForm({ state, onSubmit }) {
  const [amountZec, setAmountZec] = useState(state.giftCard.amountZec);
  const [memo, setMemo] = useState(state.giftCard.memo);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ amountZec, memo });
  };

  return (
    <section className="panel">
      <h2 className="panel-title">Create gift card</h2>

      <form className="gift-form" onSubmit={handleSubmit}>
        <label className="field" htmlFor="amount">
          Amount (ZEC)
          <input
            id="amount"
            name="amount"
            inputMode="decimal"
            placeholder="1.23"
            autoComplete="off"
            value={amountZec}
            onChange={(e) => setAmountZec(e.target.value)}
          />
        </label>
        {state.errors.amountZec && (
          <p className="field-error">{state.errors.amountZec}</p>
        )}

        <label className="field" htmlFor="memo">
          Memo (optional)
          <textarea
            id="memo"
            name="memo"
            rows={2}
            placeholder="Happy birthday"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </label>

        {state.submitError && (
          <p className="alert alert-error">{state.submitError}</p>
        )}

        {state.wasmError && (
          <p className="alert alert-error">{state.wasmError}</p>
        )}

        <div className="button-row">
          <button
            className="button button-primary"
            type="submit"
            disabled={state.isBusy || !state.wasmReady}
          >
            {state.isBusy ? "Creating..." : "Create gift card"}
          </button>
        </div>
      </form>
    </section>
  );
}
