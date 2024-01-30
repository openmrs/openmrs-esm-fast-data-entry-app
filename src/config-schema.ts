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
    sessionName: {
      _type: Type.UUID,
      _description: "UUID of concept for Session Name",
      _default: "e2559620-900b-4f66-ae41-0b9c4adfb654",
    },
    sessionDate: {
      _type: Type.UUID,
      _description: "UUID of concept for Session Date",
      _default: "ceaca505-6dff-4940-8a43-8c060a0924d7",
    },
    practitionerName: {
      _type: Type.UUID,
      _description: "UUID of concept for Practitioner Name",
      _default: "f1a2d58c-1a0e-4148-931a-aac224649fdc",
    },
    sessionNotes: {
      _type: Type.UUID,
      _description: "UUID of concept for Session Notes",
      _default: "fa8fedc0-c066-4da3-8dc1-2ad8621fc480",
    },
  },
  groupAttributesConfig: {
    _type: Type.Array,
    _description:
      "List of group attributes, must correspond to an Cohort Attribute Type on the database",
    _elements: {
      uuid: {
        _type: Type.String,
        _description: "UUID of the Cohort Attribute Type",
      },
      name: {
        _type: Type.String,
        _description: "Name of the Cohort Attribute Type",
      },
      id: {
        _type: Type.String,
        _description: "ID of the attribute.",
      },
      labelCode: {
        _type: Type.String,
        _description: "Code to be use in translation.",
      },
      type: {
        _type: Type.String,
        _description:
          "Datatype of the Cohort Attribute Type, acceptable values are 'FreeTextDatatype' | 'BooleanDatatype'",
      },
    },
    _default: [
      {
        uuid: "09790099-9190-429d-811a-aac9edb8d98a",
        name: "Test 01",
        labelCode: "test01",
        type: "org.openmrs.customdatatype.datatype.FreeTextDatatype",
      },
      {
        uuid: "09790099-9190-429d-811a-aac9edb8d98d",
        name: "Close Group",
        labelCode: "closeGroup",
        type: "org.openmrs.customdatatype.datatype.BooleanDatatype",
      },
    ],
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

export type CohortAttributeTypeConfig = {
  uuid: string;
  name: string;
  labelCode: string;
  type:
    | "org.openmrs.customdatatype.datatype.FreeTextDatatype"
    | "org.openmrs.customdatatype.datatype.BooleanDatatype";
};

export type Config = {
  formCategories: Array<Category>;
  formCategoriesToShow: Array<string>;
  groupAttributesConfig: Array<CohortAttributeTypeConfig>;
};
