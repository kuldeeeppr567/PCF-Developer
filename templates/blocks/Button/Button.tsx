import * as React from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps {
    label?: string;
    variant?: ButtonVariant;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    fullWidth?: boolean;
    icon?: string;
    className?: string;
    onClick?: () => void;
}

/**
 * Button — styled action button. XSS-safe: label via textContent, no innerHTML.
 */
export const Button: React.FC<ButtonProps> = React.memo(({
    label = "Button",
    variant = "primary",
    disabled = false,
    type = "button",
    fullWidth = false,
    icon,
    className = "",
    onClick,
}) => {
    return (
        <button
            type={type}
            disabled={disabled}
            className={`pcf-block-button pcf-block-button--${variant}${fullWidth ? " pcf-block-button--full-width" : ""}${className ? ` ${className}` : ""}`}
            onClick={onClick}
            aria-label={label}
        >
            {icon && <span className="pcf-block-button__icon" aria-hidden="true">{icon}</span>}
            <span className="pcf-block-button__label">{label}</span>
        </button>
    );
});

Button.displayName = "Button";
