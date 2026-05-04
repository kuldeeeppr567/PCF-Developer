# Dataset Control Template

Use this template for PCF controls that bind to a dataset (view/grid of records with columns and rows).

## ControlManifest.Input.xml

```xml
<?xml version="1.0" encoding="utf-8" ?>
<manifest>
  <control namespace="{{NAMESPACE}}" constructor="{{CONTROL_NAME}}" version="0.0.1"
           display-name-key="{{CONTROL_NAME}}" description-key="{{DESCRIPTION}}"
           control-type="standard">

    <!-- Dataset binding -->
    <data-set name="dataSet" display-name-key="DataSet"
              description-key="The dataset to display">
    </data-set>

    <!-- Optional configuration properties -->
    <!--
    <property name="pageSize" display-name-key="Page Size"
              description-key="Number of records per page"
              of-type="Whole.None" usage="input" required="false" default-value="25" />
    -->

    <resources>
      <code path="index.ts" order="1"/>
      <css path="css/{{CONTROL_NAME}}.css" order="1" />
    </resources>
  </control>
</manifest>
```

## index.ts

```typescript
import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class {{CONTROL_NAME}} implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _notifyOutputChanged: () => void;

    // DOM elements
    private _controlRoot: HTMLDivElement;
    private _tableContainer: HTMLDivElement;
    private _paginationContainer: HTMLDivElement;

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this._context = context;
        this._container = container;
        this._notifyOutputChanged = notifyOutputChanged;

        // Build DOM structure
        this._controlRoot = document.createElement("div");
        this._controlRoot.classList.add("{{CONTROL_NAME_LOWER}}-container");

        this._tableContainer = document.createElement("div");
        this._tableContainer.classList.add("{{CONTROL_NAME_LOWER}}-table-wrapper");

        this._paginationContainer = document.createElement("div");
        this._paginationContainer.classList.add("{{CONTROL_NAME_LOWER}}-pagination");

        this._controlRoot.appendChild(this._tableContainer);
        this._controlRoot.appendChild(this._paginationContainer);
        this._container.appendChild(this._controlRoot);

        // Request initial page size
        context.parameters.dataSet.paging.setPageSize(25);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._context = context;
        const dataset = context.parameters.dataSet;

        if (!dataset.loading) {
            this._renderTable(dataset);
            this._renderPagination(dataset);
        } else {
            this._renderLoading();
        }
    }

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        // Cleanup
    }

    private _renderTable(dataset: ComponentFramework.PropertyTypes.DataSet): void {
        this._tableContainer.innerHTML = "";

        const table = document.createElement("table");
        table.classList.add("{{CONTROL_NAME_LOWER}}-table");
        table.setAttribute("role", "grid");
        table.setAttribute("aria-label", "Data Grid");

        // Header
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        dataset.columns
            .sort((a, b) => a.order - b.order)
            .forEach(column => {
                const th = document.createElement("th");
                th.textContent = column.displayName;
                th.setAttribute("scope", "col");
                th.classList.add("{{CONTROL_NAME_LOWER}}-header-cell");

                // Sortable columns
                if (column.dataType !== "MultiSelectPicklist") {
                    th.classList.add("sortable");
                    th.addEventListener("click", () => this._onColumnSort(column.name));
                    th.setAttribute("role", "columnheader");
                    th.setAttribute("aria-sort", "none");
                }

                headerRow.appendChild(th);
            });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Body
        const tbody = document.createElement("tbody");

        if (dataset.sortedRecordIds.length === 0) {
            const emptyRow = document.createElement("tr");
            const emptyCell = document.createElement("td");
            emptyCell.colSpan = dataset.columns.length;
            emptyCell.textContent = "No records found";
            emptyCell.classList.add("{{CONTROL_NAME_LOWER}}-empty");
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
        } else {
            dataset.sortedRecordIds.forEach(recordId => {
                const record = dataset.records[recordId];
                const row = document.createElement("tr");
                row.classList.add("{{CONTROL_NAME_LOWER}}-row");
                row.setAttribute("data-record-id", recordId);
                row.addEventListener("click", () => this._onRowClick(recordId));

                dataset.columns
                    .sort((a, b) => a.order - b.order)
                    .forEach(column => {
                        const td = document.createElement("td");
                        td.textContent = record.getFormattedValue(column.name);
                        td.classList.add("{{CONTROL_NAME_LOWER}}-cell");
                        row.appendChild(td);
                    });

                tbody.appendChild(row);
            });
        }

        table.appendChild(tbody);
        this._tableContainer.appendChild(table);
    }

    private _renderPagination(dataset: ComponentFramework.PropertyTypes.DataSet): void {
        this._paginationContainer.innerHTML = "";

        const paging = dataset.paging;

        if (paging.hasNextPage || paging.hasPreviousPage) {
            const prevButton = document.createElement("button");
            prevButton.textContent = "← Previous";
            prevButton.disabled = !paging.hasPreviousPage;
            prevButton.classList.add("{{CONTROL_NAME_LOWER}}-page-btn");
            prevButton.addEventListener("click", () => paging.loadPreviousPage());

            const pageInfo = document.createElement("span");
            pageInfo.classList.add("{{CONTROL_NAME_LOWER}}-page-info");
            pageInfo.textContent = `Page ${Math.ceil((paging.firstPageNumber || 1))} • ${dataset.sortedRecordIds.length} records`;

            const nextButton = document.createElement("button");
            nextButton.textContent = "Next →";
            nextButton.disabled = !paging.hasNextPage;
            nextButton.classList.add("{{CONTROL_NAME_LOWER}}-page-btn");
            nextButton.addEventListener("click", () => paging.loadNextPage());

            this._paginationContainer.appendChild(prevButton);
            this._paginationContainer.appendChild(pageInfo);
            this._paginationContainer.appendChild(nextButton);
        }
    }

    private _renderLoading(): void {
        this._tableContainer.innerHTML = "";
        const loading = document.createElement("div");
        loading.classList.add("{{CONTROL_NAME_LOWER}}-loading");
        loading.setAttribute("role", "progressbar");
        loading.setAttribute("aria-label", "Loading data");
        loading.textContent = "Loading...";
        this._tableContainer.appendChild(loading);
    }

    private _onColumnSort(columnName: string): void {
        const dataset = this._context.parameters.dataSet;
        const currentSort = dataset.sorting;
        const isCurrentlySorted = currentSort.length > 0 && currentSort[0].name === columnName;
        const newDirection = isCurrentlySorted && currentSort[0].sortDirection === 0 ? 1 : 0;

        while (dataset.sorting.length > 0) {
            dataset.sorting.pop();
        }
        dataset.sorting.push({ name: columnName, sortDirection: newDirection });
        dataset.refresh();
    }

    private _onRowClick(recordId: string): void {
        const dataset = this._context.parameters.dataSet;
        dataset.setSelectedRecordIds([recordId]);
        // Optionally open the record
        // const entityRef = dataset.records[recordId].getNamedReference();
        // this._context.navigation.openForm({ entityName: entityRef.entityType!, entityId: entityRef.id });
    }
}
```

