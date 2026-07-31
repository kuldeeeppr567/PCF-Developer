# PCF Development - Global Copilot Instructions

## Overview

This workspace is configured for Power Apps Component Framework (PCF) control development. All code generation, editing, deployment, and agent behavior should follow PCF best practices and conventions.

## PCF Fundamentals

### Control Types
- **Field Controls** (`ControlType: Standard`) — Bind to a single data field (text, number, date, option set, etc.)
- **Dataset Controls** (`ControlType: DataSet`) — Bind to a view/grid of records with columns and rows
- **React Controls** — Use `platform-library` with `ReactControl<IInputs, IOutputs>` base class and virtual controls for better performance

### Project Structure
```text
ControlName/
├── ControlName/
│   ├── ControlManifest.Input.xml    # Manifest defining properties, resources, features
│   ├── index.ts                      # Main control logic
│   ├── css/
│   │   └── ControlName.css          # Styling
│   ├── components/                   # React components (if React-based)
│   │   └── App.tsx
│   └── generated/
│       └── ManifestTypes.d.ts       # Auto-generated type definitions
├── package.json
├── tsconfig.json
├── pcfconfig.json
└── .eslintrc.json
```

### Manifest Structure (ControlManifest.Input.xml)
```xml
<?xml version="1.0" encoding="utf-8" ?>
<manifest>
  <control namespace="YourNamespace" constructor="ControlName" version="0.0.1"
           display-name-key="ControlName" description-key="ControlName description"
           control-type="standard|virtual">
    <!-- Properties -->
    <property name="propertyName" display-name-key="Property_Display"
              description-key="Property_Desc" of-type="SingleLine.Text"
              usage="bound|input" required="true|false" />

    <!-- Dataset (for dataset controls) -->
    <data-set name="dataSetGrid" display-name-key="DataSet">
      <property-set name="columnName" display-name-key="Column" of-type="SingleLine.Text" />
    </data-set>

    <!-- Type Groups -->
    <type-group name="numbers">
      <type>Whole.None</type>
      <type>Currency</type>
      <type>Decimal</type>
      <type>FP</type>
    </type-group>

    <!-- Resources -->
    <resources>
      <code path="index.ts" order="1"/>
      <css path="css/ControlName.css" order="1" />
      <platform-library name="React" version="16.8.6" />
      <platform-library name="Fluent" version="9.46.2" />
    </resources>

    <!-- Feature Usage -->
    <feature-usage>
      <uses-feature name="Device.captureImage" required="false" />
      <uses-feature name="Device.captureAudio" required="false" />
      <uses-feature name="Device.captureVideo" required="false" />
      <uses-feature name="Device.getBarcodeValue" required="false" />
      <uses-feature name="Device.getCurrentPosition" required="false" />
      <uses-feature name="Device.pickFile" required="false" />
      <uses-feature name="Utility" required="true" />
      <uses-feature name="WebAPI" required="true" />
    </feature-usage>
  </control>
</manifest>
```

### Property Types
- `SingleLine.Text`, `Multiple`, `SingleLine.Email`, `SingleLine.Phone`, `SingleLine.URL`
- `Whole.None`, `Currency`, `Decimal`, `FP`, `DateAndTime.DateOnly`, `DateAndTime.DateAndTime`
- `TwoOptions`, `OptionSet`, `MultiSelectOptionSet`
- `Lookup.Simple`

### Lifecycle Methods (Standard Control)
```typescript
export class ControlName implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _notifyOutputChanged: () => void;

    public init(context, notifyOutputChanged, state, container): void {
        // Initialize - runs once when control loads
        this._context = context;
        this._container = container;
        this._notifyOutputChanged = notifyOutputChanged;
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Called when any property changes - re-render UI
        this._context = context;
    }

    public getOutputs(): IOutputs {
        // Return current output values to the platform
        return {};
    }

    public destroy(): void {
        // Cleanup - remove event listeners, observers, etc.
    }
}
```

### Lifecycle Methods (React Virtual Control)
```typescript
export class ControlName implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private _notifyOutputChanged: () => void;

    public init(context, notifyOutputChanged, state): void {
        this._notifyOutputChanged = notifyOutputChanged;
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        return React.createElement(AppComponent, { context, onValueChanged: this._notifyOutputChanged });
    }

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {}
}
```

## Best Practices

### Performance
- Minimize DOM manipulation in `updateView()` — only update what changed
- Use `context.updatedProperties` to check what actually changed
- Debounce user input before calling `notifyOutputChanged()`
- For React controls, use `React.memo` and `useMemo` for expensive computations
- Prefer virtual controls (React) for better performance in model-driven apps

### Accessibility
- Always include `aria-label`, `aria-describedby` on interactive elements
- Support keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Use semantic HTML (`<button>`, `<input>`, not `<div onclick>`)
- Use `tabIndex = 0` for focusable elements (do NOT use `context.accessibility.assignedTabIndex` — it does not exist)
- Test with screen readers

