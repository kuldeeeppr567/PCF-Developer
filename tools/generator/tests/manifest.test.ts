/**
 * Tests for manifest merging — the most critical part of the generator.
 * Covers: deduplication, hard conflicts (ofType mismatch, usage mismatch),
 * soft conflicts (required mismatch), XML building, and dataset manifests.
 */

import { mergeManifestFragments, buildManifestXml } from "../src/generator/manifest";
import { ManifestProperty, ControlSpec } from "../src/schema/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeProp(overrides: Partial<ManifestProperty> & Pick<ManifestProperty, "name">): ManifestProperty {
    return {
        ofType: "SingleLine.Text",
        usage: "input",
        required: false,
        ...overrides,
    };
}

// ---------------------------------------------------------------------------
// mergeManifestFragments
// ---------------------------------------------------------------------------

describe("mergeManifestFragments — empty input", () => {
    it("returns empty properties with no errors or warnings", () => {
        const result = mergeManifestFragments([]);
        expect(result.properties).toHaveLength(0);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });
});

describe("mergeManifestFragments — deduplication", () => {
    it("keeps a single property when there are no duplicates", () => {
        const result = mergeManifestFragments([makeProp({ name: "label" })]);
        expect(result.properties).toHaveLength(1);
        expect(result.errors).toHaveLength(0);
    });

    it("deduplicates exact copies silently", () => {
        const p = makeProp({ name: "label", ofType: "SingleLine.Text", usage: "input", required: false });
        const result = mergeManifestFragments([p, { ...p }, { ...p }]);
        expect(result.properties).toHaveLength(1);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("keeps multiple distinct properties", () => {
        const result = mergeManifestFragments([
            makeProp({ name: "label" }),
            makeProp({ name: "placeholder" }),
            makeProp({ name: "maxLength", ofType: "Whole.None" }),
        ]);
        expect(result.properties).toHaveLength(3);
        expect(result.errors).toHaveLength(0);
    });
});

describe("mergeManifestFragments — hard conflicts", () => {
    it("errors on same name with different ofType", () => {
        const result = mergeManifestFragments([
            makeProp({ name: "value", ofType: "SingleLine.Text", usage: "bound" }),
            makeProp({ name: "value", ofType: "Whole.None", usage: "bound" }),
        ]);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain("value");
        expect(result.errors[0]).toContain("ofType");
        // The conflicting duplicate should not appear in merged properties
        expect(result.properties).toHaveLength(1);
    });

    it("errors on same name with different usage (bound vs input)", () => {
        const result = mergeManifestFragments([
            makeProp({ name: "score", ofType: "Whole.None", usage: "bound" }),
            makeProp({ name: "score", ofType: "Whole.None", usage: "input" }),
        ]);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain("score");
        expect(result.errors[0]).toContain("usage");
    });

    it("accumulates multiple independent hard conflicts", () => {
        const result = mergeManifestFragments([
            makeProp({ name: "a", ofType: "SingleLine.Text", usage: "bound" }),
            makeProp({ name: "a", ofType: "Whole.None", usage: "bound" }),
            makeProp({ name: "b", ofType: "SingleLine.Text", usage: "bound" }),
            makeProp({ name: "b", ofType: "SingleLine.Text", usage: "input" }),
        ]);
        expect(result.errors).toHaveLength(2);
    });
});

describe("mergeManifestFragments — soft conflicts (required mismatch)", () => {
    it("warns and uses required=false when same name+type+usage differ on required", () => {
        const result = mergeManifestFragments([
            makeProp({ name: "label", ofType: "SingleLine.Text", usage: "input", required: true }),
            makeProp({ name: "label", ofType: "SingleLine.Text", usage: "input", required: false }),
        ]);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]).toContain("label");
        expect(result.properties).toHaveLength(1);
        expect(result.properties[0].required).toBe(false);
    });
});

describe("mergeManifestFragments — mixed blocks", () => {
    it("merges fragments from 3 different blocks correctly", () => {
        // Rating block: { name: "rating", ofType: "Whole.None", usage: "bound" }
        // Label block: no fragments
        // Toggle block: no fragments
        // But suppose two blocks each add a "disabled" input property
        const ratingFrag = makeProp({ name: "rating", ofType: "Whole.None", usage: "bound", required: true });
        const disabled1 = makeProp({ name: "disabled", ofType: "TwoOptions", usage: "input", required: false });
        const disabled2 = makeProp({ name: "disabled", ofType: "TwoOptions", usage: "input", required: false });

        const result = mergeManifestFragments([ratingFrag, disabled1, disabled2]);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
        expect(result.properties).toHaveLength(2);
        expect(result.properties.map((p) => p.name).sort()).toEqual(["disabled", "rating"]);
    });
});

