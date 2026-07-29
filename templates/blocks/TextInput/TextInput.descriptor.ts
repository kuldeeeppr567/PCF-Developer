import { BlockDescriptor } from "../../tools/generator/src/generator/blockDescriptor";

const descriptor: BlockDescriptor = {
    blockType: "TextInput",
    displayName: "Text Input",
    description: "Single-line or multiline text input with debounced change notification.",
    category: "input",
    componentFile: "TextInput.tsx",
    componentName: "TextInput",
    cssFile: "TextInput.css",
    manifestFragments: [],
    props: [
        { name: "value", label: "Value", type: "string", default: "" },
        { name: "placeholder", label: "Placeholder", type: "string", default: "" },
        { name: "disabled", label: "Disabled", type: "boolean", default: false },
        { name: "maxLength", label: "Max Length", type: "number", default: undefined },
        { name: "multiline", label: "Multiline", type: "boolean", default: false, description: "Use a textarea instead of input." },
        { name: "label", label: "Label Text", type: "string", default: "" },
    ],
};

export default descriptor;
