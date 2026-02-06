import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
mkdirSync(dist, { recursive: true });

for (const file of ["renderer.html", "renderer.css"]) {
  copyFileSync(resolve(root, "src", file), resolve(dist, file));
}

console.log("Copied static renderer assets to dist/");
