import { useRef, useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QrCode({ text }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!canvasRef.current || !text) return;

    setError("");
    QRCode.toCanvas(canvasRef.current, text, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 240,
      color: { dark: "#141529", light: "#f7f7f7" },
    }).catch(() => setError("QR rendering failed in this browser."));
  }, [text]);

  if (error) {
    return (
      <div className="qr-shell">
        <p className="field-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="qr-shell">
      <canvas ref={canvasRef} className="qr-canvas" />
    </div>
  );
}
