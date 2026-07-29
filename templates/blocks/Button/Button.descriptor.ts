import { BlockDescriptor } from "../../tools/generator/src/generator/blockDescriptor";

const descriptor: BlockDescriptor = {
    blockType: "Button",
    displayName: "Button",
    description: "Styled action button (primary, secondary, ghost, danger).",
    category: "input",
    componentFile: "Button.tsx",
    componentName: "Button",
    cssFile: "Button.css",
    manifestFragments: [],
    props: [
        { name: "label", label: "Label", type: "string", default: "Button" },
        { name: "variant", label: "Variant", type: "string", default: "primary", description: "primary | secondary | ghost | danger" },
        { name: "disabled", label: "Disabled", type: "boolean", default: false },
        { name: "type", label: "Type", type: "string", default: "button", description: "button | submit | reset" },
        { name: "fullWidth", label: "Full Width", type: "boolean", default: false },
        { name: "icon", label: "Icon (emoji/text)", type: "string", default: "" },
    ],
};

export default descriptor;
