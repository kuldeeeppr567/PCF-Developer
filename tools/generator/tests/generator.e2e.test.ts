/**
 * End-to-end generator tests.
 * These tests run the full generator against real spec files and verify that
 * the expected output files are created with the correct content.
 */

import * as path from "path";
import * as fs from "fs-extra";
import * as os from "os";
import { generate } from "../src/generator/generator";

const BLOCKS_ROOT = path.resolve(__dirname, "..", "..", "..", "templates", "blocks");
const SPECS_DIR = path.resolve(__dirname, "e2e");

async function runGenerator(specFile: string, tmpDir: string) {
    const specPath = path.join(SPECS_DIR, specFile);
    const specJson = await fs.readJson(specPath);
    return generate(specJson, {
        outputRoot: tmpDir,
        blocksRoot: BLOCKS_ROOT,
        force: false,
        verbose: false,
    });
}

describe("E2E: field-control.spec.json (CustomerRating)", () => {
    let tmpDir: string;
    let result: Awaited<ReturnType<typeof runGenerator>>;

    beforeAll(async () => {
        tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "pcf-gen-test-"));
        result = await runGenerator("field-control.spec.json", tmpDir);
    });

    afterAll(async () => {
        await fs.remove(tmpDir);
    });

    it("generates successfully without errors", () => {
        expect(result.errors).toHaveLength(0);
        expect(result.success).toBe(true);
    });

    it("writes files to the expected output directory", () => {
        expect(result.outputDir).toContain("CustomerRating");
    });

    it("produces a ControlManifest.Input.xml", async () => {
        const manifestPath = path.join(result.outputDir, "CustomerRating", "ControlManifest.Input.xml");
        const exists = await fs.pathExists(manifestPath);
        expect(exists).toBe(true);
    });

    it("manifest contains the bound field property", async () => {
        const manifestPath = path.join(result.outputDir, "CustomerRating", "ControlManifest.Input.xml");
        const content = await fs.readFile(manifestPath, "utf-8");
        expect(content).toContain('name="value"');
        expect(content).toContain('of-type="Whole.None"');
        expect(content).toContain('usage="bound"');
    });

    it("manifest contains correct namespace and constructor", async () => {
        const manifestPath = path.join(result.outputDir, "CustomerRating", "ControlManifest.Input.xml");
        const content = await fs.readFile(manifestPath, "utf-8");
        expect(content).toContain('namespace="Contoso.Controls"');
        expect(content).toContain('constructor="CustomerRating"');
    });

    it("produces an index.ts with the control class", async () => {
        const indexPath = path.join(result.outputDir, "CustomerRating", "index.ts");
        const content = await fs.readFile(indexPath, "utf-8");
        expect(content).toContain("class CustomerRating");
        expect(content).toContain("implements ComponentFramework.StandardControl");
    });

    it("produces a package.json", async () => {
        const pkgPath = path.join(result.outputDir, "CustomerRating", "package.json");
        const pkg = await fs.readJson(pkgPath);
        expect(pkg.name).toBe("customerrating");
        expect(pkg.version).toBe("0.0.1");
    });

    it("produces a CSS file", async () => {
        const cssPath = path.join(result.outputDir, "CustomerRating", "css", "CustomerRating.css");
        const exists = await fs.pathExists(cssPath);
        expect(exists).toBe(true);
    });

    it("writes the sidecar control.spec.json for round-tripping", async () => {
        const specPath = path.join(result.outputDir, "CustomerRating", "control.spec.json");
        const spec = await fs.readJson(specPath);
        expect(spec.name).toBe("CustomerRating");
        expect(spec.controlType).toBe("field");
    });

    it("copies block component files for used blocks (Rating, Label, Button)", async () => {
        for (const blockType of ["Rating", "Label", "Button"]) {
            const compPath = path.join(
                result.outputDir,
                "CustomerRating",
                "components",
                blockType,
                `${blockType}.tsx`
            );
            expect(await fs.pathExists(compPath)).toBe(true);
        }
    });
});

describe("E2E: dataset-control.spec.json (ContactsDataset)", () => {
    let tmpDir: string;
    let result: Awaited<ReturnType<typeof runGenerator>>;

    beforeAll(async () => {
        tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "pcf-gen-test-"));
        result = await runGenerator("dataset-control.spec.json", tmpDir);
    });

    afterAll(async () => {
        await fs.remove(tmpDir);
    });

    it("generates successfully without errors", () => {
        expect(result.errors).toHaveLength(0);
        expect(result.success).toBe(true);
    });

    it("manifest contains a <data-set> element", async () => {
        const manifestPath = path.join(result.outputDir, "ContactsDataset", "ControlManifest.Input.xml");
        const content = await fs.readFile(manifestPath, "utf-8");
        expect(content).toContain("<data-set");
        expect(content).toContain('name="dataSetGrid"');
    });

    it("manifest includes column property-sets", async () => {
        const manifestPath = path.join(result.outputDir, "ContactsDataset", "ControlManifest.Input.xml");
        const content = await fs.readFile(manifestPath, "utf-8");
        expect(content).toContain('name="fullName"');
        expect(content).toContain('name="email"');
        expect(content).toContain('name="phone"');
    });

    it("manifest does not contain a 'bound' field property", async () => {
        const manifestPath = path.join(result.outputDir, "ContactsDataset", "ControlManifest.Input.xml");
        const content = await fs.readFile(manifestPath, "utf-8");
        expect(content).not.toContain('usage="bound"');
    });

    it("produces a sidecar spec with correct controlType", async () => {
        const specPath = path.join(result.outputDir, "ContactsDataset", "control.spec.json");
        const spec = await fs.readJson(specPath);
        expect(spec.controlType).toBe("dataset");
    });
});

describe("E2E: --force protection", () => {
    let tmpDir: string;

    beforeAll(async () => {
        tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "pcf-gen-force-test-"));
    });

    afterAll(async () => {
        await fs.remove(tmpDir);
    });

    it("fails without --force when output dir already exists", async () => {
        const specPath = path.join(SPECS_DIR, "field-control.spec.json");
        const specJson = await fs.readJson(specPath);

        // First generation
        const first = await generate(specJson, {
            outputRoot: tmpDir,
            blocksRoot: BLOCKS_ROOT,
            force: false,
            verbose: false,
        });
        expect(first.success).toBe(true);

        // Second generation without --force
        const second = await generate(specJson, {
            outputRoot: tmpDir,
            blocksRoot: BLOCKS_ROOT,
            force: false,
            verbose: false,
        });
        expect(second.success).toBe(false);
        expect(second.errors.some((e) => e.includes("already exists"))).toBe(true);
        expect(second.errors.some((e) => e.includes("--force"))).toBe(true);
    });

    it("succeeds with --force when output dir already exists", async () => {
        const specPath = path.join(SPECS_DIR, "field-control.spec.json");
        const specJson = await fs.readJson(specPath);

        // Use a fresh tmpDir for this test
        const forceTmp = await fs.mkdtemp(path.join(os.tmpdir(), "pcf-gen-force2-"));
        try {
            // First generation
            await generate(specJson, { outputRoot: forceTmp, blocksRoot: BLOCKS_ROOT, force: false, verbose: false });

            // Second with force
            const second = await generate(specJson, {
                outputRoot: forceTmp,
                blocksRoot: BLOCKS_ROOT,
                force: true,
                verbose: false,
            });
            expect(second.success).toBe(true);
        } finally {
            await fs.remove(forceTmp);
        }
    });
});
