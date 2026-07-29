import { BlockDescriptor } from "../../tools/generator/src/generator/blockDescriptor";

const descriptor: BlockDescriptor = {
    blockType: "Slider",
    displayName: "Slider",
    description: "Numeric range slider with optional value display.",
    category: "input",
    componentFile: "Slider.tsx",
    componentName: "Slider",
    cssFile: "Slider.css",
    manifestFragments: [],
    props: [
        { name: "value", label: "Value", type: "number", default: 0 },
        { name: "min", label: "Min", type: "number", default: 0 },
        { name: "max", label: "Max", type: "number", default: 100 },
        { name: "step", label: "Step", type: "number", default: 1 },
        { name: "disabled", label: "Disabled", type: "boolean", default: false },
        { name: "label", label: "Label Text", type: "string", default: "" },
        { name: "showValue", label: "Show Value", type: "boolean", default: true },
    ],
};

export default descriptor;
