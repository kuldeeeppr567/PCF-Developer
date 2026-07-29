import * as React from "react";

export interface RatingProps {
    value?: number;
    max?: number;
    disabled?: boolean;
    label?: string;
    size?: "small" | "medium" | "large";
    className?: string;
    onChange?: (value: number) => void;
}

/**
 * Rating — clickable star rating component. XSS-safe: no innerHTML.
 */
export const Rating: React.FC<RatingProps> = React.memo(({
    value = 0,
    max = 5,
    disabled = false,
    label,
    size = "medium",
    className = "",
    onChange,
}) => {
    const [hovered, setHovered] = React.useState<number>(0);
    const sizeMap = { small: "18px", medium: "24px", large: "32px" } as const;
    const starSize = sizeMap[size];

    const stars = Array.from({ length: max }, (_, i) => i + 1);

    const handleClick = React.useCallback((star: number) => {
        if (!disabled) onChange?.(star);
    }, [disabled, onChange]);

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent, star: number) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled) onChange?.(star);
        }
    }, [disabled, onChange]);

    const displayValue = hovered > 0 ? hovered : value;

    return (
        <div
            className={`pcf-block-rating pcf-block-rating--${size}${className ? ` ${className}` : ""}`}
            role="group"
            aria-label={label ?? "Rating"}
        >
            {label && <span className="pcf-block-rating__label">{label}</span>}
            <div className="pcf-block-rating__stars">
                {stars.map((star) => (
                    <span
                        key={star}
                        role="radio"
                        aria-checked={star === value}
                        aria-label={`${star} of ${max}`}
                        tabIndex={disabled ? -1 : 0}
                        className={`pcf-block-rating__star${star <= displayValue ? " pcf-block-rating__star--filled" : ""}${disabled ? " pcf-block-rating__star--disabled" : ""}`}
                        style={{ fontSize: starSize, cursor: disabled ? "not-allowed" : "pointer" }}
                        onClick={() => handleClick(star)}
                        onKeyDown={(e) => handleKeyDown(e, star)}
                        onMouseEnter={() => !disabled && setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                    >
                        {star <= displayValue ? "★" : "☆"}
                    </span>
                ))}
            </div>
        </div>
    );
});

Rating.displayName = "Rating";
