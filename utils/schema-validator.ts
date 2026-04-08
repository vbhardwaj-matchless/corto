import { APIResponse } from "@playwright/test";
import Ajv, { ErrorObject, SchemaObject } from "ajv";
import addFormats from "ajv-formats";
import { ZodType, ZodIssue } from "zod";

// Module-level instance — avoids re-compiling the AJV engine on every call.
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

/**
 * Validate an API response against either:
 *  - a Zod schema  (preferred — single source of truth, typed)
 *  - a plain JSON Schema object  (legacy — kept for backward-compat)
 */
export async function validateSchema(
  response: APIResponse,
  schema: ZodType | object,
): Promise<void> {
  const body = await response.json();

  // Zod path
  if (schema instanceof ZodType) {
    const result = schema.safeParse(body);
    if (!result.success) {
      const errorMsgs = result.error.issues
        .map((e: ZodIssue) => `Field: /${e.path.join("/")} | ${e.message}`)
        .join("\n");
      throw new Error(`Schema validation failed:\n${errorMsgs}`);
    }
    return;
  }

  // Legacy AJV path — plain JSON Schema objects
  const validate = ajv.compile(schema as SchemaObject);
  const valid = validate(body);
  if (!valid && validate.errors) {
    const errorMsgs = validate.errors
      .map(
        (e: ErrorObject) =>
          `Field: ${e.instancePath || "/"} | Expected: ${e.message} | Value: ${JSON.stringify(e.data)}`,
      )
      .join("\n");
    throw new Error(`Schema validation failed:\n${errorMsgs}`);
  }
}
