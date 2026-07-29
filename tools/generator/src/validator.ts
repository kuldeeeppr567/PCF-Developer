/**
 * Spec validator — validates a raw JSON object against the JSON Schema
 * and returns actionable error messages.
 */

import Ajv, { ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import * as path from "path";
import * as fs from "fs";

// ---------------------------------------------------------------------------
// Load the schema
// ---------------------------------------------------------------------------

function loadSchema(): object {
    // When running from source (ts-jest), __dirname is 'src/'.
    // When running from compiled output, __dirname is 'dist/'.
    // The schema file lives at src/schema/spec.schema.json — try both paths.
    const candidates = [
        path.join(__dirname, "schema", "spec.schema.json"),       // running from src/
        path.join(__dirname, "..", "src", "schema", "spec.schema.json"), // running from dist/
    ];
    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            const raw = fs.readFileSync(candidate, "utf-8");
            return JSON.parse(raw) as object;
        }
    }
    throw new Error(`spec.schema.json not found. Searched:\n${candidates.join("\n")}`);
}

// ---------------------------------------------------------------------------
// Validator instance (singleton)
// ---------------------------------------------------------------------------

let _validate: ReturnType<Ajv["compile"]> | null = null;

function getValidator(): ReturnType<Ajv["compile"]> {
    if (!_validate) {
        const ajv = new Ajv({ allErrors: true, strict: false });
        addFormats(ajv);
        const schema = loadSchema();
        _validate = ajv.compile(schema);
    }
    return _validate;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

/** Formats an AJV error into a human-readable message. */
function formatError(err: ErrorObject): string {
    const path = err.instancePath ? `at "${err.instancePath}"` : "at root";
    const msg = err.message ?? "unknown error";
    const extra = err.params ? ` (${JSON.stringify(err.params)})` : "";
    return `${path}: ${msg}${extra}`;
}

/**
 * Validates a raw spec object against the JSON Schema.
 * Returns { valid: true } on success or { valid: false, errors: [...] } on failure.
 */
export function validateSpec(spec: unknown): ValidationResult {
    const validate = getValidator();
    const valid = validate(spec) as boolean;

    if (valid) {
        return { valid: true, errors: [] };
    }

    const errors = (validate.errors ?? []).map(formatError);
    return { valid: false, errors };
}
