/**
 * Post-install script for PCF workspace.
 * Creates directory junctions from each control's node_modules to the root node_modules.
 * This is required because PCF tooling (pcf-scripts, pcf-start) expects node_modules
 * to exist locally in the control folder, but npm workspaces hoists everything to the root.
 * 
 * A junction (mklink /J on Windows) is a zero-cost pointer — no disk duplication.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const controlsDir = path.join(__dirname, "..", "controls");
const rootNodeModules = path.join(__dirname, "..", "node_modules");

// Ensure controls directory exists
if (!fs.existsSync(controlsDir)) {
    fs.mkdirSync(controlsDir, { recursive: true });
    process.exit(0);
}

// Get all control directories (skip files like README.md)
const entries = fs.readdirSync(controlsDir, { withFileTypes: true });
const controlDirs = entries.filter(e => e.isDirectory());

if (controlDirs.length === 0) {
    console.log("No controls found in controls/ — skipping junction creation.");
    process.exit(0);
}

let created = 0;
let skipped = 0;

for (const dir of controlDirs) {
    const controlPath = path.join(controlsDir, dir.name);
    const targetNM = path.join(controlPath, "node_modules");

    // Skip if node_modules already exists (junction or real folder)
    if (fs.existsSync(targetNM)) {
        skipped++;
        continue;
    }

    // Create junction (works on Windows without admin privileges)
    const relativePath = path.relative(controlPath, rootNodeModules);
    
    if (process.platform === "win32") {
        // Use absolute path for junction target on Windows
        execSync(`cmd /c mklink /J "node_modules" "${rootNodeModules}"`, {
            cwd: controlPath,
            stdio: "pipe"
        });
    } else {
        // On macOS/Linux, use a symlink
        fs.symlinkSync(relativePath, targetNM, "dir");
    }
    
    created++;
    console.log(`  ✔ Linked: controls/${dir.name}/node_modules → root`);
}

if (created > 0 || skipped > 0) {
    console.log(`\nJunctions: ${created} created, ${skipped} already existed.`);
}
