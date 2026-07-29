# Block Library

The block library (`templates/blocks/`) contains pre-built, reusable React components that can be assembled into PCF controls using the generator. Each block is self-describing — it ships with its component source, CSS, and a descriptor that declares its configurable props and any manifest property fragments it requires.

## Quick Reference

| Block | Category | Description | Manifest Fragments |
|---|---|---|---|
| [Label](#label) | display | Simple text label | none |
| [TextInput](#textinput) | input | Single-line or multiline text | none |
| [Rating](#rating) | input | Clickable star rating | `rating` (Whole.None, bound) |
| [Toggle](#toggle) | input | On/off toggle switch | none |
| [Slider](#slider) | input | Numeric range slider | none |
| [DatePicker](#datepicker) | input | Date / date-time picker | none |
| [Card](#card) | layout | Content card with header | none |
| [DataGrid](#datagrid) | data | Tabular record grid | none |
| [Button](#button) | input | Action button (4 variants) | none |
| [NumberInput](#numberinput) | input | Numeric input with prefix/suffix | none |

> **Manifest fragments:** A block may declare properties that will be merged into the generated `ControlManifest.Input.xml`. The `Rating` block is the only built-in block that does so — it contributes a `rating` bound property so the star value can be persisted to a Dataverse field. Most display/layout blocks have no manifest requirements.

---

## Label

A simple text label. XSS-safe: text is rendered as a React text node (no `innerHTML`).

**File:** `templates/blocks/Label/Label.tsx`

| Prop | Type | Default | Description |
|---|---|---|---|
| `text` | string | `"Label"` | The label text. |
| `htmlFor` | string | `""` | ID of an associated input element. |
| `fontSize` | string | `"14px"` | CSS font size. |
| `fontWeight` | string | `"400"` | CSS font weight. |
| `color` | string | `"#323130"` | CSS text color. |

**Usage in spec:**
```json
{ "id": "titleLabel", "blockType": "Label", "props": { "text": "Customer Name", "fontWeight": "600" } }
```

---

## TextInput

Single-line or multiline text input with 300ms debounced change notification.

**File:** `templates/blocks/TextInput/TextInput.tsx`

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | string | `""` | Current value. |
| `placeholder` | string | `""` | Placeholder text. |
| `disabled` | boolean | `false` | Disable the input. |
| `maxLength` | number | — | Maximum character count. |
| `multiline` | boolean | `false` | Use `<textarea>` instead of `<input>`. |
| `label` | string | `""` | Label text shown above the input. |

---

## Rating

Clickable star rating. Keyboard accessible (Tab to reach, Enter/Space to select).

**File:** `templates/blocks/Rating/Rating.tsx`

**Manifest fragment contributed:**
```xml
<property name="rating" of-type="Whole.None" usage="bound" required="true" />
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | number | `0` | Current rating value. |
| `max` | number | `5` | Maximum number of stars. |
| `disabled` | boolean | `false` | Make stars non-interactive. |
| `label` | string | `""` | Accessible label / heading. |
| `size` | `"small"\|"medium"\|"large"` | `"medium"` | Star size. |

---

## Toggle

Accessible on/off toggle switch using a visually-hidden checkbox with `role="switch"`.

**File:** `templates/blocks/Toggle/Toggle.tsx`

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | boolean | `false` | Checked state. |
| `disabled` | boolean | `false` | Disable the toggle. |
| `label` | string | `""` | Label shown above the toggle. |
| `onText` | string | `"On"` | Text shown when checked. |
| `offText` | string | `"Off"` | Text shown when unchecked. |

---

## Slider

Numeric range slider. The fill track percentage is tracked via a CSS custom property (`--slider-fill`).

**File:** `templates/blocks/Slider/Slider.tsx`

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | number | `0` | Current value. |
| `min` | number | `0` | Minimum value. |
| `max` | number | `100` | Maximum value. |
| `step` | number | `1` | Step increment. |
| `disabled` | boolean | `false` | Disable the slider. |
| `label` | string | `""` | Label shown above the slider. |
| `showValue` | boolean | `true` | Show the numeric value next to the track. |

---

## DatePicker

Native browser date or date-time input. Value is an ISO date string (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM`).

**File:** `templates/blocks/DatePicker/DatePicker.tsx`

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | string | `""` | ISO date string. |
| `min` | string | `""` | Minimum date (ISO string). |
| `max` | string | `""` | Maximum date (ISO string). |
| `disabled` | boolean | `false` | Disable the input. |
| `label` | string | `""` | Label shown above the input. |
| `includeTime` | boolean | `false` | Use `datetime-local` instead of `date`. |

---

## Card

Content container with an optional title/subtitle header and elevation shadow.

**File:** `templates/blocks/Card/Card.tsx`

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | string | `""` | Card heading (renders as `<h3>`). |
| `subtitle` | string | `""` | Card sub-heading. |
| `body` | string | `""` | Body paragraph text. |
| `elevated` | boolean | `true` | Show a drop shadow. |
| `borderRadius` | string | `"4px"` | CSS border radius. |
| `padding` | string | `"16px"` | CSS padding. |

---

## DataGrid

Tabular data grid. All cell content is rendered via React text nodes — no `innerHTML`.

Intended primarily for `dataset` controls: the consuming `index.ts` passes dataset records as `rows` and column definitions as `columns`.

**File:** `templates/blocks/DataGrid/DataGrid.tsx`

| Prop | Type | Default | Description |
|---|---|---|---|
| `columns` | `{ key, header, width? }[]` | `[]` | Column definitions. |
| `rows` | `Record<string, unknown>[]` | `[]` | Data rows. |
| `emptyText` | string | `"No records to display."` | Shown when rows is empty. |
| `striped` | boolean | `true` | Alternate row background. |

---

## Button

Styled action button with four variants.

**File:** `templates/blocks/Button/Button.tsx`

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | string | `"Button"` | Button text. |
| `variant` | `"primary"\|"secondary"\|"ghost"\|"danger"` | `"primary"` | Visual style. |
| `disabled` | boolean | `false` | Disable the button. |
| `type` | `"button"\|"submit"\|"reset"` | `"button"` | HTML button type. |
| `fullWidth` | boolean | `false` | Stretch to container width. |
| `icon` | string | `""` | Optional icon (emoji or text) shown before the label. |

---

## NumberInput

Numeric input with optional clamping to `[min, max]`, decimal precision control, and prefix/suffix adornments.

**File:** `templates/blocks/NumberInput/NumberInput.tsx`

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | number | — | Current numeric value. |
| `min` | number | — | Minimum value (clamped on change). |
| `max` | number | — | Maximum value (clamped on change). |
| `step` | number | `1` | Step increment for the native input. |
| `precision` | number | `0` | Decimal places to round to. |
| `disabled` | boolean | `false` | Disable the input. |
| `label` | string | `""` | Label shown above the input. |
| `prefix` | string | `""` | Text/symbol shown before the input (e.g. `$`). |
| `suffix` | string | `""` | Text/symbol shown after the input (e.g. `kg`). |

---

## Authoring a New Block

To add a new block to the library:

### 1. Create the folder

```
templates/blocks/MyBlock/
├── MyBlock.tsx          # React component
├── MyBlock.css          # Scoped styles
└── MyBlock.descriptor.ts  # Self-description metadata
```

### 2. Write the component

Follow these security rules (from `docs/SECURITY.md`):

- **No `innerHTML`** — use React text nodes or DOM APIs only.
- **No `eval()`** — CSP-compatible code only.
- **No inline event handlers** (`onclick="..."` pattern is forbidden).
- Sanitize any value before rendering if it came from outside the component.

Use `React.memo` to prevent unnecessary re-renders.

### 3. Write the descriptor

```typescript
// MyBlock.descriptor.ts
import { BlockDescriptor } from "../../tools/generator/src/generator/blockDescriptor";

const descriptor: BlockDescriptor = {
    blockType: "MyBlock",         // unique, matches folder name
    displayName: "My Block",
    description: "One-line description.",
    category: "input",            // display | input | layout | data
    componentFile: "MyBlock.tsx",
    componentName: "MyBlock",
    cssFile: "MyBlock.css",
    manifestFragments: [
        // List any ControlManifest.Input.xml properties this block needs.
        // Leave empty if the block is display-only.
        // { name: "myValue", ofType: "SingleLine.Text", usage: "bound", required: true }
    ],
    props: [
        { name: "text", label: "Text", type: "string", default: "" },
        // ...
    ],
};

export default descriptor;
```

### 4. Register the block

Open `tools/generator/src/generator/blockRegistry.ts` and add an entry to the `BLOCKS` array:

```typescript
{
    blockType: "MyBlock",
    displayName: "My Block",
    description: "One-line description.",
    category: "input",
    componentFile: "MyBlock/MyBlock.tsx",
    componentName: "MyBlock",
    cssFile: "MyBlock/MyBlock.css",
    manifestFragments: [],
    props: [
        { name: "text", label: "Text", type: "string", default: "" },
    ],
},
```

### 5. Verify

```bash
cd tools/generator
npm test                    # existing tests still pass
node dist/index.js list-blocks  # shows your new block
```

### Manifest fragment naming conventions

| Convention | Reason |
|---|---|
| Use `camelCase` property names | Matches PCF convention |
| Prefer `"input"` usage unless the value must round-trip to Dataverse | `"bound"` usage creates a two-way binding; `"input"` is one-way configuration |
| Never reuse the name `value` in a fragment | `value` is reserved for the primary bound field in field controls |
| Keep fragment count low | Each `"bound"` fragment adds a required field binding in the maker portal |
