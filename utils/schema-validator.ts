import { APIResponse } from "@playwright/test";
import Ajv, { ErrorObject } from "ajv";

export async function validateSchema(
  response: APIResponse,
  schema: object,
): Promise<void> {
  const body = await response.json();
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
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
