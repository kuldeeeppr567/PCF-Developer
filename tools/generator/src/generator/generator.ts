/**
 * Main generator — orchestrates all generation steps:
 *   1. Validate the spec
 *   2. Resolve block descriptors
 *   3. Collect + merge manifest fragments
 *   4. Generate all project files
 *   5. Write to output directory
 */

import * as path from "path";
import * as fs from "fs-extra";
import { ControlSpec, ManifestProperty } from "../schema/types";
import { validateSpec } from "../validator";
import { getBlock, isKnownBlock } from "./blockRegistry";
import { mergeManifestFragments, buildManifestXml } from "./manifest";
import { generateIndexTs } from "./indexTs";
import { generatePackageJson, generateTsconfig, generateAggregatedCss } from "./projectFiles";
import { BlockDescriptor } from "./blockDescriptor";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GeneratorOptions {
    /** Absolute path to the controls/ output root. */
    outputRoot: string;
    /** Path to the templates/blocks/ folder (source of block CSS/TSX). */
    blocksRoot: string;
    /** If true, overwrite an existing control folder. */
    force: boolean;
    /** If true, emit verbose output. */
    verbose: boolean;
}

export interface GeneratorResult {
    success: boolean;
    outputDir: string;
    errors: string[];
    warnings: string[];
    writtenFiles: string[];
}

// ---------------------------------------------------------------------------
// Helper: log only in verbose mode
// ---------------------------------------------------------------------------
let _verbose = false;
function log(msg: string): void {
    if (_verbose) console.log(`  ${msg}`);
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Generates a complete PCF project from a spec.
 *
 * @param specInput  - Parsed spec object (or raw JSON to validate)
 * @param options    - Generator options
 */
export async function generate(specInput: unknown, options: GeneratorOptions): Promise<GeneratorResult> {
    _verbose = options.verbose;

    const errors: string[] = [];
    const warnings: string[] = [];
    const writtenFiles: string[] = [];

    // -----------------------------------------------------------------------
    // Step 1: Validate spec
    // -----------------------------------------------------------------------
    const validation = validateSpec(specInput);
    if (!validation.valid) {
        return {
            success: false,
            outputDir: "",
            errors: [
                "Spec validation failed. Fix the following errors in control.spec.json:",
                ...validation.errors.map((e) => `  • ${e}`),
            ],
            warnings: [],
            writtenFiles: [],
        };
    }

    const spec = specInput as ControlSpec;
    const controlName = spec.name;
    const outputDir = path.join(options.outputRoot, controlName);

    // -----------------------------------------------------------------------
    // Step 2: Check for existing output directory
    // -----------------------------------------------------------------------
    if (await fs.pathExists(outputDir)) {
        if (!options.force) {
            return {
                success: false,
                outputDir,
                errors: [
                    `Output directory already exists: ${outputDir}`,
                    `Use --force to overwrite (WARNING: this will overwrite auto-generated files).`,
                    `Hand-edited custom component files (blockType: "custom") are NOT overwritten.`,
                ],
                warnings: [],
                writtenFiles: [],
            };
        }
        log(`--force: overwriting existing directory ${outputDir}`);
    }

    // -----------------------------------------------------------------------
    // Step 3: Resolve block descriptors + collect manifest fragments
    // -----------------------------------------------------------------------
    const blockEntries: Array<{ instance: typeof spec.blocks[0]; descriptor: BlockDescriptor | null }> = [];
    const allFragments: ManifestProperty[] = [];

    for (const block of spec.blocks) {
        if (block.blockType === "custom") {
            blockEntries.push({ instance: block, descriptor: null });
            // Custom block may declare its own fragments
            if (block.custom?.manifestFragments) {
                allFragments.push(...block.custom.manifestFragments);
            }
            continue;
        }

        if (!isKnownBlock(block.blockType)) {
            errors.push(
                `Unknown blockType: "${block.blockType}" (instance id: "${block.id}"). ` +
                `Known types: Label, TextInput, Rating, Toggle, Slider, DatePicker, Card, DataGrid, Button, NumberInput, custom.`
            );
            continue;
        }

        const descriptor = getBlock(block.blockType)!;
        blockEntries.push({ instance: block, descriptor });
        allFragments.push(...descriptor.manifestFragments);
    }

    if (errors.length > 0) {
        return { success: false, outputDir, errors, warnings, writtenFiles };
    }

    // -----------------------------------------------------------------------
    // Step 4: Merge manifest fragments
    // -----------------------------------------------------------------------
    const mergeResult = mergeManifestFragments(allFragments);
    warnings.push(...mergeResult.warnings);

    if (mergeResult.errors.length > 0) {
        return {
            success: false,
            outputDir,
            errors: [
                "Manifest fragment merge failed:",
                ...mergeResult.errors.map((e) => `  • ${e}`),
            ],
            warnings,
            writtenFiles,
        };
    }

    // -----------------------------------------------------------------------
    // Step 5: Build CSS map (read block CSS files from blocksRoot)
    // -----------------------------------------------------------------------
    const blockCssMap = new Map<string, string>();
    const usedDescriptors: BlockDescriptor[] = [];

    for (const { descriptor } of blockEntries) {
        if (!descriptor) continue;
        if (blockCssMap.has(descriptor.blockType)) continue;

        usedDescriptors.push(descriptor);
        const cssPath = path.join(options.blocksRoot, descriptor.cssFile);
        if (await fs.pathExists(cssPath)) {
            blockCssMap.set(descriptor.blockType, await fs.readFile(cssPath, "utf-8"));
        } else {
            warnings.push(`CSS file not found for block "${descriptor.blockType}": ${cssPath}`);
            blockCssMap.set(descriptor.blockType, `/* CSS for ${descriptor.blockType} not found */`);
        }
    }

    // -----------------------------------------------------------------------
    // Step 6: Generate file contents
    // -----------------------------------------------------------------------
    const manifestXml = buildManifestXml(spec, mergeResult.properties);
    const indexTs = generateIndexTs(spec, blockEntries);
    const packageJson = generatePackageJson(spec);
    const tsconfigJson = generateTsconfig();
    const cssContent = generateAggregatedCss(spec, usedDescriptors, blockCssMap);

    // -----------------------------------------------------------------------
    // Step 7: Write files
    // -----------------------------------------------------------------------
    await fs.ensureDir(outputDir);
    await fs.ensureDir(path.join(outputDir, "css"));
    await fs.ensureDir(path.join(outputDir, "components"));

    const filesToWrite: Array<[string, string]> = [
        [path.join(outputDir, `${controlName}`, "ControlManifest.Input.xml"), manifestXml],
        [path.join(outputDir, `${controlName}`, "index.ts"), indexTs],
        [path.join(outputDir, `${controlName}`, "package.json"), packageJson],
        [path.join(outputDir, `${controlName}`, "tsconfig.json"), tsconfigJson],
        [path.join(outputDir, `${controlName}`, "css", `${controlName}.css`), cssContent],
        // Sidecar spec for round-tripping
        [path.join(outputDir, `${controlName}`, "control.spec.json"), JSON.stringify(spec, null, 2)],
    ];

    for (const [filePath, content] of filesToWrite) {
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, content, "utf-8");
        writtenFiles.push(filePath);
        log(`wrote: ${path.relative(options.outputRoot, filePath)}`);
    }

    // Copy block component source files into components/<BlockType>/
    for (const { descriptor } of blockEntries) {
        if (!descriptor) continue;

        const srcTsx = path.join(options.blocksRoot, descriptor.componentFile);
        const dstTsx = path.join(
            outputDir,
            `${controlName}`,
            "components",
            descriptor.blockType,
            `${descriptor.componentName}.tsx`
        );

        if (await fs.pathExists(srcTsx)) {
            await fs.ensureDir(path.dirname(dstTsx));
            // Only copy if not already present (prevents overwriting hand-edits)
            if (!options.force && (await fs.pathExists(dstTsx))) {
                warnings.push(`Skipping existing component file (use --force to overwrite): ${dstTsx}`);
            } else {
                await fs.copy(srcTsx, dstTsx);
                writtenFiles.push(dstTsx);
                log(`copied: ${descriptor.componentName}.tsx`);
            }
        } else {
            warnings.push(`Source TSX not found for block "${descriptor.blockType}": ${srcTsx}`);
        }
    }

    // -----------------------------------------------------------------------
    // Step 8: Write README for the generated control
    // -----------------------------------------------------------------------
    const readmeContent = buildGeneratedReadme(spec, writtenFiles.length);
    await fs.writeFile(path.join(outputDir, "README.md"), readmeContent, "utf-8");
    writtenFiles.push(path.join(outputDir, "README.md"));

    return { success: true, outputDir, errors: [], warnings, writtenFiles };
}

