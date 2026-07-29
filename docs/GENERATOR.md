# Generator — Spec Format, CLI Usage, and Round-Tripping

The generator (`tools/generator/`) converts a `control.spec.json` file into a complete, buildable PCF project under `controls/<ControlName>/`.

## Quick Start

```bash
# From the repo root
cd tools/generator
npm install
npm run build          # compiles to dist/

# Generate a control
node dist/index.js generate examples/my-control.spec.json

# Validate a spec without generating
node dist/index.js validate my-control.spec.json

# List available blocks
node dist/index.js list-blocks
```

---

## The control.spec.json Format

The spec file is the **source of truth** for a generated control. Generated code is disposable — you should always be able to delete the generated folder and regenerate from the spec.

### Full schema

```jsonc
{
  // Required: PascalCase control name. Used as PCF constructor and folder name.
  "name": "MyRatingControl",

  // Required: PCF namespace (dots allowed).
  "namespace": "MyCompany.Controls",

  // Required: semantic version string.
  "version": "0.0.1",

  // Optional: human-readable description.
  "description": "A composable rating control.",

  // Required: "field" or "dataset".
  // This determines the manifest shape and MUST be declared explicitly.
  // It cannot be inferred from the block list — a Rating block can appear
  // in either a field control or a dataset control.
  "controlType": "field",

  // Optional: logical name of the Dataverse table this control is designed for.
  // DOCUMENTATION ONLY — PCF does not bind to a table at the manifest level.
  // This value is written into the generated README but does not affect code.
  "targetTable": "account",

  // Required when controlType is "field".
  // Defines the primary bound attribute.
  "field": {
    "propertyName": "value",    // PCF property name for the binding
    "ofType": "Whole.None",     // PCF data type
    "required": true
  },

  // Required when controlType is "dataset".
  // Defines the dataset and optional column definitions.
  "dataset": {
    "name": "dataSetGrid",
    "displayName": "Contacts",
    "columns": [
      { "name": "fullName", "displayName": "Full Name", "ofType": "SingleLine.Text" },
      { "name": "email", "ofType": "SingleLine.Email" }
    ]
  },

  // Optional: layout of the block stack.
  "layout": {
    "direction": "vertical",   // "vertical" (default) or "horizontal"
    "gap": "8px",              // CSS gap between blocks
    "padding": "4px"           // CSS padding around the container
  },

  // Required: ordered list of blocks to compose.
  // Minimum 1 block.
  "blocks": [
    {
      "id": "titleLabel",       // unique within this spec; used as React key
      "blockType": "Label",     // must be a registered block or "custom"
      "props": {                // block-specific configuration props
        "text": "Customer Satisfaction",
        "fontWeight": "600"
      }
    },
    {
      "id": "ratingStars",
      "blockType": "Rating",
      "props": { "max": 5, "size": "large" }
    },
    // Custom block escape hatch — see below
    {
      "id": "mySpecialWidget",
      "blockType": "custom",
      "custom": {
        "componentPath": "./components/MyWidget.tsx",
        "componentName": "MyWidget",
        "manifestFragments": [
          // optional: any manifest properties this custom block needs
        ]
      }
    }
  ]
}
```

### Supported ofType values

`SingleLine.Text`, `SingleLine.Email`, `SingleLine.Phone`, `SingleLine.URL`, `Multiple`, `Whole.None`, `Currency`, `Decimal`, `FP`, `TwoOptions`, `OptionSet`, `MultiSelectOptionSet`, `DateAndTime.DateOnly`, `DateAndTime.DateAndTime`, `Lookup.Simple`

### controlType must be explicit

The `controlType` field is validated up front. The generator refuses to start without it because `"field"` and `"dataset"` produce fundamentally different manifests:

| `controlType` | Manifest shape | Spec requirement |
|---|---|---|
| `"field"` | `<property usage="bound">` for the primary attribute | `field` object required |
| `"dataset"` | `<data-set>` element with columns | `dataset` object required |

---

## CLI Reference

### `generate <specFile>`

```
node dist/index.js generate <specFile> [options]
```

| Option | Description |
|---|---|
| `-o, --output <dir>` | Output root directory. Default: `<repo-root>/controls` |
| `-f, --force` | Overwrite an existing control folder |
| `-v, --verbose` | Print each written file |

**What gets generated:**

