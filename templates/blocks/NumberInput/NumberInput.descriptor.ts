import { BlockDescriptor } from "../../tools/generator/src/generator/blockDescriptor";

const descriptor: BlockDescriptor = {
    blockType: "NumberInput",
    displayName: "Number Input",
    description: "Numeric input with optional min/max clamping, prefix, and suffix.",
    category: "input",
    componentFile: "NumberInput.tsx",
    componentName: "NumberInput",
    cssFile: "NumberInput.css",
    manifestFragments: [],
    props: [
        { name: "value", label: "Value", type: "number", default: undefined },
        { name: "min", label: "Min", type: "number", default: undefined },
        { name: "max", label: "Max", type: "number", default: undefined },
        { name: "step", label: "Step", type: "number", default: 1 },
        { name: "precision", label: "Decimal Precision", type: "number", default: 0 },
        { name: "disabled", label: "Disabled", type: "boolean", default: false },
        { name: "label", label: "Label Text", type: "string", default: "" },
        { name: "prefix", label: "Prefix", type: "string", default: "", description: "Text shown before the input (e.g. '$')." },
        { name: "suffix", label: "Suffix", type: "string", default: "", description: "Text shown after the input (e.g. 'kg')." },
    ],
};

export default descriptor;
