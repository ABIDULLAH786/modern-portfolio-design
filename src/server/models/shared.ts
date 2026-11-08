import { Schema, type SchemaDefinition, type SchemaOptions } from "mongoose";

/**
 * Builds a schema WITHOUT Mongoose's deep type inference (InferSchemaType on nested
 * schemas exhausts the TypeScript compiler). Document shapes are declared by hand in index.ts.
 */
export function makeSchema(def: Record<string, unknown>, opts?: SchemaOptions): Schema {
  return new Schema(def as SchemaDefinition, opts);
}

export const mediaRefSchema = makeSchema(
  {
    mediaId: { type: String, required: true },
    url: { type: String, required: true },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    alt: { type: String, default: "" },
    blurDataUrl: { type: String },
  },
  { _id: false },
);

export const themeSourceSchema = makeSchema(
  { kind: { type: String, enum: ["preset", "custom"], required: true }, id: { type: String, required: true } },
  { _id: false },
);

export const themeSchemaDef = {
  source: { type: themeSourceSchema, required: true },
  overrides: { type: Schema.Types.Mixed, default: {} },
  fontPair: { type: String, default: "sora" },
  radius: { type: Number, default: 18 },
  effect: { type: String, default: "starfield" },
  animations: { type: Boolean, default: true },
  visitorToggle: {
    enabled: { type: Boolean, default: false },
    darkSource: { type: themeSourceSchema },
    lightSource: { type: themeSourceSchema },
  },
};
