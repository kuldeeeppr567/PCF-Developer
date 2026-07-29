import { BlockDescriptor } from "../../tools/generator/src/generator/blockDescriptor";

const descriptor: BlockDescriptor = {
    blockType: "Label",
    displayName: "Label",
    description: "A simple text label. XSS-safe display only.",
    category: "display",
    componentFile: "Label.tsx",
    componentName: "Label",
    cssFile: "Label.css",
    manifestFragments: [],
    props: [
        { name: "text", label: "Text", type: "string", default: "Label", description: "The label text." },
        { name: "htmlFor", label: "For (HTML ID)", type: "string", default: "", description: "ID of the associated input element." },
        { name: "fontSize", label: "Font Size", type: "string", default: "14px" },
        { name: "fontWeight", label: "Font Weight", type: "string", default: "400" },
        { name: "color", label: "Color", type: "string", default: "#323130" },
    ],
};

export default descriptor;
