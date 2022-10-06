import { Type } from "@openmrs/esm-framework";

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
      name: {
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
        name: "ICRC Forms",
        forms: [
          {
            formUUID: "0cefb866-110c-4f16-af58-560932a1db1f",
            name: "Adult Triage",
          },
        ],
      },
      {
        name: "Distress Scales",
        forms: [
          {
            formUUID: "9f26aad4-244a-46ca-be49-1196df1a8c9a",
            name: "POC Sample Form 1",
          },
        ],
      },
    ],
  },
  formCategoriesToShow: {
    _type: Type.Array,
    _description: "Forms to show by default on the forms app home page.",
    _elements: {
      _type: Type.String,
      _description: "Name of category",
    },
    _default: ["ICRC Forms", "Distress Scales"],
  },
  groupSessionConcepts: {
    _type: Type.Array,
    _description: "Concept UUIDs for group session meta data fields",
    _elements: {
      sessionName: {
        _type: Type.UUID,
        _description: "UUID of concept for Session Name",
      },
      sessionDate: {
        _type: Type.UUID,
        _description: "UUID of concept for Session Date",
      },
      practitionerName: {
        _type: Type.UUID,
        _description: "UUID of concept for Practitioner Name",
      },
      sessionNotes: {
        _type: Type.UUID,
        _description: "UUID of concept for Session Notes",
      },
    },
    _default: {
      sessionName: "e2559620-900b-4f66-ae41-0b9c4adfb654",
      sessionDate: "ceaca505-6dff-4940-8a43-8c060a0924d7",
      practitionerName: "f1a2d58c-1a0e-4148-931a-aac224649fdc",
      sessionNotes: "fa8fedc0-c066-4da3-8dc1-2ad8621fc480",
    },
  },
};

export type Form = {
  formUUID: Type.UUID;
  name: Type.String;
};

export type Category = {
  name: string;
  forms: Array<Form>;
};

export type Config = {
  formCategories: Array<Category>;
  formCategoriesToShow: Array<string>;
};
