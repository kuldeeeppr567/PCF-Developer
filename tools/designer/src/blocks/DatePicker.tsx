import * as React from "react";

export interface DatePickerProps {
    value?: string;
    min?: string;
    max?: string;
    disabled?: boolean;
    label?: string;
    includeTime?: boolean;
    className?: string;
    onChange?: (value: string) => void;
}

/**
 * DatePicker — date or date-time input. XSS-safe: no innerHTML.
 * Value is an ISO date string: 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM'.
 */
export const DatePicker: React.FC<DatePickerProps> = React.memo(({
    value = "",
    min,
    max,
    disabled = false,
    label,
    includeTime = false,
    className = "",
    onChange,
}) => {
    const inputId = React.useId();

    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!disabled) onChange?.(e.target.value);
    }, [disabled, onChange]);

    return (
        <div className={`pcf-block-datepicker${className ? ` ${className}` : ""}`}>
            {label && (
                <label htmlFor={inputId} className="pcf-block-datepicker__label">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                type={includeTime ? "datetime-local" : "date"}
                className="pcf-block-datepicker__input"
                value={value}
                min={min}
                max={max}
                disabled={disabled}
                onChange={handleChange}
                aria-label={label ?? "Date picker"}
            />
        </div>
    );
});

DatePicker.displayName = "DatePicker";
