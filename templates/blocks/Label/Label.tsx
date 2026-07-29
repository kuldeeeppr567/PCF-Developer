import * as React from "react";

export interface LabelProps {
    text?: string;
    htmlFor?: string;
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    className?: string;
}

/**
 * Label — a simple text label. XSS-safe: uses textContent only (via children).
 */
export const Label: React.FC<LabelProps> = React.memo(({
    text = "",
    htmlFor,
    fontSize = "14px",
    fontWeight = "400",
    color = "#323130",
    className = "",
}) => {
    const style: React.CSSProperties = { fontSize, fontWeight: fontWeight as React.CSSProperties["fontWeight"], color };
    return (
        <label
            htmlFor={htmlFor}
            style={style}
            className={`pcf-block-label${className ? ` ${className}` : ""}`}
        >
            {text}
        </label>
    );
});

Label.displayName = "Label";
