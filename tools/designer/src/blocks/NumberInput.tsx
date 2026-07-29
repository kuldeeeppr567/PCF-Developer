import * as React from "react";

export interface NumberInputProps {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    disabled?: boolean;
    label?: string;
    prefix?: string;
    suffix?: string;
    className?: string;
    onChange?: (value: number | null) => void;
}

/**
 * NumberInput — numeric input with optional prefix/suffix. XSS-safe: no innerHTML.
 */
export const NumberInput: React.FC<NumberInputProps> = React.memo(({
    value,
    min,
    max,
    step = 1,
    precision = 0,
    disabled = false,
    label,
    prefix,
    suffix,
    className = "",
    onChange,
}) => {
    const inputId = React.useId();
    const [localValue, setLocalValue] = React.useState<string>(value !== undefined ? String(value) : "");

    React.useEffect(() => {
        setLocalValue(value !== undefined ? String(value) : "");
    }, [value]);

    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setLocalValue(raw);
        const num = parseFloat(raw);
        if (!Number.isNaN(num)) {
            const clamped = min !== undefined && num < min ? min : max !== undefined && num > max ? max : num;
            const rounded = parseFloat(clamped.toFixed(precision));
            onChange?.(rounded);
        } else if (raw === "" || raw === "-") {
            onChange?.(null);
        }
    }, [disabled, min, max, precision, onChange]);

    return (
        <div className={`pcf-block-numberinput${className ? ` ${className}` : ""}`}>
            {label && (
                <label htmlFor={inputId} className="pcf-block-numberinput__label">
                    {label}
                </label>
            )}
            <div className="pcf-block-numberinput__row">
                {prefix && <span className="pcf-block-numberinput__prefix" aria-hidden="true">{prefix}</span>}
                <input
                    id={inputId}
                    type="number"
                    className="pcf-block-numberinput__input"
                    value={localValue}
                    min={min}
                    max={max}
                    step={step}
                    disabled={disabled}
                    onChange={handleChange}
                    aria-label={label ?? "Number input"}
                />
                {suffix && <span className="pcf-block-numberinput__suffix" aria-hidden="true">{suffix}</span>}
            </div>
        </div>
    );
});

NumberInput.displayName = "NumberInput";
