# PCF Development - Global Copilot Instructions

## Overview

This workspace is configured for Power Apps Component Framework (PCF) control development. All code generation, editing, and deployment should follow PCF best practices and conventions.

## PCF Fundamentals

### Control Types
- **Field Controls** (`ControlType: Standard`) — Bind to a single data field (text, number, date, option set, etc.)
- **Dataset Controls** (`ControlType: DataSet`) — Bind to a view/grid of records with columns and rows
- **React Controls** — Use `platform-library` with `ReactControl<IInputs, IOutputs>` base class and virtual controls for better performance

### Project Structure
```
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
