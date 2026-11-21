import fs from "node:fs";
import path from "node:path";
import type { ImageManifestEntry, Vehicle } from "../src/lib/types";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const MANIFEST_PATH = path.join(ROOT, "src", "data", "image-manifest.json");
const VEHICLES_PATH = path.join(ROOT, "src", "data", "vehicles.json");

function main() {
  const errors: string[] = [];

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error("FAIL: Missing src/data/image-manifest.json");
    process.exit(1);
  }
  if (!fs.existsSync(VEHICLES_PATH)) {
    console.error("FAIL: Missing src/data/vehicles.json");
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8")) as ImageManifestEntry[];
  const vehicles = JSON.parse(fs.readFileSync(VEHICLES_PATH, "utf-8")) as Vehicle[];

  const manifestByFile = new Map<string, ImageManifestEntry>();

  for (const entry of manifest) {
    if (!entry.file || !entry.file.startsWith("/cars/")) {
      errors.push(`Manifest entry has invalid local path: ${entry.file}`);
      continue;
    }
    if (manifestByFile.has(entry.file)) {
      errors.push(`Duplicate manifest entry for ${entry.file}`);
    }
    manifestByFile.set(entry.file, entry);

    const diskPath = path.join(PUBLIC_DIR, entry.file.replace(/^\//, ""));
    if (!fs.existsSync(diskPath)) {
      errors.push(`Manifest file missing on disk: ${entry.file}`);
    }
    if (entry.verifiedBy !== "agent-visual" && entry.verifiedBy !== "owner") {
      errors.push(`Manifest entry missing valid verifiedBy: ${entry.file}`);
    }
    if (!entry.sourceUrl || !entry.license) {
      errors.push(`Manifest entry missing sourceUrl or license: ${entry.file}`);
    }
  }

  if (vehicles.length === 0) {
    errors.push("vehicles.json contains 0 vehicles.");
  }

  for (const vehicle of vehicles) {
    if (!vehicle.images || vehicle.images.length === 0) {
      errors.push(`Vehicle ${vehicle.id} (${vehicle.make} ${vehicle.model}) has no images.`);
      continue;
    }

    for (const imgPath of vehicle.images) {
      if (imgPath.startsWith("http://") || imgPath.startsWith("https://")) {
        errors.push(`Vehicle ${vehicle.id} references forbidden external URL: ${imgPath}`);
        continue;
      }

      const entry = manifestByFile.get(imgPath);
      if (!entry) {
        errors.push(`Vehicle ${vehicle.id} references unmanifested image: ${imgPath}`);
        continue;
      }

      if (entry.make !== vehicle.make || entry.model !== vehicle.model) {
        errors.push(
          `Mismatch on ${vehicle.id}: vehicle is "${vehicle.make} ${vehicle.model}" but manifest entry ${imgPath} is "${entry.make} ${entry.model}".`
        );
      }

      const diskPath = path.join(PUBLIC_DIR, imgPath.replace(/^\//, ""));
      if (!fs.existsSync(diskPath)) {
        errors.push(`Vehicle ${vehicle.id} image missing on disk: ${imgPath}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error(`\nImage validation FAILED with ${errors.length} error(s):`);
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log(
    `OK: Validated ${vehicles.length} vehicles against ${manifest.length} verified local manifest entries.`
  );
}

main();
