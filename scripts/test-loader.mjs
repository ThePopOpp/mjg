// Lets `node --experimental-strip-types` run tests against app modules that use
// the bundler-style imports the rest of the code relies on: extensionless
// relative paths ("./merge") and the "@/" alias. Without it, a test can only
// import files that import nothing.
//
// Usage: node --experimental-strip-types --import ./scripts/test-loader.mjs path/to/x.test.mjs

import { register } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const hooks = `
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
const root = ${JSON.stringify(root)};
const CANDIDATES = ["", ".ts", ".tsx", "/index.ts"];
export async function resolve(specifier, context, next) {
  let base = null;
  if (specifier.startsWith("@/")) base = path.join(root, specifier.slice(2));
  else if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
    base = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
  }
  if (base) {
    for (const suffix of CANDIDATES) {
      const file = base + suffix;
      if (existsSync(file) && !file.endsWith(path.sep)) {
        try { return await next(pathToFileURL(file).href, context); } catch {}
      }
    }
  }
  try {
    return await next(specifier, context);
  } catch (error) {
    // Bare subpath imports such as "next/server" resolve in the bundler but
    // need the file extension under plain Node ESM.
    if (error?.code === "ERR_MODULE_NOT_FOUND" && /^[@a-z][^:]*\\/[^.]+$/i.test(specifier)) {
      return next(specifier + ".js", context);
    }
    throw error;
  }
}
`;

register(`data:text/javascript,${encodeURIComponent(hooks)}`, pathToFileURL("./"));
