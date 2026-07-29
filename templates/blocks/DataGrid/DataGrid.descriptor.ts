import { BlockDescriptor } from "../../tools/generator/src/generator/blockDescriptor";

const descriptor: BlockDescriptor = {
    blockType: "DataGrid",
    displayName: "Data Grid",
    description: "Tabular grid for displaying rows of data. Intended for use in dataset controls.",
    category: "data",
    componentFile: "DataGrid.tsx",
    componentName: "DataGrid",
    cssFile: "DataGrid.css",
    manifestFragments: [],
    props: [
        { name: "columns", label: "Columns", type: "string[]", default: [], description: "Array of { key, header, width? } column definitions." },
        { name: "rows", label: "Rows", type: "string[]", default: [], description: "Array of record objects." },
        { name: "emptyText", label: "Empty Text", type: "string", default: "No records to display." },
        { name: "striped", label: "Striped Rows", type: "boolean", default: true },
    ],
};

export default descriptor;
