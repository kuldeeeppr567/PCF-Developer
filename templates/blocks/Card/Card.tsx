import * as React from "react";

export interface CardProps {
    title?: string;
    subtitle?: string;
    /** Body text. XSS-safe: rendered via textContent (children). */
    body?: string;
    elevated?: boolean;
    borderRadius?: string;
    padding?: string;
    className?: string;
    children?: React.ReactNode;
}

/**
 * Card — container with optional header. XSS-safe: no innerHTML.
 */
export const Card: React.FC<CardProps> = React.memo(({
    title,
    subtitle,
    body,
    elevated = true,
    borderRadius = "4px",
    padding = "16px",
    className = "",
    children,
}) => {
    const style: React.CSSProperties = {
        borderRadius,
        padding,
        boxShadow: elevated ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
    };

    return (
        <div
            className={`pcf-block-card${elevated ? " pcf-block-card--elevated" : ""}${className ? ` ${className}` : ""}`}
            style={style}
        >
            {(title || subtitle) && (
                <div className="pcf-block-card__header">
                    {title && <h3 className="pcf-block-card__title">{title}</h3>}
                    {subtitle && <p className="pcf-block-card__subtitle">{subtitle}</p>}
                </div>
            )}
            {body && <p className="pcf-block-card__body">{body}</p>}
            {children && <div className="pcf-block-card__content">{children}</div>}
        </div>
    );
});

Card.displayName = "Card";
