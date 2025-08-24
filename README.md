

# OpenMRS ESM Fast Data Entry App

The Fast Data Entry App is a module for the [OpenMRS](https://openmrs.org/) healthcare platform which allows for a natural workflow when entering many pre-recorded forms at a time. It is not meant for point-of-care workflows, but rather as a way to do retrospective data entry. For more detailed information, see the [FDE Wiki Documentation](https://openmrs.atlassian.net/wiki/spaces/docs/pages/150962486/Key+O3+Repositories#Fast-Data-Entry).

## Overview
Currently the app consists of three main parts, a Forms Page to list available forms, Fast Data Entry which allows the rapid input of forms, and Group Sessions which enable recording information about a group session as well as individual forms for the session participants.

### Forms Page
The Forms page lists all forms able to be seen by a user, filtered by that user's permission to edit the given form. Additionally implementors are able to customize the page by creating form categories and listing the forms inside of each category. These categories can then be shown or hidden using configuration (see more [here](docs/configuring-form-categories.md)). From these lists forms are able to be opened in the Form Workflow using the 'Fill form' button.

### Fast Data Entry
Forms can be entered quickly with the Form Entry Workflow. This workflow depends on a state machine managed by the [FormWorkflowReducer](src/context/FormWorkflowReducer.ts).

See the video below of a normal workflow.

https://user-images.githubusercontent.com/5445264/181378774-341b2a2f-3ecc-4052-b960-d61ba07980fb.mov

State diagram for the Form Workflow.

![Form Workflow State Diagram](docs/form-workflow-state-diagram.png)

### Group Sessions
Group Sessions can be recorded with use of the Group Session Workflow. This workflow depends on a state machine managed by the [GroupFormWorkflowReducer](src/context/GroupFormWorkflowReducer.ts).

See the video below of a normal workflow

https://user-images.githubusercontent.com/5445264/194318314-90bf95a0-cbbc-4ed2-9f83-f8e20d317fbf.mov

At the end, data from the group session will be visible on the patient's chart

![Screen Shot 2022-10-06 at 5 14 27 AM](https://user-images.githubusercontent.com/5445264/194314665-84238e14-8655-4438-bf28-46afce172d13.png)


### Group Builder

This app also contains a Group Builder for quickly putting together a group of patients and storing them as a cohort. While this feature arose to meet the needs of the workflow the concept is valid for the broader platform and could, some day, be moved to a more central location so more apps could make use of it. [AddGroupModal](https://github.com/openmrs/openmrs-esm-fast-data-entry-app/blob/main/src/add-group-modal/AddGroupModal.tsx) was created in a way to reduce external dependencies so this eventual transition would be easier.

https://user-images.githubusercontent.com/5445264/190840219-ec032792-0479-4676-8312-24064edb6afc.mov

### Pre-Filled Questions

In many retrospective workflows, certain fields on a form may have the **same value across multiple patients** (e.g., *session date*, *facility name*, or *session type*). Rather than forcing the data clerk to re-enter these values repeatedly, the Fast Data Entry (FDE) app supports **pre-filled questions**.

These are configured in the `specificQuestions` schema. The schema allows you to:

* Identify **which forms** the question applies to.
* Point to the **question ID** within the form schema.
* Optionally define a **default answer**.
* Optionally limit the set of **answer choices** (for multi-select fields).

#### Example Schema

```json
"specificQuestions": [
  {
    "forms": [
      "547c0814-eb78-3280-91a8-8d7c574e0301",
      "0f5d1e6c-8f8e-3d5c-ac50-f0db0c74d7d8"
    ],
    "questionId": "placeOfConsultation"
  },
  {
    "forms": [
      "547c0814-eb78-3280-91a8-8d7c574e0301",
      "0f5d1e6c-8f8e-3d5c-ac50-f0db0c74d7d8"
    ],
    "questionId": "practitionerAffiliation"
  },
  {
    "forms": [
      "547c0814-eb78-3280-91a8-8d7c574e0301",
      "0f5d1e6c-8f8e-3d5c-ac50-f0db0c74d7d8"
    ],
    "questionId": "typeOfSession",
    "defaultAnswer": "9bc5ecea-7c82-11e9-8f9e-2a86e4085a59",
    "answers": [
      "9bc5ecea-7c82-11e9-8f9e-2a86e4085a59",
      "3a826502-6d4a-4e84-82e2-13deb0a5f958"
    ]
  },
  {
    "forms": [
      "547c0814-eb78-3280-91a8-8d7c574e0301",
      "0f5d1e6c-8f8e-3d5c-ac50-f0db0c74d7d8"
    ],
    "questionId": "sessionFormat"
  },
  {
    "forms": [
      "547c0814-eb78-3280-91a8-8d7c574e0301",
      "0f5d1e6c-8f8e-3d5c-ac50-f0db0c74d7d8"
    ],
    "questionId": "targetGroupProgramType"
  }
]
```

#### Schema Keys

* **`forms`**: Array of form UUIDs. The pre-fill rule applies only to these forms.
* **`questionId`**: The field identifier in the form schema to pre-fill. Must exist in the published form schema.
* **`defaultAnswer`** *(optional)*: A concept UUID or value to use as the default answer.
* **`answers`** *(optional, multi-select only)*: Array of concept UUIDs to restrict the available answer options.

#### Use Cases

1. **Shared Values Across Patients**

   * *Example*: *“Date of Consultation”* is the same for all 20 patients in a session. Instead of retyping it 20 times, pre-fill once.

2. **Default Answers**

   * *Example*: *“Type of Session”* defaults to *Counseling*. Users can override if necessary.

3. **Restricting Options** (multi-select)

   * *Example*: A schema defines four session formats, but only two are relevant in this workflow. The `answers` array limits options to those two.

4. **Multiple Forms, One Rule**

   * A single pre-fill definition can target the same field across multiple forms.

#### Important Notes

* Forms must be **published** before pre-filled values will display.
* The `questionId` must **match an existing field** in the form schema.
* Concepts used in `defaultAnswer` or `answers` must exist in the database; otherwise, the UI will show empty values

## Integration with Form Engines

Since all forms in OpenMRS are submitted via a form engine, **FDE** relies on one of two wrapper modules:

- [Form Engine App](https://github.com/openmrs/openmrs-esm-patient-chart/tree/main/packages/esm-form-engine-app)  
- [Form Entry App](https://github.com/openmrs/openmrs-esm-patient-chart/tree/main/packages/esm-form-entry-app)  

⚠️ **Important**: Only one wrapper can be active in a distribution. A distribution must choose either the **React-based** or **Angular-based** engine, depending on its architecture.  
👉 For example, the **O3 Reference Application** uses the **React Form Engine**

#### Adopting a Form Engine with FDE

1. **Add the wrapper module** (`Form Engine App` or `Form Entry App`) to the frontend modules in your distribution.  
2. **Do not add both wrappers** at the same time. They depend on the same OpenMRS extension framework resources (e.g., `extension-slots`), and will conflict.  
3. Once the wrapper is loaded, **FDE automatically integrates** with the form engine.


#### Why This Works

Because the form engines themselves have been extended to support FDE, the FDE module remains **generic and independent**. Its flexibility comes from the **OpenMRS extension system**, particularly:

- **`form-widget-slot`** → provide an entry point for rendering forms.  
- **`ampath-form-action` event** → used by both form engines to synchronize form operations with FDE.  


## Running this code

Clone the repo locally, then install and run using

```sh
yarn  # to install dependencies
yarn start  # to run the dev server
```

To customize your development build pass other arguments to yarn start (which under the hood is running `npx openmrs develop`). For example to point to a backend other than [dev3](https://dev3.openmrs.org/)  specify the `--backend` option. See the full example below for running against an ICRC backend.

```sh
yarn start --importmap "https://spa-modules.nyc3.digitaloceanspaces.com/import-map.json" --backend "https://openmrs-dev-v2.test.icrc.org/" --add-cookie "MRHSession=abcdefghijklmnop012345678910" --spa-path "/ui"
```

To see more options run `npx openmrs --help`

## To run end-to-end tests, run:

```bash
yarn test-e2e
```

Read the [e2e testing guide](https://openmrs.atlassian.net/wiki/spaces/docs/pages/150962731/Testing+Frontend+Modules+O3) to learn more about End-to-End tests in this project.
