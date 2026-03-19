import ZcashLogo from "./ZcashLogo.jsx";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-brand">
        <ZcashLogo size={24} />
        <span>Zcash Gift Card</span>
      </div>
      <div className="footer-links">
        <a
          href="https://zips.z.cash/zip-0324"
          target="_blank"
          rel="noopener noreferrer"
        >
          ZIP 324 Spec
        </a>
        <a
          href="https://github.com/juleshenry/zip324wasm"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
