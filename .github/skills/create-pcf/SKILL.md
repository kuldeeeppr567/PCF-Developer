---
name: create-pcf
description: Scaffold a new PCF (Power Apps Component Framework) control project. Supports field controls, dataset controls, and React-based virtual controls. Generates manifest, index.ts, CSS, and all boilerplate files. USE FOR creating new PCF controls, initializing PCF projects, scaffolding components.
---

# Create PCF Control Skill

## Purpose
Scaffold a complete, working PCF control project from scratch. This skill handles the full initialization including `pac pcf init`, manifest configuration, index.ts boilerplate with lifecycle methods, CSS file setup, and dependency installation.

## When to Use
- User says "create a new PCF control", "scaffold a PCF", "init a PCF project"
- User names a control and wants it built from scratch
- User specifies a control type (field, dataset, React)

## Required Information

Before scaffolding, gather the following from the user (ask if not provided):

| Parameter | Description | Default |
|-----------|-------------|---------|
| `controlName` | PascalCase name for the control | (required) |
| `namespace` | Namespace for the control | `PCFControls` |
| `controlType` | `field`, `dataset`, or `react` | `field` |
| `boundPropertyType` | For field controls: the data type to bind to | `SingleLine.Text` |
| `description` | Short description of the control | `A custom PCF control` |
| `publisherPrefix` | Publisher prefix for deployment | `custom` |

## Execution Steps

### Step 0: Verify Prerequisites

Before creating any control, check that shared dependencies are installed:

```bash
cd <repo-root>
if (Test-Path "node_modules/pcf-scripts") { "Dependencies OK" } else { npm install }
```

If `node_modules/pcf-scripts` does NOT exist, run `npm install` from the repo root first. This ensures the shared workspace packages are available before scaffolding begins.

Also verify `pac` CLI is available:
```bash
pac --version
```
If `pac` is not found, install it: `dotnet tool install --global Microsoft.PowerApps.CLI.Tool`

### Step 1: Create Project Directory Inside `controls/` Workspace

This repo uses **npm workspaces** — all controls go in the `controls/` folder and share a single `node_modules/` at the repo root. This means dependencies install only once, not per control.

```bash
cd controls
mkdir <controlName>
cd <controlName>
```

### Step 2: Initialize PCF Project

**For field controls:**
```bash
pac pcf init --namespace <namespace> --name <controlName> --template field
```

**For dataset controls:**
```bash
pac pcf init --namespace <namespace> --name <controlName> --template dataset
```

**For React-based controls:**
```bash
pac pcf init --namespace <namespace> --name <controlName> --template field --framework react
```

### Step 3: Install Dependencies (Shared Workspace)

Run from the **repository root** (not inside the control folder):
```bash
cd <repo-root>
npm install
```

This does two things:
1. Links the new control into the workspace and installs shared packages (fast if not the first control)
2. Automatically creates a **directory junction** from `controls/<controlName>/node_modules` → root `node_modules/` via the `postinstall` script

The junction is required because PCF tooling (`pcf-scripts`, `pcf-start`) expects `node_modules` to exist locally in the control folder. The junction is a zero-cost pointer — no disk duplication.

> **Important:** Do NOT run `npm install` inside the control folder. Always run it from the repo root.
> **Important:** Do NOT modify `tsconfig.json` paths — the junction makes the default `./node_modules/pcf-scripts/tsconfig_base.json` resolve correctly.

**Verify the junction was created:**
```bash
dir controls/<controlName>/node_modules
```
If it shows as a `<JUNCTION>` pointing to the root `node_modules`, you're good.

### Step 4: Configure the Manifest

Replace the generated `ControlManifest.Input.xml` with a properly configured manifest based on the control type.

**Field Control Manifest Template:**
```xml
<?xml version="1.0" encoding="utf-8" ?>
<manifest>
  <control namespace="{{namespace}}" constructor="{{controlName}}" version="0.0.1"
           display-name-key="{{controlName}}" description-key="{{description}}"
           control-type="standard">
    <property name="value" display-name-key="Value" description-key="The bound field value"
              of-type="{{boundPropertyType}}" usage="bound" required="true" />
    <resources>
      <code path="index.ts" order="1"/>
      <css path="css/{{controlName}}.css" order="1" />
    </resources>
  </control>
</manifest>
```

