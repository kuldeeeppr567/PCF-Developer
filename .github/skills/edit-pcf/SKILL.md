---
name: edit-pcf
description: Modify an existing PCF control — add/edit properties, update rendering logic, change styling, integrate external libraries, or update the control to match a new design from an attached image. USE FOR editing PCF controls, adding properties, changing styles, updating behavior, refactoring PCF code, updating controls to match new designs.
---

# Edit PCF Control Skill

## Purpose
Modify an existing PCF control project. This includes adding new properties, editing rendering logic, updating CSS styles, integrating third-party libraries, fixing bugs, and updating the control's appearance to match a new design (from an image or description).

## When to Use
- User says "add a property to my PCF control"
- User says "change the styling of my control"
- User says "make my control do X when Y happens"
- User says "integrate library Z into my control"
- User provides an image and says "update my control to look like this"
- User wants to fix a bug or improve an existing control
- User just created a control and immediately asks for modifications
- User returns to an existing control they built earlier and wants changes

## Scenarios

This skill handles two distinct scenarios:

### Scenario A: Just-Created Control (Same Session)
The user just created a control using `create-pcf` or `create-pcf-from-image` and immediately asks for changes (e.g., "add a reset button", "change the color to red", "make it support decimals too"). In this case:
- You already know the control location and structure from the creation session
- Skip the discovery/locate steps — go directly to understanding what needs to change
- For simple tweaks (color change, text update), apply immediately without questions

### Scenario B: Existing Control (Different Session or Pre-existing)
The user references a control that was built earlier or already exists in the `controls/` folder. In this case:
- You need to **locate** and **read** the control first
- You may need to ask which control (if multiple exist)
- You should understand the current implementation before proposing changes

## Discovery Phase — Understand Before Editing

### For Scenario A (just created):
- **Simple changes** (styling tweak, rename, add a class): Apply directly, no questions needed.
- **Behavioral changes** (add new property, change interaction model): Briefly confirm what the user wants, then proceed.

### For Scenario B (existing control):
1. **Locate the control** — List `controls/` to find it, or ask the user which one:
   > "I see these controls in your workspace: [list]. Which one should I modify?"

2. **Read and understand** — Read manifest, index.ts, and CSS to understand current behavior.

3. **Confirm the change** — For non-trivial edits, summarize what you'll change:
   > "Currently the control [does X]. I'll modify it to [do Y] by [changing Z]. This will affect [scope]. Sound good?"

### When to Ask Questions (either scenario):
- The requested change is ambiguous (e.g., "make it better" — better how?)
- The change could break existing behavior (e.g., "change the property type" — this breaks existing form bindings)
- Multiple valid approaches exist (e.g., "add filtering" — client-side vs FetchXML vs WebAPI?)
- The image shows a redesign but it's unclear which parts to keep vs replace

### When NOT to Ask:
- Clear, specific request (e.g., "change the background to #ff0000")
- Bug fix with obvious solution
- Adding something that doesn't affect existing functionality
- User explicitly says "just do it" or describes exactly what they want

## Required Tools
- `read_file` — To read existing control code
- `replace_string_in_file` / `multi_replace_string_in_file` — To make targeted edits
- `grep_search` / `file_search` — To find relevant files
- `list_dir` — To understand project structure
- `run_in_terminal` — To install packages and build
- `view_image` — To analyze new design images (if provided)
- `vscode_askQuestions` — To clarify requirements

## Execution Steps

### Step 1: Locate and Understand the Existing Control

#### If continuing from a just-created control (Scenario A):
Skip the locate step — you already know the path and structure. Jump to reading only the files relevant to the change.

#### If working with a pre-existing control (Scenario B):
1. **Find the control:**
   ```bash
   Get-ChildItem "controls" -Directory | Select-Object Name
   ```
   If multiple controls exist and the user didn't specify which one, ask.

2. **Read the key files** to understand the current implementation:

1. **Read the manifest** — `ControlManifest.Input.xml`
   - Current properties (names, types, usage)
   - Resources declared
   - Feature usage
   - Control type (standard/virtual)

2. **Read index.ts** — Main control logic
   - Lifecycle method implementations
   - Current rendering approach
   - Event handlers
   - State management

3. **Read CSS** — Current styling
   - Class naming convention
   - Existing custom properties
   - Layout approach

