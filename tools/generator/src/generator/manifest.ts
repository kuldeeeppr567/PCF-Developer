/**
 * Manifest merger
 *
 * Takes a resolved list of ManifestProperty fragments collected from all block
 * descriptors in a spec and produces:
 *   - A merged, deduplicated, validated list of properties.
 *   - The final XML string for ControlManifest.Input.xml.
 *
 * Conflict rules (in order of severity):
 *   1. Same name, different ofType  → ERROR (hard conflict).
 *   2. Same name, different usage   → ERROR (hard conflict).
 *   3. Same name, same ofType + usage, different required →
 *      WARN and keep the more-permissive value (required:false wins).
 *   4. Exact duplicate (same name + ofType + usage + required) → silently deduplicate.
 */

import { ControlSpec, ManifestProperty } from "../schema/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MergeResult {
    properties: ManifestProperty[];
    warnings: string[];
    errors: string[];
}

// ---------------------------------------------------------------------------
// Core merge function
// ---------------------------------------------------------------------------

/**
 * Merges an array of ManifestProperty fragments into a single, validated list.
 * Does NOT mutate the input array.
 */
export function mergeManifestFragments(fragments: ManifestProperty[]): MergeResult {
    const seen = new Map<string, ManifestProperty>();
    const warnings: string[] = [];
    const errors: string[] = [];

    for (const fragment of fragments) {
        const key = fragment.name;

        if (!seen.has(key)) {
            seen.set(key, { ...fragment });
            continue;
        }

        const existing = seen.get(key)!;

        // Hard conflict: different ofType
        if (existing.ofType !== fragment.ofType) {
            errors.push(
                `Property name conflict: "${key}" is declared with ofType="${existing.ofType}" ` +
                `by one block and ofType="${fragment.ofType}" by another. ` +
                `Rename one of the properties to resolve this conflict.`
            );
            continue;
        }

        // Hard conflict: different usage
        if (existing.usage !== fragment.usage) {
            errors.push(
                `Property name conflict: "${key}" is declared with usage="${existing.usage}" ` +
                `by one block and usage="${fragment.usage}" by another. ` +
                `A property cannot be both 'bound' and 'input'. Rename one to resolve.`
            );
            continue;
        }

        // Soft conflict: same name + type + usage, but different required flag
        const existingRequired = existing.required ?? false;
        const fragmentRequired = fragment.required ?? false;
        if (existingRequired !== fragmentRequired) {
            warnings.push(
                `Property "${key}" has conflicting 'required' values (${existingRequired} vs ${fragmentRequired}). ` +
                `Using required=false (more permissive).`
            );
            seen.set(key, { ...existing, required: false });
            continue;
        }

        // Exact duplicate — silently skip
    }

    return {
        properties: Array.from(seen.values()),
        warnings,
        errors,
    };
}

// ---------------------------------------------------------------------------
// XML builder
// ---------------------------------------------------------------------------