**Dataset Control Manifest Template:**
```xml
<?xml version="1.0" encoding="utf-8" ?>
<manifest>
  <control namespace="{{namespace}}" constructor="{{controlName}}" version="0.0.1"
           display-name-key="{{controlName}}" description-key="{{description}}"
           control-type="standard">
    <data-set name="dataSet" display-name-key="DataSet" description-key="The dataset to display">
    </data-set>
    <resources>
      <code path="index.ts" order="1"/>
      <css path="css/{{controlName}}.css" order="1" />
    </resources>
  </control>
</manifest>
```

**React Virtual Control Manifest Template:**
```xml
<?xml version="1.0" encoding="utf-8" ?>
<manifest>
  <control namespace="{{namespace}}" constructor="{{controlName}}" version="0.0.1"
           display-name-key="{{controlName}}" description-key="{{description}}"
           control-type="virtual">
    <property name="value" display-name-key="Value" description-key="The bound field value"
              of-type="{{boundPropertyType}}" usage="bound" required="true" />
    <resources>
      <code path="index.ts" order="1"/>
      <platform-library name="React" version="16.8.6" />
      <platform-library name="Fluent" version="9.46.2" />
    </resources>
  </control>
</manifest>
```

### Step 5: Generate index.ts

**Standard Field Control:**
```typescript
import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class {{controlName}} implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _notifyOutputChanged: () => void;
    private _value: string | null;

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this._context = context;
        this._container = container;
        this._notifyOutputChanged = notifyOutputChanged;

        // Create control DOM
        this._container.classList.add("{{controlName | lowercase}}-container");
        this._renderControl();
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._context = context;

        if (context.updatedProperties.includes("value")) {
            this._value = context.parameters.value.raw;
            this._renderControl();
        }
    }

    public getOutputs(): IOutputs {
        return {
            value: this._value ?? undefined
        };
    }

    public destroy(): void {
        // Cleanup event listeners
    }

    private _renderControl(): void {
        this._value = this._context.parameters.value.raw;
        // TODO: Implement control rendering
        this._container.textContent = this._value ?? "";
    }
}
```

**Standard Dataset Control:**
```typescript
import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class {{controlName}} implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _notifyOutputChanged: () => void;

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this._context = context;
        this._container = container;
        this._notifyOutputChanged = notifyOutputChanged;

        this._container.classList.add("{{controlName | lowercase}}-container");
        this._renderGrid();
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._context = context;

        if (context.updatedProperties.includes("dataset")) {
            this._renderGrid();
        }
    }

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        // Cleanup
    }

    private _renderGrid(): void {
        const dataset = this._context.parameters.dataSet;

        if (!dataset.loading) {
            this._container.innerHTML = "";

            const table = document.createElement("table");
            table.classList.add("{{controlName | lowercase}}-table");
            table.setAttribute("role", "grid");

            // Header row
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            dataset.columns.forEach(col => {
                const th = document.createElement("th");
                th.textContent = col.displayName;
                th.setAttribute("scope", "col");
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Data rows
            const tbody = document.createElement("tbody");
            dataset.sortedRecordIds.forEach(recordId => {
                const record = dataset.records[recordId];
                const row = document.createElement("tr");
                dataset.columns.forEach(col => {
                    const td = document.createElement("td");
                    td.textContent = record.getFormattedValue(col.name);
                    row.appendChild(td);
                });
                tbody.appendChild(row);
            });
            table.appendChild(tbody);

            this._container.appendChild(table);
        }
    }
}
```

**React Virtual Control:**
```typescript
import * as React from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { {{controlName}}App } from "./components/App";

export class {{controlName}} implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private _notifyOutputChanged: () => void;
    private _currentValue: string | null;

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this._notifyOutputChanged = notifyOutputChanged;
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        return React.createElement({{controlName}}App, {
            value: context.parameters.value.raw,
            isDisabled: context.mode.isControlDisabled,
            onChange: this._handleChange.bind(this)
        });
    }

    public getOutputs(): IOutputs {
        return {
            value: this._currentValue ?? undefined
        };
    }

    public destroy(): void {}

    private _handleChange(newValue: string | null): void {
        this._currentValue = newValue;
        this._notifyOutputChanged();
    }
}
```

### Step 6: Generate React Component (React controls only)

Create `components/App.tsx`:
```tsx
import * as React from "react";

export interface I{{controlName}}AppProps {
    value: string | null;
    isDisabled: boolean;
    onChange: (newValue: string | null) => void;
}

export const {{controlName}}App: React.FC<I{{controlName}}AppProps> = React.memo(({ value, isDisabled, onChange }) => {
    const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value || null);
    }, [onChange]);

    return (
        <div className="{{controlName | lowercase}}-app">
            {/* TODO: Implement control UI */}
            <input
                type="text"
                value={value ?? ""}
                onChange={handleChange}
                disabled={isDisabled}
                aria-label="{{controlName}}"
            />
        </div>
    );
});

{{controlName}}App.displayName = "{{controlName}}App";
```

