/*
 * Generates the PWA icons from the keycap mark (DESIGN.md signature element #1).
 * Run once after changing the mark:  node scripts/make-icons.mjs
 * Colors are inlined because these render outside the app's CSS variables.
 */
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const INK = "#20261E";
const RED = "#9E2B25";
const PAPER = "#F6F6F1";
const CARD = "#FFFFFF";

// The keycap fills the frame — used for regular icons.
const keycap = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  ${pad ? `<rect width="64" height="64" fill="${PAPER}"/>` : ""}
  <g transform="${pad ? "translate(12.8 12.8) scale(0.6)" : ""}">
    <rect x="5" y="5" width="54" height="54" rx="13" fill="${CARD}" stroke="${INK}" stroke-width="4"/>
    <circle cx="32" cy="32" r="11" fill="${RED}"/>
  </g>
</svg>`;

await mkdir(new URL("../public/icons/", import.meta.url), { recursive: true });

const out = (name) => fileURLToPath(new URL(`../public/icons/${name}`, import.meta.url));

await sharp(Buffer.from(keycap(false))).resize(192, 192).png().toFile(out("icon-192.png"));
await sharp(Buffer.from(keycap(false))).resize(512, 512).png().toFile(out("icon-512.png"));
// Maskable: safe-zone padding on the paper ground so launchers can crop any shape.
await sharp(Buffer.from(keycap(true))).resize(512, 512).png().toFile(out("maskable-512.png"));

console.log("icons written to public/icons/");
