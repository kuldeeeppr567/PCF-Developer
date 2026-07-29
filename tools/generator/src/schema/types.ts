/**
 * TypeScript types for control.spec.json
 *
 * These types mirror the JSON Schema at ./spec.schema.json and are the
 * authoritative type definitions used throughout the generator.
 */

// ---------------------------------------------------------------------------
// PCF property types (data binding types)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Manifest fragment — a single property declaration destined for the manifest
// ---------------------------------------------------------------------------
export interface ManifestProperty {
    /** Property name in the manifest — must be unique across all merged fragments. */
    name: string;
    /** Display name key shown in maker portal. Defaults to name if omitted. */
    displayName?: string;
    /** Description key. Defaults to empty string if omitted. */
    description?: string;
    /** PCF property type. */
    ofType: string;
    /** 'bound' = two-way binding to a field; 'input' = one-way configuration value. */
    usage: "bound" | "input";
    /** Whether the property is required. Defaults to false. */
    required?: boolean;
    /** Default value for input properties. */
    defaultValue?: string;
}

// ---------------------------------------------------------------------------
// Field config (for controlType: 'field')
// ---------------------------------------------------------------------------
export interface FieldConfig {
    /** PCF property name for the bound field (e.g. 'value'). */
    propertyName: string;
    /** PCF data type of the bound field. */
    ofType: PcfPropertyType;
    /** Whether the bound field is required. Defaults to true. */
    required?: boolean;
}

// ---------------------------------------------------------------------------
// Dataset config (for controlType: 'dataset')
// ---------------------------------------------------------------------------
export interface DatasetColumn {
    /** Column property name. */
    name: string;
    /** Human-readable display name. */
    displayName?: string;
    /** PCF data type. */
    ofType: PcfPropertyType;
}

export interface DatasetConfig {
    /** PCF dataset name (e.g. 'dataSetGrid'). */
    name: string;
    /** Human-readable display name for the dataset. */
    displayName?: string;
    /** Optional column definitions. */
    columns?: DatasetColumn[];
}

// ---------------------------------------------------------------------------
// Layout config
// ---------------------------------------------------------------------------
export interface LayoutConfig {
    /** Stack direction. Defaults to 'vertical'. */
    direction?: "vertical" | "horizontal";
    /** CSS gap between blocks. Defaults to '8px'. */
    gap?: string;
    /** CSS padding around the control container. Defaults to '0'. */
    padding?: string;
}

// ---------------------------------------------------------------------------
// Custom block escape hatch
// ---------------------------------------------------------------------------
export interface CustomBlockConfig {
    /**
     * Relative path (from the generated control folder) to the component file.
     * Example: './components/MyCustomComponent.tsx'
     */
    componentPath: string;
    /** Named export of the React component in that file. */
    componentName: string;
    /** Optional manifest property fragments this custom block needs. */
    manifestFragments?: ManifestProperty[];
}

// ---------------------------------------------------------------------------
// Block instance
// ---------------------------------------------------------------------------
export interface BlockInstance {
    /** Unique instance id within this control. Used as React key + prop prefix. */
    id: string;
    /**
     * Block type identifier. Built-in types: Label | TextInput | Rating |
     * Toggle | Slider | DatePicker | Card | DataGrid | Button | NumberInput.
     * Use 'custom' for user-authored components.
     */
    blockType: string;
    /** Configuration props for the block instance. */
    props?: Record<string, unknown>;
    /** Required when blockType is 'custom'. */
    custom?: CustomBlockConfig;
}

// ---------------------------------------------------------------------------
// Root spec
// ---------------------------------------------------------------------------
export interface ControlSpec {
    /** PascalCase control name (e.g. 'MyRatingControl'). */
    name: string;
    /** PCF namespace (e.g. 'MyCompany.Controls'). */
    namespace: string;
    /** Semantic version string (e.g. '0.0.1'). */
    version: string;
    /** Human-readable description. */
    description?: string;
    /**
     * Whether this control binds to a single field ('field') or a dataset/view
     * ('dataset'). This determines the fundamental manifest shape and MUST be
     * declared explicitly — the generator will refuse to proceed if it is absent.
     */
    controlType: "field" | "dataset";
    /**
     * Optional logical name of the Dataverse table this control is designed for
     * (e.g. 'account'). DOCUMENTATION ONLY — PCF does not bind to a table at the
     * manifest level. This value does not affect generated code or the manifest.
     */
    targetTable?: string;
    /** Required when controlType is 'field'. */
    field?: FieldConfig;
    /** Required when controlType is 'dataset'. */
    dataset?: DatasetConfig;
    /** Layout configuration. */
    layout?: LayoutConfig;
    /** Ordered list of block instances to compose into this control. */
    blocks: BlockInstance[];
}