### Step 7: Generate CSS

Create `css/{{controlName}}.css`:
```css
.{{controlName | lowercase}}-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
    font-size: 14px;
    box-sizing: border-box;
}

/* Add control-specific styles below */
```

### Step 8: Verify Build

Build from within the control folder:
```bash
cd controls/<controlName>
npm run build
```

## Output Confirmation

After scaffolding, confirm with the user:
- ✅ Project initialized at `controls/<controlName>/`
- ✅ Manifest configured with correct properties
- ✅ index.ts has full lifecycle implementation
- ✅ CSS file created with scoped styles
- ✅ Dependencies linked via workspace (shared `node_modules/`)
- ✅ Build succeeds

## Post-Creation Workflow

After a successful build, follow this exact sequence:

### Step 9: Show Control Information Document

Display a markdown summary to the user with:

```markdown
# <controlName> — PCF Control Summary

## What This Control Does
<One-paragraph description of the control's purpose and behavior>

## Control Type
| Property | Value |
|----------|-------|
| Type | Field / Dataset / React Virtual |
| Namespace | <namespace> |
| Bound Property | <boundPropertyType> (or Dataset) |
| Framework | Standard DOM / React + Fluent UI |

## How to Configure in Power Apps

### Option A: Deploy via VS Code (Recommended)
1. Open this workspace in VS Code
2. Select the **PCF Developer** agent in Copilot Chat
3. Say: *"Deploy <controlName> to my environment"*
4. Provide your environment URL and publisher prefix when asked

### Option B: Manual Import
1. **Build the solution package:**
   ```bash
   cd solutions
   mkdir <controlName>Solution
   cd <controlName>Solution
   pac solution init --publisher-name <PublisherName> --publisher-prefix <prefix>
   pac solution add-reference --path ../../controls/<controlName>
   dotnet build
   ```
2. **Find the solution zip:** `solutions/<controlName>Solution/bin/Debug/<controlName>Solution.zip`
3. **Import into Power Platform:**
   - Go to [make.powerapps.com](https://make.powerapps.com)
   - Navigate to **Solutions** → **Import solution**
   - Upload the `.zip` file and click **Import**
4. **Add to a form or page:**
   - Open the form editor for your table
   - Select the field → **Change control** → Choose `<controlName>`
   - Save and publish the form
```

### Step 10: Ask About Preview

After showing the information document, ask the user:

> **Would you like to preview the control in the test harness?**

- If **yes** → Run `npm start watch` inside `controls/<controlName>/` and inform the user the browser will open at `http://localhost:8181`
- If **no** → Proceed to Step 11

### Step 11: Ask About Deployment

If the user declined preview (or after preview is done), ask:

> **Would you like to deploy this control to a Power Platform environment?**

- If **yes** → Ask for:
  - **Environment URL** (e.g., `https://yourorg.crm.dynamics.com`)
  - **Publisher prefix** (e.g., `contoso`) — use the one from scaffolding if already provided
  Then invoke the `deploy-pcf` skill to handle authentication and deployment.
- If **no** → End the workflow. Inform the user they can deploy later by saying *"Deploy <controlName>"* in chat.

## Common Property Type Mappings

| Use Case | Property Type |
|----------|--------------|
| Text input | `SingleLine.Text` |
| Multi-line text | `Multiple` |
| Whole number | `Whole.None` |
| Decimal number | `Decimal` |
| Currency | `Currency` |
| Yes/No toggle | `TwoOptions` |
| Dropdown | `OptionSet` |
| Multi-select | `MultiSelectOptionSet` |
| Date picker | `DateAndTime.DateOnly` |
| Date + time | `DateAndTime.DateAndTime` |
| Email | `SingleLine.Email` |
| Phone | `SingleLine.Phone` |
| URL | `SingleLine.URL` |

## Additional Properties

If the user wants extra input/configuration properties beyond the bound value, add them to the manifest:
```xml
<property name="maxLength" display-name-key="Max Length" description-key="Maximum character length"
          of-type="Whole.None" usage="input" required="false" default-value="100" />
```

Access in code via `context.parameters.maxLength.raw`.
