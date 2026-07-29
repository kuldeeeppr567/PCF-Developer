import { BlockDescriptor } from "../../tools/generator/src/generator/blockDescriptor";

const descriptor: BlockDescriptor = {
    blockType: "DatePicker",
    displayName: "Date Picker",
    description: "Date or date-time input using native browser controls.",
    category: "input",
    componentFile: "DatePicker.tsx",
    componentName: "DatePicker",
    cssFile: "DatePicker.css",
    manifestFragments: [],
    props: [
        { name: "value", label: "Value", type: "string", default: "", description: "ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:MM)." },
        { name: "min", label: "Min Date", type: "string", default: "" },
        { name: "max", label: "Max Date", type: "string", default: "" },
        { name: "disabled", label: "Disabled", type: "boolean", default: false },
        { name: "label", label: "Label Text", type: "string", default: "" },
        { name: "includeTime", label: "Include Time", type: "boolean", default: false },
    ],
};

export default descriptor;
