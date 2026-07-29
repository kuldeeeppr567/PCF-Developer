import * as React from "react";

export interface DataGridColumn {
    key: string;
    header: string;
    width?: string;
}

export interface DataGridProps {
    columns?: DataGridColumn[];
    rows?: Array<Record<string, unknown>>;
    emptyText?: string;
    striped?: boolean;
    className?: string;
    onRowClick?: (row: Record<string, unknown>, index: number) => void;
}

/**
 * DataGrid — tabular data display. XSS-safe: all cell content via textContent
 * (React text nodes — no innerHTML).
 */
export const DataGrid: React.FC<DataGridProps> = React.memo(({
    columns = [],
    rows = [],
    emptyText = "No records to display.",
    striped = true,
    className = "",
    onRowClick,
}) => {
    return (
        <div className={`pcf-block-datagrid${className ? ` ${className}` : ""}`} role="region" aria-label="Data grid">
            <table className="pcf-block-datagrid__table" role="grid">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                scope="col"
                                className="pcf-block-datagrid__th"
                                style={col.width ? { width: col.width } : undefined}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length || 1}
                                className="pcf-block-datagrid__empty"
                            >
                                {emptyText}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, rowIdx) => (
                            <tr
                                key={rowIdx}
                                className={`pcf-block-datagrid__row${striped && rowIdx % 2 === 1 ? " pcf-block-datagrid__row--striped" : ""}${onRowClick ? " pcf-block-datagrid__row--clickable" : ""}`}
                                onClick={() => onRowClick?.(row, rowIdx)}
                                tabIndex={onRowClick ? 0 : undefined}
                                onKeyDown={(e) => {
                                    if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                                        e.preventDefault();
                                        onRowClick(row, rowIdx);
                                    }
                                }}
                                role={onRowClick ? "row" : undefined}
                                aria-label={onRowClick ? `Row ${rowIdx + 1}` : undefined}
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className="pcf-block-datagrid__td">
                                        {String(row[col.key] ?? "")}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
});

DataGrid.displayName = "DataGrid";