/** Escapes a string for safe embedding in XML attribute values. */
function escapeXmlAttr(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/** Renders a single <property> element with correct indentation. */
function renderProperty(p: ManifestProperty, indent = "    "): string {
    const displayName = escapeXmlAttr(p.displayName ?? p.name);
    const description = escapeXmlAttr(p.description ?? `${p.name} property`);
    const required = p.required ?? false;
    const requiredAttr = required ? " required=\"true\"" : " required=\"false\"";
    const defaultAttr = p.defaultValue !== undefined ? ` default-value="${escapeXmlAttr(p.defaultValue)}"` : "";

    return (
        `${indent}<property name="${escapeXmlAttr(p.name)}" display-name-key="${displayName}"\n` +
        `${indent}          description-key="${description}"\n` +
        `${indent}          of-type="${escapeXmlAttr(p.ofType)}" usage="${p.usage}"` +
        `${requiredAttr}${defaultAttr} />`
    );
}

/** Renders a <property-set> element inside a <data-set>. */
function renderPropertySet(col: { name: string; displayName?: string; ofType: string }, indent = "      "): string {
    const displayName = escapeXmlAttr(col.displayName ?? col.name);
    return (
        `${indent}<property-set name="${escapeXmlAttr(col.name)}" display-name-key="${displayName}" ` +
        `of-type="${escapeXmlAttr(col.ofType)}" />`
    );
}

/**
 * Builds the full ControlManifest.Input.xml string from a validated spec
 * and a merged property list.
 */
export function buildManifestXml(spec: ControlSpec, mergedProperties: ManifestProperty[]): string {
    const controlType = spec.controlType === "field" ? "standard" : "standard";
    const version = spec.version ?? "0.0.1";
    const description = spec.description ?? `${spec.name} PCF control`;
    const controlName = spec.name;
    const namespace = spec.namespace;
    const cssFileName = `${controlName}.css`;

    const lines: string[] = [];

    lines.push(`<?xml version="1.0" encoding="utf-8" ?>`);
    lines.push(`<manifest>`);
    lines.push(
        `  <control namespace="${escapeXmlAttr(namespace)}" constructor="${escapeXmlAttr(controlName)}" ` +
        `version="${escapeXmlAttr(version)}"`
    );
    lines.push(`           display-name-key="${escapeXmlAttr(controlName)}" description-key="${escapeXmlAttr(description)}"`);
    lines.push(`           control-type="${controlType}">`);
    lines.push(``);

    // -----------------------------------------------------------------------
    // Field control: bound property + merged block properties
    // -----------------------------------------------------------------------
    if (spec.controlType === "field" && spec.field) {
        const f = spec.field;
        lines.push(`    <!-- Primary bound field property -->`);
        lines.push(
            `    <property name="${escapeXmlAttr(f.propertyName)}" display-name-key="${escapeXmlAttr(f.propertyName)}"\n` +
            `              description-key="The bound field value"\n` +
            `              of-type="${escapeXmlAttr(f.ofType)}" usage="bound" required="${f.required !== false ? "true" : "false"}" />`
        );

        // Add block manifest properties (skip if already covered by the bound property)
        const blockProps = mergedProperties.filter((p) => p.name !== f.propertyName);
        if (blockProps.length > 0) {
            lines.push(``);
            lines.push(`    <!-- Block configuration properties -->`);
            for (const prop of blockProps) {
                lines.push(renderProperty(prop));
            }
        }
    }

    // -----------------------------------------------------------------------
    // Dataset control: <data-set> element + merged block properties
    // -----------------------------------------------------------------------
    if (spec.controlType === "dataset" && spec.dataset) {
        const ds = spec.dataset;
        const dsDisplayName = ds.displayName ?? ds.name;
        lines.push(`    <!-- Dataset binding -->`);
        lines.push(`    <data-set name="${escapeXmlAttr(ds.name)}" display-name-key="${escapeXmlAttr(dsDisplayName)}">`);
        if (ds.columns && ds.columns.length > 0) {
            for (const col of ds.columns) {
                lines.push(renderPropertySet(col));
            }
        }
        lines.push(`    </data-set>`);

        if (mergedProperties.length > 0) {
            lines.push(``);
            lines.push(`    <!-- Block configuration properties -->`);
            for (const prop of mergedProperties) {
                lines.push(renderProperty(prop));
            }
        }
    }

    // -----------------------------------------------------------------------
    // Resources
    // -----------------------------------------------------------------------
    lines.push(``);
    lines.push(`    <resources>`);
    lines.push(`      <code path="index.ts" order="1"/>`);
    lines.push(`      <css path="css/${cssFileName}" order="1" />`);
    // React virtual controls would add platform-library here; for simplicity we
    // generate standard controls (React can be added manually).
    lines.push(`    </resources>`);

    lines.push(`  </control>`);
    lines.push(`</manifest>`);

    return lines.join("\n");
}
