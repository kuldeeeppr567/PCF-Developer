#!/usr/bin/env node
/**
 * pcf-gen — CLI entry point
 *
 * Usage:
 *   pcf-gen generate <specFile> [--output <dir>] [--force] [--verbose]
 *   pcf-gen list-blocks
 *   pcf-gen validate <specFile>
 */

import { Command } from "commander";
import * as path from "path";
import * as fs from "fs-extra";
import { generate } from "./generator/generator";
import { validateSpec } from "./validator";
import { getAllBlocks } from "./generator/blockRegistry";

const program = new Command();

program
    .name("pcf-gen")
    .description("Generate a buildable PCF project from a control.spec.json file.")
    .version("1.0.0");

// ---------------------------------------------------------------------------
// generate command
// ---------------------------------------------------------------------------
program
    .command("generate <specFile>")
    .description(
        "Generate a PCF project from a spec file.\n" +
        "Output is written to controls/<ControlName>/ by default."
    )
    .option("-o, --output <dir>", "Output root directory (defaults to <repoRoot>/controls)")
    .option("-f, --force", "Overwrite an existing control folder (WARNING: overwrites auto-generated files)")
    .option("-v, --verbose", "Emit verbose output")
    .action(async (specFile: string, opts: { output?: string; force?: boolean; verbose?: boolean }) => {
        // Resolve the spec file path
        const specPath = path.resolve(process.cwd(), specFile);

        if (!(await fs.pathExists(specPath))) {
            console.error(`Error: spec file not found: ${specPath}`);
            process.exit(1);
        }

        let specJson: unknown;
        try {
            specJson = await fs.readJson(specPath);
        } catch (err) {
            console.error(`Error: failed to parse spec file as JSON: ${(err as Error).message}`);
            process.exit(1);
        }

        // Determine output root (default: <repo root>/controls)
        const outputRoot = opts.output
            ? path.resolve(process.cwd(), opts.output)
            : path.resolve(__dirname, "..", "..", "..", "controls");

        // Determine blocks root (templates/blocks/)
        const blocksRoot = path.resolve(__dirname, "..", "..", "..", "templates", "blocks");

        const result = await generate(specJson, {
            outputRoot,
            blocksRoot,
            force: opts.force ?? false,
            verbose: opts.verbose ?? false,
        });

        if (result.warnings.length > 0) {
            console.warn("\nWarnings:");
            result.warnings.forEach((w) => console.warn(`  ⚠  ${w}`));
        }

        if (!result.success) {
            console.error("\nGeneration failed:");
            result.errors.forEach((e) => console.error(`  ✗  ${e}`));
            process.exit(1);
        }

        console.log(`\n✓ Generated ${result.writtenFiles.length} files → ${result.outputDir}`);
        if (opts.verbose) {
            result.writtenFiles.forEach((f) => console.log(`  ${f}`));
        }
        console.log("\nNext steps:");
        console.log(`  cd ${result.outputDir}/<ControlName>`);
        console.log("  npm install");
        console.log("  npm run build");
    });

// ---------------------------------------------------------------------------
// validate command
// ---------------------------------------------------------------------------
program
    .command("validate <specFile>")
    .description("Validate a control.spec.json without generating any files.")
    .action(async (specFile: string) => {
        const specPath = path.resolve(process.cwd(), specFile);

        if (!(await fs.pathExists(specPath))) {
            console.error(`Error: file not found: ${specPath}`);
            process.exit(1);
        }

        let specJson: unknown;
        try {
            specJson = await fs.readJson(specPath);
        } catch (err) {
            console.error(`Error: invalid JSON — ${(err as Error).message}`);
            process.exit(1);
        }

        const result = validateSpec(specJson);

        if (result.valid) {
            console.log("✓ Spec is valid.");
        } else {
            console.error("✗ Spec validation failed:");
            result.errors.forEach((e) => console.error(`  • ${e}`));
            process.exit(1);
        }
    });

// ---------------------------------------------------------------------------
// list-blocks command
// ---------------------------------------------------------------------------
program
    .command("list-blocks")
    .description("List all available blocks in the block library.")
    .action(() => {
        const blocks = getAllBlocks();
        console.log(`\nAvailable blocks (${blocks.length}):\n`);

        const byCategory: Record<string, typeof blocks> = {};
        for (const b of blocks) {
            (byCategory[b.category] ??= []).push(b);
        }

        for (const [cat, catBlocks] of Object.entries(byCategory)) {
            console.log(`  ${cat.toUpperCase()}`);
            for (const b of catBlocks) {
                console.log(`    ${b.blockType.padEnd(16)} — ${b.description}`);
            }
        }
        console.log("");
    });

program.parse(process.argv);
