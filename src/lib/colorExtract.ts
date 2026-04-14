/**
 * Extract dominant colors from an image URL using canvas sampling.
 * Returns an array of hex color strings sorted by vibrancy.
 */
export async function extractColors(
  imageUrl: string,
  count = 3
): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 64; // downsample for speed
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve([]);
          return;
        }
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        // Bucket colors into clusters
        const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
        for (let i = 0; i < data.length; i += 16) {
          // quantize to reduce noise
          const r = Math.round(data[i] / 32) * 32;
          const g = Math.round(data[i + 1] / 32) * 32;
          const b = Math.round(data[i + 2] / 32) * 32;
          const key = `${r},${g},${b}`;
          const existing = buckets.get(key);
          if (existing) {
            existing.r += data[i];
            existing.g += data[i + 1];
            existing.b += data[i + 2];
            existing.count++;
          } else {
            buckets.set(key, { r: data[i], g: data[i + 1], b: data[i + 2], count: 1 });
          }
        }

        // Sort by vibrancy first, then count as tiebreaker — prioritize vivid colors
        const sorted = [...buckets.values()]
          .filter((c) => {
            const avg = (c.r / c.count + c.g / c.count + c.b / c.count) / 3;
            return avg > 40 && avg < 220;
          })
          .sort((a, b) => {
            const satA = vibrancy(a.r / a.count, a.g / a.count, a.b / a.count);
            const satB = vibrancy(b.r / b.count, b.g / b.count, b.b / b.count);
            // Weight vibrancy much more heavily than frequency
            return (satB * 5 + Math.log(b.count)) - (satA * 5 + Math.log(a.count));
          });

        const colors = sorted.slice(0, count).map((c) => {
          let r = Math.round(c.r / c.count);
          let g = Math.round(c.g / c.count);
          let b = Math.round(c.b / c.count);
          // Boost saturation for more vivid backgrounds
          [r, g, b] = boostSaturation(r, g, b, 1.4);
          return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        });

        resolve(colors.length >= 2 ? colors : []);
      } catch {
        resolve([]);
      }
    };
    img.onerror = () => resolve([]);
    img.src = imageUrl;
  });
}

function vibrancy(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

/** Boost saturation by converting to HSL, multiplying S, converting back */
function boostSaturation(r: number, g: number, b: number, factor: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  s = Math.min(1, s * factor);

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(Math.min(255, hue2rgb(p, q, h + 1 / 3) * 255)),
    Math.round(Math.min(255, hue2rgb(p, q, h) * 255)),
    Math.round(Math.min(255, hue2rgb(p, q, h - 1 / 3) * 255)),
  ];
}
