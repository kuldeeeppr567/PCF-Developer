import { BlockDescriptor } from "../../tools/generator/src/generator/blockDescriptor";

const descriptor: BlockDescriptor = {
    blockType: "Card",
    displayName: "Card",
    description: "Content container with optional header (title + subtitle) and optional elevation shadow.",
    category: "layout",
    componentFile: "Card.tsx",
    componentName: "Card",
    cssFile: "Card.css",
    manifestFragments: [],
    props: [
        { name: "title", label: "Title", type: "string", default: "" },
        { name: "subtitle", label: "Subtitle", type: "string", default: "" },
        { name: "body", label: "Body Text", type: "string", default: "" },
        { name: "elevated", label: "Elevated", type: "boolean", default: true, description: "Show drop shadow." },
        { name: "borderRadius", label: "Border Radius", type: "string", default: "4px" },
        { name: "padding", label: "Padding", type: "string", default: "16px" },
    ],
};

export default descriptor;
