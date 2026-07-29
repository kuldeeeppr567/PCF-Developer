import { BlockDescriptor } from "../../tools/generator/src/generator/blockDescriptor";

const descriptor: BlockDescriptor = {
    blockType: "Toggle",
    displayName: "Toggle",
    description: "Accessible on/off toggle switch.",
    category: "input",
    componentFile: "Toggle.tsx",
    componentName: "Toggle",
    cssFile: "Toggle.css",
    manifestFragments: [],
    props: [
        { name: "value", label: "Value", type: "boolean", default: false },
        { name: "disabled", label: "Disabled", type: "boolean", default: false },
        { name: "label", label: "Label Text", type: "string", default: "" },
        { name: "onText", label: "On Label", type: "string", default: "On" },
        { name: "offText", label: "Off Label", type: "string", default: "Off" },
    ],
};

export default descriptor;
