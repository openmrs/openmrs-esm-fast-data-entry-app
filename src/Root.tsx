import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { appPath } from "./constant";
import { FormWorkflowProvider } from "./context/FormWorkflowContext";
const FormsPage = React.lazy(() => import("./forms-page"));
const FormEntryWorkflow = React.lazy(() => import("./form-entry-workflow"));

const Root = () => {
  return (
    <main>
      <FormWorkflowProvider>
        <BrowserRouter basename={appPath}>
          <Switch>
            <Route exact path="/" children={<FormsPage />} />
            <Route path="/:formUuid?" children={<FormEntryWorkflow />} />
          </Switch>
        </BrowserRouter>
      </FormWorkflowProvider>
    </main>
  );
};

export default Root;
