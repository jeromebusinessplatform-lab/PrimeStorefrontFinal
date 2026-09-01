import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "dist");
const storefront = path.join(root, "apps", "storefront", "dist");
const admin = path.join(root, "apps", "admin", "dist");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

await cp(storefront, output, { recursive: true });
await mkdir(path.join(output, "admin"), { recursive: true });
await cp(admin, path.join(output, "admin"), { recursive: true });

console.log(`Prepared Workers Static Assets in ${path.relative(root, output)}`);
console.log("  storefront: /");
console.log("  admin:      /admin/");
