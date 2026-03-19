const entries = [
  {
    q: "What is Zcash Gift Card?",
    a: "It generates a Zcash gift card you can send to anyone — even if they don't have a wallet yet. You fund a temporary address, and the recipient claims the funds by opening a link.",
  },
  {
    q: "What is ZIP 324?",
    a: "ZIP 324 is a Zcash standard for URI-Encapsulated Payments. It encodes a secret spending key into a URL so you can send ZEC through any messaging app — Signal, iMessage, email, whatever. The recipient clicks the link and a Zcash wallet sweeps the funds into their own address.",
  },
  {
    q: "How does it work?",
    a: "The app generates a random secret in your browser and derives a temporary Sapling address from it. You send ZEC to that address using the funding QR code, then share the claim URI or QR with the recipient. They open it in a Zcash wallet, which uses the embedded key to sweep the funds into their own address. They don't need a wallet when you send it — only when they claim.",
  },
  {
    q: "Where are my keys stored?",
    a: "Only in your browser's memory. No keys or secrets are ever sent to a server. If you close the tab before backing up the claim URI, the key is gone and the funds are unrecoverable.",
  },
  {
    q: "What if I lose the claim URI or someone else sees it?",
    a: "The claim URI is a bearer token — anyone who has it can claim the funds, and if you lose it there's no recovery. This app doesn't store anything server-side. Always back up the URI, and only share it over secure, end-to-end encrypted channels.",
  },
  {
    q: "How do I cancel my gift card?",
    a: "Yes, if the recipient hasn't claimed yet. You'd need the secret key (from the claim URI or backup) to sweep the funds back to your own wallet using a ZIP 324-compatible wallet.",
  },
  {
    q: "Is this running on mainnet or testnet?",
    a: "This is running on mainnet. Addresses use the mainnet Sapling prefix, keys use secret-spending-key-main, and claim URIs point to pay.withzcash.com.",
  },
];

export default function Faq() {
  return (
    <section className="faq">
      <h2 className="faq-title">FAQ</h2>
      <div className="faq-list">
        {entries.map(({ q, a }) => (
          <details key={q} className="faq-entry">
            <summary className="faq-question">{q}</summary>
            <p className="faq-answer">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
