# React Virtual Control Template

Use this template for PCF controls that use React and the Fluent UI platform library for optimal performance in model-driven apps.

## ControlManifest.Input.xml

```xml
<?xml version="1.0" encoding="utf-8" ?>
<manifest>
  <control namespace="{{NAMESPACE}}" constructor="{{CONTROL_NAME}}" version="0.0.1"
           display-name-key="{{CONTROL_NAME}}" description-key="{{DESCRIPTION}}"
           control-type="virtual">

    <!-- Primary bound property -->
    <property name="value" display-name-key="Value"
              description-key="The bound field value"
              of-type="{{PROPERTY_TYPE}}" usage="bound" required="true" />

    <!-- Optional configuration properties -->
    <!--
    <property name="label" display-name-key="Label"
              description-key="Display label for the control"
              of-type="SingleLine.Text" usage="input" required="false" />
    <property name="maxValue" display-name-key="Max Value"
              description-key="Maximum allowed value"
              of-type="Whole.None" usage="input" required="false" default-value="100" />
    -->

    <resources>
      <code path="index.ts" order="1"/>
      <platform-library name="React" version="16.8.6" />
      <platform-library name="Fluent" version="9.46.2" />
    </resources>
  </control>
</manifest>
```

## index.ts

```typescript
import * as React from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { {{CONTROL_NAME}}App, I{{CONTROL_NAME}}AppProps } from "./components/App";

export class {{CONTROL_NAME}} implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private _notifyOutputChanged: () => void;
    private _currentValue: string | null;

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this._notifyOutputChanged = notifyOutputChanged;
        this._currentValue = context.parameters.value.raw;
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        const props: I{{CONTROL_NAME}}AppProps = {
            value: context.parameters.value.raw,
            isDisabled: context.mode.isControlDisabled,
            isVisible: context.mode.isVisible,
            onChange: this._handleChange,
        };

        return React.createElement({{CONTROL_NAME}}App, props);
    }

    public getOutputs(): IOutputs {
        return {
            value: this._currentValue ?? undefined
        };
    }

    public destroy(): void {
        // React cleanup is handled automatically by the platform
    }

    private _handleChange = (newValue: string | null): void => {
        if (this._currentValue !== newValue) {
            this._currentValue = newValue;
            this._notifyOutputChanged();
        }
    };
}
```

## components/App.tsx

```tsx
import * as React from "react";

export interface I{{CONTROL_NAME}}AppProps {
    value: string | null;
    isDisabled: boolean;
    isVisible: boolean;
    onChange: (newValue: string | null) => void;
}

export const {{CONTROL_NAME}}App: React.FC<I{{CONTROL_NAME}}AppProps> = React.memo((props) => {
    const { value, isDisabled, isVisible, onChange } = props;

    // Local state for immediate UI updates
    const [localValue, setLocalValue] = React.useState<string>(value ?? "");

    // Sync with external value changes
    React.useEffect(() => {
        setLocalValue(value ?? "");
    }, [value]);

    // Debounced change handler
    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setLocalValue(newValue);

        // Debounce the output notification
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            onChange(newValue || null);
        }, 300);
    }, [onChange]);

    // Cleanup debounce on unmount
    React.useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    if (!isVisible) {
        return null;
    }

    return (
        <div className="{{CONTROL_NAME_LOWER}}-app">
            <input
                className="{{CONTROL_NAME_LOWER}}-input"
                type="text"
                value={localValue}
                onChange={handleChange}
                disabled={isDisabled}
                aria-label="{{CONTROL_NAME}}"
                placeholder="Enter value..."
            />
        </div>
    );
});

{{CONTROL_NAME}}App.displayName = "{{CONTROL_NAME}}App";
```

## components/useControlTheme.ts (optional utility hook)

```typescript
import * as React from "react";

/**
 * Hook to access Fluent design language tokens from the PCF context.
 * Pass context.fluentDesignLanguage into your component props to use this.
 */
export interface IThemeTokens {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    disabledColor: string;
    fontSize: string;
    fontFamily: string;
    borderRadius: string;
}

export const DEFAULT_THEME: IThemeTokens = {
    primaryColor: "#0078d4",
    backgroundColor: "#ffffff",
    textColor: "#323130",
    borderColor: "#8a8886",
    disabledColor: "#a19f9d",
    fontSize: "14px",
    fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
    borderRadius: "4px",
};

export function useControlTheme(fluentDesignLanguage?: ComponentFramework.FluentDesignLanguage): IThemeTokens {
    return React.useMemo(() => {
        if (!fluentDesignLanguage) {
            return DEFAULT_THEME;
        }

        const tokens = fluentDesignLanguage.tokenTheme;
        return {
            primaryColor: tokens.colorBrandBackground || DEFAULT_THEME.primaryColor,
            backgroundColor: tokens.colorNeutralBackground1 || DEFAULT_THEME.backgroundColor,
            textColor: tokens.colorNeutralForeground1 || DEFAULT_THEME.textColor,
            borderColor: tokens.colorNeutralStroke1 || DEFAULT_THEME.borderColor,
            disabledColor: tokens.colorNeutralForegroundDisabled || DEFAULT_THEME.disabledColor,
            fontSize: DEFAULT_THEME.fontSize,
            fontFamily: DEFAULT_THEME.fontFamily,
            borderRadius: tokens.borderRadiusMedium || DEFAULT_THEME.borderRadius,
        };
    }, [fluentDesignLanguage]);
}
```

## Notes on React Virtual Controls

### Key Differences from Standard Controls
1. **No `container` parameter** — The platform manages the DOM; you return React elements
2. **`control-type="virtual"`** — Must be set in manifest
3. **Platform provides React** — Use `platform-library` instead of bundling React
4. **No direct DOM manipulation** — Use React patterns exclusively
5. **No CSS file in resources** — Use inline styles or CSS-in-JS (or include CSS via other means)

### Performance Best Practices
- Use `React.memo()` on all components to prevent unnecessary re-renders
- Use `React.useCallback()` for event handlers passed as props
- Use `React.useMemo()` for expensive computations
- Keep component tree shallow when possible
- Avoid creating new objects/arrays in render (causes re-renders)

### Fluent UI Integration
Since `platform-library name="Fluent"` is declared, you can use Fluent UI React v9 components:

```tsx
import { Button, Input, Spinner } from "@fluentui/react-components";

// Use directly in your component:
<Button appearance="primary" onClick={handleClick}>Submit</Button>
<Input value={value} onChange={handleChange} />
<Spinner label="Loading..." />
```

### State Management Pattern
```tsx
// For complex state, use useReducer:
interface ControlState {
    value: string;
    isEditing: boolean;
    error: string | null;
}

type ControlAction =
    | { type: "SET_VALUE"; payload: string }
    | { type: "START_EDIT" }
    | { type: "END_EDIT" }
    | { type: "SET_ERROR"; payload: string | null };

function controlReducer(state: ControlState, action: ControlAction): ControlState {
    switch (action.type) {
        case "SET_VALUE":
            return { ...state, value: action.payload, error: null };
        case "START_EDIT":
            return { ...state, isEditing: true };
        case "END_EDIT":
            return { ...state, isEditing: false };
        case "SET_ERROR":
            return { ...state, error: action.payload };
        default:
            return state;
    }
}
```
