import { ManifestProperty } from "../schema/types";

/**
 * Categories for organising blocks in future UI toolbox panels.
 */
export type BlockCategory = "display" | "input" | "layout" | "data";

/**
 * Describes one configurable prop exposed by a block.
 */
export interface BlockPropDescriptor {
    /** Internal prop name (camelCase). */
    name: string;
    /** Human-readable label. */
    label: string;
    /** JavaScript type. */
    type: "string" | "number" | "boolean" | "string[]";
    /** Default value used when the spec omits this prop. */
    default: unknown;
    /** Optional description. */
    description?: string;
}

/**
 * Self-describing metadata for a block type.
 *
 * Each block's descriptor.ts exports a single `BlockDescriptor` value.
 * The generator reads these at build time to:
 *   1. Know which manifest fragments to merge.
 *   2. Know which default props to apply.
 *   3. Describe the block in BLOCKS.md.
 */
export interface BlockDescriptor {
    /** Unique block type id — must match the `blockType` value in specs. */
    blockType: string;
    /** Human-readable display name. */
    displayName: string;
    /** Short description. */
    description: string;
    /** Toolbox category. */
    category: BlockCategory;
    /** Configurable props (shown in the future visual designer). */
    props: BlockPropDescriptor[];
    /**
     * Manifest property fragments this block needs.
     * These are merged into the single `ControlManifest.Input.xml` by the generator.
     * Most display-only blocks declare NO manifest properties (they are driven
     * entirely by the spec/props mechanism rather than PCF properties).
     */
    manifestFragments: ManifestProperty[];
    /** Source file for the React component (relative to this descriptor). */
    componentFile: string;
    /** Named export of the React component. */
    componentName: string;
    /** CSS file (relative to this descriptor). */
    cssFile: string;
}
