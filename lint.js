#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

// Try v2 first; fall back to top-level in case package layout changes
const lang = (() => {
    try { return require("@usebruno/lang/v2"); } catch { return require("@usebruno/lang"); }
})();
const { bruToJsonV2 } = lang;

function walk(dir, fileList = []) {
    for (const file of fs.readdirSync(dir)) {
        if (file === "environments") continue;
        const fp = path.join(dir, file);
        const stat = fs.statSync(fp);
        if (stat.isDirectory()) walk(fp, fileList);
        else if (file.endsWith(".bru")) fileList.push(fp);
    }
    return fileList;
}

let hasErrors = false;
const bruFiles = walk("./Bruno"); // adjust to your workspace root

for (const file of bruFiles) {
    const content = fs.readFileSync(file, "utf-8");
    try {
        // Parse will throw on syntax errors
        bruToJsonV2(content);
        console.log(`✔ OK: ${file}`);
    } catch (err) {
        hasErrors = true;
        console.error(`✖ ERROR in ${file}: ${err?.message || err}`);
    }
}

if (hasErrors) process.exit(1);