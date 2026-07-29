import * as React from "react";

export interface TextInputProps {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    maxLength?: number;
    multiline?: boolean;
    label?: string;
    className?: string;
    onChange?: (value: string) => void;
}

/**
 * TextInput — single-line or multiline text input.
 * XSS-safe: uses React-controlled input; no innerHTML.
 */
export const TextInput: React.FC<TextInputProps> = React.memo(({
    value = "",
    placeholder = "",
    disabled = false,
    maxLength,
    multiline = false,
    label,
    className = "",
    onChange,
}) => {
    const [localValue, setLocalValue] = React.useState(value);
    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => { setLocalValue(value); }, [value]);

    React.useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

    const handleChange = React.useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const next = e.target.value;
        setLocalValue(next);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => onChange?.(next), 300);
    }, [onChange]);

    const inputId = React.useId();

    return (
        <div className={`pcf-block-textinput${className ? ` ${className}` : ""}`}>
            {label && <label htmlFor={inputId} className="pcf-block-textinput__label">{label}</label>}
            {multiline ? (
                <textarea
                    id={inputId}
                    className="pcf-block-textinput__textarea"
                    value={localValue}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={maxLength}
                    onChange={handleChange}
                    aria-label={label ?? "Text input"}
                />
            ) : (
                <input
                    id={inputId}
                    type="text"
                    className="pcf-block-textinput__input"
                    value={localValue}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={maxLength}
                    onChange={handleChange}
                    aria-label={label ?? "Text input"}
                />
            )}
        </div>
    );
});

TextInput.displayName = "TextInput";