```
controls/<ControlName>/
└── <ControlName>/
    ├── ControlManifest.Input.xml   # generated manifest
    ├── index.ts                     # generated PCF shell
    ├── package.json
    ├── tsconfig.json
    ├── control.spec.json            # sidecar copy for round-tripping
    ├── css/
    │   └── <ControlName>.css        # aggregated block CSS
    └── components/
        ├── Rating/
        │   └── Rating.tsx           # copied from templates/blocks/
        └── ...
```

### `validate <specFile>`

Validates the spec against the JSON schema without generating any files. Prints actionable errors.

```bash
node dist/index.js validate my-control.spec.json
```

### `list-blocks`

Lists all registered blocks, grouped by category.

```bash
node dist/index.js list-blocks
```

---

## Manifest Merging

The manifest merge is the most important step. When multiple blocks each declare manifest property fragments, the generator:

1. Collects all `manifestFragments` arrays from all block descriptors in the spec.
2. Deduplicates exact copies silently.
3. **Hard-errors** on same-name properties with different `ofType` or `usage` values — these represent a real conflict that cannot be resolved automatically.
4. **Warns** on same-name properties with different `required` values and picks `required: false` (more permissive).
5. Merges the result into one `ControlManifest.Input.xml`.

### Example: two blocks adding the same property

If two blocks both need a `disabled` (TwoOptions, input) property, the generator silently deduplicates them. If one declares `Whole.None` and the other declares `TwoOptions`, the generator fails with a clear message:

```
✗  Manifest fragment merge failed:
   • Property name conflict: "score" is declared with ofType="Whole.None" by one block
     and ofType="TwoOptions" by another. Rename one of the properties to resolve this conflict.
```

Fix: edit the spec so that the two blocks' required properties have distinct names.

---

## Round-Tripping

The generated `control.spec.json` (sidecar) inside the control folder is a verbatim copy of the original spec. It allows you to:

1. Inspect the spec that produced the current code.
2. Edit the spec and regenerate with `--force`.
3. (Future) re-open the spec in a visual designer.

**Important:** The sidecar is overwritten on every `--force` regeneration. If you edit the sidecar directly, use it as the input to `generate` to keep things in sync:

```bash
node dist/index.js generate controls/MyControl/MyControl/control.spec.json --force
```

---

## Custom Block Escape Hatch

The `custom` blockType lets you point the generator at a component you wrote yourself. It is designed in from day one so that the "80% case" block library never becomes a hard ceiling.

### How to use it

1. Create your component file (e.g. `controls/MyControl/MyControl/components/MyWidget.tsx`).
2. Add a `custom` block entry to your spec:

```json
{
  "id": "myWidget",
  "blockType": "custom",
  "custom": {
    "componentPath": "./components/MyWidget.tsx",
    "componentName": "MyWidget",
    "manifestFragments": [
      {
        "name": "widgetValue",
        "ofType": "SingleLine.Text",
        "usage": "input",
        "required": false
      }
    ]
  }
}
```

3. Run the generator normally. The generated `index.ts` will import `MyWidget` from `./components/MyWidget.tsx`.

### What regeneration does and does NOT preserve

| File | On `generate` (no `--force`) | On `generate --force` |
|---|---|---|
| `ControlManifest.Input.xml` | **Skipped** (folder exists) | **Overwritten** |
| `index.ts` | **Skipped** | **Overwritten** |
| `css/<Name>.css` | **Skipped** | **Overwritten** |
| `package.json`, `tsconfig.json` | **Skipped** | **Overwritten** |
| `control.spec.json` (sidecar) | **Skipped** | **Overwritten** |
| Block component TSX files | **Skipped** (file already exists) | **Overwritten** |
| **Custom component files** | **Never overwritten** | **Never overwritten** |
| `node_modules/` | Never touched | Never touched |

The rule: if you wrote it, the generator will not touch it — as long as you use `custom` blockType for your component. Auto-generated files can be safely deleted and regenerated.

---

## Running Tests

```bash
cd tools/generator
npm test
```

The test suite covers:

- **Schema validation** (`tests/validator.test.ts`) — valid specs, missing required fields, pattern violations, controlType constraints.
- **Manifest merging** (`tests/manifest.test.ts`) — deduplication, hard conflicts (ofType mismatch, usage mismatch), soft conflicts (required mismatch), XML output for field and dataset controls.
- **End-to-end generation** (`tests/generator.e2e.test.ts`) — full run against `field-control.spec.json` and `dataset-control.spec.json`, verifying output file existence and content; `--force` protection tests.