4. **Read components/** (if React) — Component structure
   - Props interfaces
   - Component hierarchy
   - State management approach

### Step 2: Plan the Changes

Based on the user's request, determine what needs to change:

#### Adding a New Property
1. Add `<property>` element to manifest
2. Update `IInputs`/`IOutputs` references in code (types auto-regenerate on build)
3. Handle the new property in `updateView()`
4. If output property, return it in `getOutputs()`

#### Modifying Rendering Logic
1. Identify the rendering method(s) to change
2. Plan DOM changes (add/remove/modify elements)
3. Update event handlers if needed
4. Ensure `updateView()` handles the new rendering

#### Updating Styles
1. Identify CSS changes needed
2. Add new classes or modify existing rules
3. Ensure scoping is maintained
4. Check for responsive/RTL implications

#### Integrating a Library
1. Install the package: `npm install <package>`
2. Add any CSS/resource references to manifest if needed
3. Import and use in control code
4. Ensure bundle size is acceptable

#### Updating Design from Image
1. Analyze the new image with `view_image`
2. Compare with current control appearance
3. Identify specific CSS/HTML changes needed
4. Apply changes incrementally

### Step 3: Apply Changes

#### Manifest Changes

**Adding a bound property:**
```xml
<property name="newProperty" display-name-key="New_Property_Display"
          description-key="New property description"
          of-type="SingleLine.Text" usage="bound" required="false" />
```

**Adding an input (configuration) property:**
```xml
<property name="configProp" display-name-key="Config_Display"
          description-key="Configuration property"
          of-type="Whole.None" usage="input" required="false" default-value="10" />
```

**Adding a type group:**
```xml
<type-group name="valueTypes">
  <type>Whole.None</type>
  <type>Decimal</type>
  <type>Currency</type>
</type-group>
<property name="numericValue" display-name-key="Numeric_Value"
          of-type-group="valueTypes" usage="bound" required="true" />
```

**Adding feature usage:**
```xml
<feature-usage>
  <uses-feature name="WebAPI" required="true" />
  <uses-feature name="Utility" required="true" />
</feature-usage>
```

**Adding a resource file:**
```xml
<resources>
  <code path="index.ts" order="1"/>
  <css path="css/ControlName.css" order="1" />
  <resx path="strings/ControlName.1033.resx" order="1" />
</resources>
```

#### Code Changes

**Adding property handling in updateView:**
```typescript
public updateView(context: ComponentFramework.Context<IInputs>): void {
    this._context = context;

    // Check what changed
    if (context.updatedProperties.includes("newProperty")) {
        const newValue = context.parameters.newProperty.raw;
        // Handle the new property
        this._updateNewProperty(newValue);
    }
}
```

**Adding an event handler:**
```typescript
private _onButtonClick = (event: Event): void => {
    event.preventDefault();
    // Handle click
    this._value = "new value";
    this._notifyOutputChanged();
};

// In init or render method:
button.addEventListener("click", this._onButtonClick);

// In destroy:
button.removeEventListener("click", this._onButtonClick);
```

**Adding debounced input:**
```typescript
private _debounceTimer: number | null = null;

private _onInputChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    
    if (this._debounceTimer) {
        clearTimeout(this._debounceTimer);
    }
    
    this._debounceTimer = window.setTimeout(() => {
        this._value = target.value;
        this._notifyOutputChanged();
    }, 300);
};
```

**Adding WebAPI call:**
```typescript
private async _fetchData(): Promise<void> {
    try {
        const result = await this._context.webAPI.retrieveMultipleRecords(
            "account",
            "?$select=name,accountnumber&$top=10"
        );
        this._records = result.entities;
        this._renderControl();
    } catch (error) {
        console.error("WebAPI error:", error);
        this._renderError("Failed to load data");
    }
}
```

### Step 4: Update from Image (if applicable)

When the user provides a new design image:

1. **Analyze the new image** — Extract colors, layout, spacing, new elements
2. **Compare with current** — Identify what's different
3. **Plan minimal changes** — Don't rewrite everything; modify what's needed
4. **Apply CSS changes** — Update colors, spacing, layout properties
5. **Apply HTML changes** — Add/remove/reorder DOM elements
6. **Update event handlers** — If new interactive elements were added

**Example workflow:**
```
Current control: Simple text input with border
New image shows: Text input with icon prefix, rounded corners, shadow on focus

Changes needed:
1. CSS: Add border-radius, box-shadow on :focus
2. HTML: Wrap input in container, add icon span before input
3. CSS: Add flexbox layout for icon + input alignment
```

### Step 5: Rebuild and Verify

After making changes:

```bash
# Rebuild to regenerate types and verify no errors
npm run build
```

If the build fails:
1. Check for TypeScript errors (property name mismatches, type errors)
2. Verify manifest property names match code references
3. Ensure all imports are correct
4. Fix any CSS path issues

### Step 6: Offer Preview (MANDATORY after successful build)

After a successful build, use `vscode_askQuestions` to offer preview:

```
Question: "Would you like to preview the updated control in the test harness?"
Message: "I'll run `npm start watch` in `controls/<controlName>/` — this opens at http://localhost:8181."
Options:
  - "Yes, start preview" (recommended)
  - "No, skip preview"
```

**If "Yes, start preview":**
1. Run `npm start watch` using `run_in_terminal` with `mode=async`
2. Store the terminal ID for later cleanup
3. Tell user: "Preview server is running at http://localhost:8181."
4. When user comes back, ask via `vscode_askQuestions`:
   ```
   Question: "Would you like to stop the preview server?"
   Options:
     - "Stop preview" (recommended)
     - "Keep it running"
   ```
5. If "Stop preview" → kill terminal with `kill_terminal`, then proceed to Step 7
6. If "Keep it running" → proceed to Step 7

**If "No, skip preview":** Proceed to Step 7.

### Step 7: Offer Deployment (MANDATORY)

Use `vscode_askQuestions`:
```
Question: "Would you like to deploy the updated control to your Power Platform environment?"
Options:
  - "Yes, deploy now"
  - "No, maybe later"
```

**If "Yes, deploy now":** Ask for environment URL and publisher prefix, then invoke `deploy-pcf` skill.
**If "No, maybe later":** End with: "You can deploy anytime later by saying *'Deploy <controlName>'*."

## Common Edit Patterns

### Adding Validation
```typescript
private _validate(value: string | null): string | null {
    if (!value) return null;
    if (value.length > this._maxLength) {
        return `Value exceeds maximum length of ${this._maxLength}`;
    }
    return null; // No error
}
```

### Adding Loading State
```typescript
private _renderLoading(): void {
    this._container.innerHTML = "";
    const spinner = document.createElement("div");
    spinner.classList.add("loading-spinner");
    spinner.setAttribute("role", "progressbar");
    spinner.setAttribute("aria-label", "Loading");
    this._container.appendChild(spinner);
}
```

### Adding Keyboard Navigation
```typescript
private _onKeyDown = (event: KeyboardEvent): void => {
    switch (event.key) {
        case "Enter":
            this._confirmSelection();
            break;
        case "Escape":
            this._cancelEdit();
            break;
        case "ArrowUp":
            event.preventDefault();
            this._moveFocus(-1);
            break;
        case "ArrowDown":
            event.preventDefault();
            this._moveFocus(1);
            break;
    }
};
```

### Adding Theming Support
```typescript
private _applyTheme(): void {
    const fluentDL = this._context.fluentDesignLanguage;
    if (fluentDL) {
        const tokens = fluentDL.tokenTheme;
        this._container.style.setProperty("--primary-color", tokens.colorBrandBackground);
        this._container.style.setProperty("--text-color", tokens.colorNeutralForeground1);
        this._container.style.setProperty("--border-color", tokens.colorNeutralStroke1);
    }
}
```

### Integrating a Third-Party Library

**Install:**
```bash
npm install chart.js
```

**Import and use:**
```typescript
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

private _createChart(): void {
    const canvas = document.createElement("canvas");
    this._container.appendChild(canvas);
    
    this._chart = new Chart(canvas, {
        type: "bar",
        data: { /* ... */ },
        options: { responsive: true, maintainAspectRatio: false }
    });
}
```

**Update manifest** (if CSS needed):
```xml
<resources>
  <code path="index.ts" order="1"/>
  <css path="css/ControlName.css" order="1" />
</resources>
```

## Edit Safety Rules

1. **Always read before editing** — Understand what exists before changing it
2. **Make targeted changes** — Don't rewrite working code
3. **Preserve existing behavior** — Unless explicitly asked to change it
4. **Update manifest and code together** — Keep them in sync
5. **Rebuild after changes** — Catch errors immediately
6. **Don't delete user customizations** — Ask before removing code
7. **Back up complex logic** — Suggest git commit before major refactors
