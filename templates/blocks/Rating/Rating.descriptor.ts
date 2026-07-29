import { BlockDescriptor } from "../../tools/generator/src/generator/blockDescriptor";

const descriptor: BlockDescriptor = {
    blockType: "Rating",
    displayName: "Rating",
    description: "Clickable star rating (1–N stars). Keyboard accessible.",
    category: "input",
    componentFile: "Rating.tsx",
    componentName: "Rating",
    cssFile: "Rating.css",
    manifestFragments: [
        {
            name: "rating",
            displayName: "Rating Value",
            description: "Numeric rating value bound to a Whole.None field",
            ofType: "Whole.None",
            usage: "bound",
            required: true,
        },
    ],
    props: [
        { name: "value", label: "Value", type: "number", default: 0 },
        { name: "max", label: "Max Stars", type: "number", default: 5 },
        { name: "disabled", label: "Disabled", type: "boolean", default: false },
        { name: "label", label: "Label Text", type: "string", default: "" },
        { name: "size", label: "Size", type: "string", default: "medium", description: "small | medium | large" },
    ],
};

export default descriptor;
