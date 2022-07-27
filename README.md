

# OpenMRS ESM Fast Data Entry App

The Fast Data Entry App is a module for the [OpenMRS](https://openmrs.org/) healthcare platform which allows for a natural workflow when entering many pre-recorded forms at a time. It is not meant for point-of-care workflows, but rather as a way to do retrospective data entry.

## Overview
Currently the app consists of two main parts, a Forms Page to list available forms and a Form Workflow which allows the rapid input of forms.

### Forms Page
The Forms page lists all forms able to be seen by a user, filtered by that user's permission to edit the given form. Additionally implementors are able to customize the page by creating form categories and listing the forms inside of each category. These categories can then be shown or hidden using configuration (see more [here](docs/configuring-form-categories.md)). From these lists forms are able to be opened in the Form Workflow using the 'Fill form' button.

### Form Workflow
Forms can be entered quickly with the Form Entry Workflow. This workflow depends on a state machine managed by the [FormWorkflowReducer](src/context/FormWorkflowReducer.ts).

See the video below of a normal workflow.
![Form Workflow Movie](docs/fde-workflow.mov)
State diagram for the Form Workflow.
![Form Workflow State Diagram](docs/form-workflow-state-diagram.png)

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
