import { Type, validator } from "@openmrs/esm-framework";

/**
 * This is the config schema.
 *
 */

export const configSchema = {
  formCategories: {
    _type: Type.Array,
    _description:
      "Organize forms into categories. A form can belong to multiple categories.",
    _elements: {
      categoryName: {
        _type: Type.String,
        _description: "Category name",
      },
      forms: {
        _type: Type.Array,
        _description: "List of forms for this category.",
        _elements: {
          formUUID: {
            _type: Type.UUID,
            _description: "UUID of form",
          },
          name: {
            _type: Type.String,
            _description: "Name of form",
          },
        },
      },
    },
    _default: [
      {
        categoryName: "ICRC Forms",
        forms: [
          {
            formUUID: "0cefb866-110c-4f16-af58-560932a1db1f",
            name: "Adult Triage",
          },
        ],
      },
      {
        categoryName: "Distress Scales",
        forms: [
          {
            formUUID: "9f26aad4-244a-46ca-be49-1196df1a8c9a",
            name: "POC Sample Form 1",
          },
        ],
      },
    ],
  },
};

export type Form = {
  formUUID: Type.UUID;
  name: Type.String;
};

export type FormList = {
  categoryName: String;
  forms: Array<Form>;
};

export type Config = {
  formCategories: Array<FormList>;
};
