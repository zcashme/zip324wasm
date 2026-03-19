import QRCode from "qrcode";

export async function renderQr(container, text) {
  container.replaceChildren();

  const canvas = document.createElement("canvas");
  canvas.className = "qr-canvas";

  await QRCode.toCanvas(canvas, text, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240,
    color: {
      dark: "#102217",
      light: "#f6f1dd",
    },
  });

  container.append(canvas);
}