// ---------------------------------------------------------------------------
// buildManifestXml
// ---------------------------------------------------------------------------

const fieldSpec: ControlSpec = {
    name: "RatingWidget",
    namespace: "MyCompany",
    version: "0.0.1",
    description: "Rating widget",
    controlType: "field",
    field: { propertyName: "value", ofType: "Whole.None", required: true },
    blocks: [{ id: "r1", blockType: "Rating" }],
};

const datasetSpec: ControlSpec = {
    name: "CustomerGrid",
    namespace: "MyCompany",
    version: "1.0.0",
    controlType: "dataset",
    dataset: {
        name: "dataSetGrid",
        displayName: "Customer Grid",
        columns: [
            { name: "fullName", displayName: "Full Name", ofType: "SingleLine.Text" },
            { name: "email", ofType: "SingleLine.Email" },
        ],
    },
    blocks: [{ id: "grid", blockType: "DataGrid" }],
};

describe("buildManifestXml — field control", () => {
    it("produces valid XML string", () => {
        const xml = buildManifestXml(fieldSpec, []);
        expect(xml).toContain('<?xml version="1.0" encoding="utf-8" ?>');
        expect(xml).toContain("<manifest>");
        expect(xml).toContain("</manifest>");
    });

    it("sets the correct namespace and constructor", () => {
        const xml = buildManifestXml(fieldSpec, []);
        expect(xml).toContain('namespace="MyCompany"');
        expect(xml).toContain('constructor="RatingWidget"');
    });

    it("includes the bound field property", () => {
        const xml = buildManifestXml(fieldSpec, []);
        expect(xml).toContain('name="value"');
        expect(xml).toContain('of-type="Whole.None"');
        expect(xml).toContain('usage="bound"');
    });

    it("includes merged block properties", () => {
        const props: ManifestProperty[] = [
            makeProp({ name: "maxRating", ofType: "Whole.None", usage: "input", required: false }),
        ];
        const xml = buildManifestXml(fieldSpec, props);
        expect(xml).toContain('name="maxRating"');
        expect(xml).toContain('of-type="Whole.None"');
        expect(xml).toContain('usage="input"');
    });

    it("does not include the bound property twice even if it's also in mergedProperties", () => {
        // The bound property 'value' appears both as the fieldConfig bound prop
        // and as a fragment. buildManifestXml should filter it from the block props section.
        const props: ManifestProperty[] = [
            makeProp({ name: "value", ofType: "Whole.None", usage: "bound", required: true }),
            makeProp({ name: "maxRating", ofType: "Whole.None", usage: "input" }),
        ];
        const xml = buildManifestXml(fieldSpec, props);
        // Count occurrences of 'name="value"'
        const matches = xml.match(/name="value"/g) ?? [];
        expect(matches).toHaveLength(1);
    });

    it("includes css resource reference", () => {
        const xml = buildManifestXml(fieldSpec, []);
        expect(xml).toContain("RatingWidget.css");
        expect(xml).toContain('path="index.ts"');
    });

    it("escapes XML special characters in description", () => {
        const spec: ControlSpec = { ...fieldSpec, description: 'Test & "special" <chars>' };
        const xml = buildManifestXml(spec, []);
        expect(xml).toContain("&amp;");
        expect(xml).toContain("&quot;");
        expect(xml).toContain("&lt;");
    });
});

describe("buildManifestXml — dataset control", () => {
    it("includes a <data-set> element with correct name", () => {
        const xml = buildManifestXml(datasetSpec, []);
        expect(xml).toContain("<data-set");
        expect(xml).toContain('name="dataSetGrid"');
        expect(xml).toContain("</data-set>");
    });

    it("includes column property-sets", () => {
        const xml = buildManifestXml(datasetSpec, []);
        expect(xml).toContain('<property-set name="fullName"');
        expect(xml).toContain('<property-set name="email"');
        expect(xml).toContain('of-type="SingleLine.Text"');
        expect(xml).toContain('of-type="SingleLine.Email"');
    });

    it("sets the correct version", () => {
        const xml = buildManifestXml(datasetSpec, []);
        expect(xml).toContain('version="1.0.0"');
    });
});
