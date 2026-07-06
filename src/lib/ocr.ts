import type { Worker } from "tesseract.js";
import { cacheOcrText, loadOcrCache } from "./store";

/**
 * Lazy, cached OCR. Tesseract.js is dynamically imported so it never weighs down the
 * initial bundle; its wasm + language data (~2 MB) download only when a row actually
 * needs text extraction. Results are cached per screenshot id in localStorage.
 * Callers run requests sequentially — one shared worker keeps memory bounded.
 */

let workerPromise: Promise<Worker> | null = null;

function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    // Reset on failure so a one-off network/init error doesn't poison OCR for the session.
    workerPromise = import("tesseract.js")
      .then((m) => m.createWorker("eng"))
      .catch((e) => {
        workerPromise = null;
        throw e;
      });
  }
  return workerPromise;
}

export function getCachedText(id: string): string | undefined {
  const cache = loadOcrCache();
  return Object.hasOwn(cache, id) ? cache[id] : undefined;
}

export async function extractText(id: string, imageUrl: string): Promise<string> {
  const cached = getCachedText(id);
  if (cached !== undefined) return cached;

  const worker = await getWorker();
  const result = await Promise.race([
    worker.recognize(imageUrl),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("OCR timed out for this image.")), 25_000),
    ),
  ]);

  const text = result.data.text.trim();
  cacheOcrText(id, text);
  return text;
}
