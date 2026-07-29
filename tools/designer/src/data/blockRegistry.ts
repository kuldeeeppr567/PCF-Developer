import type { BlockRegistryEntry } from "../types";

export const BLOCK_REGISTRY: BlockRegistryEntry[] = [
  {
    blockType: "Label",
    displayName: "Label",
    description: "Simple text label",
    category: "display",
    icon: "🏷️",
    props: [
      { name: "text", label: "Text", type: "string", default: "Label" },
      { name: "fontSize", label: "Font Size", type: "string", default: "14px" },
      { name: "fontWeight", label: "Font Weight", type: "string", default: "400", options: ["400", "500", "600", "700", "bold"] },
      { name: "color", label: "Color", type: "string", default: "#323130" },
      { name: "htmlFor", label: "For (HTML ID)", type: "string", default: "" },
    ],
  },
  {
    blockType: "TextInput",
    displayName: "Text Input",
    description: "Single-line or multiline text field",
    category: "input",
    icon: "📝",
    props: [
      { name: "label", label: "Label Text", type: "string", default: "" },
      { name: "placeholder", label: "Placeholder", type: "string", default: "" },
      { name: "value", label: "Default Value", type: "string", default: "" },
      { name: "multiline", label: "Multiline", type: "boolean", default: false },
      { name: "disabled", label: "Disabled", type: "boolean", default: false },
      { name: "maxLength", label: "Max Length", type: "number", default: 0 },
    ],
  },
  {
    blockType: "Rating",
    displayName: "Rating",
    description: "Clickable star rating (1–N stars)",
    category: "input",
    icon: "⭐",
    props: [
      { name: "label", label: "Label Text", type: "string", default: "" },
      { name: "value", label: "Default Value", type: "number", default: 0 },
      { name: "max", label: "Max Stars", type: "number", default: 5 },
      { name: "size", label: "Size", type: "string", default: "medium", options: ["small", "medium", "large"] },
      { name: "disabled", label: "Disabled", type: "boolean", default: false },
    ],
  },
  {
    blockType: "Toggle",
    displayName: "Toggle",
    description: "On/off toggle switch",
    category: "input",
    icon: "🔄",
    props: [
      { name: "label", label: "Label Text", type: "string", default: "" },
      { name: "value", label: "Default (On)", type: "boolean", default: false },
      { name: "onText", label: "On Text", type: "string", default: "On" },
      { name: "offText", label: "Off Text", type: "string", default: "Off" },
      { name: "disabled", label: "Disabled", type: "boolean", default: false },
    ],
  },
  {
    blockType: "Slider",
    displayName: "Slider",
    description: "Numeric range slider",
    category: "input",
    icon: "🎚️",
    props: [
      { name: "label", label: "Label Text", type: "string", default: "" },
      { name: "value", label: "Default Value", type: "number", default: 0 },
      { name: "min", label: "Min", type: "number", default: 0 },
      { name: "max", label: "Max", type: "number", default: 100 },
      { name: "step", label: "Step", type: "number", default: 1 },
      { name: "showValue", label: "Show Value", type: "boolean", default: true },
      { name: "disabled", label: "Disabled", type: "boolean", default: false },
    ],
  },
  {
    blockType: "DatePicker",
    displayName: "Date Picker",
    description: "Date or date-time input",
    category: "input",
    icon: "📅",
    props: [
      { name: "label", label: "Label Text", type: "string", default: "" },
      { name: "value", label: "Default Value", type: "string", default: "" },
      { name: "min", label: "Min Date", type: "string", default: "" },
      { name: "max", label: "Max Date", type: "string", default: "" },
      { name: "includeTime", label: "Include Time", type: "boolean", default: false },
      { name: "disabled", label: "Disabled", type: "boolean", default: false },
    ],
  },
  {
    blockType: "Card",
    displayName: "Card",
    description: "Content card with optional header",
    category: "layout",
    icon: "🃏",
    props: [
      { name: "title", label: "Title", type: "string", default: "" },
      { name: "subtitle", label: "Subtitle", type: "string", default: "" },
      { name: "body", label: "Body Text", type: "string", default: "" },
      { name: "elevated", label: "Elevated (shadow)", type: "boolean", default: true },
      { name: "borderRadius", label: "Border Radius", type: "string", default: "4px" },
      { name: "padding", label: "Padding", type: "string", default: "16px" },
    ],
  },
  {
    blockType: "DataGrid",
    displayName: "Data Grid",
    description: "Tabular grid for dataset controls",
    category: "data",
    icon: "📊",
    props: [
      { name: "emptyText", label: "Empty Message", type: "string", default: "No records to display." },
      { name: "striped", label: "Striped Rows", type: "boolean", default: true },
    ],
  },
  {
    blockType: "Button",
    displayName: "Button",
    description: "Action button (4 variants)",
    category: "input",
    icon: "🔘",
    props: [
      { name: "label", label: "Label", type: "string", default: "Button" },
      { name: "variant", label: "Variant", type: "string", default: "primary", options: ["primary", "secondary", "ghost", "danger"] },
      { name: "icon", label: "Icon (emoji)", type: "string", default: "" },
      { name: "fullWidth", label: "Full Width", type: "boolean", default: false },
      { name: "disabled", label: "Disabled", type: "boolean", default: false },
    ],
  },
  {
    blockType: "NumberInput",
    displayName: "Number Input",
    description: "Numeric field with prefix/suffix",
    category: "input",
    icon: "🔢",
    props: [
      { name: "label", label: "Label Text", type: "string", default: "" },
      { name: "prefix", label: "Prefix (e.g. $)", type: "string", default: "" },
      { name: "suffix", label: "Suffix (e.g. kg)", type: "string", default: "" },
      { name: "min", label: "Min", type: "number", default: 0 },
      { name: "max", label: "Max", type: "number", default: 100 },
      { name: "step", label: "Step", type: "number", default: 1 },
      { name: "precision", label: "Decimal Precision", type: "number", default: 0 },
      { name: "disabled", label: "Disabled", type: "boolean", default: false },
    ],
  },
];

export function getBlock(blockType: string): BlockRegistryEntry | undefined {
  return BLOCK_REGISTRY.find((b) => b.blockType === blockType);
}

/** Build a default props object for a block type */
export function defaultPropsFor(blockType: string): Record<string, unknown> {
  const entry = getBlock(blockType);
  if (!entry) return {};
  const result: Record<string, unknown> = {};
  for (const p of entry.props) {
    result[p.name] = p.default;
  }
  return result;
}
