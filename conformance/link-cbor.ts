/**
 * Development only: point node_modules/@harmoniclabs/cbor at a local cbor
 * checkout (default: the sibling `cbor-conformance` worktree, built with
 * `npm run build`) so tests run against the cbor fixes (items 570/572/583/
 * 584) before they are published. package.json is left untouched; run
 * `bun install --force` to go back to the registry copy.
 *
 *   bun conformance/link-cbor.ts [path-to-cbor-checkout]
 */
import { existsSync, lstatSync, renameSync, rmSync, symlinkSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const target = resolve(process.argv[2] ?? join(root, "..", "cbor-conformance"));
if (!existsSync(join(target, "dist", "index.js"))) {
    throw new Error(`${target}/dist/index.js missing: run \`npm run build\` in ${target} first`);
}
const link = join(root, "node_modules", "@harmoniclabs", "cbor");
if (existsSync(link) || (() => { try { return lstatSync(link).isSymbolicLink(); } catch { return false; } })()) {
    if (lstatSync(link).isSymbolicLink()) rmSync(link);
    else {
        const backup = link + ".registry";
        rmSync(backup, { recursive: true, force: true });
        renameSync(link, backup);
    }
}
symlinkSync(target, link, "dir");
const v = JSON.parse(readFileSync(join(link, "package.json"), "utf8")).version;
console.log(`@harmoniclabs/cbor -> ${target} (${v})`);