## css/{{CONTROL_NAME}}.css

```css
.{{CONTROL_NAME_LOWER}}-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
    font-size: 14px;
    box-sizing: border-box;
    overflow: hidden;
}

.{{CONTROL_NAME_LOWER}}-table-wrapper {
    flex: 1;
    overflow: auto;
}

.{{CONTROL_NAME_LOWER}}-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: auto;
}

.{{CONTROL_NAME_LOWER}}-header-cell {
    padding: 10px 12px;
    text-align: start;
    font-weight: 600;
    color: #323130;
    background-color: #faf9f8;
    border-bottom: 2px solid #edebe9;
    white-space: nowrap;
    user-select: none;
}

.{{CONTROL_NAME_LOWER}}-header-cell.sortable {
    cursor: pointer;
}

.{{CONTROL_NAME_LOWER}}-header-cell.sortable:hover {
    background-color: #f3f2f1;
}

.{{CONTROL_NAME_LOWER}}-row {
    cursor: pointer;
    transition: background-color 0.1s ease;
}

.{{CONTROL_NAME_LOWER}}-row:hover {
    background-color: #f3f2f1;
}

.{{CONTROL_NAME_LOWER}}-row:nth-child(even) {
    background-color: #faf9f8;
}

.{{CONTROL_NAME_LOWER}}-row:nth-child(even):hover {
    background-color: #edebe9;
}

.{{CONTROL_NAME_LOWER}}-cell {
    padding: 8px 12px;
    border-bottom: 1px solid #edebe9;
    color: #323130;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
}

.{{CONTROL_NAME_LOWER}}-empty {
    padding: 24px;
    text-align: center;
    color: #605e5c;
    font-style: italic;
}

.{{CONTROL_NAME_LOWER}}-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 8px 12px;
    border-top: 1px solid #edebe9;
    background-color: #faf9f8;
}

.{{CONTROL_NAME_LOWER}}-page-btn {
    padding: 6px 12px;
    font-size: 13px;
    font-family: inherit;
    color: #0078d4;
    background: transparent;
    border: 1px solid #0078d4;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.1s ease;
}

.{{CONTROL_NAME_LOWER}}-page-btn:hover:not(:disabled) {
    background-color: #0078d4;
    color: #ffffff;
}

.{{CONTROL_NAME_LOWER}}-page-btn:disabled {
    color: #a19f9d;
    border-color: #c8c6c4;
    cursor: not-allowed;
}

.{{CONTROL_NAME_LOWER}}-page-info {
    font-size: 13px;
    color: #605e5c;
}

.{{CONTROL_NAME_LOWER}}-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: #605e5c;
    font-size: 14px;
}
```
