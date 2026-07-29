/**
 * Generates the PCF index.ts (the shell control) from a spec.
 *
 * The generated control:
 *   - Implements ComponentFramework.StandardControl<IInputs, IOutputs>
 *   - Renders a React root with all composed block components
 *   - For field controls: reads/writes the bound property
 *   - For dataset controls: reads dataset records and passes them to blocks
 */

import { ControlSpec, BlockInstance } from "../schema/types";
import { BlockDescriptor } from "./blockDescriptor";

interface BlockEntry {
    instance: BlockInstance;
    descriptor: BlockDescriptor | null;
}

/**
 * Emits the full index.ts source for the composed control.
 */
export function generateIndexTs(spec: ControlSpec, blocks: BlockEntry[]): string {
    const controlName = spec.name;
    const isField = spec.controlType === "field";
    const fieldProp = spec.field?.propertyName ?? "value";
    const layout = spec.layout ?? {};
    const direction = layout.direction ?? "vertical";
    const gap = layout.gap ?? "8px";
    const padding = layout.padding ?? "0";

    // Build import lines for each unique block
    const componentImports: string[] = [];
    const seen = new Set<string>();
    for (const { instance, descriptor } of blocks) {
        if (instance.blockType === "custom") {
            const cfg = instance.custom!;
            const importAlias = cfg.componentName;
            if (!seen.has(importAlias)) {
                seen.add(importAlias);
                componentImports.push(`import { ${importAlias} } from "${cfg.componentPath}";`);
            }
        } else if (descriptor) {
            const alias = descriptor.componentName;
            if (!seen.has(alias)) {
                seen.add(alias);
                // Path is relative from index.ts → components/<BlockType>/<BlockType>
                const relPath = `./components/${descriptor.blockType}/${descriptor.componentName}`;
                componentImports.push(`import { ${alias} } from "${relPath}";`);
            }
        }
    }

    // Build the render function body
    const renderLines: string[] = [];
    renderLines.push(`        const flexDir = "${direction === "horizontal" ? "row" : "column"}";`);
    renderLines.push(`        const container = React.createElement("div", {`);
    renderLines.push(`            style: {`);
    renderLines.push(`                display: "flex",`);
    renderLines.push(`                flexDirection: flexDir as React.CSSProperties["flexDirection"],`);
    renderLines.push(`                gap: "${gap}",`);
    renderLines.push(`                padding: "${padding}",`);
    renderLines.push(`                width: "100%",`);
    renderLines.push(`                boxSizing: "border-box" as React.CSSProperties["boxSizing"],`);
    renderLines.push(`                visibility: context.mode.isVisible ? "visible" : "hidden",`);
    renderLines.push(`            },`);
    renderLines.push(`        },`);

    // Children: one element per block
    for (const { instance, descriptor } of blocks) {
        const props = instance.props ?? {};
        const propEntries = Object.entries(props)
            .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
            .join(", ");

        let componentName: string;
        if (instance.blockType === "custom") {
            componentName = instance.custom!.componentName;
        } else {
            componentName = descriptor?.componentName ?? instance.blockType;
        }

        // For field blocks that use the bound value, wire it up
        const extraProps: string[] = [];
        if (isField && descriptor?.manifestFragments?.some((f) => f.usage === "bound")) {
            extraProps.push(`value: this._boundValue`);
            extraProps.push(`onChange: (v: unknown) => { this._boundValue = String(v ?? ""); this._notifyOutputChanged(); }`);
        }

        const allPropsStr = [propEntries, ...extraProps].filter(Boolean).join(", ");

        renderLines.push(
            `            React.createElement(${componentName}, { key: "${instance.id}"${allPropsStr ? ", " + allPropsStr : ""} }),`
        );
    }

    // Close the container createElement
    renderLines.push(`        );`);
    renderLines.push(`        return container;`);

    const source = `#!/usr/bin/env node
/* eslint-disable */
// ============================================================================
// AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY
// Source of truth: control.spec.json
// To regenerate: pcf-gen generate ./control.spec.json
//
// To make permanent changes that survive regeneration:
//   1. Edit control.spec.json and re-run the generator, OR
//   2. Add a 'custom' block entry pointing to your own component file.
// ============================================================================

import * as React from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
${componentImports.join("\n")}

export class ${controlName} implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container!: HTMLDivElement;
    private _notifyOutputChanged!: () => void;
    private _boundValue: string | null = null;
    private _reactRoot: { render: (element: React.ReactElement) => void; unmount: () => void } | null = null;

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this._container = container;
        this._notifyOutputChanged = notifyOutputChanged;
${isField ? `        this._boundValue = (context.parameters as Record<string, { raw: string | null }>)["${fieldProp}"]?.raw ?? null;` : ""}
        this._renderControl(context);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
${isField ? `        if (context.updatedProperties.includes("${fieldProp}")) {
            this._boundValue = (context.parameters as Record<string, { raw: string | null }>)["${fieldProp}"]?.raw ?? null;
        }` : ""}
        this._renderControl(context);
    }

    public getOutputs(): IOutputs {
        return {
${isField ? `            ${fieldProp}: this._boundValue ?? undefined,` : ""}
        };
    }

    public destroy(): void {
        if (this._reactRoot) {
            this._reactRoot.unmount();
            this._reactRoot = null;
        }
    }

    private _renderControl(context: ComponentFramework.Context<IInputs>): void {
        // Lazy-initialise a minimal React root (works with both React 16 and React 18)
        if (!this._reactRoot) {
            const el = document.createElement("div");
            el.className = "${controlName.toLowerCase()}-root";
            this._container.appendChild(el);

            // Try React 18 createRoot; fall back to ReactDOM.render for earlier versions
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const ReactDOM = require("react-dom/client");
                this._reactRoot = ReactDOM.createRoot(el);
            } catch {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const ReactDOM = require("react-dom");
                this._reactRoot = {
                    render: (element: React.ReactElement) => ReactDOM.render(element, el),
                    unmount: () => ReactDOM.unmountComponentAtNode(el),
                };
            }
        }

        const element = this._buildElement(context);
        this._reactRoot.render(element);
    }

    private _buildElement(context: ComponentFramework.Context<IInputs>): React.ReactElement {
${renderLines.join("\n")}
    }
}
`;

    return source;
}
