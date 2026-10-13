import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

const MAX_DIMENSION = 2048;
const UPSCALE_FACTOR = 1.5;

function createSharpenedPreview(image) {
  if (
    image.naturalWidth > MAX_DIMENSION ||
    image.naturalHeight > MAX_DIMENSION
  ) {
    return null;
  }

  const scale = Math.min(
    UPSCALE_FACTOR,
    MAX_DIMENSION / image.naturalWidth,
    MAX_DIMENSION / image.naturalHeight
  );
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);

  const pixels = context.getImageData(0, 0, width, height);
  const source = pixels.data;
  const sharpened = new Uint8ClampedArray(source);

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const center = (y * width + x) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        let neighbors = 0;
        for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
          for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
            if (offsetX || offsetY) {
              neighbors +=
                source[((y + offsetY) * width + x + offsetX) * 4 + channel];
            }
          }
        }
        sharpened[center + channel] = Math.max(
          0,
          Math.min(
            255,
            source[center + channel] * 1.35 - (neighbors / 8) * 0.35
          )
        );
      }
    }
  }

  pixels.data.set(sharpened);
  context.putImageData(pixels, 0, 0);
  return canvas.toDataURL("image/webp", 0.92);
}

const EnhancedImage = ({ src, alt, className }) => {
  const [enhancedSrc, setEnhancedSrc] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setEnhancedSrc(null);
    setHasError(false);

    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const preview = createSharpenedPreview(image);
        if (!cancelled) setEnhancedSrc(preview);
      } catch (error) {
        console.warn("Could not enhance image preview:", error);
      }
    };
    image.onerror = () => {
      if (!cancelled) setEnhancedSrc(null);
    };
    image.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (hasError) {
    return (
      <span className="flex size-40 flex-col items-center justify-center gap-2 rounded-xl bg-muted text-xs text-muted-foreground">
        <ImageOff className="size-5" />
        Image unavailable
      </span>
    );
  }

  return (
    <a href={src} target="_blank" rel="noreferrer" aria-label={`Open original ${alt}`}>
      <img
        src={enhancedSrc || src}
        alt={alt}
        className={className}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </a>
  );
};

export default EnhancedImage;
