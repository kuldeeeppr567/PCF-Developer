# Field Control Template

Use this template for PCF controls that bind to a single data field (text, number, date, etc.).

## ControlManifest.Input.xml

```xml
<?xml version="1.0" encoding="utf-8" ?>
<manifest>
  <control namespace="{{NAMESPACE}}" constructor="{{CONTROL_NAME}}" version="0.0.1"
           display-name-key="{{CONTROL_NAME}}" description-key="{{DESCRIPTION}}"
           control-type="standard">

    <!-- Primary bound property -->
    <property name="value" display-name-key="Value"
              description-key="The bound field value"
              of-type="{{PROPERTY_TYPE}}" usage="bound" required="true" />

    <!-- Optional configuration properties -->
    <!--
    <property name="placeholder" display-name-key="Placeholder"
              description-key="Placeholder text when empty"
              of-type="SingleLine.Text" usage="input" required="false" />
    -->

    <resources>
      <code path="index.ts" order="1"/>
      <css path="css/{{CONTROL_NAME}}.css" order="1" />
    </resources>
  </control>
</manifest>
```

## index.ts

```typescript
import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class {{CONTROL_NAME}} implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _notifyOutputChanged: () => void;
    private _value: string | null;

    // DOM elements
    private _controlRoot: HTMLDivElement;
    private _input: HTMLInputElement;

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this._context = context;
        this._container = container;
        this._notifyOutputChanged = notifyOutputChanged;

        // Build DOM
        this._controlRoot = document.createElement("div");
        this._controlRoot.classList.add("{{CONTROL_NAME_LOWER}}-container");

        this._input = document.createElement("input");
        this._input.type = "text";
        this._input.classList.add("{{CONTROL_NAME_LOWER}}-input");
        this._input.setAttribute("aria-label", "{{CONTROL_NAME}}");
        this._input.addEventListener("input", this._onInputChange);
        this._input.addEventListener("blur", this._onBlur);

        this._controlRoot.appendChild(this._input);
        this._container.appendChild(this._controlRoot);

        // Set initial value
        this._updateValue(context.parameters.value.raw);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._context = context;

        // Only update if the value property changed (not from our own output)
        if (context.updatedProperties.includes("value")) {
            this._updateValue(context.parameters.value.raw);
        }

        // Handle disabled state
        this._input.disabled = context.mode.isControlDisabled;
        this._controlRoot.classList.toggle("disabled", context.mode.isControlDisabled);
    }

    public getOutputs(): IOutputs {
        return {
            value: this._value ?? undefined
        };
    }

    public destroy(): void {
        this._input.removeEventListener("input", this._onInputChange);
        this._input.removeEventListener("blur", this._onBlur);
    }

    private _updateValue(newValue: string | null): void {
        this._value = newValue;
        this._input.value = newValue ?? "";
    }

    private _onInputChange = (event: Event): void => {
        const target = event.target as HTMLInputElement;
        this._value = target.value || null;
    };

    private _onBlur = (): void => {
        this._notifyOutputChanged();
    };
}
```

## css/{{CONTROL_NAME}}.css

```css
.{{CONTROL_NAME_LOWER}}-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    box-sizing: border-box;
}

.{{CONTROL_NAME_LOWER}}-input {
    width: 100%;
    padding: 6px 12px;
    font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #323130;
    background-color: #ffffff;
    border: 1px solid #8a8886;
    border-radius: 2px;
    outline: none;
    transition: border-color 0.1s ease;
    box-sizing: border-box;
}

.{{CONTROL_NAME_LOWER}}-input:hover:not(:disabled) {
    border-color: #323130;
}

.{{CONTROL_NAME_LOWER}}-input:focus {
    border-color: #0078d4;
    border-bottom-width: 2px;
    padding-bottom: 5px;
}

.{{CONTROL_NAME_LOWER}}-input:disabled {
    background-color: #f3f2f1;
    border-color: #c8c6c4;
    color: #a19f9d;
    cursor: not-allowed;
}

.{{CONTROL_NAME_LOWER}}-container.disabled {
    opacity: 0.6;
}
```