### Styling
- Scope all CSS with a unique container class to avoid conflicts
- Use CSS custom properties for theming
- Respect the app's theme via `context.fluentDesignLanguage` (if available)
- Support RTL layouts with logical properties (`margin-inline-start` vs `margin-left`)
- Make controls responsive — use relative units, flexbox/grid

### Error Handling
- Validate inputs in `updateView()` before rendering
- Use try-catch around WebAPI calls
- Show user-friendly error states in the UI
- Log errors with `console.error` for debugging

### Security
- Sanitize any user input before rendering as HTML (prevent XSS)
- Never use `innerHTML` with unsanitized content — prefer `textContent` or DOM APIs
- Validate URLs before navigation
- Use CSP-compatible patterns

## CLI Commands Reference
```bash
# Initialize a new PCF project
pac pcf init --namespace YourNamespace --name ControlName --template field|dataset
pac pcf init --namespace YourNamespace --name ControlName --template field --framework react

# Install dependencies
npm install

# Build the control
npm run build

# Start test harness
npm start watch

# Push to environment (requires auth)
pac auth create --url https://yourorg.crm.dynamics.com
pac pcf push --publisher-prefix yourprefix

# Solution packaging
pac solution init --publisher-name YourPublisher --publisher-prefix yourprefix
pac solution add-reference --path ../ControlName
msbuild /t:build /restore
# or
dotnet build
```

## Coding Standards
- Use TypeScript strict mode
- Follow Microsoft naming conventions (PascalCase for classes/interfaces, camelCase for variables/methods)
- Prefix private members with underscore (`_container`, `_context`)
- Use `IInputs` and `IOutputs` generated types — never use `any` for context properties
- Keep `index.ts` focused on lifecycle — extract complex logic to separate modules
- Write clean, readable code with meaningful variable names

## Repository-Specific PCF Agent Guidance

These instructions are the repository-wide source of truth for PCF development in this repo. When working in this repository, follow the more specific guidance below in addition to the general PCF conventions above.

### Safety and Read-Only Behavior
- ALWAYS honor read-only: if `context.mode.isControlDisabled === true`, disable every input and hide/disable all action buttons (submit/save/modify/reset).
- Re-read `context.mode.isControlDisabled` in `updateView()` because it can change without a remount.
- Do not assume `statecode` needs special handling for read-only enforcement; the platform already disables controls appropriately.

### Manifest Versioning and Deployment
- Do NOT assume `npm run build` repacked the solution zip — it does not. Only `pac pcf push` does.
- Do NOT ship the same manifest version after a code change; bump the version so the browser and platform do not serve stale cached bundles.
- After a code change, ensure the manifest version is higher than the deployed one before pushing.
- Verify the live control version after deployment by checking the `customcontrols` record for the control and comparing `version` and `modifiedon`.

### MSB3231 Push Failures
- The first MSB3231 after a push can be a race on freshly written `obj` files.
- If push fails after packing completes, clean `obj`, `out`, and `bin`, shut down the dotnet build server, and retry the push.
- If the push keeps failing after pack completion, import the fresh zip directly from the `obj/PowerAppsToolsTemp_<prefix>/bin/Debug/` path and confirm it is newer than the bundled output.
- If a `PublishAll` is already in flight, finalize by calling `POST /api/data/v9.2/PublishAllXml`.

### Canvas Custom Page Hosting
- A canvas custom page embeds a snapshot of the control bundle at publish time.
- `pac pcf push` updates the `customcontrol` record, but it does not propagate into an already-published canvas page.
- Diagnose stale behavior by comparing the canvas app publish time with the control modification time.
- To refresh the hosted bundle, open the page in maker studio, accept any update prompt, then save and publish again.

### Dataverse Access
- Reads: use `context.webAPI.retrieveMultipleRecords()` and `retrieveRecord()`.
- Unbound Actions: use a hand-built `fetch` POST to `${clientUrl}/api/data/v9.2/<actionName>` with `credentials: "include"` and an explicit JSON body.
- Prefer Actions over Functions for Decimal/Money parameters when possible.
- Surface server errors by reading `response.text()` and parsing the returned error message.

### Grid Customizer Guidance
- Treat `cellRendererOverrides` and `cellEditorOverrides` as UI-only.
- Do not use custom editors to mutate data directly.
- If an editor should remain inline-editable, return `null` so the grid uses its internal editor.
- Use renderers, not editors, for side-effect events such as refresh notifications.
- Defer renderer side effects with `window.setTimeout(fn, 0)` and deduplicate by record id.
- Keep listeners idempotent and poll the server until the committed value is visible.

### CSS Zoom and Chart.js
- If an ancestor applies CSS `zoom`, disable native Chart.js events and drive tooltip behavior manually.
- Convert visible pixels to drawing pixels before selecting the nearest data point.

### TypeScript and React
- Tighten `React.useRef<Chart<...>>` generics to match the `ChartConfiguration`.
- Keep local option-value whitelists synchronized with the server option set.

### Output Expectations
When making PCF changes in this repository, clearly report:
- the edits made,
- the manifest version bumped to,
- the push/import command run,
- the live-version verification,
- and a reminder to hard-refresh and re-publish the canvas page if the host is a custom page.
