const rows = [
  {
    id: "admission-form",
    name: "Admission form",
    region: "All regions",
    actions: "Fill Form",
  },
  {
    id: "dass-form",
    name: "DASS 21",
    region: "All regions",
    actions: "Fill form",
  },
  {
    id: "follow-up-form",
    name: "Follow-up form",
    region: "All regions",
    actions: "Fill form",
  },
  {
    id: "closure-form",
    name: "Closure form",
    region: "All regions",
    actions: "Fill form",
  },
];

const headers = [
  {
    key: "name",
    header: "Form name",
  },
  {
    key: "region",
    header: "Region",
  },
  {
    key: "actions",
    header: "Actions",
  },
];

export const tableData = { ...{ rows, headers } };