// ---------------------------------------------------------------------------
// Helper: per-control README
// ---------------------------------------------------------------------------

function buildGeneratedReadme(spec: ControlSpec, fileCount: number): string {
    return `# ${spec.name}

> Auto-generated PCF control — do not edit generated files directly.
> Source of truth: \`control.spec.json\`

## Description

${spec.description ?? ""}

## Control Type

${spec.controlType === "field" ? `**Field** — binds to a \`${spec.field?.ofType}\` attribute (\`${spec.field?.propertyName}\`)` : `**Dataset** — binds to a dataset view (\`${spec.dataset?.name}\`)`}

${spec.targetTable ? `**Target Table (documentation only):** \`${spec.targetTable}\`\n\n> Note: PCF does not bind to a specific table at the manifest level. This is metadata only.\n` : ""}

## Working with this control

\`\`\`bash
cd ${spec.name}
npm install
npm run build
npm start watch   # open the test harness
\`\`\`

## Regenerating

To regenerate after editing \`control.spec.json\`:

\`\`\`bash
# From the repo root
node tools/generator/dist/index.js generate ./${spec.name}/control.spec.json --force
\`\`\`

> Using \`--force\` will overwrite all auto-generated files.
> Custom block component files are **not** overwritten unless you use \`--force\`.

## Blocks used

${spec.blocks.map((b) => `- **${b.id}** (\`${b.blockType}\`)`).join("\n")}

---
*Generated by pcf-gen. ${fileCount} files written.*
`;
}
