/**
 * Tests for the spec validator (schema validation).
 */

import { validateSpec } from "../src/validator";

// Minimal valid field spec
const validFieldSpec = {
    name: "MyRatingControl",
    namespace: "MyCompany.Controls",
    version: "0.0.1",
    description: "A rating control",
    controlType: "field",
    field: { propertyName: "value", ofType: "Whole.None", required: true },
    blocks: [{ id: "ratingBlock", blockType: "Rating", props: { max: 5 } }],
};

// Minimal valid dataset spec
const validDatasetSpec = {
    name: "CustomerCards",
    namespace: "MyCompany.Controls",
    version: "0.0.1",
    controlType: "dataset",
    dataset: {
        name: "dataSetGrid",
        displayName: "Customer Grid",
        columns: [
            { name: "fullName", displayName: "Full Name", ofType: "SingleLine.Text" },
            { name: "email", displayName: "Email", ofType: "SingleLine.Email" },
        ],
    },
    blocks: [
        { id: "grid", blockType: "DataGrid", props: { striped: true } },
    ],
};

describe("validateSpec — valid specs", () => {
    it("accepts a valid field spec", () => {
        const result = validateSpec(validFieldSpec);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it("accepts a valid dataset spec", () => {
        const result = validateSpec(validDatasetSpec);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it("accepts a spec with optional targetTable", () => {
        const result = validateSpec({ ...validFieldSpec, targetTable: "account" });
        expect(result.valid).toBe(true);
    });

    it("accepts a spec with layout config", () => {
        const result = validateSpec({
            ...validFieldSpec,
            layout: { direction: "horizontal", gap: "12px", padding: "8px" },
        });
        expect(result.valid).toBe(true);
    });

    it("accepts a custom block with required fields", () => {
        const result = validateSpec({
            ...validFieldSpec,
            blocks: [
                {
                    id: "custom1",
                    blockType: "custom",
                    custom: {
                        componentPath: "./components/MyComp.tsx",
                        componentName: "MyComp",
                    },
                },
            ],
        });
        expect(result.valid).toBe(true);
    });
});

describe("validateSpec — required field errors", () => {
    it("rejects a spec missing 'name'", () => {
        const { name: _, ...spec } = validFieldSpec;
        const result = validateSpec(spec);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("name"))).toBe(true);
    });

    it("rejects a spec missing 'namespace'", () => {
        const { namespace: _, ...spec } = validFieldSpec;
        const result = validateSpec(spec);
        expect(result.valid).toBe(false);
    });

    it("rejects a spec missing 'controlType'", () => {
        const { controlType: _, ...spec } = validFieldSpec;
        const result = validateSpec(spec);
        expect(result.valid).toBe(false);
    });

    it("rejects a spec missing 'blocks'", () => {
        const { blocks: _, ...spec } = validFieldSpec;
        const result = validateSpec(spec);
        expect(result.valid).toBe(false);
    });

    it("rejects a spec with empty 'blocks' array", () => {
        const result = validateSpec({ ...validFieldSpec, blocks: [] });
        expect(result.valid).toBe(false);
    });
});

describe("validateSpec — controlType constraints", () => {
    it("rejects a field spec without 'field' config", () => {
        const { field: _, ...spec } = validFieldSpec;
        const result = validateSpec(spec);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.toLowerCase().includes("field"))).toBe(true);
    });

    it("rejects a dataset spec without 'dataset' config", () => {
        const { dataset: _, ...spec } = validDatasetSpec;
        const result = validateSpec(spec);
        expect(result.valid).toBe(false);
    });

    it("rejects an unknown controlType", () => {
        const result = validateSpec({ ...validFieldSpec, controlType: "grid" });
        expect(result.valid).toBe(false);
    });
});

describe("validateSpec — name pattern validation", () => {
    it("rejects a name starting with a digit", () => {
        const result = validateSpec({ ...validFieldSpec, name: "1Control" });
        expect(result.valid).toBe(false);
    });

    it("rejects a name with spaces", () => {
        const result = validateSpec({ ...validFieldSpec, name: "My Control" });
        expect(result.valid).toBe(false);
    });

    it("rejects a version that is not semver", () => {
        const result = validateSpec({ ...validFieldSpec, version: "v1.0" });
        expect(result.valid).toBe(false);
    });

    it("accepts a version with three parts", () => {
        const result = validateSpec({ ...validFieldSpec, version: "1.2.3" });
        expect(result.valid).toBe(true);
    });
});

describe("validateSpec — block validation", () => {
    it("rejects a block missing 'id'", () => {
        const result = validateSpec({
            ...validFieldSpec,
            blocks: [{ blockType: "Label" }],
        });
        expect(result.valid).toBe(false);
    });

    it("rejects a block missing 'blockType'", () => {
        const result = validateSpec({
            ...validFieldSpec,
            blocks: [{ id: "lbl1" }],
        });
        expect(result.valid).toBe(false);
    });

    it("rejects a 'custom' block without 'custom' config", () => {
        const result = validateSpec({
            ...validFieldSpec,
            blocks: [{ id: "c1", blockType: "custom" }],
        });
        expect(result.valid).toBe(false);
    });
});
