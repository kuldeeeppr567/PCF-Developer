import * as React from "react";

export interface ToggleProps {
    value?: boolean;
    disabled?: boolean;
    label?: string;
    onText?: string;
    offText?: string;
    className?: string;
    onChange?: (value: boolean) => void;
}

/**
 * Toggle — accessible on/off toggle switch. XSS-safe: no innerHTML.
 */
export const Toggle: React.FC<ToggleProps> = React.memo(({
    value = false,
    disabled = false,
    label,
    onText = "On",
    offText = "Off",
    className = "",
    onChange,
}) => {
    const inputId = React.useId();

    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!disabled) onChange?.(e.target.checked);
    }, [disabled, onChange]);

    return (
        <div className={`pcf-block-toggle${className ? ` ${className}` : ""}`}>
            {label && (
                <label htmlFor={inputId} className="pcf-block-toggle__label">
                    {label}
                </label>
            )}
            <div className="pcf-block-toggle__control">
                <input
                    id={inputId}
                    type="checkbox"
                    role="switch"
                    className="pcf-block-toggle__input"
                    checked={value}
                    disabled={disabled}
                    onChange={handleChange}
                    aria-checked={value}
                    aria-label={label ?? (value ? onText : offText)}
                />
                <span
                    className={`pcf-block-toggle__track${value ? " pcf-block-toggle__track--on" : ""}`}
                    aria-hidden="true"
                >
                    <span className="pcf-block-toggle__thumb" />
                </span>
                <span className="pcf-block-toggle__state-text">
                    {value ? onText : offText}
                </span>
            </div>
        </div>
    );
});

Toggle.displayName = "Toggle";
