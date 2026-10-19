// Deteksi buram dengan Laplacian Variance.
// Makin kecil nilainya, makin buram (atau kamera terlalu dekat).
export const BLUR_MIN = 80;

// source bisa berupa <video>, <img>, <canvas>, atau ImageBitmap.
export const measureSharpness = (source) => {
  const srcW = source?.videoWidth || source?.naturalWidth || source?.width || 0;
  const srcH = source?.videoHeight || source?.naturalHeight || source?.height || 0;
  if (!srcW || !srcH) return { variance: 0, isBlurry: false, ready: false };

  // Perkecil gambar agar hitungan ringan di HP
  const w = 100;
  const h = Math.max(3, Math.round((srcH / srcW) * w));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(source, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;

  // 1. Abu-abu
  const gray = new Uint8Array(w * h);
  for (let i = 0; i < data.length; i += 4) {
    gray[i / 4] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  }

  // 2. Kernel Laplacian 3x3
  const lap = new Int16Array(w * h);
  let sum = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const val = gray[idx - w] + gray[idx - 1] + gray[idx + 1] + gray[idx + w] - 4 * gray[idx];
      lap[idx] = val;
      sum += val;
    }
  }

  // 3. Varians
  const mean = sum / (w * h);
  let variance = 0;
  for (let i = 0; i < lap.length; i++) variance += (lap[i] - mean) ** 2;
  variance = Math.round(variance / (w * h));

  return { variance, isBlurry: variance < BLUR_MIN, ready: true };
};

// Kata untuk pembaca layar dan tampilan (bukan hanya warna)
export const sharpnessLabel = (variance) => {
  if (variance < BLUR_MIN) return "Rendah";
  if (variance < BLUR_MIN * 2) return "Cukup";
  return "Bagus";
};
