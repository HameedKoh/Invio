// Turns an uploaded image into a small data URL so the logo can live
// directly inside the Firestore brand document (no Firebase Storage needed).
// Firestore docs max out at 1 MB and every invoice embeds a brand snapshot,
// so we keep the logo tiny.

const MAX_SIDE = 200;
const MAX_CHARS = 120_000; // ~90 KB of image data

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read image")); };
    img.src = url;
  });

export const fileToLogoDataUrl = async (file: File): Promise<string> => {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(img, 0, 0, w, h);

  // PNG keeps transparency. If it is too heavy, fall back to JPEG on white.
  let out = canvas.toDataURL("image/png");
  if (out.length > MAX_CHARS) {
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    out = canvas.toDataURL("image/jpeg", 0.8);
  }
  if (out.length > MAX_CHARS) throw new Error("Logo is too detailed. Try a simpler image.");
  return out;
};
