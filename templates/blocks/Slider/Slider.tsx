import * as React from "react";

export interface SliderProps {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    label?: string;
    showValue?: boolean;
    className?: string;
    onChange?: (value: number) => void;
}

/**
 * Slider — numeric range slider. XSS-safe: no innerHTML.
 */
export const Slider: React.FC<SliderProps> = React.memo(({
    value = 0,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    label,
    showValue = true,
    className = "",
    onChange,
}) => {
    const inputId = React.useId();

    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!disabled) onChange?.(Number(e.target.value));
    }, [disabled, onChange]);

    const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;

    return (
        <div className={`pcf-block-slider${className ? ` ${className}` : ""}`}>
            {label && (
                <label htmlFor={inputId} className="pcf-block-slider__label">
                    {label}
                </label>
            )}
            <div className="pcf-block-slider__row">
                <input
                    id={inputId}
                    type="range"
                    className="pcf-block-slider__input"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    disabled={disabled}
                    onChange={handleChange}
                    aria-label={label ?? "Slider"}
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={value}
                    style={{ "--slider-fill": `${percent}%` } as React.CSSProperties}
                />
                {showValue && (
                    <span className="pcf-block-slider__value" aria-live="polite">
                        {value}
                    </span>
                )}
            </div>
        </div>
    );
});

Slider.displayName = "Slider";
