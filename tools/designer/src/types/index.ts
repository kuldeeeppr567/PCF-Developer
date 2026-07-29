/**
 * Types for the PCF Designer — mirrors control.spec.json structure.
 * Kept in sync with tools/generator/src/schema/types.ts.
 */

export type PcfPropertyType =
  | "SingleLine.Text"
  | "SingleLine.Email"
  | "SingleLine.Phone"
  | "SingleLine.URL"
  | "Multiple"
  | "Whole.None"
  | "Currency"
  | "Decimal"
  | "FP"
  | "TwoOptions"
  | "OptionSet"
  | "MultiSelectOptionSet"
  | "DateAndTime.DateOnly"
  | "DateAndTime.DateAndTime"
  | "Lookup.Simple";

export const PCF_PROPERTY_TYPES: PcfPropertyType[] = [
  "SingleLine.Text",
  "SingleLine.Email",
  "SingleLine.Phone",
  "SingleLine.URL",
  "Multiple",
  "Whole.None",
  "Currency",
  "Decimal",
  "FP",
  "TwoOptions",
  "OptionSet",
  "MultiSelectOptionSet",
  "DateAndTime.DateOnly",
  "DateAndTime.DateAndTime",
  "Lookup.Simple",
];

export interface DatasetColumn {
  name: string;
  displayName?: string;
  ofType: PcfPropertyType;
}

/** A block instance placed on the canvas */
export interface CanvasBlock {
  /** Unique instance id within this control design */
  id: string;
  /** Block type — one of the registered block types */
  blockType: string;
  /** Current prop values for this instance */
  props: Record<string, unknown>;
}

/** Prop descriptor from the block registry */
export interface PropDescriptor {
  name: string;
  label: string;
  type: "string" | "number" | "boolean";
  default: unknown;
  options?: string[];
}

/** Block registration entry */
export interface BlockRegistryEntry {
  blockType: string;
  displayName: string;
  description: string;
  category: "display" | "input" | "layout" | "data";
  icon: string;
  props: PropDescriptor[];
}

/** Full designer state */
export interface DesignerState {
  // ── Control metadata ────────────────────────────────────────────────────
  name: string;
  namespace: string;
  version: string;
  description: string;
  controlType: "field" | "dataset";
  targetTable: string;

  // ── Field binding (controlType === 'field') ───────────────────────────
  fieldPropertyName: string;
  fieldOfType: PcfPropertyType;
  fieldRequired: boolean;

  // ── Dataset config (controlType === 'dataset') ────────────────────────
  datasetName: string;
  datasetDisplayName: string;
  datasetColumns: DatasetColumn[];

  // ── Layout ────────────────────────────────────────────────────────────
  layoutDirection: "vertical" | "horizontal";
  layoutGap: string;
  layoutPadding: string;

  // ── Canvas blocks ────────────────────────────────────────────────────
  blocks: CanvasBlock[];
  selectedBlockId: string | null;
}

/** Serialised spec output (control.spec.json shape) */
export interface ControlSpec {
  name: string;
  namespace: string;
  version: string;
  description?: string;
  controlType: "field" | "dataset";
  targetTable?: string;
  field?: {
    propertyName: string;
    ofType: PcfPropertyType;
    required: boolean;
  };
  dataset?: {
    name: string;
    displayName?: string;
    columns?: DatasetColumn[];
  };
  layout?: {
    direction?: "vertical" | "horizontal";
    gap?: string;
    padding?: string;
  };
  blocks: Array<{
    id: string;
    blockType: string;
    props?: Record<string, unknown>;
  }>;
}
