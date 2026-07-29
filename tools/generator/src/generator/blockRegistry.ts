/**
 * Block registry — maps blockType → descriptor.
 *
 * The generator reads these at runtime. New blocks are registered here.
 * Descriptors are plain objects (no file I/O required at import time).
 */

import { BlockDescriptor } from "./blockDescriptor";
import { ManifestProperty } from "../schema/types";

// ---------------------------------------------------------------------------
// Inline descriptors (avoids file-system reads at runtime)
// ---------------------------------------------------------------------------

const BLOCKS: BlockDescriptor[] = [
    {
        blockType: "Label",
        displayName: "Label",
        description: "A simple text label. XSS-safe display only.",
        category: "display",
        componentFile: "Label/Label.tsx",
        componentName: "Label",
        cssFile: "Label/Label.css",
        manifestFragments: [],
        props: [
            { name: "text", label: "Text", type: "string", default: "Label" },
            { name: "htmlFor", label: "For (HTML ID)", type: "string", default: "" },
            { name: "fontSize", label: "Font Size", type: "string", default: "14px" },
            { name: "fontWeight", label: "Font Weight", type: "string", default: "400" },
            { name: "color", label: "Color", type: "string", default: "#323130" },
        ],
    },
    {
        blockType: "TextInput",
        displayName: "Text Input",
        description: "Single-line or multiline text input with debounced change notification.",
        category: "input",
        componentFile: "TextInput/TextInput.tsx",
        componentName: "TextInput",
        cssFile: "TextInput/TextInput.css",
        manifestFragments: [],
        props: [
            { name: "value", label: "Value", type: "string", default: "" },
            { name: "placeholder", label: "Placeholder", type: "string", default: "" },
            { name: "disabled", label: "Disabled", type: "boolean", default: false },
            { name: "multiline", label: "Multiline", type: "boolean", default: false },
            { name: "label", label: "Label Text", type: "string", default: "" },
        ],
    },
    {
        blockType: "Rating",
        displayName: "Rating",
        description: "Clickable star rating (1–N stars). Keyboard accessible.",
        category: "input",
        componentFile: "Rating/Rating.tsx",
        componentName: "Rating",
        cssFile: "Rating/Rating.css",
        manifestFragments: [
            {
                name: "rating",
                displayName: "Rating Value",
                description: "Numeric rating value bound to a Whole.None field",
                ofType: "Whole.None",
                usage: "bound",
                required: true,
            } as ManifestProperty,
        ],
        props: [
            { name: "value", label: "Value", type: "number", default: 0 },
            { name: "max", label: "Max Stars", type: "number", default: 5 },
            { name: "disabled", label: "Disabled", type: "boolean", default: false },
            { name: "label", label: "Label Text", type: "string", default: "" },
            { name: "size", label: "Size", type: "string", default: "medium" },
        ],
    },
    {
        blockType: "Toggle",
        displayName: "Toggle",
        description: "Accessible on/off toggle switch.",
        category: "input",
        componentFile: "Toggle/Toggle.tsx",
        componentName: "Toggle",
        cssFile: "Toggle/Toggle.css",
        manifestFragments: [],
        props: [
            { name: "value", label: "Value", type: "boolean", default: false },
            { name: "disabled", label: "Disabled", type: "boolean", default: false },
            { name: "label", label: "Label Text", type: "string", default: "" },
            { name: "onText", label: "On Label", type: "string", default: "On" },
            { name: "offText", label: "Off Label", type: "string", default: "Off" },
        ],
    },
    {
        blockType: "Slider",
        displayName: "Slider",
        description: "Numeric range slider with optional value display.",
        category: "input",
        componentFile: "Slider/Slider.tsx",
        componentName: "Slider",
        cssFile: "Slider/Slider.css",
        manifestFragments: [],
        props: [
            { name: "value", label: "Value", type: "number", default: 0 },
            { name: "min", label: "Min", type: "number", default: 0 },
            { name: "max", label: "Max", type: "number", default: 100 },
            { name: "step", label: "Step", type: "number", default: 1 },
            { name: "disabled", label: "Disabled", type: "boolean", default: false },
            { name: "label", label: "Label Text", type: "string", default: "" },
            { name: "showValue", label: "Show Value", type: "boolean", default: true },
        ],
    },
    {
        blockType: "DatePicker",
        displayName: "Date Picker",
        description: "Date or date-time input using native browser controls.",
        category: "input",
        componentFile: "DatePicker/DatePicker.tsx",
        componentName: "DatePicker",
        cssFile: "DatePicker/DatePicker.css",
        manifestFragments: [],
        props: [
            { name: "value", label: "Value", type: "string", default: "" },
            { name: "min", label: "Min Date", type: "string", default: "" },
            { name: "max", label: "Max Date", type: "string", default: "" },
            { name: "disabled", label: "Disabled", type: "boolean", default: false },
            { name: "label", label: "Label Text", type: "string", default: "" },
            { name: "includeTime", label: "Include Time", type: "boolean", default: false },
        ],
    },
    {
        blockType: "Card",
        displayName: "Card",
        description: "Content container with optional header and elevation shadow.",
        category: "layout",
        componentFile: "Card/Card.tsx",
        componentName: "Card",
        cssFile: "Card/Card.css",
        manifestFragments: [],
        props: [
            { name: "title", label: "Title", type: "string", default: "" },
            { name: "subtitle", label: "Subtitle", type: "string", default: "" },
            { name: "body", label: "Body Text", type: "string", default: "" },
            { name: "elevated", label: "Elevated", type: "boolean", default: true },
            { name: "borderRadius", label: "Border Radius", type: "string", default: "4px" },
            { name: "padding", label: "Padding", type: "string", default: "16px" },
        ],
    },
    {
        blockType: "DataGrid",
        displayName: "Data Grid",
        description: "Tabular grid for displaying rows of data.",
        category: "data",
        componentFile: "DataGrid/DataGrid.tsx",
        componentName: "DataGrid",
        cssFile: "DataGrid/DataGrid.css",
        manifestFragments: [],
        props: [
            { name: "emptyText", label: "Empty Text", type: "string", default: "No records to display." },
            { name: "striped", label: "Striped Rows", type: "boolean", default: true },
        ],
    },
    {
        blockType: "Button",
        displayName: "Button",
        description: "Styled action button (primary, secondary, ghost, danger).",
        category: "input",
        componentFile: "Button/Button.tsx",
        componentName: "Button",
        cssFile: "Button/Button.css",
        manifestFragments: [],
        props: [
            { name: "label", label: "Label", type: "string", default: "Button" },
            { name: "variant", label: "Variant", type: "string", default: "primary" },
            { name: "disabled", label: "Disabled", type: "boolean", default: false },
            { name: "type", label: "Type", type: "string", default: "button" },
            { name: "fullWidth", label: "Full Width", type: "boolean", default: false },
            { name: "icon", label: "Icon", type: "string", default: "" },
        ],
    },
    {
        blockType: "NumberInput",
        displayName: "Number Input",
        description: "Numeric input with optional min/max clamping, prefix, and suffix.",
        category: "input",
        componentFile: "NumberInput/NumberInput.tsx",
        componentName: "NumberInput",
        cssFile: "NumberInput/NumberInput.css",
        manifestFragments: [],
        props: [
            { name: "min", label: "Min", type: "number", default: undefined },
            { name: "max", label: "Max", type: "number", default: undefined },
            { name: "step", label: "Step", type: "number", default: 1 },
            { name: "precision", label: "Decimal Precision", type: "number", default: 0 },
            { name: "disabled", label: "Disabled", type: "boolean", default: false },
            { name: "label", label: "Label Text", type: "string", default: "" },
            { name: "prefix", label: "Prefix", type: "string", default: "" },
            { name: "suffix", label: "Suffix", type: "string", default: "" },
        ],
    },
];

// ---------------------------------------------------------------------------
// Registry API
// ---------------------------------------------------------------------------

const _registry = new Map<string, BlockDescriptor>(BLOCKS.map((b) => [b.blockType, b]));

/** Look up a block descriptor by type id. Returns undefined if not found. */
export function getBlock(blockType: string): BlockDescriptor | undefined {
    return _registry.get(blockType);
}

/** Returns all registered block descriptors. */
export function getAllBlocks(): BlockDescriptor[] {
    return Array.from(_registry.values());
}

/** Returns true if blockType is registered in the library. */
export function isKnownBlock(blockType: string): boolean {
    return _registry.has(blockType);
}
