/**
 * Generates boilerplate project files for the composed PCF control:
 *   - package.json
 *   - tsconfig.json
 *   - css/<ControlName>.css  (aggregated block CSS)
 */

import { ControlSpec } from "../schema/types";
import { BlockDescriptor } from "./blockDescriptor";

export interface ProjectFiles {
    packageJson: string;
    tsconfigJson: string;
    cssContent: string;
}

/** Generates package.json for the PCF project. */
export function generatePackageJson(spec: ControlSpec): string {
    const pkg = {
        name: spec.name.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        version: spec.version,
        description: spec.description ?? `${spec.name} PCF control`,
        private: true,
        scripts: {
            build: "pcf-scripts build",
            clean: "pcf-scripts clean",
            rebuild: "pcf-scripts rebuild",
            start: "pcf-scripts start",
        },
        dependencies: {
            "@types/powerapps-component-framework": "1.3.4",
        },
        devDependencies: {
            "@microsoft/eslint-plugin-power-apps": "0.2.22",
            "eslint": "^7.32.0",
            "pcf-scripts": "^1",
            "pcf-start": "^1",
            "typescript": "~4.5.5",
        },
    };
    return JSON.stringify(pkg, null, 2);
}

/** Generates tsconfig.json for the PCF project. */
export function generateTsconfig(): string {
    const tsconfig = {
        extends: "./node_modules/pcf-scripts/tsconfig_base.json",
        compilerOptions: {
            typeRoots: ["node_modules/@types"],
            jsx: "react",
        },
    };
    return JSON.stringify(tsconfig, null, 2);
}

/**
 * Generates the aggregated CSS file, prepending each block's CSS
 * under a comment heading.  Block CSS files are read from the
 * templates/blocks/ folder at generation time.
 */
export function generateAggregatedCss(
    spec: ControlSpec,
    usedDescriptors: BlockDescriptor[],
    blockCssMap: Map<string, string>
): string {
    const lines: string[] = [
        `/* ============================================================`,
        ` * AUTO-GENERATED CSS for ${spec.name}`,
        ` * To add custom styles, append them below the auto-generated section.`,
        ` * ============================================================ */`,
        ``,
        `.${spec.name.toLowerCase()}-root {`,
        `    width: 100%;`,
        `    height: 100%;`,
        `    box-sizing: border-box;`,
        `    font-family: "Segoe UI", system-ui, -apple-system, sans-serif;`,
        `}`,
        ``,
    ];

    const seenBlockTypes = new Set<string>();
    for (const desc of usedDescriptors) {
        if (seenBlockTypes.has(desc.blockType)) continue;
        seenBlockTypes.add(desc.blockType);

        const css = blockCssMap.get(desc.blockType);
        if (css) {
            lines.push(`/* --- ${desc.displayName} block --- */`);
            lines.push(css.trim());
            lines.push(``);
        }
    }

    lines.push(`/* --- Custom styles (preserved on regeneration if placed below here) --- */`);

    return lines.join("\n");
}
