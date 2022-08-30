export const mockGroupData = [
  {
    name: "Teal Group",
    description: "Coping skills group - Calgary",
    patients: [
      {
        uuid: "9bf3adf4-3a5e-48b2-9adf-e117ce2ecdc5",
        name: "Patty Patterson",
      },
      {
        uuid: "749cfacb-5879-4661-86da-fd397132a5a0",
        name: "Jessica Rabb",
      },
      {
        uuid: "9739e34b-74c6-4e8e-907f-07a38982ac0e",
        name: "Agnes Ragnarson",
      },
      {
        uuid: "5e615e79-f936-498e-98eb-9c3a5b5da53d",
        name: "Donna Campbell",
      },
      {
        uuid: "1f4b2643-5a0e-4d30-b45f-87c848e0e23f",
        name: "Ashley Theo",
      },
    ],
  },
  {
    name: "Orange Group",
    description: "Thursday night depression session",
    patients: [
      {
        firstname: "Robert",
        gender: "M",
        patientId: 5,
        age: 79,
        lastname: "Evans",
        id: "5",
        name: "Robert Evans",
      },
      {
        firstname: "Daniel",
        gender: "M",
        patientId: 7,
        age: 79,
        lastname: "Green",
        id: "7",
        name: "Daniel Green",
      },
      {
        firstname: "Daniel",
        gender: "M",
        patientId: 9,
        age: 30,
        lastname: "Lee",
        id: "9",
        name: "Daniel Lee",
      },
      {
        firstname: "Daniel",
        gender: "M",
        patientId: 13,
        age: 59,
        lastname: "Mitchell",
        id: "13",
        name: "Daniel Mitchell",
      },
      {
        firstname: "William",
        gender: "M",
        patientId: 14,
        age: 47,
        lastname: "Jackson",
        id: "14",
        name: "William Jackson",
      },
      {
        firstname: "Joseph",
        gender: "M",
        patientId: 15,
        age: 38,
        lastname: "Baker",
        id: "15",
        name: "Joseph Baker",
      },
    ],
    parameters: {
      type: "org.openmrs.module.reporting.dataset.definition.PatientDataSetDefinition",
      columns: [
        {
          name: "firstname",
          key: "reporting.library.patientDataDefinition.builtIn.preferredName.givenName",
          type: "org.openmrs.module.reporting.data.patient.definition.PatientDataDefinition",
        },
        {
          name: "lastname",
          key: "reporting.library.patientDataDefinition.builtIn.preferredName.familyName",
          type: "org.openmrs.module.reporting.data.patient.definition.PatientDataDefinition",
        },
        {
          name: "gender",
          key: "reporting.library.patientDataDefinition.builtIn.gender",
          type: "org.openmrs.module.reporting.data.patient.definition.PatientDataDefinition",
        },
        {
          name: "age",
          key: "reporting.library.patientDataDefinition.builtIn.ageOnDate.fullYears",
          type: "org.openmrs.module.reporting.data.patient.definition.PatientDataDefinition",
        },
        {
          name: "patientId",
          key: "reporting.library.patientDataDefinition.builtIn.patientId",
          type: "org.openmrs.module.reporting.data.patient.definition.PatientDataDefinition",
        },
      ],
      rowFilters: [
        {
          key: "reporting.library.cohortDefinition.builtIn.males",
          type: "org.openmrs.module.reporting.dataset.definition.PatientDataSetDefinition",
        },
        {
          key: "reporting.library.cohortDefinition.builtIn.diedDuringPeriod",
          parameterValues: { endDate: "2022-08-26T03:48:04-07:00" },
          type: "org.openmrs.module.reporting.dataset.definition.PatientDataSetDefinition",
        },
      ],
      customRowFilterCombination: "1 AND NOT 2",
    },
  },
];
